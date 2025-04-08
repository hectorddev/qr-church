import mongoose from "mongoose";

// Definir el esquema para los eventos
const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Por favor ingresa un título para el evento"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  date: {
    type: String,
    required: [true, "Por favor ingresa una fecha para el evento"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Usa mongoose.models.Event para verificar si el modelo ya existe
// Evita el error "Cannot overwrite model once compiled"
export default mongoose.models.Event || mongoose.model("Event", EventSchema);
