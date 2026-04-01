const mongoose = require('mongoose');

const solicitudSchema = new mongoose.Schema(
  {
    clienteId:    { type: String, required: true },
    estudianteId: { type: String, required: true },
    servicioId:   { type: String, required: true },
    mensaje:      { type: String, default: "" },
    estado:       { type: String, enum: ["pendiente", "aceptada", "rechazada"], default: "pendiente" },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Solicitud', solicitudSchema);