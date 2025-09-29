import { eliminarTodosPuntos } from "@/lib/database";
import { NextResponse } from "next/server";

// POST /api/puntos/reset - Resetear la base de datos
export async function POST() {
  try {
    const count = await eliminarTodosPuntos();

    return NextResponse.json({
      success: true,
      message: `Base de datos reseteada. ${count} puntos eliminados.`,
      data: { count },
    });
  } catch (error) {
    console.error("Error al resetear base de datos:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
