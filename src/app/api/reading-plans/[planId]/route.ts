import { NextRequest, NextResponse } from "next/server";
import {
    obtenerPlanConProgreso,
    actualizarPlanLectura,
    eliminarPlanLectura,
} from "@/lib/database";
import { CreatePlanData } from "@/lib/types";

// GET /api/reading-plans/[planId] - Obtener plan específico con progreso
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ planId: string }> }
) {
    try {
        const userId = request.headers.get("x-user-id") || "guest";
        const { planId } = await params;

        const plan = await obtenerPlanConProgreso(planId, userId);

        if (!plan) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Plan no encontrado o no tienes permiso para verlo",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: plan,
        });
    } catch (error) {
        console.error("Error obteniendo plan:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido",
            },
            { status: 500 }
        );
    }
}

// PUT /api/reading-plans/[planId] - Actualizar plan
export async function PUT(
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

        const { planId } = await params;
        const body = await request.json();
        const data: Partial<CreatePlanData> = body;

        const plan = await actualizarPlanLectura(planId, data, userId);

        if (!plan) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Plan no encontrado",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: plan,
        });
    } catch (error) {
        console.error("Error actualizando plan:", error);

        // Verificar si es error de permisos
        if (error instanceof Error && error.message.includes("permiso")) {
            return NextResponse.json(
                {
                    success: false,
                    error: error.message,
                },
                { status: 403 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido",
            },
            { status: 500 }
        );
    }
}

// DELETE /api/reading-plans/[planId] - Eliminar plan
export async function DELETE(
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

        const { planId } = await params;

        const deleted = await eliminarPlanLectura(planId, userId);

        if (!deleted) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Plan no encontrado",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Plan eliminado correctamente",
        });
    } catch (error) {
        console.error("Error eliminando plan:", error);

        // Verificar si es error de permisos
        if (error instanceof Error && error.message.includes("permiso")) {
            return NextResponse.json(
                {
                    success: false,
                    error: error.message,
                },
                { status: 403 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido",
            },
            { status: 500 }
        );
    }
}
