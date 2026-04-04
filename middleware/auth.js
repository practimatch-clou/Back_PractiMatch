const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token requerido" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.userId = decoded.id;    // ← para las rutas que usan req.userId
    req.userRol = decoded.rol;  // ← para esAdmin
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};