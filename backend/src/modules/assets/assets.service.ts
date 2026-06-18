import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ok } from "../../common/api-response";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateAssetDto } from "./dto/create-asset.dto";
import type { UpdateAssetStatusDto } from "./dto/update-asset-status.dto";

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── List all assets (with optional status filter) ──────────────────────────

  async findAll(statusFilter?: string) {
    const assets = await this.prisma.garmentAsset.findMany({
      where: statusFilter ? { status: statusFilter as any } : undefined,
      orderBy: { assetCode: "asc" },
<<<<<<< HEAD
      include: { garment: { select: { name: true } }, garment_sizes: { select: { size_label: true } } },
=======
      include: { garment: { select: { name: true, sizeLabel: true } } },
>>>>>>> 6fb0177 (role manager)
    });

    return ok(
      assets.map((a) => ({
        id: a.id,
        garmentId: a.garmentId,
        garmentName: a.garment.name,
<<<<<<< HEAD
        sizeLabel: a.garment_sizes?.size_label ?? null,
=======
        sizeLabel: a.garment.sizeLabel,
>>>>>>> 6fb0177 (role manager)
        assetCode: a.assetCode,
        status: a.status,
        conditionNote: a.conditionNote,
        purchaseCost: a.purchaseCost ? Number(a.purchaseCost) : null,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
    );
  }

  // ── Create a new physical asset ────────────────────────────────────────────

  async create(dto: CreateAssetDto) {
    const garment = await this.prisma.garment.findUnique({
      where: { id: dto.garmentId },
    });
    if (!garment) throw new NotFoundException("Garment not found.");

    const existing = await this.prisma.garmentAsset.findUnique({
      where: { assetCode: dto.assetCode },
    });
    if (existing) {
      throw new BadRequestException(
        `Asset code '${dto.assetCode}' already exists.`,
      );
    }

    const asset = await this.prisma.garmentAsset.create({
      data: {
        garmentId: dto.garmentId,
        assetCode: dto.assetCode,
        conditionNote: dto.conditionNote ?? null,
        purchaseCost: dto.purchaseCost ?? null,
        status: "available",
      },
<<<<<<< HEAD
      include: { garment: { select: { name: true } }, garment_sizes: { select: { size_label: true } } },
=======
      include: { garment: { select: { name: true, sizeLabel: true } } },
>>>>>>> 6fb0177 (role manager)
    });

    return ok({
      id: asset.id,
      garmentId: asset.garmentId,
      garmentName: asset.garment.name,
<<<<<<< HEAD
        sizeLabel: asset.garment_sizes?.size_label ?? null,
=======
      sizeLabel: asset.garment.sizeLabel,
>>>>>>> 6fb0177 (role manager)
      assetCode: asset.assetCode,
      status: asset.status,
      conditionNote: asset.conditionNote,
      purchaseCost: asset.purchaseCost ? Number(asset.purchaseCost) : null,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
    });
  }

  async findAllByGarment(garmentId: string) {
    const garment = await this.prisma.garment.findFirst({
      where: { id: garmentId, isActive: true },
    });
    if (!garment) throw new NotFoundException("Garment not found.");

    const assets = await this.prisma.garmentAsset.findMany({
      where: { garmentId },
      orderBy: { assetCode: "asc" },
<<<<<<< HEAD
      include: { garment: { select: { name: true } }, garment_sizes: { select: { size_label: true } } },
=======
      include: { garment: { select: { name: true, sizeLabel: true } } },
>>>>>>> 6fb0177 (role manager)
    });

    return ok(
      assets.map((a) => ({
        id: a.id,
        garmentId: a.garmentId,
        garmentName: a.garment.name,
<<<<<<< HEAD
        sizeLabel: a.garment_sizes?.size_label ?? null,
=======
        sizeLabel: a.garment.sizeLabel,
>>>>>>> 6fb0177 (role manager)
        assetCode: a.assetCode,
        status: a.status,
        conditionNote: a.conditionNote,
        purchaseCost: a.purchaseCost ? Number(a.purchaseCost) : null,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
    );
  }

  async findOne(id: string) {
    const asset = await this.prisma.garmentAsset.findUnique({
      where: { id },
<<<<<<< HEAD
      include: { garment: { select: { name: true } }, garment_sizes: { select: { size_label: true, daily_price: true } } },
=======
      include: { garment: { select: { name: true, sizeLabel: true, dailyPrice: true } } },
>>>>>>> 6fb0177 (role manager)
    });
    if (!asset) throw new NotFoundException("Garment asset not found.");

    return ok({
      id: asset.id,
      garmentId: asset.garmentId,
      garmentName: asset.garment.name,
<<<<<<< HEAD
        sizeLabel: asset.garment_sizes?.size_label ?? null,
      dailyPrice: asset.garment_sizes?.daily_price ? Number(asset.garment_sizes.daily_price) : 0,
=======
      sizeLabel: asset.garment.sizeLabel,
      dailyPrice: Number(asset.garment.dailyPrice),
>>>>>>> 6fb0177 (role manager)
      assetCode: asset.assetCode,
      status: asset.status,
      conditionNote: asset.conditionNote,
      purchaseCost: asset.purchaseCost ? Number(asset.purchaseCost) : null,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
    });
  }

  async findInspectionHistory(assetId: string) {
    const asset = await this.prisma.garmentAsset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException("Garment asset not found.");

    const sessions = await this.prisma.inspectionSession.findMany({
      where: { garmentAssetId: assetId },
      orderBy: { createdAt: "desc" },
      include: {
        findings: true,
        inspector: { include: { profile: true } },
        booking: { select: { id: true, rentalStartDate: true, rentalEndDate: true } },
      },
    });

    return ok(
      sessions.map((s) => ({
        id: s.id,
        bookingId: s.bookingId,
        status: s.status,
        note: s.note,
        createdAt: s.createdAt.toISOString(),
        completedAt: s.completedAt?.toISOString() ?? null,
        inspectorName: s.inspector?.profile?.fullName ?? s.inspector?.email ?? null,
        bookingDates: {
          start: s.booking.rentalStartDate.toISOString().slice(0, 10),
          end: s.booking.rentalEndDate.toISOString().slice(0, 10),
        },
        findings: s.findings.map((f) => ({
          id: f.id,
          findingType: f.findingType,
          severity: f.severity,
          penaltyAmount: Number(f.penaltyAmount),
          createdAt: f.createdAt.toISOString(),
        })),
      })),
    );
  }

  async updateStatus(id: string, dto: UpdateAssetStatusDto) {
    const asset = await this.prisma.garmentAsset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException("Garment asset not found.");

    const updated = await this.prisma.garmentAsset.update({
      where: { id },
      data: {
        status: dto.status as any,
        ...(dto.note ? { conditionNote: dto.note } : {}),
      },
<<<<<<< HEAD
      include: { garment: { select: { name: true } }, garment_sizes: { select: { size_label: true } } },
=======
      include: { garment: { select: { name: true, sizeLabel: true } } },
>>>>>>> 6fb0177 (role manager)
    });

    return ok({
      id: updated.id,
      assetCode: updated.assetCode,
      status: updated.status,
      conditionNote: updated.conditionNote,
      garmentName: updated.garment.name,
      updatedAt: updated.updatedAt.toISOString(),
    });
  }
}
