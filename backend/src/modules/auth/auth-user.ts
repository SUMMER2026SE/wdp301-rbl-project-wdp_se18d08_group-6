import type { AppRole, Profile, UserAccount } from "@prisma/client";

export type UserWithProfile = UserAccount & {
  profile: Profile | null;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: AppRole;
  isActive: boolean;
  fullName: string | null;
  phone: string | null;
};

export function toAuthenticatedUser(user: UserWithProfile): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    fullName: user.profile?.fullName ?? null,
    phone: user.profile?.phone ?? null,
  };
}
