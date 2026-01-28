import { obtenerUsuarios } from "@/lib/database";
import { AuthResponse, LoginData } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body: LoginData = await request.json();
    const { nombre, versiculo_id } = body;
    // Debug autenticación (sin exponer secretos)
    const dbProvider = (process.env.DB_PROVIDER || "").toLowerCase();
    const hasMongo = !!process.env.MONGODB_URI;
    const hasSupabase =
      !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    console.log("[Auth] Intento de login:", {
      nombre,
      versiculo_id_len: versiculo_id?.length || 0,
      dbProvider,
      hasMongo,
      hasSupabase,
      env: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
    });

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
    console.log("[Auth] Obteniendo usuarios...");
    const usuarios = await obtenerUsuarios();
    console.log(
      "[Auth] Usuarios obtenidos:",
      Array.isArray(usuarios) ? usuarios.length : "N/A"
    );

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
    // Generar JWT token
    const { signToken } = await import("@/lib/auth-jwt");
    const token = await signToken({
      id: usuario.id,
      rol: usuario.rol,
      nombre: usuario.nombre
    });

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
