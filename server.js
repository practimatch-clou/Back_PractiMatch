if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("node:dns");
const authRoutes = require("./routes/authRoutes");
const perfilRoutes = require("./routes/perfil"); // ← agrega esto
const serviciosRoutes = require("./routes/servicios");
const messageRoutes = require("./routes/messages");

// ✅ La "Magia" de tu profesor para el DNS
dns.setServers(["1.1.1.1", "8.8.8.8"]);
dns.setDefaultResultOrder("ipv4first");

const app = express(); // ← app se declara AQUÍ primero
app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requests sin origin (Postman, mobile, server-to-server)
      if (!origin) return callback(null, true);

      const allowed = ["http://localhost:5173", "http://localhost:5174"];

      // ✅ Permite cualquier subdominio de vercel.app
      const isVercel = origin.endsWith(".vercel.app");

      if (allowed.includes(origin) || isVercel) {
        callback(null, true);
      } else {
        callback(new Error(`CORS bloqueado: ${origin}`));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", require("./routes/users")); // ← se mueve para abajo
app.use("/api/perfil", perfilRoutes); // ← agrega esto
app.use("/api/servicios", require("./routes/servicios"));
app.use("/api/messages", messageRoutes);
app.use("/api/solicitudes", require("./routes/solicitudes"));
app.use("/api/conversations", require("./routes/conversations"));
app.use("/api/availability", require("./routes/availability"));
app.use("/api/citas", require("./routes/citas"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/documents", require("./routes/documents"));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    family: 4,
  })
  .then(() => {
    console.log("✅ Conectado a mongoDB:", mongoose.connection.name);
    // Solo escucha en local
    if (process.env.NODE_ENV !== "production") {
      app.listen(PORT, () =>
        console.log(`🚀 Servidor de PractiMatch en puerto: ${PORT}`),
      );
    }
  })
  .catch((err) => {
    console.error("❌ Error conectado a mongoDB:", err.message);
    process.exit(1);
  });

module.exports = app;
