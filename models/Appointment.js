const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    estudiante: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    availability: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Availability',
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },
    precio: {
        type: Number,
        required: true
    },
    estado: {
        type: String,
        enum: ['pendiente_pago', 'pagada', 'completada', 'cancelada'],
        default: 'pendiente_pago'
    },
    notas: {
        type: String,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);