import { actualizarPuntuacionUsuario, obtenerUsuario } from "@/lib/database";
import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PUT /api/usuarios/[id]/puntuacion - Actualizar puntuación de un usuario
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { puntuacion } = body;

    // Verificar autenticación y rol
    const { verifyToken } = await import("@/lib/auth-jwt");
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Token inválido" },
        { status: 401 }
      );
    }

    // @ts-ignore
    const isAdmin = payload.rol === "admin";
    // @ts-ignore
    const isOwner = payload.id === id;

    // Only allow if user is admin OR updating their own score
    if (!isAdmin && !isOwner) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No puedes modificar la puntuación de otro usuario" },
        { status: 403 }
      );
    }

    // Validar que la puntuación sea un número
    if (typeof puntuacion !== "number" || puntuacion < 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "La puntuación debe ser un número positivo",
        },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const usuario = await obtenerUsuario(id);
    if (!usuario) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Usuario no encontrado",
        },
        { status: 404 }
      );
    }

    // Actualizar puntuación
    const usuarioActualizado = await actualizarPuntuacionUsuario(
      id,
      puntuacion
    );

    if (!usuarioActualizado) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Error al actualizar la puntuación",
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: usuarioActualizado,
      message: "Puntuación actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar puntuación:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
