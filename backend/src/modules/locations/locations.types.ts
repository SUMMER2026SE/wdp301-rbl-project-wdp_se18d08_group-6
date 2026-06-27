export type AddressSuggestion = {
  placeId: string;
  label: string;
  mainText?: string;
  secondaryText?: string;
  types?: string[];
};

export type ResolvedAddress = {
  fullAddress: string;
  name?: string;
  district?: string;
  province?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  provider: "gogoduk";
  providerPlaceId?: string;
};

export type AdministrativeArea = {
  latitude: number;
  longitude: number;
  city: string | null;
  district: string | null;
};

export type DirectionSummary = {
  status: "OK" | "ESTIMATED" | string;
  distanceMeters: number | null;
  durationSeconds: number | null;
  distanceText: string | null;
  durationText: string | null;
  raw: unknown;
};
