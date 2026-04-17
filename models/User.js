const mongoose = require("mongoose");

// ← documentSchema PRIMERO
const documentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  nombre: { type: String, required: true },
  tipo: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema(
  {
    carrera: {
      type: String,
      enum: [
        "Medicina",
        "Psicología",
        "Derecho",
        "Diseño Gráfico",
        "Comunicación",
        "Contabilidad",
        "Nutrición",
        "Arquitectura",
        "Fotografía",
        "Otra",
      ],
    },
    universidad: { type: String, trim: true },
    area: { type: String, default: "" },
    precioPorHora: { type: Number, min: 0 },
    rol: {
      type: String,
      required: true,
      enum: ["estudiante", "cliente", "admin"], // ← unificado aquí
      default: "estudiante",
    },
    nombre: { type: String, required: true, trim: true },
    apellido: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    aceptaTerminos: { type: Boolean, required: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    fechaRegistro: { type: Date, default: Date.now },
    favorites: [{ type: Number }],
    fotoPerfil: { type: String, default: "" },
    documentosValidacion: [documentSchema], // ← ahora sí lo encuentra
    estadoValidacion: {
      type: String,
      enum: ["pendiente", "en_revision", "aprobado", "rechazado"],
      default: "pendiente",
    },
    motivoRechazo: { type: String, default: "" },
    puedePublicar: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
