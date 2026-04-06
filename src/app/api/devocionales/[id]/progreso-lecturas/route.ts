import { obtenerResumenProgresoLecturas } from "@/lib/database";
import { getBearerAuth } from "@/lib/api-auth";
import { ApiResponse, ResumenProgresoLecturas } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET — progreso por lecturas: tema activo por defecto, o `?tema_id=` para un tema concreto
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
    const temaId = request.nextUrl.searchParams.get("tema_id");
    const data = await obtenerResumenProgresoLecturas(
      auth.id,
      id,
      temaId
    );
    return NextResponse.json<ApiResponse<ResumenProgresoLecturas>>({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET progreso-lecturas:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
