// app.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');  // New task routes
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

const app = express();

// Middleware for parsing JSON bodies
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Create an HTTP server and wrap it with Socket.IO
const server = http.createServer(app);
const io = new Server(server);

// Setup Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // User joins a room for a specific task (for real-time comments)
  socket.on('joinTask', (taskId) => {
    socket.join(taskId); // Join a room specific to the task
    console.log(`User joined task room: ${taskId}`);
  });

  // Task status update event
  socket.on('taskStatusUpdate', (taskId, status) => {
    // Broadcast the new task status to all connected clients in the room
    io.emit('taskStatusUpdated', { taskId, status });
  });

  // Task creation event
  socket.on('newTask', (task) => {
    // Broadcast the new task to all connected clients
    io.emit('taskCreated', task);
  });

  // New comment event
  socket.on('newComment', (comment) => {
    const { taskId, commentData } = comment;
    io.to(taskId).emit('commentAdded', commentData);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
