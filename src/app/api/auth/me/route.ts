
import { verifyToken } from "@/lib/auth-jwt";
import { obtenerUsuario } from "@/lib/database";
import { ApiResponse, Usuario } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.split(" ")[1];

        if (!token) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: "No autorizado" },
                { status: 401 }
            );
        }

        const payload = await verifyToken(token);

        if (!payload || !payload.id) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: "Token inválido" },
                { status: 401 }
            );
        }

        // Obtener usuario fresco de la base de datos
        // @ts-ignore
        const usuario = await obtenerUsuario(payload.id);

        if (!usuario) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: "Usuario no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json<ApiResponse<Usuario>>({
            success: true,
            data: usuario,
        });
    } catch (error) {
        console.error("Error en validación de sesión:", error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: "Error interno" },
            { status: 500 }
        );
    }
}
