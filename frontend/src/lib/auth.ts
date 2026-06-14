export type AppRole = "customer" | "staff" | "manager_owner" | "admin";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: AppRole;
  isActive: boolean;
  fullName: string | null;
  phone: string | null;
};

export type AuthSession = {
  accessToken: string;
  user: AuthenticatedUser;
};

export const AUTH_SESSION_STORAGE_KEY = "co_phuc_auth_session";

const LEGACY_ACCESS_TOKEN_KEY = "access_token";
const LEGACY_ROLE_KEY = "user_role";

const dashboardPathByRole: Record<AppRole, string> = {
  customer: "/dashboard/customer",
  staff: "/dashboard/staff",
  manager_owner: "/dashboard/manager",
  admin: "/dashboard/admin",
};

const roleLabelByRole: Record<AppRole, string> = {
  customer: "Customer",
  staff: "Staff",
  manager_owner: "Manager/Owner",
  admin: "Admin",
};

export function toAuthenticatedUser(user: Pick<AuthenticatedUser, "id" | "email" | "role"> & Partial<Omit<AuthenticatedUser, "id" | "email" | "role">>): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isActive: user.isActive ?? true,
    fullName: user.fullName ?? null,
    phone: user.phone ?? null,
  };
}

export function resolveDashboardPath(role: AppRole) {
  return dashboardPathByRole[role];
}

export function getRoleLabel(role: AppRole) {
  return roleLabelByRole[role];
}

export function normalizeNullableText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isRole(value: unknown): value is AppRole {
  return value === "customer" || value === "staff" || value === "manager_owner" || value === "admin";
}

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as { accessToken?: unknown; user?: Partial<AuthenticatedUser> & { id?: unknown; email?: unknown; role?: unknown } };
  return typeof candidate.accessToken === "string" && typeof candidate.user?.id === "string" && typeof candidate.user?.email === "string" && isRole(candidate.user?.role);
}

function readLegacySession(): AuthSession | null {
  const accessToken = window.localStorage.getItem(LEGACY_ACCESS_TOKEN_KEY);
  const role = window.localStorage.getItem(LEGACY_ROLE_KEY);

  return accessToken && isRole(role) ? { accessToken, user: toAuthenticatedUser({ id: "", email: "", role }) } : null;
}

export function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (!rawValue) {
    return readLegacySession();
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    return isAuthSession(parsed) ? { accessToken: parsed.accessToken, user: toAuthenticatedUser(parsed.user) } : readLegacySession();
  } catch {
    return readLegacySession();
  }
}
export function readStoredAccessToken() {
  return readStoredSession()?.accessToken ?? null;
}

export function storeAuthSession(session: AuthSession) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedSession = { accessToken: session.accessToken, user: toAuthenticatedUser(session.user) };
  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(normalizedSession));
  window.localStorage.setItem(LEGACY_ACCESS_TOKEN_KEY, normalizedSession.accessToken);
  window.localStorage.setItem(LEGACY_ROLE_KEY, normalizedSession.user.role);
}

export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(LEGACY_ROLE_KEY);
}
