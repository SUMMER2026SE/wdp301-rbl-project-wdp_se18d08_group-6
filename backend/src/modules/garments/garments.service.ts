import { Injectable } from "@nestjs/common";
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

    return ok(
      garments.map((garment) => ({
        id: garment.id,
        name: garment.name,
        categoryName: garment.category?.name ?? null,
        sizeLabel: garment.sizeLabel,
        dailyPrice: Number(garment.dailyPrice),
        depositAmount: Number(garment.depositAmount),
      })),
    );
  }
}