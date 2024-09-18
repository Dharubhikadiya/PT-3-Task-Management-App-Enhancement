// controllers/taskController.js
const Task = require('../models/Task');
const User = require('../models/User'); // Assuming you have a User model

const { sendNotification } = require('../utils/notificationService');
const { sendPushNotification } = require('../utils/notificationService');


const addComment = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  try {
    // Find the task
    const task = await Task.findById(id).populate('createdBy assignedTo');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Add the comment to the task
    const newComment = { user: userId, text };
    task.comments.push(newComment);
    await task.save();

    // Notify task creator and assignees
    const involvedUsers = [task.createdBy._id.toString(), task.assignedTo._id.toString()];
    
    involvedUsers.forEach((userId) => {
      sendPushNotification(userId, `A new comment was added to the task "${task.title}"`);
    });

    res.status(201).json(task.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign a new task to a user
const assignTask = async (req, res) => {
  const { title, description, assignedTo, dueDate } = req.body;

  try {
    // Validate if the assigned user exists
    const user = await User.findById(assignedTo);
    if (!user) {
      return res.status(404).json({ message: 'Assigned user not found' });
    }

    // Create a new task and assign it to a user
    const task = await Task.create({
      title,
      description,
      assignedTo,
      createdBy: req.user._id,  // Assuming the authenticated user is creating this task
      dueDate,
    });
    sendNotification(assignedTo, `A new task has been assigned to you: ${title} with due date ${dueDate}`);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update task status
const updateTask = async (req, res) => {
    const { status } = req.body;
    const taskId = req.params.id;
  
    try {
      const task = await Task.findById(taskId);
  
      if (!task) return res.status(404).json({ message: 'Task not found' });
  
      // Only allow the assigned user to update the task
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not allowed to update this task' });
      }
  
      task.status = status;
      await task.save();
  
      // Notify the assigned user about the status update
      sendNotification(task.assignedTo, `The status of task "${task.title}" has been updated to ${status}`);
  
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const updateTaskStatus = async (req, res, io) => {
    const { id } = req.params;
    const { status } = req.body;
  
    try {
      const task = await Task.findById(id);
      if (!task) return res.status(404).json({ message: 'Task not found' });
  
      task.status = status;
      await task.save();
  
      // Emit a Socket.IO event to update all clients in real-time
      io.emit('taskStatusUpdated', { taskId: id, status });
  
      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


const createTask = async (req, res, io) => {
  const { title, description, dueDate, assignedTo } = req.body;

  try {
    const task = new Task({
      title,
      description,
      dueDate,
      assignedTo,
      createdBy: req.user._id,
    });
    await task.save();

    // Emit a Socket.IO event for task creation
    io.emit('taskCreated', task);

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};








module.exports = { assignTask, updateTask, addComment, updateTaskStatus, createTask };

