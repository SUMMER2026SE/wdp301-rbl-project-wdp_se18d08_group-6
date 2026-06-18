import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AssetsModule } from "./modules/assets/assets.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BookingsModule } from "./modules/bookings/bookings.module";
import { GarmentsModule } from "./modules/garments/garments.module";
import { HealthModule } from "./modules/health/health.module";
import { InspectionsModule } from "./modules/inspections/inspections.module";
import { RefundsModule } from "./modules/refunds/refunds.module";
import { UsersModule } from "./modules/users/users.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AssetsModule,
    HealthModule,
    AuthModule,
    UsersModule,
    GarmentsModule,
    BookingsModule,
    InspectionsModule,
    RefundsModule,
  ],
})
export class AppModule {}
