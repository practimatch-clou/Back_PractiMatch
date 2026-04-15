const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Resena = require("../models/Resena");
const Cita = require("../models/Appointment");

// POST /api/resenas — el CLIENTE reseña al ESTUDIANTE
router.post("/", auth, async (req, res) => {
  try {
    const { citaId, calificacion, comentario } = req.body;
    const clienteId = req.user.id;

    const cita = await Cita.findById(citaId);
    if (!cita)
      return res.status(404).json({ ok: false, mensaje: "Cita no encontrada" });

    if (cita.cliente.toString() !== clienteId)
      return res.status(403).json({ ok: false, mensaje: "No tienes permiso para reseñar esta cita" });

    if (cita.estado !== "pagada" && cita.estado !== "completada")
      return res.status(400).json({ ok: false, mensaje: "Solo puedes reseñar citas pagadas o completadas" });

    const yaReseno = await Resena.findOne({ citaId });
    // ✅ unique:true en el modelo ya lo previene, pero este check da mejor mensaje de error
    if (yaReseno)
      return res.status(400).json({ ok: false, mensaje: "Ya dejaste una reseña para esta cita" });

    const resena = await Resena.create({
      clienteId,
      estudianteId: cita.estudiante,
      citaId,
      calificacion,
      comentario: comentario ?? "",
    });

    // ✅ Esto es lo que faltaba — populate para que el frontend reciba nombre y foto
    const resenaPopulada = await Resena.findById(resena._id)
      .populate({ path: "clienteId", model: "User", select: "nombre fotoPerfil" })
      .populate({ path: "estudianteId", model: "User", select: "nombre fotoPerfil" });

    res.json({ ok: true, resena: resenaPopulada });
  } catch (e) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
});

// GET /api/resenas/estudiante/:estudianteId — para el dashboard del ESTUDIANTE
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

// GET /api/resenas/cliente/:clienteId — para el dashboard del CLIENTE
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