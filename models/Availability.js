const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
    estudiante: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },
    horaInicio: {
        type: String,  // "10:00"
        required: true
    },
    horaFin: {
        type: String,  // "11:00"
        required: true
    },
    disponible: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Availability', AvailabilitySchema);