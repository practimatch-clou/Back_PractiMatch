const mongoose = require('mongoose');

const servicioSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  titulo:    { type: String, required: true },
  precio:    { type: String, required: true },
  tags:      [{ type: String }],
  activo:    { type: Boolean, default: true },
  imagenes:  [{ type: String }], // URLs de Cloudinary
}, { timestamps: true });

module.exports = mongoose.model('Servicio', servicioSchema);