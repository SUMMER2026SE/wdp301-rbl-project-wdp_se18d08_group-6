import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { ok } from "../../common/api-response";
import { LocationsService } from "./locations.service";

@Controller("locations")
export class LocationsController {
  constructor(private readonly locations: LocationsService) {}

  @Get("suggest")
  async suggest(@Query("q") query = "") {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      return ok([]);
    }

    return ok(await this.locations.suggest(normalizedQuery));
  }

  @Get("resolve")
  async resolve(@Query("placeId") placeId = "") {
    const normalizedPlaceId = placeId.trim();
    if (!normalizedPlaceId) {
      throw new BadRequestException("Thiếu mã địa điểm.");
    }

    return ok(await this.locations.resolve(normalizedPlaceId));
  }

  @Get("reverse")
  async reverse(@Query("lat") lat = "", @Query("lng") lng = "") {
    const { latitude, longitude } = this.parseCoordinates(lat, lng);
    return ok(await this.locations.reverse(latitude, longitude));
  }

  @Get("reverse-geocode")
  async reverseGeocode(@Query("lat") lat = "", @Query("lng") lng = "") {
    const { latitude, longitude } = this.parseCoordinates(lat, lng);
    return ok(await this.locations.reverseGeocode(latitude, longitude));
  }

  @Get("directions")
  async directions(@Query("origin") origin = "", @Query("destination") destination = "") {
    if (!this.isCoordinatePair(origin) || !this.isCoordinatePair(destination)) {
      throw new BadRequestException("origin và destination phải có định dạng lat,lng.");
    }

    return ok(await this.locations.directions(origin, destination));
  }

  private parseCoordinates(lat: string, lng: string) {
    const latitude = Number(lat);
    const longitude = Number(lng);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new BadRequestException("Tọa độ không hợp lệ.");
    }

    return { latitude, longitude };
  }

  private isCoordinatePair(value: string) {
    const [lat, lng, extra] = value.split(",");
    return extra === undefined && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
  }
}
