const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Availability = require("../models/Availability");
const User = require("../models/User");
const pusher = require("../lib/pusher");

// POST /api/citas — cliente crea una cita
router.post("/", async (req, res) => {
  try {
    const {
      clienteId,
      estudianteId,
      availabilityId,
      fecha,
      hora,
      lugar,
      notas,
      precio,
      servicio,
    } = req.body;

    if (!clienteId || !estudianteId || !fecha || !precio) {
      return res
        .status(400)
        .json({ ok: false, error: "Faltan campos requeridos" });
    }

    const cliente = await User.findById(clienteId).select("nombre");
    if (!cliente)
      return res
        .status(404)
        .json({ ok: false, error: "Cliente no encontrado" });

    const cita = await Appointment.create({
      cliente: clienteId,
      estudiante: estudianteId,
      availability: availabilityId ?? undefined,
      servicio: servicio ?? "",
      lugar: lugar ?? "",
      fecha: new Date(`${fecha}T${hora || "00:00"}:00`),
      precio: Number(precio),
      notas: notas ?? "",
      estado: "pendiente_pago",
    });

    // Marcar horario como no disponible
    if (availabilityId) {
      await Availability.findByIdAndUpdate(availabilityId, {
        disponible: false,
      });
    }

    // Notificar al estudiante en tiempo real
    await pusher.trigger(`citas-${estudianteId}`, "nueva-cita", {
      id: cita._id,
      cliente: cliente.nombre,
      servicio: servicio ?? "",
      fecha,
      hora: hora ?? "",
      lugar: lugar ?? "",
      notas: notas ?? "",
      precio: String(precio),
      estado: "pendiente",
      pagoEstado: "pendiente",
    });

    res.status(201).json({ ok: true, cita });
  } catch (err) {
    console.error("❌ Error al crear cita:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/citas/cliente/:clienteId — cargar citas del cliente
router.get("/cliente/:clienteId", async (req, res) => {
  try {
    const citas = await Appointment.find({ cliente: req.params.clienteId })
      .populate("estudiante", "nombre")
      .sort({ createdAt: -1 });

    const resultado = citas.map((c) => ({
      id: c._id,
      estudianteId: c.estudiante?._id,
      practicante: c.estudiante?.nombre ?? "Estudiante",
      servicio: c.servicio ?? "",
      fecha: c.fecha?.toISOString().split("T")[0] ?? "",
      hora: c.fecha?.toISOString().split("T")[1]?.slice(0, 5) ?? "",
      lugar: c.lugar ?? "",
      notas: c.notas ?? "",
      precio: String(c.precio),
      estado: c.estado === "pendiente_pago" ? "pendiente" : c.estado,
      pagoEstado: c.estado === "pagada" ? "completado" : "pendiente",
    }));

    res.json({ ok: true, citas: resultado });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/citas/estudiante/:estudianteId — cargar citas del estudiante
router.get("/estudiante/:estudianteId", async (req, res) => {
  try {
    const citas = await Appointment.find({
      estudiante: req.params.estudianteId,
    })
      .populate("cliente", "nombre")
      .sort({ createdAt: -1 });

    const resultado = citas.map((c) => ({
      id: c._id,
      cliente: c.cliente?.nombre ?? "Cliente",
      servicio: c.servicio ?? "",
      fecha: c.fecha?.toISOString().split("T")[0] ?? "",
      hora: c.fecha?.toISOString().split("T")[1]?.slice(0, 5) ?? "",
      lugar: c.lugar ?? "",
      notas: c.notas ?? "",
      precio: String(c.precio),
      estado: c.estado === "pendiente_pago" ? "pendiente" : c.estado,
      pagoEstado: c.estado === "pagada" ? "completado" : "pendiente",
    }));

    res.json({ ok: true, citas: resultado });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PUT /api/citas/:id/pago — reemplaza tu versión actual completa
router.put("/:id/pago", async (req, res) => {
  try {
    // ── CAMBIO: popular estudiante también para no depender del body ──
    const cita = await Appointment.findByIdAndUpdate(
      req.params.id,
      { estado: "pagada" },
      { returnDocument: "after" },
    )
      .populate("cliente", "nombre")
      .populate("estudiante", "_id"); // ← NUEVO

    if (!cita)
      return res.status(404).json({ ok: false, error: "Cita no encontrada" });

    const nombreCliente = cita.cliente?.nombre ?? "Un cliente";
    const clienteId = cita.cliente?._id?.toString();
    const estudianteId = cita.estudiante?._id?.toString(); // ← NUEVO, ya no viene del body

    await pusher.trigger(`citas-${estudianteId}`, "cita-pagada", {
      id: cita._id,
      cliente: nombreCliente,
    });

    if (clienteId) {
      await pusher.trigger(`citas-cliente-${clienteId}`, "cita-pagada", {
        id: cita._id,
      });
    }

    res.json({ ok: true, cita });
  } catch (err) {
    console.error("❌ Error en pago:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
