require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('node:dns'); // Esto es lo que usó tu profesor
const authRoutes = require('./routes/authRoutes');
app.use('/api/users', require('./routes/users'));

// ✅ La "Magia" de tu profesor para el DNS
dns.setServers(['1.1.1.1', '8.8.8.8']);
dns.setDefaultResultOrder('ipv4first');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI; // Asegúrate que en tu .env se llame así

// ✅ Configuración de conexión robusta
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 10000, // Espera 10 segundos antes de rendirse
  family: 4, // Fuerza a usar IPv4 (esto evita el error de querySrv)
})
  .then(() => {
    console.log('✅ Conectado a mongoDB:', mongoose.connection.name);
    app.listen(PORT, () => console.log(`🚀 Servidor de PractiMatch en puerto: ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Error conectado a mongoDB:', err.message);
    process.exit(1);
  });
