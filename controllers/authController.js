const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Lógica para Registrar Estudiante o Cliente
exports.registrarUsuario = async (req, res) => {
    try {
        const { rol, nombre, apellido, email, password, aceptaTerminos } = req.body;

        // 1. Verificar si el usuario ya existe
        let usuario = await User.findOne({ email });
        if (usuario) return res.status(400).json({ msg: "El correo ya está registrado" });

        // 2. Crear el nuevo usuario
        usuario = new User({ rol, nombre, apellido, email, password, aceptaTerminos });

        // 3. Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(password, salt);

        // 4. Guardar en MongoDB
        await usuario.save();

        res.status(201).json({ msg: "Usuario creado exitosamente", rol: usuario.rol });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al registrar usuario');
    }
};

// Lógica para el Login
exports.loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Verificar que el correo exista
        const usuario = await User.findOne({ email });
        if (!usuario) return res.status(400).json({ msg: "Credenciales inválidas" });

        // 2. Comparar la contraseña encriptada
        const esCorrecto = await bcrypt.compare(password, usuario.password);
        if (!esCorrecto) return res.status(400).json({ msg: "Credenciales inválidas" });

        // 3. Crear el Token de seguridad (JWT)
        const token = jwt.sign(
            { id: usuario._id, rol: usuario.rol },
            process.env.JWT_SECRET || 'palabrasecreta',
            { expiresIn: '8h' }
        );

        res.json({ token, usuario: { id: usuario._id, nombre: usuario.nombre, rol: usuario.rol } });
    } catch (error) {
        res.status(500).send('Error en el servidor');
    }
};