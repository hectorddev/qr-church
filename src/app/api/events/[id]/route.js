import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db";
import Event from "../../../../models/Event";

const isMongoEnabled = !!process.env.MONGODB_URI;

// GET para obtener un evento específico
export async function GET(request, context) {
  if (!isMongoEnabled) {
    return NextResponse.json(
      { error: "Eventos API deshabilitada: falta MONGODB_URI" },
      { status: 503 }
    );
  }
  try {
    await connectToDatabase();
    const { params } = context;
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "ID de evento no válido" },
        { status: 400 }
      );
    }

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT para actualizar un evento específico
export async function PUT(request, context) {
  if (!isMongoEnabled) {
    return NextResponse.json(
      { error: "Eventos API deshabilitada: falta MONGODB_URI" },
      { status: 503 }
    );
  }
  try {
    const body = await request.json();
    await connectToDatabase();

    const { params } = context;
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "ID de evento no válido" },
        { status: 400 }
      );
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedEvent) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE para eliminar un evento específico
export async function DELETE(request, context) {
  if (!isMongoEnabled) {
    return NextResponse.json(
      { error: "Eventos API deshabilitada: falta MONGODB_URI" },
      { status: 503 }
    );
  }
  try {
    await connectToDatabase();

    const { params } = context;
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "ID de evento no válido" },
        { status: 400 }
      );
    }

    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Evento eliminado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
