const express = require("express");
const router = express.Router();
const { upload, cloudinary } = require("../config/cloudinary");
const Servicio = require("../models/Servicio");
const auth = require("../middleware/auth");

// 1️⃣ GET /api/servicios — todos los servicios activos (para el cliente)
router.get("/", auth, async (req, res) => {
  try {
    const servicios = await Servicio.find({ activo: true })
      .populate("usuarioId", "nombre fotoPerfil universidad area carrera")
      .sort({ createdAt: -1 });
    res.json({ ok: true, servicios });
  } catch (e) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
});

// 2️⃣ GET /api/servicios/:usuarioId — servicios del estudiante (para su dashboard)
router.get("/:usuarioId", auth, async (req, res) => {
  try {
    const servicios = await Servicio.find({
      usuarioId: req.params.usuarioId,
    }).populate("usuarioId", "nombre fotoPerfil universidad area carrera");
    res.json({ ok: true, servicios });
  } catch (e) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
});

// 3️⃣ POST /api/servicios — crear servicio con imágenes
router.post("/", auth, upload.array("imagenes", 5), async (req, res) => {
  try {
    const titulo = req.body.titulo;
    const descripcion = req.body.descripcion ?? "";
    const precio = req.body.precio;
    const activo = req.body.activo === "true";
    const tags = JSON.parse(req.body.tags || "[]");
    const imagenes = (req.files ?? []).map((f) => f.path);

    const servicio = await Servicio.create({
      usuarioId: req.user.id,
      titulo,
      descripcion,
      precio,
      tags,
      activo,
      imagenes,
    });

    res.json({ ok: true, servicio });
  } catch (e) {
    console.error("ERROR CREAR SERVICIO:", e);
    res.status(500).json({ ok: false, mensaje: e.message });
  }
});

// 4️⃣ PUT /api/servicios/:id/imagenes — agregar imágenes a servicio existente
router.put("/:id/imagenes", upload.array("imagenes", 5), async (req, res) => {
  try {
    const nuevasUrls = req.files?.map((f) => f.path) ?? [];
    const servicio = await Servicio.findByIdAndUpdate(
      req.params.id,
      { $push: { imagenes: { $each: nuevasUrls } } },
      { new: true },
    );
    res.json({ ok: true, servicio });
  } catch (e) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
});

// 5️⃣ DELETE /api/servicios/:id/imagenes/:imgIdx — eliminar imagen
router.delete("/:id/imagenes/:imgIdx", async (req, res) => {
  try {
    const servicio = await Servicio.findById(req.params.id);
    const url = servicio.imagenes[req.params.imgIdx];

    const publicId = url.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`perfiles/${publicId}`);

    servicio.imagenes.splice(req.params.imgIdx, 1);
    await servicio.save();

    res.json({ ok: true, servicio });
  } catch (e) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
});

module.exports = router;
