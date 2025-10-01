import { AuthResponse, LoginData, Usuario } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

// Simulación de base de datos de usuarios
// En un proyecto real, esto vendría de una base de datos
const usuarios: Usuario[] = [
  {
    id: "1",
    nombre: "admin",
    versiculo_id: "juan316",
    rol: "admin",
    puntuacion: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    nombre: "usuario1",
    versiculo_id: "mateo2819",
    rol: "usuario",
    puntuacion: 150,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    nombre: "usuario2",
    versiculo_id: "salmo231",
    rol: "usuario",
    puntuacion: 200,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

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
