const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

// GET /api/favoritos
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("favoritos");
    res.json(user.favoritos);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener favoritos" });
  }
});

// POST /api/favoritos/:servicioId — toggle
router.post("/:servicioId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const id = req.params.servicioId;
    const idx = user.favoritos.map(String).indexOf(id); // ← .map(String) para comparar bien ObjectIds

    if (idx === -1) {
      user.favoritos.push(id);
    } else {
      user.favoritos.splice(idx, 1);
    }

    await user.save();
    res.json(user.favoritos);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar favoritos" });
  }
});

module.exports = router;