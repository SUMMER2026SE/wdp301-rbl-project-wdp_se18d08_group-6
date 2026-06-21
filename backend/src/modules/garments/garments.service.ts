import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ok } from "../../common/api-response";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateGarmentDto } from "./dto/create-garment.dto";
import type { UpdateGarmentDto } from "./dto/update-garment.dto";
import type { AddGarmentImageDto } from "./dto/add-image.dto";

type GarmentWithCategory = {
  id: string;
  name: string;
  description: string | null;
  sizeLabel: string | null;
  color: string | null;
  dailyPrice: unknown;
  depositAmount: unknown;
  isActive: boolean;
  category?: { name: string } | null;
};

type GarmentWithImages = GarmentWithCategory & {
  images?: Array<{ id: string; imageUrl: string; altText: string | null; sortOrder: number }>;
};

@Injectable()
export class GarmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const garments = await this.prisma.garment.findMany({
      where: { isActive: true },
      include: {
        category: true,
        garment_sizes: { where: { is_active: true } },
        images: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    return ok(garments.map((g) => ({
      id: g.id, name: g.name, categoryName: g.category?.name ?? null,
      sizeLabel: g.garment_sizes[0]?.size_label ?? null,
      dailyPrice: Number(g.garment_sizes[0]?.daily_price ?? 0),
      depositAmount: Number(g.garment_sizes[0]?.deposit_amount ?? 0),
    })));
  }

  async findOne(id: string) {
    const garment = await this.prisma.garment.findFirst({
      where: { id, isActive: true },
      include: {
        category: true,
        garment_sizes: { where: { is_active: true } },
        images: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (!garment) throw new NotFoundException("Garment not found.");
    return ok({
      id: garment.id, name: garment.name, categoryName: garment.category?.name ?? null,
      sizeLabel: garment.garment_sizes[0]?.size_label ?? null,
      dailyPrice: Number(garment.garment_sizes[0]?.daily_price ?? 0),
      depositAmount: Number(garment.garment_sizes[0]?.deposit_amount ?? 0),
    });
  }

  // ── Manager / Owner: Create ────────────────────────────────────────────────

  async create(dto: CreateGarmentDto) {
    if (dto.categoryId) {
      const category = await this.prisma.garmentCategory.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) throw new NotFoundException("Category not found.");
    }

    const garment = await this.prisma.garment.create({
      data: {
        name: dto.name,
        categoryId: dto.categoryId ?? null,
        description: dto.description ?? null,
        sizeLabel: dto.sizeLabel ?? null,
        color: dto.color ?? null,
        dailyPrice: dto.dailyPrice,
        depositAmount: dto.depositAmount,
        isActive: dto.isActive ?? true,
      },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
    });

    return ok(this.serialize(garment));
  }

  // ── Manager / Owner: Update ────────────────────────────────────────────────

  async update(id: string, dto: UpdateGarmentDto) {
    const garment = await this.prisma.garment.findUnique({ where: { id } });
    if (!garment) throw new NotFoundException("Garment not found.");

    if (dto.categoryId !== undefined) {
      if (dto.categoryId) {
        const category = await this.prisma.garmentCategory.findUnique({
          where: { id: dto.categoryId },
        });
        if (!category) throw new NotFoundException("Category not found.");
      }
    }

    const updated = await this.prisma.garment.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.sizeLabel !== undefined ? { sizeLabel: dto.sizeLabel } : {}),
        ...(dto.color !== undefined ? { color: dto.color } : {}),
        ...(dto.dailyPrice !== undefined ? { dailyPrice: dto.dailyPrice } : {}),
        ...(dto.depositAmount !== undefined ? { depositAmount: dto.depositAmount } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
    });

    return ok(this.serialize(updated));
  }

  // ── Manager / Owner: Add image ─────────────────────────────────────────────

  async addImage(garmentId: string, dto: AddGarmentImageDto) {
    const garment = await this.prisma.garment.findUnique({
      where: { id: garmentId },
    });
    if (!garment) throw new NotFoundException("Garment not found.");

    const nextSortOrder = await this.prisma.garmentImage.aggregate({
      where: { garmentId },
      _max: { sortOrder: true },
    });
    const sortOrder = dto.sortOrder !== undefined
      ? Number(dto.sortOrder)
      : (nextSortOrder._max.sortOrder ?? -1) + 1;

    const image = await this.prisma.garmentImage.create({
      data: {
        garmentId,
        imageUrl: dto.imageUrl,
        altText: dto.altText ?? null,
        sortOrder,
      },
    });

    return ok({
      id: image.id,
      garmentId: image.garmentId,
      imageUrl: image.imageUrl,
      altText: image.altText,
      sortOrder: image.sortOrder,
    });
  }

  async removeImage(garmentId: string, imageId: string) {
    const image = await this.prisma.garmentImage.findFirst({
      where: { id: imageId, garmentId },
    });
    if (!image) throw new NotFoundException("Garment image not found.");

    await this.prisma.garmentImage.delete({ where: { id: imageId } });
    return ok({ id: imageId, deleted: true });
  }

  // ── Available assets for booking ───────────────────────────────────────────

  async findAvailableAssets(garmentId: string) {
    const garment = await this.prisma.garment.findFirst({
      where: { id: garmentId, isActive: true },
    });
    if (!garment) throw new NotFoundException("Garment not found.");

    const assets = await this.prisma.garmentAsset.findMany({
      where: { garmentId, status: "available" },
      orderBy: { assetCode: "asc" },
    });
    return ok(assets.map((a) => ({ id: a.id, assetCode: a.assetCode, status: a.status, conditionNote: a.conditionNote })));
  }

  async findAllGrouped() {
    const garments = await this.prisma.garment.findMany({
      where: { isActive: true },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        garment_sizes: { where: { is_active: true }, orderBy: { size_label: "asc" } },
      },
      orderBy: { name: "asc" },
    });

    // Gom nhóm theo tên (không phân biệt hoa/thường, trim)
    const grouped = new Map<string, {
      name: string;
      categoryName: string | null;
      description: string | null;
      imageUrl: string | null;
      sizeMap: Map<string, { garmentSizeId: string; sizeLabel: string | null; dailyPrice: number; depositAmount: number }>;
    }>();

    for (const g of garments) {
      if (g.garment_sizes.length === 0) continue;
      const key = g.name.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

      if (!grouped.has(key)) {
        grouped.set(key, {
          name: g.name.trim(),
          categoryName: g.category?.name ?? null,
          description: g.description,
          imageUrl: g.images[0]?.imageUrl ?? null,
          sizeMap: new Map(),
        });
      }

      const group = grouped.get(key)!;
      // Merge sizes, deduplicate by sizeLabel
      for (const s of g.garment_sizes) {
        const sk = (s.size_label ?? "__nosize__").trim().toLowerCase();
        if (!group.sizeMap.has(sk)) {
          group.sizeMap.set(sk, {
            garmentSizeId: s.id,
            sizeLabel: s.size_label,
            dailyPrice: Number(s.daily_price ?? 0),
            depositAmount: Number(s.deposit_amount ?? 0),
          });
        }
      }
    }

    return ok(
      Array.from(grouped.values()).map((group, idx) => ({
        name: group.name,
        slug: `group-${idx}-${group.name.toLowerCase().replace(/\s+/g, "-")}`,
        garmentId: "",
        categoryName: group.categoryName,
        description: group.description,
        imageUrl: group.imageUrl,
        sizes: Array.from(group.sizeMap.values()).sort((a, b) => (a.sizeLabel ?? "").localeCompare(b.sizeLabel ?? "")),
      })),
    );
  }

  // ── Category CRUD ──────────────────────────────────────────────────────────

  async findAllCategories() {
    const categories = await this.prisma.garmentCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return ok(
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        isActive: c.isActive,
      })),
    );
  }

  async createCategory(name: string, description?: string) {
    const existing = await this.prisma.garmentCategory.findUnique({
      where: { name },
    });
    if (existing) {
      throw new BadRequestException("Category with this name already exists.");
    }

    const category = await this.prisma.garmentCategory.create({
      data: { name, description: description ?? null },
    });
    return ok({
      id: category.id,
      name: category.name,
      description: category.description,
    });
  }

  // ── Serialization ──────────────────────────────────────────────────────────

  private serialize(garment: GarmentWithImages) {
    return {
      id: garment.id,
      name: garment.name,
      description: garment.description,
      categoryName: garment.category?.name ?? null,
      categoryId: (garment as any).categoryId ?? null,
      sizeLabel: garment.sizeLabel,
      color: garment.color,
      dailyPrice: Number(garment.dailyPrice),
      depositAmount: Number(garment.depositAmount),
      isActive: garment.isActive,
      images: (garment.images ?? []).map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        altText: img.altText,
        sortOrder: img.sortOrder,
      })),
    };
  }
}
