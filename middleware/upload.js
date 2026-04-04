const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary'); // tu instancia ya configurada

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: `validaciones/${req.userId}`,   // req.userId lo pone tu middleware JWT
    resource_type: 'auto',                  // acepta PDF e imágenes
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    public_id: `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`,
  }),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB máximo
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