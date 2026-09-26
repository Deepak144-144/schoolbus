import { Role } from "@prisma/client";

export const roleRedirects: Record<Role, string> = {
  PARENT: "/parent",
  DRIVER: "/driver",
  ADMIN: "/admin",
};

export function getRoleRedirectPath(role: Role): string {
  return roleRedirects[role];
}

export function requireRole(requiredRole: Role | Role[]): Role[] {
  if (Array.isArray(requiredRole)) {
    return requiredRole;
  }
  return [requiredRole];
}

export const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/register"];
