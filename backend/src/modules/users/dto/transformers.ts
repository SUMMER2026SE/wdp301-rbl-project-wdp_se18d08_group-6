type TransformInput = {
  value: unknown;
};

export function normalizeOptionalString({ value }: TransformInput) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function trimRequiredString({ value }: TransformInput) {
  return typeof value === "string" ? value.trim() : value;
}

export function normalizeOptionalNumber({ value }: TransformInput) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  return value;
}
