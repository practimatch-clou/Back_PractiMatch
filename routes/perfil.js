// routes/perfil.js
const express = require("express");
const router = express.Router();
const { upload, cloudinary } = require("../config/cloudinary");
const Usuario = require("../models/User");

// GET /api/perfil/:id
router.get("/:id", async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select("-password");
    if (!usuario)
      return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });
    res.json({ ok: true, usuario });
  } catch (error) {
    console.error("ERROR GET:", error);
    res.status(500).json({ ok: false, mensaje: error.message });
  }
});

// PUT /api/perfil/:id
router.put("/:id", upload.single("fotoPerfil"), async (req, res) => {
  try {
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    const { nombre } = req.body;
    const updateData = { nombre };

    if (req.file) {
      updateData.fotoPerfil = req.file.path;

      // Borrar foto anterior de Cloudinary
      const usuario = await Usuario.findById(req.params.id);
      if (usuario?.fotoPerfil) {
        const publicId = usuario.fotoPerfil.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`perfiles/${publicId}`);
      }
    }

    const actualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({ ok: true, usuario: actualizado });
  } catch (error) {
    console.error("ERROR PUT:", error);
    res.status(500).json({ ok: false, mensaje: error.message });
  }
});

module.exports = router;