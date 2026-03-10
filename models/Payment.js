const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    monto: {
        type: Number,
        required: true
    },
    estado: {
        type: String,
        enum: ['pendiente', 'completado', 'fallido', 'reembolsado'],
        default: 'pendiente'
    },
    paypalOrderId: {
        type: String  // ID que regresa PayPal al crear la orden
    },
    paypalCaptureId: {
        type: String  // ID que regresa PayPal al confirmar el pago
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);