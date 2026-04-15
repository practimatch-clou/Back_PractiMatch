const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Resena = require("../models/Resena");
const Cita = require("../models/Appointment");

// POST /api/resenas
router.post("/", auth, async (req, res) => {
  try {
    const { citaId, calificacion, comentario } = req.body;
    const clienteId = req.user.id;

    const cita = await Cita.findById(citaId);
    if (!cita) return res.status(404).json({ ok: false, mensaje: "Cita no encontrada" });
    if (cita.cliente.toString() !== clienteId)
      return res.status(403).json({ ok: false, mensaje: "No tienes permiso para reseñar esta cita" });
    if (cita.estado !== "pagada" && cita.estado !== "completada")
      return res.status(400).json({ ok: false, mensaje: "Solo puedes reseñar citas pagadas o completadas" });

    const yaReseno = await Resena.findOne({ citaId });
    if (yaReseno) return res.status(400).json({ ok: false, mensaje: "Ya dejaste una reseña para esta cita" });

    const resena = await Resena.create({
      clienteId,
      estudianteId: cita.estudiante,
      citaId,
      calificacion,
      comentario: comentario ?? "",
    });

    res.json({ ok: true, resena });
  } catch (e) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
});

// GET /api/resenas/estudiante/:estudianteId
router.get("/estudiante/:estudianteId", auth, async (req, res) => {
  try {
    const resenas = await Resena.find({ estudianteId: req.params.estudianteId })
      .populate({ path: "clienteId", model: "User", select: "nombre fotoPerfil" })
      .sort({ createdAt: -1 });
    res.json({ ok: true, resenas });
  } catch (e) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
});

// GET /api/resenas/cliente/:clienteId
router.get("/cliente/:clienteId", auth, async (req, res) => {
  try {
    const resenas = await Resena.find({ clienteId: req.params.clienteId })
      .populate({ path: "estudianteId", model: "User", select: "nombre fotoPerfil" })
      .populate({ path: "citaId", model: "Appointment", select: "fecha" })
      .sort({ createdAt: -1 });
    res.json({ ok: true, resenas });
  } catch (e) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
});

module.exports = router;
