import { BadRequestException, Injectable } from "@nestjs/common";
import { ok } from "../../common/api-response";
import { PrismaService } from "../../prisma/prisma.service";
import { toAuthenticatedUser } from "../auth/auth-user";

type UpdateProfileInput = {
  fullName?: string | null;
  phone?: string | null;
};

type UpdateMeasurementsInput = {
  heightCm?: number | null;
  weightKg?: number | null;
  bustCm?: number | null;
  waistCm?: number | null;
  hipCm?: number | null;
  usualSize?: string | null;
};

type CreateAddressInput = {
  receiverName: string;
  phone: string;
  line1: string;
  ward?: string | null;
  district?: string | null;
  city?: string | null;
  isDefault?: boolean;
};

type MeasurementRecord = {
  id: string;
  heightCm: unknown;
  weightKg: unknown;
  bustCm: unknown;
  waistCm: unknown;
  hipCm: unknown;
  usualSize: string | null;
  createdAt: Date;
};

type AddressRecord = {
  id: string;
  receiverName: string;
  phone: string;
  line1: string;
  ward: string | null;
  district: string | null;
  city: string | null;
  isDefault: boolean;
  createdAt: Date;
};

type UsersTransactionClient = {
  address: {
    updateMany(args: unknown): Promise<unknown>;
    create(args: unknown): Promise<AddressRecord>;
  };
};

type UsersPrismaBridge = {
  profile: PrismaService["profile"];
  userAccount: PrismaService["userAccount"];
  customerMeasurement: {
    findFirst(args: unknown): Promise<MeasurementRecord | null>;
    update(args: unknown): Promise<MeasurementRecord>;
    create(args: unknown): Promise<MeasurementRecord>;
  };
  address: {
    count(args: unknown): Promise<number>;
    findMany(args: unknown): Promise<AddressRecord[]>;
  };
  $transaction<T>(callback: (tx: UsersTransactionClient) => Promise<T>): Promise<T>;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const profileData = this.pickDefined({
      fullName: input.fullName,
      phone: input.phone,
    });

    if (Object.keys(profileData).length === 0) {
      throw new BadRequestException("At least one profile field is required.");
    }

    await this.prisma.profile.upsert({
      where: { userId },
      update: profileData,
      create: {
        userId,
        ...profileData,
      },
    });

    const user = await this.prisma.userAccount.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new BadRequestException("User account no longer exists.");
    }

    return ok(toAuthenticatedUser(user));
  }

  async getMeasurements(userId: string) {
    const prisma = this.prisma as unknown as UsersPrismaBridge;
    const measurement = await prisma.customerMeasurement.findFirst({
      where: { customerId: userId },
      orderBy: { createdAt: "desc" },
    });

    return ok(measurement ? this.serializeMeasurement(measurement) : null);
  }

  async updateMeasurements(userId: string, input: UpdateMeasurementsInput) {
    const prisma = this.prisma as unknown as UsersPrismaBridge;
    const measurementData = this.pickDefined({
      heightCm: input.heightCm,
      weightKg: input.weightKg,
      bustCm: input.bustCm,
      waistCm: input.waistCm,
      hipCm: input.hipCm,
      usualSize: input.usualSize,
    });

    if (Object.keys(measurementData).length === 0) {
      throw new BadRequestException("At least one measurement field is required.");
    }

    const existingMeasurement = await prisma.customerMeasurement.findFirst({
      where: { customerId: userId },
      orderBy: { createdAt: "desc" },
    });

    const measurement = existingMeasurement
      ? await prisma.customerMeasurement.update({
          where: { id: existingMeasurement.id },
          data: measurementData,
        })
      : await prisma.customerMeasurement.create({
          data: {
            customerId: userId,
            ...measurementData,
          },
        });

    return ok(this.serializeMeasurement(measurement));
  }

  async createAddress(userId: string, input: CreateAddressInput) {
    const prisma = this.prisma as unknown as UsersPrismaBridge;
    const addressCount = await prisma.address.count({ where: { customerId: userId } });
    const shouldBeDefault = input.isDefault === true || addressCount === 0;

    const address = await prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { customerId: userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          customerId: userId,
          receiverName: input.receiverName,
          phone: input.phone,
          line1: input.line1,
          ward: input.ward ?? null,
          district: input.district ?? null,
          city: input.city ?? null,
          isDefault: shouldBeDefault,
        },
      });
    });

    return ok(this.serializeAddress(address));
  }

  async listAddresses(userId: string) {
    const prisma = this.prisma as unknown as UsersPrismaBridge;
    const addresses = await prisma.address.findMany({
      where: { customerId: userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return ok(addresses.map((address) => this.serializeAddress(address)));
  }

  private pickDefined<T extends Record<string, unknown>>(input: T) {
    return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;
  }

  private serializeMeasurement(measurement: MeasurementRecord) {
    return {
      id: measurement.id,
      heightCm: this.toNullableNumber(measurement.heightCm),
      weightKg: this.toNullableNumber(measurement.weightKg),
      bustCm: this.toNullableNumber(measurement.bustCm),
      waistCm: this.toNullableNumber(measurement.waistCm),
      hipCm: this.toNullableNumber(measurement.hipCm),
      usualSize: measurement.usualSize,
      createdAt: measurement.createdAt,
    };
  }

  private serializeAddress(address: AddressRecord) {
    return {
      id: address.id,
      receiverName: address.receiverName,
      phone: address.phone,
      line1: address.line1,
      ward: address.ward,
      district: address.district,
      city: address.city,
      isDefault: address.isDefault,
      createdAt: address.createdAt,
    };
  }

  private toNullableNumber(value: unknown) {
    return value === null || value === undefined ? null : Number(value);
  }
}
