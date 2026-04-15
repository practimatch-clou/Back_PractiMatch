const mongoose = require("mongoose");

const ResenaSchema = new mongoose.Schema(
  {
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    estudianteId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    citaId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true, unique: true },
    calificacion: { type: Number, required: true, min: 1, max: 5 },
    comentario: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resena", ResenaSchema);