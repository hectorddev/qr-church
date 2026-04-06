import {
  crearSesionDevocional,
  listarSesionesUsuarioEnDevocional,
  obtenerSesionUsuarioPorLectura,
} from "@/lib/database";
import { getBearerAuth } from "@/lib/api-auth";
import {
  ApiResponse,
  CrearSesionDevocionalInput,
  DevocionalSesion,
} from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

// GET ?devocional_id= — sesiones del usuario en ese devocional.
// Opcional ?lectura_id= — solo la sesión más reciente vinculada a esa lectura (0 o 1 ítem).
export async function GET(request: NextRequest) {
  try {
    const auth = await getBearerAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }
    const devocionalId = request.nextUrl.searchParams.get("devocional_id");
    if (!devocionalId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Falta devocional_id" },
        { status: 400 }
      );
    }
    const lecturaId = request.nextUrl.searchParams.get("lectura_id")?.trim();
    if (lecturaId) {
      const ses = await obtenerSesionUsuarioPorLectura(
        auth.id,
        devocionalId,
        lecturaId
      );
      return NextResponse.json<ApiResponse<DevocionalSesion[]>>({
        success: true,
        data: ses ? [ses] : [],
      });
    }
    const lista = await listarSesionesUsuarioEnDevocional(
      auth.id,
      devocionalId
    );
    return NextResponse.json<ApiResponse<DevocionalSesion[]>>({
      success: true,
      data: lista,
    });
  } catch (error) {
    console.error("GET devocional sesiones:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST /api/devocionales/sesiones — iniciar sesión (ahora solo individual; pareja reservado para más adelante)
export async function POST(request: NextRequest) {
  try {
    const auth = await getBearerAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }
    const body: CrearSesionDevocionalInput = await request.json();
    if (!body.devocional_id || !body.modo || !body.lectura_id?.trim()) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error:
            "devocional_id, lectura_id y modo son obligatorios",
        },
        { status: 400 }
      );
    }
    if (body.modo !== "solo" && body.modo !== "pareja") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "modo debe ser solo o pareja" },
        { status: 400 }
      );
    }
    if (body.modo === "pareja") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error:
            "El modo en pareja no está disponible por ahora. Usa lectura individual.",
        },
        { status: 400 }
      );
    }
    try {
      const sesion = await crearSesionDevocional(body, auth.id);
      return NextResponse.json<ApiResponse<DevocionalSesion>>(
        { success: true, data: sesion },
        { status: 201 }
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al crear sesión";
      return NextResponse.json<ApiResponse>(
        { success: false, error: msg },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("POST devocional sesiones:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
