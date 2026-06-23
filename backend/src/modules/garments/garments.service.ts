import { Injectable, NotFoundException } from "@nestjs/common";
import { ok } from "../../common/api-response";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class GarmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const garments = await this.prisma.garment.findMany({
      where: { isActive: true },
      include: { category: true, garment_sizes: { where: { is_active: true } } },
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
      include: { category: true, garment_sizes: { where: { is_active: true } } },
    });
    if (!garment) throw new NotFoundException("Garment not found.");
    return ok({
      id: garment.id, name: garment.name, categoryName: garment.category?.name ?? null,
      sizeLabel: garment.garment_sizes[0]?.size_label ?? null,
      dailyPrice: Number(garment.garment_sizes[0]?.daily_price ?? 0),
      depositAmount: Number(garment.garment_sizes[0]?.deposit_amount ?? 0),
    });
  }

  async findAvailableAssets(garmentSizeId: string) {
    const size = await this.prisma.garment_sizes.findFirst({ where: { id: garmentSizeId, is_active: true } });
    if (!size) throw new NotFoundException("Garment size not found.");
    const assets = await this.prisma.garmentAsset.findMany({
      where: { garment_size_id: garmentSizeId, status: "available" },
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
      // Nếu group chưa có ảnh mà garment này có ảnh → cập nhật ảnh cho group
      if (!group.imageUrl && g.images[0]?.imageUrl) {
        group.imageUrl = g.images[0].imageUrl;
      }
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
}
