const express     = require('express');
const router      = express.Router();
const Payment     = require('../models/Payment');
const Appointment = require('../models/Appointment');
const auth        = require('../middleware/auth');
const pusher      = require('../lib/pusher');

// POST /api/payments/capture — cliente confirma pago
router.post('/capture', auth, async (req, res) => {
  try {
    const { citaId, paypalOrderId, paypalCaptureId, monto } = req.body;
    const clienteId = req.user.id;

    // 1. Guardar el pago en MongoDB
    const payment = await Payment.create({
      appointment:     citaId,
      cliente:         clienteId,
      monto:           Number(monto),
      estado:          'completado',
      paypalOrderId,
      paypalCaptureId,
    });

    // 2. Actualizar la cita a pagada
    const cita = await Appointment.findByIdAndUpdate(
      citaId,
      { estado: 'pagada' },
      { new: true }
    )
      .populate('cliente',    'nombre')
      .populate('estudiante', '_id');

    if (!cita) return res.status(404).json({ ok: false, error: 'Cita no encontrada' });

    const estudianteId = cita.estudiante?._id?.toString();
    const nombreCliente = cita.cliente?.nombre ?? 'Un cliente';

    // 3. Notificar al estudiante
    await pusher.trigger(`citas-${estudianteId}`, 'cita-pagada', {
      id:      citaId,
      cliente: nombreCliente,
    });

    // 4. Confirmar al cliente
    await pusher.trigger(`citas-cliente-${clienteId}`, 'cita-pagada', {
      id: citaId,
    });

    res.json({ ok: true, payment });
  } catch (err) {
    console.error('❌ Error al capturar pago:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;