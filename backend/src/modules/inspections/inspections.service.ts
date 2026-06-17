import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  AssetStatus,
  BookingStatus,
  InspectionStatus,
  Prisma,
} from "@prisma/client";
import { ok } from "../../common/api-response";
import { PrismaService } from "../../prisma/prisma.service";
import type { CompleteAssetStatus, CompleteInspectionDto } from "./dto/complete-inspection.dto";
import type { CreateFindingDto } from "./dto/create-finding.dto";
import type { CreateInspectionDto } from "./dto/create-inspection.dto";
import type { CreatePhotoDto } from "./dto/create-photo.dto";

const ASSET_ITEMS_INCLUDE = {
  items: {
    include: {
      garment: true,
      garmentAsset: true,
    },
  },
} satisfies Prisma.BookingInclude;

type InspectionWithRelations = Prisma.InspectionSessionGetPayload<{
  include: {
    findings: true;
    photos: true;
    booking: {
      include: typeof ASSET_ITEMS_INCLUDE;
    };
    garmentAsset: {
      include: { garment: true };
    };
    inspector: {
      include: { profile: true };
    };
  };
}>;

@Injectable()
export class InspectionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo hoặc lấy lại inspection session cho một item cụ thể trong booking.
   * Nếu đã có session chưa hoàn thành thì trả về session cũ.
   */
  async createOrGet(dto: CreateInspectionDto, staffId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
    });
    if (!booking) throw new NotFoundException("Booking not found.");

    // Kiểm tra garment asset tồn tại
    const asset = await this.prisma.garmentAsset.findUnique({
      where: { id: dto.garmentAssetId },
      include: { garment: true },
    });
    if (!asset) throw new NotFoundException("Garment asset not found.");

    // Fix #2: Chỉ cho phép inspect asset đang ở inspection_pending
    if (asset.status !== AssetStatus.inspection_pending) {
      throw new BadRequestException(
        `Asset '${asset.assetCode}' is not ready for inspection (current status: ${asset.status}). ` +
        `Asset must be in 'inspection_pending' status.`,
      );
    }

    // Tìm session chưa hoàn thành trước đó
    const existing = await this.prisma.inspectionSession.findFirst({
      where: {
        bookingId: dto.bookingId,
        garmentAssetId: dto.garmentAssetId,
        status: { not: InspectionStatus.completed },
      },
      include: {
        findings: true,
        photos: true,
        booking: { include: ASSET_ITEMS_INCLUDE },
        garmentAsset: { include: { garment: true } },
        inspector: { include: { profile: true } },
      },
    });

    if (existing) {
      return ok(this.serializeInspection(existing));
    }

    // Fix #3: Tự động chuyển booking returned → inspection_pending khi bắt đầu inspect
    const session = await this.prisma.$transaction(async (tx) => {
      if (booking.status === BookingStatus.returned) {
        await tx.booking.update({
          where: { id: dto.bookingId },
          data: { status: BookingStatus.inspection_pending },
        });
        await tx.bookingStatusHistory.create({
          data: {
            bookingId: dto.bookingId,
            fromStatus: BookingStatus.returned,
            toStatus: BookingStatus.inspection_pending,
            changedBy: staffId,
            note: "Bắt đầu kiểm tra — inspection session created",
          },
        });
      }

      return tx.inspectionSession.create({
        data: {
          bookingId: dto.bookingId,
          garmentAssetId: dto.garmentAssetId,
          status: InspectionStatus.in_progress,
          inspectedBy: staffId,
          note: dto.note ?? null,
        },
        include: {
          findings: true,
          photos: true,
          booking: { include: ASSET_ITEMS_INCLUDE },
          garmentAsset: { include: { garment: true } },
          inspector: { include: { profile: true } },
        },
      });
    });

    return ok(this.serializeInspection(session));
  }

  /**
   * Lấy tất cả inspection sessions theo booking.
   */
  async findByBooking(bookingId: string) {
    const sessions = await this.prisma.inspectionSession.findMany({
      where: { bookingId },
      orderBy: { createdAt: "desc" },
      include: {
        findings: true,
        photos: true,
        booking: { include: ASSET_ITEMS_INCLUDE },
        garmentAsset: { include: { garment: true } },
        inspector: { include: { profile: true } },
      },
    });

    return ok(sessions.map((s) => this.serializeInspection(s)));
  }

  /**
   * Lấy chi tiết một inspection session.
   */
  async findOne(id: string) {
    const session = await this.prisma.inspectionSession.findUnique({
      where: { id },
      include: {
        findings: true,
        photos: true,
        booking: { include: ASSET_ITEMS_INCLUDE },
        garmentAsset: { include: { garment: true } },
        inspector: { include: { profile: true } },
      },
    });

    if (!session) throw new NotFoundException("Inspection session not found.");
    return ok(this.serializeInspection(session));
  }

  /**
   * Thêm finding (ghi nhận hư hỏng, lỗi...) vào session.
   */
  async addFinding(sessionId: string, dto: CreateFindingDto) {
    const session = await this.prisma.inspectionSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException("Inspection session not found.");
    if (session.status === InspectionStatus.completed) {
      throw new BadRequestException("Cannot add finding to a completed inspection.");
    }

    const finding = await this.prisma.inspectionFinding.create({
      data: {
        inspectionSessionId: sessionId,
        findingType: dto.findingType,
        severity: dto.severity ?? "low",
        description: dto.description ?? null,
        penaltyAmount: dto.penaltyAmount ?? 0,
      },
    });

    return ok(this.serializeFinding(finding));
  }

  /**
   * Thêm ảnh bằng chứng vào session.
   */
  async addPhoto(sessionId: string, dto: CreatePhotoDto) {
    const session = await this.prisma.inspectionSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException("Inspection session not found.");
    if (session.status === InspectionStatus.completed) {
      throw new BadRequestException("Cannot add photo to a completed inspection.");
    }

    const photo = await this.prisma.inspectionPhoto.create({
      data: {
        inspectionSessionId: sessionId,
        imageUrl: dto.imageUrl,
        note: dto.note ?? null,
      },
    });

    return ok({
      id: photo.id,
      imageUrl: photo.imageUrl,
      note: photo.note,
      createdAt: photo.createdAt.toISOString(),
    });
  }

  /**
   * Hoàn tất inspection session:
   * - Cập nhật GarmentAsset.status theo finalAssetStatus
   * - Tạo LaundryTicket nếu laundry
   * - Tạo MaintenanceJob nếu maintenance
   * - Cập nhật Booking.penaltyTotal nếu có findings có penalty
   * - Nếu toàn bộ asset của booking đã xử lý xong, completed booking
   */
  async complete(id: string, dto: CompleteInspectionDto, staffId: string) {
    const session = await this.prisma.inspectionSession.findUnique({
      where: { id },
      include: {
        findings: true,
        booking: { include: { items: true } },
      },
    });
    if (!session) throw new NotFoundException("Inspection session not found.");
    if (session.status === InspectionStatus.completed) {
      throw new BadRequestException("Inspection has already been completed.");
    }

    const finalAssetStatus = dto.finalAssetStatus as AssetStatus;
    const bookingId = session.bookingId;
    const garmentAssetId = session.garmentAssetId;

    const updated = await this.prisma.$transaction(async (tx) => {
      // 1. Cập nhật asset status
      await tx.garmentAsset.update({
        where: { id: garmentAssetId },
        data: { status: finalAssetStatus },
      });

      // 2. Tạo ticket phụ trợ nếu cần
      if (finalAssetStatus === AssetStatus.laundry) {
        await tx.laundryTicket.create({
          data: {
            garmentAssetId,
            bookingId,
            status: "open",
            note: dto.note ?? `Tạo từ inspection ${id}`,
          },
        });
      }

      if (finalAssetStatus === AssetStatus.maintenance) {
        await tx.maintenanceJob.create({
          data: {
            garmentAssetId,
            status: "open",
            note: dto.note ?? `Tạo từ inspection ${id}`,
          },
        });
      }

      // 3. Tính tổng penalty từ findings và cập nhật booking
      const totalPenalty = session.findings.reduce(
        (sum, f) => sum + Number(f.penaltyAmount),
        0,
      );
      if (totalPenalty > 0) {
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            penaltyTotal: { increment: totalPenalty },
          },
        });

        // Tạo penalty record
        await tx.penalty.create({
          data: {
            bookingId,
            reason: dto.note ?? `Inspection findings for session ${id}`,
            amount: totalPenalty,
            createdBy: staffId,
          },
        });
      }

      // 4. Hoàn tất inspection session
      const completedSession = await tx.inspectionSession.update({
        where: { id },
        data: {
          status: InspectionStatus.completed,
          completedAt: new Date(),
          ...(dto.note ? { note: dto.note } : {}),
        },
        include: {
          findings: true,
          photos: true,
          booking: { include: ASSET_ITEMS_INCLUDE },
          garmentAsset: { include: { garment: true } },
          inspector: { include: { profile: true } },
        },
      });

      // 5. Nếu tất cả asset đã được xử lý (không còn inspection_pending), hoàn tất booking
      const assignedAssetIds = session.booking.items
        .map((item) => item.garmentAssetId)
        .filter((assetId): assetId is string => Boolean(assetId));

      if (assignedAssetIds.length > 0) {
        const pendingCount = await tx.garmentAsset.count({
          where: {
            id: { in: assignedAssetIds },
            status: AssetStatus.inspection_pending,
          },
        });

        if (pendingCount === 0) {
          const previousStatus = session.booking.status;

          await tx.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.completed },
          });

          // Fix #1: Dùng trạng thái thực tế của booking, không hardcode inspection_pending
          await tx.bookingStatusHistory.create({
            data: {
              bookingId,
              fromStatus: previousStatus,
              toStatus: BookingStatus.completed,
              changedBy: staffId,
              note: "All items inspected",
            },
          });
        }
      }

      return completedSession;
    });

    return ok(this.serializeInspection(updated));
  }

  // ── Serialization helpers ──────────────────────────────────────────────────

  private serializeFinding(
    finding: Prisma.InspectionFindingGetPayload<Record<string, never>>,
  ) {
    return {
      id: finding.id,
      findingType: finding.findingType,
      severity: finding.severity,
      description: finding.description,
      penaltyAmount: Number(finding.penaltyAmount),
      createdAt: finding.createdAt.toISOString(),
    };
  }

  private serializeInspection(session: InspectionWithRelations) {
    return {
      id: session.id,
      bookingId: session.bookingId,
      garmentAssetId: session.garmentAssetId,
      status: session.status,
      note: session.note,
      createdAt: session.createdAt.toISOString(),
      completedAt: session.completedAt?.toISOString() ?? null,
      inspector: session.inspector
        ? {
            id: session.inspector.id,
            fullName: session.inspector.profile?.fullName ?? session.inspector.email,
          }
        : null,
      asset: {
        id: session.garmentAsset.id,
        assetCode: session.garmentAsset.assetCode,
        status: session.garmentAsset.status,
        conditionNote: session.garmentAsset.conditionNote,
        garment: {
          id: session.garmentAsset.garment.id,
          name: session.garmentAsset.garment.name,
          sizeLabel: session.garmentAsset.garment.sizeLabel,
        },
      },
      booking: {
        id: session.booking.id,
        status: session.booking.status,
        customerName: null, // Not included in session include
        rentalStartDate: session.booking.rentalStartDate.toISOString().slice(0, 10),
        rentalEndDate: session.booking.rentalEndDate.toISOString().slice(0, 10),
        items: session.booking.items.map((item) => ({
          id: item.id,
          garmentId: item.garmentId,
          garmentName: item.garment?.name ?? null,
          sizeLabel: item.garment?.sizeLabel ?? null,
          assetCode: item.garmentAsset?.assetCode ?? null,
        })),
      },
      findings: session.findings.map((f) => this.serializeFinding(f)),
      photos: session.photos.map((p) => ({
        id: p.id,
        imageUrl: p.imageUrl,
        note: p.note,
        createdAt: p.createdAt.toISOString(),
      })),
    };
  }
}
