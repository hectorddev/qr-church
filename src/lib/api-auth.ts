import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth-jwt";

export type AuthPayload = {
  id: string;
  rol: string;
  nombre?: string;
};

export async function getBearerAuth(
  request: NextRequest
): Promise<AuthPayload | null> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || typeof payload.id !== "string") return null;
  return {
    id: payload.id,
    rol: String((payload as { rol?: string }).rol || "usuario"),
    nombre: (payload as { nombre?: string }).nombre,
  };
}

export function isAdminPayload(payload: AuthPayload | null): boolean {
  return payload?.rol === "admin";
}
