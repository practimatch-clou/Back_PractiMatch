// routes/documents.js
const express = require("express");
const router = express.Router();
const cloudinary = require("../config/cloudinary");
const User = require("../models/User");
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/auth");
const {
  notificarAdminNuevosDocumentos,
  notificarEstudianteAprobado,
  notificarEstudianteRechazado,
} = require("../services/emailService");

// ── ESTUDIANTE: subir documentos ─────────────────────────────────────────────
router.post(
  "/upload",
  authMiddleware,
  upload.array("documentos", 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No se enviaron archivos." });
      }

      const nuevosDocumentos = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
        nombre: file.originalname,
        tipo: req.body.tipo || "general",
      }));

      const usuario = await User.findByIdAndUpdate(
        req.userId,
        {
          $push: { documentosValidacion: { $each: nuevosDocumentos } },
          $set: { estadoValidacion: "en_revision", motivoRechazo: "" },
        },
        { new: true }
      );

      // ── Notificar al admin por email (sin bloquear la respuesta) ──
      notificarAdminNuevosDocumentos({
        estudianteNombre: usuario.nombre,
        estudianteEmail: usuario.email,
        totalDocs: nuevosDocumentos.length,
      }).catch((err) => console.error("Error enviando email al admin:", err));

      res.json({
        message: "Documentos subidos correctamente.",
        documentos: usuario.documentosValidacion,
        estadoValidacion: usuario.estadoValidacion,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al subir documentos." });
    }
  }
);

// ── ESTUDIANTE: eliminar un documento propio ──────────────────────────────────
router.delete("/documento/:docId", authMiddleware, async (req, res) => {
  try {
    const usuario = await User.findById(req.userId);
    const doc = usuario.documentosValidacion.id(req.params.docId);
    if (!doc) return res.status(404).json({ message: "Documento no encontrado." });

    await cloudinary.uploader.destroy(doc.publicId, { resource_type: "auto" });
    doc.deleteOne();
    await usuario.save();

    res.json({ message: "Documento eliminado." });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar documento." });
  }
});

// ── ADMIN: listar todos los estudiantes (en revisión + rechazados + aprobados) ─
router.get("/admin/pendientes", authMiddleware, esAdmin, async (req, res) => {
  try {
    const usuarios = await User.find(
      { estadoValidacion: { $in: ["en_revision", "rechazado", "aprobado"] } },
      "nombre email carrera universidad documentosValidacion estadoValidacion motivoRechazo updatedAt"
    ).sort({ updatedAt: -1 });

    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener usuarios." });
  }
});

// ── ADMIN: aprobar ────────────────────────────────────────────────────────────
router.patch("/admin/aprobar/:userId", authMiddleware, esAdmin, async (req, res) => {
  try {
    const usuario = await User.findByIdAndUpdate(
      req.params.userId,
      { estadoValidacion: "aprobado", puedePublicar: true, motivoRechazo: "" },
      { new: true }
    );

    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado." });

    // ── Email al estudiante ──
    notificarEstudianteAprobado({
      nombre: usuario.nombre,
      email: usuario.email,
    }).catch((err) => console.error("Error enviando email de aprobación:", err));

    res.json({ message: `${usuario.nombre} aprobado.`, usuario });
  } catch (err) {
    res.status(500).json({ message: "Error al aprobar." });
  }
});

// ── ADMIN: rechazar ───────────────────────────────────────────────────────────
router.patch("/admin/rechazar/:userId", authMiddleware, esAdmin, async (req, res) => {
  try {
    const { motivo } = req.body;
    if (!motivo) {
      return res.status(400).json({ message: "Debes indicar el motivo del rechazo." });
    }

    const usuario = await User.findByIdAndUpdate(
      req.params.userId,
      { estadoValidacion: "rechazado", puedePublicar: false, motivoRechazo: motivo },
      { new: true }
    );

    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado." });

    // ── Email al estudiante ──
    notificarEstudianteRechazado({
      nombre: usuario.nombre,
      email: usuario.email,
      motivo,
    }).catch((err) => console.error("Error enviando email de rechazo:", err));

    res.json({ message: `${usuario.nombre} rechazado.`, usuario });
  } catch (err) {
    res.status(500).json({ message: "Error al rechazar." });
  }
});

// ── Helper middleware: verificar rol admin ────────────────────────────────────
function esAdmin(req, res, next) {
  if (req.userRol !== "admin") {
    return res.status(403).json({ message: "Acceso denegado." });
  }
  next();
}

module.exports = router;