
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only images (jpeg, jpg, png) are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    // per-file limit (kept from your original)
    fileSize: 5 * 1024 * 1024,          // 5MB per file
    // IMPORTANT: raise text field size for large JSON blobs
    fieldSize: 10 * 1024 * 1024,        // 10MB per text field (partySections JSON etc.)
    // Allow many fields/files/parts for multi-party + 12 members
    fields: 5000,                       // number of non-file fields
    files: 400,                         // number of files
    parts: 6000,                        // total parts (fields + files)
  },
});

module.exports = upload;
