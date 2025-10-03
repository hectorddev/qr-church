import { obtenerUsuarios } from "@/lib/database";
import { AuthResponse, LoginData } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body: LoginData = await request.json();
    const { nombre, versiculo_id } = body;

    // Validar que se proporcionen ambos campos
    if (!nombre || !versiculo_id) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          error: "Nombre y versículo ID son requeridos",
        },
        { status: 400 }
      );
    }

    // Obtener usuarios de la base de datos
    const usuarios = await obtenerUsuarios();

    // Buscar usuario por nombre y versículo_id
    const usuario = usuarios.find(
      (u) =>
        u.nombre.toLowerCase() === nombre.toLowerCase() &&
        u.versiculo_id.toLowerCase() === versiculo_id.toLowerCase()
    );

    if (!usuario) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          error: "Credenciales incorrectas",
        },
        { status: 401 }
      );
    }

    // En un proyecto real, aquí generarías un JWT token
    const token = `token_${usuario.id}_${Date.now()}`;

    return NextResponse.json<AuthResponse>({
      success: true,
      usuario,
      token,
    });
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
