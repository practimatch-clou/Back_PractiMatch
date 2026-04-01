const express = require('express');
const router = express.Router();
const Solicitud = require('../models/Solicitud');
const pusher = require('../lib/pusher');

// POST /api/solicitudes
router.post('/', async (req, res) => {
  try {
    const { clienteId, estudianteId, servicioId, mensaje } = req.body;

    const solicitud = await Solicitud.create({ clienteId, estudianteId, servicioId, mensaje });

    // Notificar al estudiante en tiempo real
    await pusher.trigger(`solicitudes-${estudianteId}`, 'nueva-solicitud', {
      id: solicitud._id,
      clienteId,
      servicioId,
      mensaje,
      createdAt: solicitud.createdAt,
    });

    res.status(201).json({ ok: true, solicitud });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/solicitudes/:estudianteId
router.get('/:estudianteId', async (req, res) => {
  try {
    const solicitudes = await Solicitud.find({ estudianteId: req.params.estudianteId });
    res.json({ ok: true, solicitudes });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;