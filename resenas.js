const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Resena = require("../models/Resena");
const Cita = require("../models/Cita");

// POST /api/resenas — el cliente deja una reseña (solo si la cita está pagada)
router.post("/", auth, async (req, res) => {
  try {
    const { citaId, calificacion, comentario } = req.body;
    const clienteId = req.user.id;

    // Verificar que la cita existe, está pagada y pertenece al cliente
    const cita = await Cita.findById(citaId);
    if (!cita) return res.status(404).json({ ok: false, mensaje: "Cita no encontrada" });
    if (cita.clienteId.toString() !== clienteId)
      return res.status(403).json({ ok: false, mensaje: "No tienes permiso para reseñar esta cita" });
    if (cita.estado !== "pagada" && cita.pagoEstado !== "completado")
      return res.status(400).json({ ok: false, mensaje: "Solo puedes reseñar citas pagadas" });

    // Verificar que no haya reseña previa para esta cita
    const yaReseno = await Resena.findOne({ citaId });
    if (yaReseno) return res.status(400).json({ ok: false, mensaje: "Ya dejaste una reseña para esta cita" });

    const resena = await Resena.create({
      clienteId,
      estudianteId: cita.estudianteId,
      citaId,
      calificacion,
      comentario: comentario ?? "",
    });

    res.json({ ok: true, resena });
  } catch (e) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
});

// GET /api/resenas/estudiante/:estudianteId — reseñas de un estudiante (para su perfil)
router.get("/estudiante/:estudianteId", auth, async (req, res) => {
  try {
    const resenas = await Resena.find({ estudianteId: req.params.estudianteId })
      .populate("clienteId", "nombre fotoPerfil")
      .sort({ createdAt: -1 });
    res.json({ ok: true, resenas });
  } catch (e) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
});

// GET /api/resenas/cliente/:clienteId — reseñas dejadas por el cliente (para su perfil)
router.get("/cliente/:clienteId", auth, async (req, res) => {
  try {
    const resenas = await Resena.find({ clienteId: req.params.clienteId })
      .populate("estudianteId", "nombre fotoPerfil")
      .populate("citaId", "servicio fecha")
      .sort({ createdAt: -1 });
    res.json({ ok: true, resenas });
  } catch (e) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
});

module.exports = router;
