import {
  crearDevocional,
  obtenerDevocionales,
} from "@/lib/database";
import { getBearerAuth, isAdminPayload } from "@/lib/api-auth";
import { validarCrearDevocional } from "@/lib/devocionales-utils";
import { ApiResponse, CrearDevocionalData, Devocional } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

// GET /api/devocionales — lista (autenticados). ?todos=1 solo admin (incluye inactivos)
export async function GET(request: NextRequest) {
  try {
    const auth = await getBearerAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }
    const todos =
      request.nextUrl.searchParams.get("todos") === "1" && isAdminPayload(auth);
    const lista = await obtenerDevocionales(!todos);
    return NextResponse.json<ApiResponse<Devocional[]>>({
      success: true,
      data: lista,
    });
  } catch (error) {
    console.error("GET devocionales:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST /api/devocionales — crear (solo admin)
export async function POST(request: NextRequest) {
  try {
    const auth = await getBearerAuth(request);
    if (!auth || !isAdminPayload(auth)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Permisos insuficientes" },
        { status: 403 }
      );
    }
    const body: CrearDevocionalData = await request.json();
    const err = validarCrearDevocional(body);
    if (err) {
      return NextResponse.json<ApiResponse>({ success: false, error: err }, { status: 400 });
    }
    const creado = await crearDevocional(body);
    return NextResponse.json<ApiResponse<Devocional>>(
      { success: true, data: creado, message: "Devocional creado" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST devocionales:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
