const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary');

// ✅ Sanitiza el nombre: quita acentos y caracteres especiales
const sanitizeFileName = (name) => {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // quita tildes: ó→o, á→a
    .replace(/[^a-zA-Z0-9._-]/g, '_') // reemplaza espacios y símbolos por _
    .replace(/_+/g, '_')               // colapsa múltiples guiones bajos
    .toLowerCase();
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === 'application/pdf';

    return {
      folder: `validaciones/${req.userId}`,
      resource_type: isPdf ? 'raw' : 'image', // ✅ PDFs siempre como 'raw'
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      public_id: `${Date.now()}-${sanitizeFileName(file.originalname)}`,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes JPG/PNG y PDFs'), false);
    }
  },
});

module.exports = upload;