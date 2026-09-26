import { Role } from "@prisma/client";

export const roleLabels: Record<Role, string> = {
  PARENT: "Parent",
  DRIVER: "Bus Driver",
  ADMIN: "School Administrator",
};

export const rolePaths: Record<Role, string> = {
  PARENT: "/parent",
  DRIVER: "/driver",
  ADMIN: "/admin",
};

export const roleRedirects = rolePaths;

export const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/register"];
