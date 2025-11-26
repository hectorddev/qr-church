import { NextRequest, NextResponse } from "next/server";
import { marcarCapituloCompletado } from "@/lib/database";

// POST /api/reading-plans/[planId]/progress - Marcar capítulo como completado/no completado
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ planId: string }> }
) {
    try {
        const userId = request.headers.get("x-user-id");

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "No autenticado",
                },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { chapterId, completado } = body;

        if (!chapterId || typeof completado !== "boolean") {
            return NextResponse.json(
                {
                    success: false,
                    error: "Faltan campos requeridos: chapterId, completado",
                },
                { status: 400 }
            );
        }

        const progreso = await marcarCapituloCompletado(
            chapterId,
            userId,
            completado
        );

        return NextResponse.json({
            success: true,
            data: progreso,
        });
    } catch (error) {
        console.error("Error actualizando progreso:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido",
            },
            { status: 500 }
        );
    }
}
