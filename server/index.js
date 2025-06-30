const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
const messageRoutes = require('./routes/api');
const cloudinary = require('cloudinary').v2;

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use('/api', messageRoutes);

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('message', (message) => {
    io.emit('message', message);
  });
});

server.listen(5000, () => console.log('Server running on port 5000'));
