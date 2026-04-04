// services/emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // o "outlook", "smtp.tudominio.com", etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // usa una App Password de Google, no tu contraseña normal
  },
});

// ── 1. Notificar al admin cuando un estudiante sube documentos ────────────────
async function notificarAdminNuevosDocumentos({ estudianteNombre, estudianteEmail, totalDocs }) {
  await transporter.sendMail({
    from: `"PractiMatch" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `📋 Nuevos documentos para revisión — ${estudianteNombre}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0d1f35;color:#e2faf7;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#0f3460,#1a5276);padding:28px 32px;">
          <h1 style="margin:0;font-size:22px;color:#7fffd4;">PractiMatch Admin</h1>
          <p style="margin:6px 0 0;font-size:13px;color:rgba(127,255,212,0.6);">Panel de verificación</p>
        </div>
        <div style="padding:28px 32px;">
          <h2 style="margin:0 0 16px;font-size:18px;color:#e2faf7;">Nuevos documentos pendientes</h2>
          <p style="color:rgba(127,255,212,0.7);font-size:14px;line-height:1.6;">
            El estudiante <strong style="color:#7fffd4;">${estudianteNombre}</strong> 
            (${estudianteEmail}) acaba de subir <strong>${totalDocs} documento(s)</strong> 
            para verificación de perfil.
          </p>
          <a href="${process.env.FRONTEND_URL}/admin/documentos"
             style="display:inline-block;margin-top:20px;padding:12px 24px;
                    background:linear-gradient(135deg,#00c878,#00a86b);
                    color:#fff;text-decoration:none;border-radius:10px;
                    font-weight:700;font-size:14px;">
            Revisar documentos →
          </a>
        </div>
        <div style="padding:16px 32px;background:rgba(0,0,0,0.2);font-size:11px;color:rgba(127,255,212,0.3);">
          PractiMatch · Notificación automática del sistema
        </div>
      </div>
    `,
  });
}

// ── 2. Notificar al estudiante que fue APROBADO ───────────────────────────────
async function notificarEstudianteAprobado({ nombre, email }) {
  await transporter.sendMail({
    from: `"PractiMatch" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "✅ Tu perfil fue verificado — ¡Ya puedes publicar servicios!",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0d1f35;color:#e2faf7;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#0f3460,#1a5276);padding:28px 32px;">
          <h1 style="margin:0;font-size:22px;color:#7fffd4;">PractiMatch</h1>
        </div>
        <div style="padding:28px 32px;">
          <div style="background:rgba(0,200,120,0.1);border:1px solid rgba(0,200,120,0.3);
                      border-radius:12px;padding:16px 20px;margin-bottom:20px;">
            <p style="margin:0;font-size:22px;">✅</p>
            <h2 style="margin:8px 0 4px;color:#7fffd4;font-size:18px;">¡Perfil verificado!</h2>
            <p style="margin:0;color:rgba(127,255,212,0.7);font-size:13px;">Tu cuenta ha sido aprobada por el equipo de PractiMatch.</p>
          </div>
          <p style="color:rgba(127,255,212,0.8);font-size:14px;line-height:1.7;">
            Hola <strong>${nombre}</strong>, tus documentos han sido revisados y aprobados. 
            A partir de ahora puedes publicar tus servicios y comenzar a recibir solicitudes de clientes.
          </p>
          <a href="${process.env.FRONTEND_URL}/dashboard"
             style="display:inline-block;margin-top:20px;padding:12px 24px;
                    background:linear-gradient(135deg,#00c878,#00a86b);
                    color:#fff;text-decoration:none;border-radius:10px;
                    font-weight:700;font-size:14px;">
            Ir a mi dashboard →
          </a>
        </div>
        <div style="padding:16px 32px;background:rgba(0,0,0,0.2);font-size:11px;color:rgba(127,255,212,0.3);">
          PractiMatch · Si tienes dudas escríbenos a ${process.env.EMAIL_USER}
        </div>
      </div>
    `,
  });
}

// ── 3. Notificar al estudiante que fue RECHAZADO ──────────────────────────────
async function notificarEstudianteRechazado({ nombre, email, motivo }) {
  await transporter.sendMail({
    from: `"PractiMatch" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "❌ Documentos de verificación rechazados — PractiMatch",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0d1f35;color:#e2faf7;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#0f3460,#1a5276);padding:28px 32px;">
          <h1 style="margin:0;font-size:22px;color:#7fffd4;">PractiMatch</h1>
        </div>
        <div style="padding:28px 32px;">
          <div style="background:rgba(220,0,80,0.08);border:1px solid rgba(220,0,80,0.25);
                      border-radius:12px;padding:16px 20px;margin-bottom:20px;">
            <p style="margin:0;font-size:22px;">❌</p>
            <h2 style="margin:8px 0 4px;color:#ffb3c6;font-size:18px;">Documentos rechazados</h2>
            <p style="margin:0;color:rgba(255,179,198,0.7);font-size:13px;">Tu solicitud de verificación no pudo ser aprobada.</p>
          </div>
          <p style="color:rgba(127,255,212,0.8);font-size:14px;line-height:1.7;">
            Hola <strong>${nombre}</strong>, revisamos tus documentos y lamentablemente 
            no cumplieron con los requisitos. Aquí el motivo:
          </p>
          <div style="background:rgba(255,255,255,0.04);border-left:3px solid rgba(220,0,80,0.5);
                      padding:12px 16px;border-radius:0 8px 8px 0;margin:16px 0;">
            <p style="margin:0;font-size:14px;color:#ffb3c6;">${motivo}</p>
          </div>
          <p style="color:rgba(127,255,212,0.6);font-size:13px;line-height:1.6;">
            Puedes volver a subir tus documentos corregidos desde la sección 
            <strong>Configuración → Documentos de validación</strong> en tu dashboard.
          </p>
          <a href="${process.env.FRONTEND_URL}/dashboard"
             style="display:inline-block;margin-top:20px;padding:12px 24px;
                    background:rgba(127,255,212,0.1);border:1px solid rgba(127,255,212,0.3);
                    color:#7fffd4;text-decoration:none;border-radius:10px;
                    font-weight:700;font-size:14px;">
            Volver a subir documentos →
          </a>
        </div>
        <div style="padding:16px 32px;background:rgba(0,0,0,0.2);font-size:11px;color:rgba(127,255,212,0.3);">
          PractiMatch · Si crees que es un error escríbenos a ${process.env.EMAIL_USER}
        </div>
      </div>
    `,
  });
}

module.exports = {
  notificarAdminNuevosDocumentos,
  notificarEstudianteAprobado,
  notificarEstudianteRechazado,
};