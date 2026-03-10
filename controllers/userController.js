const User = require('../models/User');
const priceConfig = require('../config/priceConfig');

// GET /api/users/me — carga el perfil del usuario logueado
exports.getMe = async (req, res) => {
    try {
        const usuario = await User.findById(req.usuario.id).select('-password');
        if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

        res.json(usuario);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener perfil' });
    }
};

// PUT /api/users/me — el estudiante actualiza su perfil (precio, universidad, etc.)
exports.updateMe = async (req, res) => {
    try {
        const { precioPorHora, universidad, nombre, apellido } = req.body;

        // Solo estudiantes pueden actualizar precioPorHora
        if (precioPorHora !== undefined && req.usuario.rol !== 'estudiante') {
            return res.status(403).json({ msg: 'Solo estudiantes pueden definir precio' });
        }

        if (precioPorHora !== undefined && precioPorHora < 0) {
            return res.status(400).json({ msg: 'El precio no puede ser negativo' });
        }

        const camposActualizar = { nombre, apellido, universidad, precioPorHora };
        
        // Limpiar campos undefined
        Object.keys(camposActualizar).forEach(
            key => camposActualizar[key] === undefined && delete camposActualizar[key]
        );

        const usuario = await User.findByIdAndUpdate(
            req.usuario.id,
            { $set: camposActualizar },
            { new: true }
        ).select('-password');

        res.json(usuario);
    } catch (error) {
        res.status(500).json({ msg: 'Error al actualizar perfil' });
    }
};