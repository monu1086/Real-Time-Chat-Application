const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const cloudinary = require('cloudinary').v2;

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/messages', authMiddleware, async (req, res) => {
  const messages = await Message.find({ userId: req.user.id });
  res.json(messages);
});

router.post('/messages', authMiddleware, async (req, res) => {
  const { content } = req.body;
  let imageUrl = '';
  if (req.files?.image) {
    const result = await cloudinary.uploader.upload(req.files.image.tempFilePath);
    imageUrl = result.secure_url;
  }
  const message = new Message({ content, imageUrl, userId: req.user.id });
  await message.save();
  res.json(message);
});

module.exports = router;
