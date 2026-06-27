import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AddressSuggestion, AdministrativeArea, DirectionSummary, ResolvedAddress } from "./locations.types";

const DEFAULT_GOGODUK_BASE_URL = "https://api.gogoduk.com";

type RawRecord = Record<string, unknown>;

@Injectable()
export class LocationsService {
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = (this.config.get<string>("GOGODUK_BASE_URL") ?? DEFAULT_GOGODUK_BASE_URL).replace(/\/$/, "");
  }

  async suggest(query: string): Promise<AddressSuggestion[]> {
    const payload = await this.gogodukFetch<unknown>("/v1/suggest", { input: query, lang: "vi", country: "VN" });
    return this.extractArray(payload, ["predictions"])
      .map((item) => this.normalizeSuggestion(item))
      .filter((item): item is AddressSuggestion => item !== null);
  }

  async resolve(placeId: string): Promise<ResolvedAddress> {
    const payload = await this.gogodukFetch<unknown>("/v1/place/resolve", { id: placeId, lang: "vi" });
    return this.normalizeResolved(this.extractObject(payload, ["result"]));
  }

  async reverse(latitude: number, longitude: number): Promise<ResolvedAddress> {
    const payload = await this.gogodukFetch<unknown>("/v1/reverse", {
      "point.lat": latitude,
      "point.lon": longitude,
      size: 1,
      lang: "vi",
      "boundary.country": "VN",
    });
    const firstResult = this.extractArray(payload, ["results"])[0] ?? {};
    return this.normalizeResolved(firstResult);
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<AdministrativeArea> {
    const payload = await this.gogodukFetch<unknown>("/v1/reverse-geocode", {
      lat: latitude,
      lng: longitude,
      levels: "4,8",
    });
    const record = this.extractObject(payload);
    return {
      latitude: this.num(record.lat) ?? latitude,
      longitude: this.num(record.lng) ?? longitude,
      city: this.str(record.city) ?? null,
      district: this.str(record.district) ?? null,
    };
  }

  async directions(origin: string, destination: string): Promise<DirectionSummary> {
    const payload = await this.gogodukFetch<unknown>("/v1/directions", {
      origin,
      destination,
      vehicle: "motobike",
    });
    const record = this.extractObject(payload);
    const firstRoute = this.extractArray(record.routes)[0];
    const firstLeg = firstRoute ? this.extractArray(firstRoute.legs)[0] : undefined;
    const distance = firstLeg && typeof firstLeg.distance === "object" ? (firstLeg.distance as RawRecord) : undefined;
    const duration = firstLeg && typeof firstLeg.duration === "object" ? (firstLeg.duration as RawRecord) : undefined;

    return {
      status: this.str(record.status) ?? "UNKNOWN",
      distanceMeters: distance ? this.num(distance.value) ?? null : null,
      durationSeconds: duration ? this.num(duration.value) ?? null : null,
      distanceText: distance ? this.str(distance.text) ?? null : null,
      durationText: duration ? this.str(duration.text) ?? null : null,
      raw: payload,
    };
  }

  private async gogodukFetch<T>(path: string, params: Record<string, string | number | undefined>): Promise<T> {
    const apiKey = this.config.get<string>("GOGODUK_API_KEY")?.trim();
    if (!apiKey) {
      throw new HttpException("GOGODUK_API_KEY is not configured.", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const url = new URL(`${this.baseUrl}${path}`);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && `${value}`.length > 0) {
        url.searchParams.set(key, `${value}`);
      }
    }

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        headers: {
          "X-API-Key": apiKey,
          Accept: "application/json",
        },
      });
    } catch {
      throw new HttpException("Không thể kết nối đến dịch vụ địa chỉ.", HttpStatus.BAD_GATEWAY);
    }

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as RawRecord | null;
      const message = this.str(payload?.error) ?? this.str(payload?.message) ?? `GoGoDuk request failed with status ${response.status}.`;
      throw new HttpException(message, response.status);
    }

    return (await response.json()) as T;
  }

  private extractArray(payload: unknown, preferredKeys: string[] = []): RawRecord[] {
    if (Array.isArray(payload)) {
      return payload as RawRecord[];
    }

    if (payload && typeof payload === "object") {
      const record = payload as RawRecord;
      for (const key of [...preferredKeys, "data", "results", "suggestions", "items", "predictions", "routes", "legs"]) {
        const value = record[key];
        if (Array.isArray(value)) {
          return value as RawRecord[];
        }
      }
    }

    return [];
  }

  private extractObject(payload: unknown, preferredKeys: string[] = []): RawRecord {
    if (payload && typeof payload === "object") {
      const record = payload as RawRecord;
      for (const key of [...preferredKeys, "data", "result", "place"]) {
        const value = record[key];
        if (value && typeof value === "object" && !Array.isArray(value)) {
          return value as RawRecord;
        }
      }
      return record;
    }

    return {};
  }

  private normalizeSuggestion(raw: RawRecord): AddressSuggestion | null {
    const placeId = this.str(this.pick(raw, ["placeId", "id", "place_id", "ref"]));
    const label = this.str(this.pick(raw, ["text", "label", "description", "name", "address", "formatted"]));

    if (!placeId && !label) {
      return null;
    }

    const types = Array.isArray(raw.types) ? raw.types.filter((type): type is string => typeof type === "string") : undefined;

    return {
      placeId: placeId ?? label ?? "",
      label: label ?? placeId ?? "",
      mainText: this.str(raw.mainText),
      secondaryText: this.str(raw.secondaryText),
      types,
    };
  }

  private normalizeResolved(raw: RawRecord): ResolvedAddress {
    return {
      fullAddress: this.str(this.pick(raw, ["address", "text", "fullAddress", "full_address", "formatted", "label", "description"])) ?? "",
      name: this.str(raw.name),
      district: this.str(raw.district),
      province: this.str(this.pick(raw, ["city", "province"])),
      country: this.str(raw.country),
      latitude: this.num(this.pick(raw, ["lat", "latitude"])),
      longitude: this.num(this.pick(raw, ["lon", "lng", "longitude"])),
      provider: "gogoduk",
      providerPlaceId: this.str(this.pick(raw, ["placeId", "place_id", "id", "ref"])),
    };
  }

  private pick(record: RawRecord, keys: string[]) {
    for (const key of keys) {
      if (record[key] !== undefined && record[key] !== null) {
        return record[key];
      }
    }
    return undefined;
  }

  private str(value: unknown): string | undefined {
    return typeof value === "string" && value.trim().length > 0 ? value : undefined;
  }

  private num(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    }

    return undefined;
  }
}
