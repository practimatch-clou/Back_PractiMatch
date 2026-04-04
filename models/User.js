const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    carrera: {
      type: String,
      enum: [
        "Medicina / Enfermería",
        "Psicología",
        "Derecho",
        "Diseño Gráfico",
        "Comunicación",
        "Contabilidad / Finanzas",
        "Nutrición",
        "Arquitectura",
        "Otra",
      ],
      // No required porque el cliente no tiene carrera
    },
    universidad: {
      type: String,
      trim: true,
    },

    area: {
      type: String,
      default: "",
    },

    precioPorHora: {
      type: Number,
      min: 0, // solo validar que no sea negativo
    },
    rol: {
      type: String,
      required: true,
      enum: ["estudiante", "cliente"], // Coincide con tu selección inicial
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    apellido: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    aceptaTerminos: {
      type: Boolean,
      required: true, // Para asegurar que marcaron el botón/check de términos
    },
    // Esto servirá para la opción de "Recuperar contraseña" más adelante
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    fechaRegistro: {
      type: Date,
      default: Date.now,
    },

    favorites: [{ type: Number }], // IDs de servicios favoritos

    fotoPerfil: { type: String, default: "" }, // URL de Cloudinary

    rol: {
      type: String,
      enum: ["estudiante", "admin"],
      default: "estudiante",
    },
    documentosValidacion: [documentSchema],
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

const documentSchema = new mongoose.Schema({
  url: { type: String, required: true }, // URL de Cloudinary
  publicId: { type: String, required: true }, // Para poder eliminarlo si se rechaza
  nombre: { type: String, required: true }, // Nombre del archivo
  tipo: { type: String }, // credencial, constancia, etc.
  uploadedAt: { type: Date, default: Date.now },
});
