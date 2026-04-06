import {
  actualizarDevocional,
  eliminarDevocional,
  obtenerDevocional,
} from "@/lib/database";
import { getBearerAuth, isAdminPayload } from "@/lib/api-auth";
import {
  sanitizarDevocionalParaCliente,
  validarCrearDevocional,
} from "@/lib/devocionales-utils";
import { ApiResponse, CrearDevocionalData, Devocional } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET — detalle. Admin con ?completo=1 recibe opciones correctas; resto sanitizado.
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getBearerAuth(request);
    if (!auth) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }
    const { id } = await params;
    const dev = await obtenerDevocional(id);
    if (!dev) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No encontrado" },
        { status: 404 }
      );
    }
    if (!dev.activo && !isAdminPayload(auth)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No encontrado" },
        { status: 404 }
      );
    }
    const completo =
      isAdminPayload(auth) &&
      request.nextUrl.searchParams.get("completo") === "1";
    const data = completo ? dev : sanitizarDevocionalParaCliente(dev);
    return NextResponse.json<ApiResponse<Devocional>>({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET devocional id:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT — actualizar (solo admin)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getBearerAuth(request);
    if (!auth || !isAdminPayload(auth)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Permisos insuficientes" },
        { status: 403 }
      );
    }
    const { id } = await params;
    const body: Partial<CrearDevocionalData> = await request.json();
    const existente = await obtenerDevocional(id);
    if (!existente) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No encontrado" },
        { status: 404 }
      );
    }
    const merged: CrearDevocionalData = {
      titulo: body.titulo ?? existente.titulo,
      descripcion: body.descripcion ?? existente.descripcion,
      imagen_url:
        body.imagen_url !== undefined
          ? body.imagen_url
          : existente.imagen_url,
      activo: body.activo ?? existente.activo,
      orden: body.orden ?? existente.orden,
      duracion_tema_dias:
        body.duracion_tema_dias ?? existente.duracion_tema_dias,
      fecha_inicio_programa:
        body.fecha_inicio_programa !== undefined
          ? body.fecha_inicio_programa
          : existente.fecha_inicio_programa,
      temas: body.temas ?? existente.temas,
    };
    const err = validarCrearDevocional(merged);
    if (err) {
      return NextResponse.json<ApiResponse>({ success: false, error: err }, { status: 400 });
    }
    const actualizado = await actualizarDevocional(id, merged);
    return NextResponse.json<ApiResponse<Devocional>>({
      success: true,
      data: actualizado!,
    });
  } catch (error) {
    console.error("PUT devocional id:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE — solo admin
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getBearerAuth(request);
    if (!auth || !isAdminPayload(auth)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Permisos insuficientes" },
        { status: 403 }
      );
    }
    const { id } = await params;
    const ok = await eliminarDevocional(id);
    if (!ok) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "No encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json<ApiResponse>({ success: true, message: "Eliminado" });
  } catch (error) {
    console.error("DELETE devocional id:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
