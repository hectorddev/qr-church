import { NextRequest, NextResponse } from "next/server";
import {
    crearPlanLectura,
    obtenerPlanesLectura,
} from "@/lib/database";
import { CreatePlanData } from "@/lib/types";

// GET /api/reading-plans - Obtener planes visibles para el usuario
export async function GET(request: NextRequest) {
    try {
        // TODO: Obtener userId del token/sesión
        // Por ahora usamos un placeholder
        const userId = request.headers.get("x-user-id") || "guest";

        const { searchParams } = new URL(request.url);
        const filter = searchParams.get("filter") as "official" | "my" | "public" | null;

        const planes = await obtenerPlanesLectura(
            userId,
            filter || undefined
        );

        return NextResponse.json({
            success: true,
            data: planes,
        });
    } catch (error) {
        console.error("Error obteniendo planes:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido",
            },
            { status: 500 }
        );
    }
}

// POST /api/reading-plans - Crear nuevo plan
export async function POST(request: NextRequest) {
    try {
        // TODO: Implementar autenticación real
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
        const data: CreatePlanData = body;

        // Validaciones básicas
        if (!data.titulo || !data.descripcion || !data.icono) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Faltan campos requeridos: titulo, descripcion, icono",
                },
                { status: 400 }
            );
        }

        if (!Array.isArray(data.capitulos) || data.capitulos.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Debe incluir al menos un capítulo",
                },
                { status: 400 }
            );
        }

        const plan = await crearPlanLectura(data, userId);

        return NextResponse.json(
            {
                success: true,
                data: plan,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creando plan:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido",
            },
            { status: 500 }
        );
    }
}
