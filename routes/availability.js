const express      = require('express');
const router       = express.Router();
const Availability = require('../models/Availability');
const auth         = require('../middleware/auth'); // ← asegúrate de importarlo

// POST — horario puntual (ya lo tienes)
router.post('/', auth, async (req, res) => {
  try {
    const { estudianteId, fecha, horaInicio, horaFin } = req.body;
    if (!estudianteId || !fecha || !horaInicio || !horaFin)
      return res.status(400).json({ ok: false, error: 'Faltan campos' });

    const horario = await Availability.create({
      estudiante: estudianteId,
      fecha: new Date(fecha + 'T00:00:00'),
      horaInicio,
      horaFin,
      disponible: true,
    });
    res.status(201).json({ ok: true, horario });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── NUEVO ────────────────────────────────────────────────────────────────
// PUT /api/availability/semanal/:estudianteId
router.put('/semanal/:estudianteId', auth, async (req, res) => {
  try {
    const { horarios } = req.body;
    const estudianteId = req.params.estudianteId;

    const DIA_MAP = {
      "Lun": 1, "Mar": 2, "Mié": 3,
      "Jue": 4, "Vie": 5, "Sáb": 6, "Dom": 0
    };

    // Borra slots futuros para regenerar
    await Availability.deleteMany({
      estudiante: estudianteId,
      fecha: { $gte: new Date() },
      disponible: true,
    });

    const slots = [];
    const hoy   = new Date();

    for (const h of horarios) {
      const diaSemana = DIA_MAP[h.dia];
      if (diaSemana === undefined) continue;

      for (let semana = 0; semana < 4; semana++) {
        const fechaBase  = new Date(hoy);
        const diaActual  = fechaBase.getDay();
        let   diff       = diaSemana - diaActual;
        if (diff <= 0) diff += 7;
        fechaBase.setDate(fechaBase.getDate() + diff + semana * 7);
        fechaBase.setHours(0, 0, 0, 0);

        slots.push({
          estudiante: estudianteId,
          dia:        h.dia,
          fecha:      fechaBase,
          horaInicio: h.horaInicio,
          horaFin:    h.horaFin,
          disponible: true,
        });
      }
    }

    await Availability.insertMany(slots);
    res.json({ ok: true, generados: slots.length });
  } catch (err) {
    console.error('❌ Error disponibilidad semanal:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});
// ─────────────────────────────────────────────────────────────────────────

// GET /api/availability/:estudianteId
router.get('/:estudianteId', auth, async (req, res) => {
  try {
    const horarios = await Availability.find({
      estudiante:  req.params.estudianteId,
      disponible:  true,
      fecha:       { $gte: new Date() },
    }).sort({ fecha: 1, horaInicio: 1 });

    res.json({ ok: true, horarios });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE
router.delete('/:id', auth, async (req, res) => {
  try {
    await Availability.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;