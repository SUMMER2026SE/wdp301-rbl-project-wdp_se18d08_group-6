import { BadRequestException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  it("updates profile and returns the serialized authenticated user", async () => {
    const prisma = {
      profile: {
        upsert: vi.fn().mockResolvedValue(undefined),
      },
      userAccount: {
        findUnique: vi.fn().mockResolvedValue({
          id: "user-1",
          email: "customer@example.com",
          role: "customer",
          isActive: true,
          profile: {
            fullName: "Nguyen Van B",
            phone: "0909000000",
          },
        }),
      },
    };

    const service = new UsersService(prisma as never);
    const result = await service.updateProfile("user-1", { fullName: "Nguyen Van B", phone: "0909000000" });

    expect(prisma.profile.upsert).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      update: { fullName: "Nguyen Van B", phone: "0909000000" },
      create: { userId: "user-1", fullName: "Nguyen Van B", phone: "0909000000" },
    });
    expect(result).toEqual({
      success: true,
      data: {
        id: "user-1",
        email: "customer@example.com",
        role: "customer",
        isActive: true,
        fullName: "Nguyen Van B",
        phone: "0909000000",
      },
    });
  });

  it("rejects empty profile updates", async () => {
    const service = new UsersService({} as never);

    await expect(service.updateProfile("user-1", {})).rejects.toBeInstanceOf(BadRequestException);
  });

  it("returns the latest measurements when loading the customer profile page", async () => {
    const prisma = {
      customerMeasurement: {
        findFirst: vi.fn().mockResolvedValue({
          id: "measurement-1",
          heightCm: 165.5,
          weightKg: 50,
          bustCm: 84,
          waistCm: 64,
          hipCm: 90,
          usualSize: "M",
          createdAt: new Date("2026-06-12T00:00:00.000Z"),
        }),
      },
    };

    const service = new UsersService(prisma as never);
    const result = await service.getMeasurements("user-1");

    expect(prisma.customerMeasurement.findFirst).toHaveBeenCalledWith({
      where: { customerId: "user-1" },
      orderBy: { createdAt: "desc" },
    });
    expect(result.data?.usualSize).toBe("M");
  });

  it("creates a measurements row when the customer has none yet", async () => {
    const prisma = {
      customerMeasurement: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({
          id: "measurement-1",
          heightCm: 165.5,
          weightKg: 50,
          bustCm: 84,
          waistCm: 64,
          hipCm: 90,
          usualSize: "M",
          createdAt: new Date("2026-06-12T00:00:00.000Z"),
        }),
      },
    };

    const service = new UsersService(prisma as never);
    const result = await service.updateMeasurements("user-1", { heightCm: 165.5, usualSize: "M" });

    expect(prisma.customerMeasurement.create).toHaveBeenCalledWith({
      data: { customerId: "user-1", heightCm: 165.5, usualSize: "M" },
    });
    expect(result).toEqual({
      success: true,
      data: {
        id: "measurement-1",
        heightCm: 165.5,
        weightKg: 50,
        bustCm: 84,
        waistCm: 64,
        hipCm: 90,
        usualSize: "M",
        createdAt: new Date("2026-06-12T00:00:00.000Z"),
      },
    });
  });

  it("updates the latest measurements row when one already exists", async () => {
    const prisma = {
      customerMeasurement: {
        findFirst: vi.fn().mockResolvedValue({ id: "measurement-1" }),
        update: vi.fn().mockResolvedValue({
          id: "measurement-1",
          heightCm: 170,
          weightKg: null,
          bustCm: null,
          waistCm: null,
          hipCm: null,
          usualSize: null,
          createdAt: new Date("2026-06-12T00:00:00.000Z"),
        }),
      },
    };

    const service = new UsersService(prisma as never);
    await service.updateMeasurements("user-1", { heightCm: 170, weightKg: null });

    expect(prisma.customerMeasurement.update).toHaveBeenCalledWith({
      where: { id: "measurement-1" },
      data: { heightCm: 170, weightKg: null },
    });
  });

  it("makes the first address default automatically", async () => {
    const tx = {
      address: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        create: vi.fn().mockResolvedValue({
          id: "address-1",
          receiverName: "Nguyen Van A",
          phone: "0909000000",
          line1: "123 Le Loi",
          ward: null,
          district: "District 1",
          city: "Ho Chi Minh City",
          isDefault: true,
          createdAt: new Date("2026-06-12T00:00:00.000Z"),
        }),
      },
    };
    const prisma = {
      address: {
        count: vi.fn().mockResolvedValue(0),
      },
      $transaction: vi.fn(async (callback: (inner: typeof tx) => Promise<unknown>) => callback(tx)),
    };

    const service = new UsersService(prisma as never);
    const result = await service.createAddress("user-1", {
      receiverName: "Nguyen Van A",
      phone: "0909000000",
      line1: "123 Le Loi",
      district: "District 1",
      city: "Ho Chi Minh City",
      isDefault: false,
    });

    expect(tx.address.updateMany).toHaveBeenCalledWith({
      where: { customerId: "user-1", isDefault: true },
      data: { isDefault: false },
    });
    expect(tx.address.create).toHaveBeenCalledWith({
      data: {
        customerId: "user-1",
        receiverName: "Nguyen Van A",
        phone: "0909000000",
        line1: "123 Le Loi",
        ward: null,
        district: "District 1",
        city: "Ho Chi Minh City",
        isDefault: true,
      },
    });
    expect(result).toEqual({
      success: true,
      data: {
        id: "address-1",
        receiverName: "Nguyen Van A",
        phone: "0909000000",
        line1: "123 Le Loi",
        ward: null,
        district: "District 1",
        city: "Ho Chi Minh City",
        isDefault: true,
        createdAt: new Date("2026-06-12T00:00:00.000Z"),
      },
    });
  });

  it("lists addresses ordered by default first and newest first", async () => {
    const prisma = {
      address: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "address-1",
            receiverName: "Nguyen Van A",
            phone: "0909000000",
            line1: "123 Le Loi",
            ward: "Ben Nghe",
            district: "District 1",
            city: "Ho Chi Minh City",
            isDefault: true,
            createdAt: new Date("2026-06-12T00:00:00.000Z"),
          },
        ]),
      },
    };

    const service = new UsersService(prisma as never);
    const result = await service.listAddresses("user-1");

    expect(prisma.address.findMany).toHaveBeenCalledWith({
      where: { customerId: "user-1" },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    expect(result).toEqual({
      success: true,
      data: [
        {
          id: "address-1",
          receiverName: "Nguyen Van A",
          phone: "0909000000",
          line1: "123 Le Loi",
          ward: "Ben Nghe",
          district: "District 1",
          city: "Ho Chi Minh City",
          isDefault: true,
          createdAt: new Date("2026-06-12T00:00:00.000Z"),
        },
      ],
    });
  });
});
