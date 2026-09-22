export const ROLES = ['user', 'admin'] as const;
export type Role = (typeof ROLES)[number];

/** The authenticated identity the rest of the domain reasons about. */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export function isAdmin(user: Pick<AuthUser, 'role'>): boolean {
  return user.role === 'admin';
}

/** Better Auth stores `role` as a free string; anything unknown is a plain user. */
export function toRole(value: string | null | undefined): Role {
  return value === 'admin' ? 'admin' : 'user';
}
