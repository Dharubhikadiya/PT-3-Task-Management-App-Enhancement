// cronJobs.js
const cron = require('node-cron');
const Task = require('./models/Task');
const { sendPushNotification } = require('./utils/notificationService');

// Function to schedule and run cron jobs
const scheduleCronJobs = () => {
  // Schedule the cron job to run every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running a job to check for tasks near their due date...');

    try {
      const now = new Date();
      const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Find tasks that are due within the next 24 hours and are not completed
      const tasksDueSoon = await Task.find({
        dueDate: { $gte: now, $lte: oneDayLater },
        status: { $ne: 'completed' },
      });

      // Send notifications to the assigned users
      tasksDueSoon.forEach((task) => {
        sendPushNotification(task.assignedTo, `Reminder: Your task "${task.title}" is due on ${task.dueDate}`);
      });
    } catch (error) {
      console.error('Error checking for due tasks:', error);
    }
  });

  // Additional cron jobs can be added here
};

module.exports = { scheduleCronJobs };
