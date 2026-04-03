const mongoose = require('mongoose');

const servicioSchema = new mongoose.Schema({
  usuarioId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  titulo:       { type: String, required: true },
  descripcion:  { type: String, default: '' },   // ← NUEVO
  precio:       { type: String, required: true },
  tags:         [{ type: String }],
  activo:       { type: Boolean, default: true },
  imagenes:     [{ type: String }],
  fotoServicio: { type: String, default: null },  // ← NUEVO
}, { timestamps: true });

module.exports = mongoose.model('Servicio', servicioSchema);