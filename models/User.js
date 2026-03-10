const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    carrera: {
        type: String,
        enum: [
            'Medicina / Enfermería', 'Psicología', 'Derecho',
            'Diseño Gráfico', 'Comunicación', 'Contabilidad / Finanzas',
            'Nutrición', 'Arquitectura', 'Otra'
        ]
        // No required porque el cliente no tiene carrera
    },
    universidad: {
        type: String,
        trim: true
    },
    precioPorHora: {
        type: Number,
        min: 0  // solo validar que no sea negativo
    },
    rol: {
        type: String,
        required: true,
        enum: ['estudiante', 'cliente'] // Coincide con tu selección inicial
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    apellido: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    aceptaTerminos: {
        type: Boolean,
        required: true // Para asegurar que marcaron el botón/check de términos
    },
    // Esto servirá para la opción de "Recuperar contraseña" más adelante
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    fechaRegistro: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);