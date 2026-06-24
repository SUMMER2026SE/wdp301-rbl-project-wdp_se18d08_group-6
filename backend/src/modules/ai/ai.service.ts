import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { TryonStatus } from "@prisma/client";
import { ok } from "../../common/api-response";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateTryonDto, TryonMode } from "./dto/create-tryon.dto";

const REPLICATE_API = "https://api.replicate.com/v1";
const DEFAULT_FACE_SWAP_MODEL = "cdingram/face-swap";
const DEFAULT_FULL_BODY_MODEL = "yisol/idm-vton";
const DEFAULT_MAX_IMAGE_MB = 8;
const DEFAULT_POLL_INTERVAL_MS = 2000;
const DEFAULT_TIMEOUT_SECONDS = 180;
const MIN_IMAGE_BYTES = 10 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

type NormalizedImage = {
  dataUri: string;
  mimeType: AllowedMimeType;
  sizeBytes: number;
};

type ReplicatePrediction = {
  id: string;
  status: string;
  output?: unknown;
  error?: string;
};

type ReplicateResult = {
  url: string;
  model: string;
  predictionId: string;
  inputSchema: string;
};

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  async createTryon(dto: CreateTryonDto, customerId: string) {
    const size = await this.prisma.garment_sizes.findFirst({
      where: { id: dto.garmentSizeId, is_active: true },
      include: {
        garments: {
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
          },
        },
      },
    });
    if (!size) throw new NotFoundException("Garment size not found.");

    const image = this.normalizeImageBase64(dto.imageBase64, dto.mode);

    const garmentImageUrl = size.garments.images[0]?.imageUrl ?? "";
    if (!garmentImageUrl) {
      throw new BadRequestException(
        "Trang phục này chưa có ảnh mẫu. Vui lòng chọn trang phục khác.",
      );
    }

    const request = await this.prisma.tryonRequest.create({
      data: {
        customerId,
        garmentId: size.garment_id,
        status: TryonStatus.processing,
        sourceImageUrl: `base64:${image.mimeType};${image.sizeBytes}bytes`,
        consentAccepted: true,
      },
    });

    let result: ReplicateResult;
    try {
      result = await this.callReplicate(dto.mode, image.dataUri, garmentImageUrl, size.garments.name);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown AI error";
      console.error("[AI] Replicate error:", message);
      await this.prisma.tryonRequest.update({
        where: { id: request.id },
        data: { status: TryonStatus.failed },
      });
      throw new BadRequestException(
        `AI xử lý thất bại: ${message}. ${this.getModeGuidance(dto.mode)}`,
      );
    }

    await this.prisma.tryonRequest.update({
      where: { id: request.id },
      data: { status: TryonStatus.completed, completedAt: new Date() },
    });

    await this.prisma.tryonResult.create({
      data: {
        tryonRequestId: request.id,
        resultImageUrl: result.url,
        aiMetadata: {
          mode: dto.mode,
          source: dto.source ?? "upload",
          model: result.model,
          predictionId: result.predictionId,
          garmentImageUrl,
          inputSchema: result.inputSchema,
        },
      },
    });

    return ok({
      id: request.id,
      status: "completed",
      resultImageUrl: result.url,
      mode: dto.mode,
      garmentName: size.garments.name,
      sizeLabel: size.size_label,
    });
  }

  private async callReplicate(
    mode: TryonMode,
    userImageDataUri: string,
    garmentImageUrl: string,
    garmentName: string,
  ): Promise<ReplicateResult> {
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) throw new Error("REPLICATE_API_TOKEN not configured");

    const model = this.getModelPath(mode);
    const { input, inputSchema } = this.buildReplicateInput(mode, userImageDataUri, garmentImageUrl, garmentName);

    console.log(`[AI] Fetching version for ${model}...`);
    const version = await this.fetchLatestModelVersion(model, apiToken);

    console.log(`[AI] POST ${REPLICATE_API}/predictions → ${model}:${version}`);
    console.log(`[AI] mode=${mode} model=${model} inputKeys=${Object.keys(input).join(",")}`);

    let prediction = await this.createPrediction(version, input, apiToken);
    console.log(`[AI] Prediction ${prediction.id}: ${prediction.status}`);

    prediction = await this.waitForPrediction(prediction, apiToken);
    const url = this.extractOutputUrl(prediction.output);
    if (!url) throw new Error("No output from Replicate");

    console.log(`[AI] Success: prediction=${prediction.id} url=${url.substring(0, 80)}`);
    return { url, model, predictionId: prediction.id, inputSchema };
  }

  private getModelPath(mode: TryonMode): string {
    return mode === "face_swap"
      ? process.env.REPLICATE_FACE_SWAP_MODEL?.trim() || DEFAULT_FACE_SWAP_MODEL
      : process.env.REPLICATE_FULL_BODY_MODEL?.trim() || DEFAULT_FULL_BODY_MODEL;
  }

  private buildReplicateInput(
    mode: TryonMode,
    userImageDataUri: string,
    garmentImageUrl: string,
    garmentName: string,
  ): { input: Record<string, unknown>; inputSchema: string } {
    if (mode === "face_swap") {
      return {
        inputSchema: "face-swap",
        input: {
          input_image: garmentImageUrl,
          swap_image: userImageDataUri,
        },
      };
    }

    const garmentPrompt = this.buildGarmentPreservationPrompt(garmentName);

    return {
      inputSchema: "idm-vton",
      input: {
        human_img: userImageDataUri,
        garm_img: garmentImageUrl,
        garment_des: garmentPrompt,
        prompt: garmentPrompt,
        negative_prompt: "different outfit, redesigned garment, changed color, changed pattern, missing embroidery, altered collar, altered sleeves, short dress, western dress, fantasy costume, inaccurate ao dai, extra decorations, logo changes, blurry garment details",
      },
    };
  }

  private buildGarmentPreservationPrompt(garmentName: string): string {
    return [
      `Exact virtual try-on of the reference garment: ${garmentName}.`,
      "Dress the person in the exact same traditional Vietnamese áo dài shown in the garment reference image.",
      "Preserve the original garment faithfully: same color, same fabric texture, same embroidery, same floral or decorative patterns, same collar, same sleeve length, same long front and back panels, same silhouette, and same matching pants if visible.",
      "Do not redesign the outfit. Do not change the color, pattern, shape, decorations, fabric identity, or Vietnamese cultural style.",
      "Keep the garment identity identical to the reference image; only adapt it naturally to the person's body pose and lighting.",
    ].join(" ");
  }

  private async fetchLatestModelVersion(model: string, apiToken: string): Promise<string> {
    const res = await fetch(`${REPLICATE_API}/models/${model}`, {
      headers: { "Authorization": `Token ${apiToken}` },
    });
    const text = await res.text();
    if (!res.ok) {
      console.error(`[AI] Model fetch HTTP ${res.status}: ${text.substring(0, 500)}`);
      throw new Error(`Replicate model fetch ${res.status}: ${text.substring(0, 150)}`);
    }

    let modelData: { latest_version?: { id: string } };
    try {
      modelData = JSON.parse(text) as { latest_version?: { id: string } };
    } catch {
      throw new Error(`Invalid JSON from Replicate model fetch: ${text.substring(0, 200)}`);
    }

    const version = modelData.latest_version?.id;
    if (!version) throw new Error(`Cannot get version for model: ${model}`);
    return version;
  }

  private async createPrediction(
    version: string,
    input: Record<string, unknown>,
    apiToken: string,
  ): Promise<ReplicatePrediction> {
    const res = await fetch(`${REPLICATE_API}/predictions`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ version, input }),
    });
    const text = await res.text();

    if (!res.ok) {
      console.error(`[AI] Prediction HTTP ${res.status}: ${text.substring(0, 500)}`);
      throw new Error(`Replicate API ${res.status}: ${text.substring(0, 150)}`);
    }

    return this.parsePrediction(text, "prediction create");
  }

  private async waitForPrediction(
    prediction: ReplicatePrediction,
    apiToken: string,
  ): Promise<ReplicatePrediction> {
    const pollIntervalMs = this.getPositiveNumberEnv("AI_TRYON_POLL_INTERVAL_MS", DEFAULT_POLL_INTERVAL_MS);
    const timeoutSeconds = this.getPositiveNumberEnv("AI_TRYON_TIMEOUT_SECONDS", DEFAULT_TIMEOUT_SECONDS);
    const maxAttempts = Math.ceil((timeoutSeconds * 1000) / pollIntervalMs);

    let current = prediction;
    let attempts = 0;
    while ((current.status === "starting" || current.status === "processing") && attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, pollIntervalMs));
      const checkRes = await fetch(`${REPLICATE_API}/predictions/${current.id}`, {
        headers: { "Authorization": `Token ${apiToken}` },
      });
      const text = await checkRes.text();
      if (!checkRes.ok) {
        console.error(`[AI] Poll HTTP ${checkRes.status}: ${text.substring(0, 500)}`);
        throw new Error(`Replicate poll ${checkRes.status}: ${text.substring(0, 150)}`);
      }
      current = this.parsePrediction(text, "prediction poll");
      attempts++;
      if (attempts % 5 === 0) console.log(`[AI] Poll ${attempts}: ${current.status}`);
    }

    if (current.status === "failed" || current.status === "canceled" || current.error) {
      throw new Error(current.error ?? `AI generation ${current.status}`);
    }
    if (current.status !== "succeeded") {
      throw new Error(`AI timeout after ${attempts * (pollIntervalMs / 1000)}s (status: ${current.status})`);
    }

    return current;
  }

  private parsePrediction(text: string, context: string): ReplicatePrediction {
    try {
      return JSON.parse(text) as ReplicatePrediction;
    } catch {
      throw new Error(`Invalid JSON from Replicate ${context}: ${text.substring(0, 200)}`);
    }
  }

  private extractOutputUrl(output: unknown): string | null {
    if (typeof output === "string") return output;
    if (Array.isArray(output)) {
      const url = output.find((item) => typeof item === "string");
      return typeof url === "string" ? url : null;
    }
    if (output && typeof output === "object") {
      const values = Object.values(output);
      const url = values.find((item) => typeof item === "string");
      return typeof url === "string" ? url : null;
    }
    return null;
  }

  private normalizeImageBase64(raw: string, mode: TryonMode): NormalizedImage {
    if (!raw?.trim()) {
      throw new BadRequestException(`Ảnh không hợp lệ. ${this.getModeGuidance(mode)}`);
    }

    const trimmed = raw.trim();
    const dataUriMatch = /^data:([^;]+);base64,(.+)$/i.exec(trimmed);
    const mimeType = dataUriMatch?.[1]?.toLowerCase() ?? this.detectMimeTypeFromBase64(trimmed);
    const base64 = dataUriMatch?.[2] ?? trimmed;

    if (!this.isAllowedMimeType(mimeType)) {
      throw new BadRequestException("Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.");
    }

    const compactBase64 = base64.replace(/\s/g, "");
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(compactBase64) || compactBase64.length % 4 !== 0) {
      throw new BadRequestException(`Ảnh base64 không hợp lệ. ${this.getModeGuidance(mode)}`);
    }

    let buffer: Buffer;
    try {
      buffer = Buffer.from(compactBase64, "base64");
    } catch {
      throw new BadRequestException(`Ảnh base64 không hợp lệ. ${this.getModeGuidance(mode)}`);
    }

    if (!buffer.length || buffer.toString("base64").replace(/=+$/, "") !== compactBase64.replace(/=+$/, "")) {
      throw new BadRequestException(`Ảnh base64 không hợp lệ. ${this.getModeGuidance(mode)}`);
    }

    if (buffer.length < MIN_IMAGE_BYTES) {
      throw new BadRequestException(`Ảnh quá nhỏ hoặc không rõ. ${this.getModeGuidance(mode)}`);
    }

    const maxImageMb = this.getPositiveNumberEnv("AI_TRYON_MAX_IMAGE_MB", DEFAULT_MAX_IMAGE_MB);
    const maxBytes = maxImageMb * 1024 * 1024;
    if (buffer.length > maxBytes) {
      throw new BadRequestException(`Ảnh vượt quá dung lượng ${maxImageMb}MB.`);
    }

    return {
      dataUri: `data:${mimeType};base64,${compactBase64}`,
      mimeType,
      sizeBytes: buffer.length,
    };
  }

  private detectMimeTypeFromBase64(base64: string): AllowedMimeType {
    if (base64.startsWith("/9j/")) return "image/jpeg";
    if (base64.startsWith("iVBOR")) return "image/png";
    if (base64.startsWith("UklGR")) return "image/webp";
    return "image/jpeg";
  }

  private isAllowedMimeType(mimeType: string): mimeType is AllowedMimeType {
    return (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
  }

  private getPositiveNumberEnv(name: string, fallback: number): number {
    const value = Number(process.env[name]);
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }

  private getModeGuidance(mode: TryonMode): string {
    return mode === "face_swap"
      ? "Vui lòng tải ảnh selfie rõ mặt, nhìn thẳng, đủ sáng."
      : "Vui lòng tải ảnh toàn thân, đứng thẳng, thấy rõ cơ thể và đủ sáng.";
  }

  async getMyHistory(customerId: string) {
    const requests = await this.prisma.tryonRequest.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { results: { take: 1, orderBy: { createdAt: "desc" } }, garment: true },
    });

    return ok(
      requests.map((r) => ({
        id: r.id,
        status: r.status,
        garmentName: r.garment.name,
        resultImageUrl: r.results[0]?.resultImageUrl ?? null,
        createdAt: r.createdAt.toISOString(),
      })),
    );
  }
}
