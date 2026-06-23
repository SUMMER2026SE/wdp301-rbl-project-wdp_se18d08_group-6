import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { TryonStatus } from "@prisma/client";
import { ok } from "../../common/api-response";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateTryonDto } from "./dto/create-tryon.dto";

const REPLICATE_API = "https://api.replicate.com/v1";

const MODELS: Record<string, string> = {
  face_swap: "cdingram/face-swap",
  full_body: "cdingram/face-swap",
};

// ── Nhập tên model thật từ Replicate ──────────────────────────────────────────
// Vào https://replicate.com/explore tìm model phù hợp rồi THAY TÊN bên dưới:
//   face_swap → model nào đổi mặt (VD: "lucataco/inswapper", "fofr/face-to-many")
//   full_body → model nào thử đồ (VD: "yisol/idm-vton", "cuuupid/idm-vton")
//
// Bạn có thể kiểm tra model có tồn tại không bằng lệnh:
//   curl https://api.replicate.com/v1/models/TEN_MODEL -H "Authorization: Token REPLICATE_API_TOKEN"
//
// ⚠️ COPY TÊN CHÍNH XÁC từ replicate.com (phân biệt hoa/thường, dấu gạch ngang)

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  async createTryon(dto: CreateTryonDto, customerId: string) {
    const size = await this.prisma.garment_sizes.findFirst({
      where: { id: dto.garmentSizeId, is_active: true },
      include: { garments: { include: { images: { take: 1 } } } },
    });
    if (!size) throw new NotFoundException("Garment size not found.");

    if (!dto.imageBase64 || dto.imageBase64.length < 100) {
      throw new BadRequestException("Ảnh không hợp lệ.");
    }

    const garmentImageUrl = size.garments.images[0]?.imageUrl ?? "";
    if (!garmentImageUrl) {
      throw new BadRequestException(
        "Trang phục này chưa có ảnh mẫu. Vui lòng chọn trang phục khác hoặc thử chế độ Toàn thân.",
      );
    }

    const dataUri = `data:image/jpeg;base64,${dto.imageBase64}`;

    const request = await this.prisma.tryonRequest.create({
      data: {
        customerId,
        garmentId: size.garment_id,
        status: TryonStatus.processing,
        sourceImageUrl: `base64:${dto.imageBase64.substring(0, 50)}...`,
        consentAccepted: true,
      },
    });

    let resultImageUrl: string;
    try {
      resultImageUrl = await this.callReplicate(dto.mode, dataUri, garmentImageUrl, size.garments.name);
    } catch (err: any) {
      console.error("[AI] Replicate error:", err.message);
      await this.prisma.tryonRequest.update({
        where: { id: request.id },
        data: { status: TryonStatus.failed },
      });
      throw new BadRequestException(
        `AI xử lý thất bại: ${err.message}. Vui lòng thử ảnh khác hoặc chế độ khác.`,
      );
    }

    await this.prisma.tryonRequest.update({
      where: { id: request.id },
      data: { status: TryonStatus.completed, completedAt: new Date() },
    });

    await this.prisma.tryonResult.create({
      data: {
        tryonRequestId: request.id,
        resultImageUrl,
        aiMetadata: { mode: dto.mode, source: dto.source ?? "upload", model: MODELS[dto.mode] },
      },
    });

    return ok({
      id: request.id,
      status: "completed",
      resultImageUrl,
      mode: dto.mode,
      garmentName: size.garments.name,
      sizeLabel: size.size_label,
    });
  }

  private async callReplicate(mode: string, dataUri: string, _garmentImageUrl: string, garmentName: string): Promise<string> {
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) throw new Error("REPLICATE_API_TOKEN not configured");

    const input: Record<string, any> =
      mode === "face_swap"
        ? { input_image: dataUri, swap_image: _garmentImageUrl }
        : { input_image: dataUri, swap_image: _garmentImageUrl };

    const modelPath = MODELS[mode];
    console.log(`[AI] Fetching version for ${modelPath}...`);

    // Lấy version mới nhất của model
    const modelRes = await fetch(`${REPLICATE_API}/models/${modelPath}`, {
      headers: { "Authorization": `Token ${apiToken}` },
    });
    const modelData = await modelRes.json() as { latest_version?: { id: string } };
    const version = modelData.latest_version?.id;
    if (!version) throw new Error(`Cannot get version for model: ${modelPath}`);

    console.log(`[AI] POST ${REPLICATE_API}/predictions → ${modelPath}:${version}`);

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
      console.error(`[AI] HTTP ${res.status}: ${text.substring(0, 500)}`);
      throw new Error(`Replicate API ${res.status}: ${text.substring(0, 150)}`);
    }

    let prediction: { id: string; status: string; output?: any; error?: string };
    try {
      prediction = JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON from Replicate: ${text.substring(0, 200)}`);
    }

    console.log(`[AI] Prediction ${prediction.id}: ${prediction.status}`);

    let attempts = 0;
    while ((prediction.status === "starting" || prediction.status === "processing") && attempts < 90) {
      await new Promise((r) => setTimeout(r, 2000));
      const checkRes = await fetch(`${REPLICATE_API}/predictions/${prediction.id}`, {
        headers: { "Authorization": `Token ${apiToken}` },
      });
      prediction = await checkRes.json();
      attempts++;
      if (attempts % 5 === 0) console.log(`[AI] Poll ${attempts}: ${prediction.status}`);
    }

    if (prediction.status === "failed" || prediction.error) {
      throw new Error(prediction.error ?? "AI generation failed");
    }
    if (prediction.status !== "succeeded") {
      throw new Error(`AI timeout after ${attempts * 2}s (status: ${prediction.status})`);
    }

    const url = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
    if (!url) throw new Error("No output from Replicate");

    console.log(`[AI] Success in ${attempts * 2}s: ${typeof url === 'string' ? url.substring(0, 80) : url}`);
    return url as string;
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
