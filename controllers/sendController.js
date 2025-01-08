const admin = require("../config/firebase");
const User = require("../model/user");

// Endpoint to send notifications
const sendNotification = async ({ senderName, fcmToken, title, message, receiverId }) => {
  if (!fcmToken || !title || !message || !senderName || !receiverId) {
    console.log("Error: Missing required parameters");
    return { success: false, error: "Missing required fields." };
  }

  try {
    const notificationPayload = {
      notification: {
        title: `${senderName} says: ${title}`,
        body: message,
      },
      token: fcmToken,
    };
    // console.log(notificationPayload,"notificationPayload");
    
  
    // Find the receiver user and store the notification in their profile
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      console.log("Receiver not found");
      return { success: false, error: "Receiver not found." };
    }

    // Store the notification in the receiver's notifications array
    receiver.notifications.push({
      senderName,
      title,
      message,
      timestamp: new Date(), // Ensure timestamp is set
    });
    await receiver.save();

    console.log("Notification sent and saved successfully for receiver:", receiverId);
      // Send the notification using FCM
      const response = await admin.messaging().send(notificationPayload);
    
    return { success: true, response };


  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, error: "Failed to send notification." };
  }
};

module.exports = {
  sendNotification,
};
