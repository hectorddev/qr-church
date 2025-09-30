// API Route para manejar puntos del mapa
import { crearPunto, eliminarTodosPuntos, obtenerPuntos } from "@/lib/database";
import { ApiResponse, CrearPuntoData } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

// GET /api/puntos - Obtener todos los puntos
export async function GET() {
  console.log("🔍 GET /api/puntos - Iniciando...");
  try {
    console.log("📡 Llamando a obtenerPuntos()...");
    const puntos = await obtenerPuntos();
    console.log("✅ obtenerPuntos() completado, puntos:", puntos?.length || 0);

    const response: ApiResponse = {
      success: true,
      data: puntos,
      message: "Puntos obtenidos exitosamente",
    };

    console.log("📤 Enviando respuesta exitosa");
    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Error al obtener puntos:", error);
    console.error("Stack trace:", error.stack);

    const response: ApiResponse = {
      success: false,
      error: "Error interno del servidor",
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/puntos - Crear un nuevo punto
export async function POST(request: NextRequest) {
  console.log("🔍 POST /api/puntos - Iniciando...");
  try {
    console.log("📄 Leyendo body de la request...");
    const body = await request.json();
    console.log("✅ Body parseado:", body);

    // Validar datos requeridos
    const { nombre, x, y, emoji, pointerName } = body;
    if (
      !nombre ||
      typeof x !== "number" ||
      typeof y !== "number" ||
      !emoji ||
      !pointerName
    ) {
      const response: ApiResponse = {
        success: false,
        error: "Datos requeridos: nombre, x, y, emoji, pointerName",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validar coordenadas
    if (x < 0 || x > 100 || y < 0 || y > 100) {
      const response: ApiResponse = {
        success: false,
        error: "Las coordenadas x e y deben estar entre 0 y 100",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const puntoData: CrearPuntoData = {
      nombre,
      x,
      y,
      emoji,
      pointerName,
      descripcion: body.descripcion || "",
      referencias: body.referencias || "",
      año: body.año || "",
    };

    const nuevoPunto = await crearPunto(puntoData);

    const response: ApiResponse = {
      success: true,
      data: nuevoPunto,
      message: "Punto creado exitosamente",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error al crear punto:", error);

    const response: ApiResponse = {
      success: false,
      error: "Error interno del servidor",
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/puntos - Eliminar todos los puntos
export async function DELETE() {
  try {
    const count = await eliminarTodosPuntos();

    const response: ApiResponse = {
      success: true,
      data: { count },
      message: `${count} puntos eliminados exitosamente`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error al eliminar puntos:", error);

    const response: ApiResponse = {
      success: false,
      error: "Error interno del servidor",
    };

    return NextResponse.json(response, { status: 500 });
  }
}
