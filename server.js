require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('node:dns');
const authRoutes = require('./routes/authRoutes');
const perfilRoutes = require('./routes/perfil'); // ← agrega esto

// ✅ La "Magia" de tu profesor para el DNS
dns.setServers(['1.1.1.1', '8.8.8.8']);
dns.setDefaultResultOrder('ipv4first');

const app = express(); // ← app se declara AQUÍ primero
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', require('./routes/users')); // ← se mueve para abajo
app.use('/api/perfil', perfilRoutes); // ← agrega esto
app.use('/api/servicios', require('./routes/servicios'));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI;

// ✅ Configuración de conexión robusta
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  family: 4,
})
  .then(() => {
    console.log('✅ Conectado a mongoDB:', mongoose.connection.name);
    app.listen(PORT, () => console.log(`🚀 Servidor de PractiMatch en puerto: ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Error conectado a mongoDB:', err.message);
    process.exit(1);
  });