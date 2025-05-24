import express from 'express';
import upload from '../middleware/uploadUserPhoto.js';

const router = express.Router();

router.post('/image', upload.single('image'), (req, res) => {
  res.json({ imageUrl: req.file.path });
});

export default router;
