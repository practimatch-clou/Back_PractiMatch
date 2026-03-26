const express = require('express');
const router = express.Router();
const { upload, cloudinary } = require('../config/cloudinary');
const Servicio = require('../models/Servicio');

// GET /api/servicios/:usuarioId — traer servicios del estudiante
router.get('/:usuarioId', async (req, res) => {
  try {
    const servicios = await Servicio.find({ usuarioId: req.params.usuarioId });
    res.json({ ok: true, servicios });
  } catch (e) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
});

// POST /api/servicios — crear servicio con imágenes
router.post('/', upload.array('imagenes', 5), async (req, res) => {
  try {
    const { usuarioId, titulo, precio, tags, activo } = req.body;
    const imagenes = req.files?.map(f => f.path) ?? [];

    const servicio = await Servicio.create({
      usuarioId, titulo, precio,
      tags: JSON.parse(tags || '[]'),
      activo: activo === 'true',
      imagenes,
    });
    res.json({ ok: true, servicio });
  } catch (e) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
});

// PUT /api/servicios/:id/imagenes — agregar imágenes a servicio existente
router.put('/:id/imagenes', upload.array('imagenes', 5), async (req, res) => {
  try {
    const nuevasUrls = req.files?.map(f => f.path) ?? [];
    const servicio = await Servicio.findByIdAndUpdate(
      req.params.id,
      { $push: { imagenes: { $each: nuevasUrls } } },
      { new: true }
    );
    res.json({ ok: true, servicio });
  } catch (e) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
});

// DELETE /api/servicios/:id/imagenes/:imgIdx — eliminar imagen
router.delete('/:id/imagenes/:imgIdx', async (req, res) => {
  try {
    const servicio = await Servicio.findById(req.params.id);
    const url = servicio.imagenes[req.params.imgIdx];

    // Borrar de Cloudinary
    const publicId = url.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`perfiles/${publicId}`);

    servicio.imagenes.splice(req.params.imgIdx, 1);
    await servicio.save();

    res.json({ ok: true, servicio });
  } catch (e) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
});

module.exports = router;