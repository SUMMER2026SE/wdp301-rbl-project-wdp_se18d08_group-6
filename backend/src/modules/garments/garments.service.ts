import { Injectable, NotFoundException } from "@nestjs/common";
import { ok } from "../../common/api-response";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class GarmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const garments = await this.prisma.garment.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return ok(garments.map((g) => this.serialize(g)));
  }

  async findOne(id: string) {
    const garment = await this.prisma.garment.findFirst({
      where: { id, isActive: true },
      include: { category: true },
    });

    if (!garment) throw new NotFoundException("Garment not found.");

    return ok(this.serialize(garment));
  }

  async findAvailableAssets(garmentId: string) {
    const garment = await this.prisma.garment.findFirst({
      where: { id: garmentId, isActive: true },
    });
    if (!garment) throw new NotFoundException("Garment not found.");

    const assets = await this.prisma.garmentAsset.findMany({
      where: {
        garmentId,
        status: "available",
      },
      orderBy: { assetCode: "asc" },
    });

    return ok(
      assets.map((a) => ({
        id: a.id,
        assetCode: a.assetCode,
        status: a.status,
        conditionNote: a.conditionNote,
      })),
    );
  }

  private serialize(garment: {
    id: string;
    name: string;
    sizeLabel: string | null;
    dailyPrice: unknown;
    depositAmount: unknown;
    category?: { name: string } | null;
  }) {
    return {
      id: garment.id,
      name: garment.name,
      categoryName: garment.category?.name ?? null,
      sizeLabel: garment.sizeLabel,
      dailyPrice: Number(garment.dailyPrice),
      depositAmount: Number(garment.depositAmount),
    };
  }
}