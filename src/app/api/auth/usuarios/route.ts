import {
  crearUsuario,
  eliminarUsuario,
  obtenerUsuario,
  obtenerUsuarios,
} from "@/lib/database";
import { ApiResponse, CrearUsuarioData, Usuario } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

// GET - Obtener todos los usuarios (solo admin)
export async function GET(request: NextRequest) {
  try {
    // En un proyecto real, aquí verificarías el token JWT y el rol de admin
    // Por simplicidad, asumimos que si llega aquí es admin

    const usuarios = await obtenerUsuarios();

    return NextResponse.json<ApiResponse<Usuario[]>>({
      success: true,
      data: usuarios,
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo usuario (solo admin)
export async function POST(request: NextRequest) {
  try {
    const body: CrearUsuarioData = await request.json();
    const { nombre, versiculo_id, rol } = body;

    // Validar campos requeridos
    if (!nombre || !versiculo_id || !rol) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Nombre, versículo ID y rol son requeridos",
        },
        { status: 400 }
      );
    }

    // Validar que el rol sea válido
    if (!["admin", "usuario"].includes(rol)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Rol debe ser "admin" o "usuario"',
        },
        { status: 400 }
      );
    }

    // Verificar que no exista un usuario con el mismo nombre o versículo_id
    const todosUsuarios = await obtenerUsuarios();
    const usuarioExistente = todosUsuarios.find(
      (u) =>
        u.nombre.toLowerCase() === nombre.toLowerCase() ||
        u.versiculo_id.toLowerCase() === versiculo_id.toLowerCase()
    );

    if (usuarioExistente) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Ya existe un usuario con ese nombre o versículo ID",
        },
        { status: 409 }
      );
    }

    // Crear nuevo usuario
    const nuevoUsuario = await crearUsuario({
      nombre,
      versiculo_id,
      rol,
      puntuacion: body.puntuacion || 0,
    });

    return NextResponse.json<ApiResponse<Usuario>>(
      {
        success: true,
        data: nuevoUsuario,
        message: "Usuario creado exitosamente",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar usuario (solo admin)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "ID de usuario es requerido",
        },
        { status: 400 }
      );
    }

    // En un proyecto real, aquí verificarías el token JWT y el rol de admin
    // Por simplicidad, asumimos que si llega aquí es admin

    const usuario = await obtenerUsuario(id);
    if (!usuario) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Usuario no encontrado",
        },
        { status: 404 }
      );
    }

    // No permitir eliminar al admin principal
    if (usuario.nombre === "admin") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "No se puede eliminar al administrador principal",
        },
        { status: 403 }
      );
    }

    await eliminarUsuario(id);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Usuario eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
