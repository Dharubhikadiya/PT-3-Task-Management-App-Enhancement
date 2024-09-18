// utils/notificationService.js
const sendPushNotification = (userId, message) => {
    console.log(`Sending push notification to user ${userId}: ${message}`);
    // You can implement real push notifications via FCM, OneSignal, etc. here
  };
  
  const sendEmailNotification = (email, message) => {
    console.log(`Sending email to ${email}: ${message}`);
    // Here you would integrate an email service like SendGrid, Nodemailer, etc.
  };
  
  
  module.exports = { sendPushNotification, sendEmailNotification };
  