// Import necessary models using ES6 import syntax

const Notifications = require("../models/Notification");

// Function to create a notification
const createNotification = async (userId, type, content) => {
  try {
    const notification = await Notifications.create({
      userId,
      type,
      content,
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

module.exports = createNotification;
