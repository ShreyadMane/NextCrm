const express = require('express');
const multer = require('multer');
const { ObjectId } = require('mongodb');
const { authenticate } = require('../middleware/auth');
const { bucket } = require('../config/gridfs');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/png', 'image/jpeg', 'application/pdf', 
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv'
    ];
    cb(null, allowed.includes(file.mimetype));
  },
});

const router = express.Router();

router.post('/', authenticate, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file or invalid type' });

  const metadata = { ownerId: req.user.id };
  if (req.query.contactId) metadata.contactId = req.query.contactId;
  if (req.query.dealId) metadata.dealId = req.query.dealId;

  const uploadStream = bucket.openUploadStream(req.file.originalname, {
    contentType: req.file.mimetype,
    metadata,
  });
  uploadStream.end(req.file.buffer);

  uploadStream.on('finish', () => {
    res.status(201).json({ data: { fileId: uploadStream.id, filename: req.file.originalname, metadata } });
  });
  uploadStream.on('error', (err) => res.status(500).json({ message: err.message }));
});

router.get('/list', authenticate, async (req, res) => {
  try {
    const filter = { 'metadata.ownerId': req.user.id };
    if (req.query.contactId) filter['metadata.contactId'] = req.query.contactId;
    if (req.query.dealId) filter['metadata.dealId'] = req.query.dealId;
    
    const files = await bucket.find(filter).toArray();
    res.json({ data: files.map(f => ({ _id: f._id, filename: f.filename, uploadDate: f.uploadDate, length: f.length })) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:fileId', authenticate, (req, res) => {
  bucket.openDownloadStream(new ObjectId(req.params.fileId))
    .on('error', () => res.status(404).json({ message: 'File not found' }))
    .pipe(res);
});

module.exports = router;
