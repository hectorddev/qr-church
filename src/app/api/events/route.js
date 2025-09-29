import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/db";
import Event from "../../../models/Event";

const isMongoEnabled = !!process.env.MONGODB_URI;

// GET para obtener todos los eventos
export async function GET() {
  if (!isMongoEnabled) {
    return NextResponse.json(
      { error: "Eventos API deshabilitada: falta MONGODB_URI" },
      { status: 503 }
    );
  }
  try {
    await connectToDatabase();
    const events = await Event.find({}).sort({ date: 1 });
    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST para crear un nuevo evento
export async function POST(request) {
  if (!isMongoEnabled) {
    return NextResponse.json(
      { error: "Eventos API deshabilitada: falta MONGODB_URI" },
      { status: 503 }
    );
  }
  try {
    const body = await request.json();

    await connectToDatabase();

    const event = await Event.create(body);

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
