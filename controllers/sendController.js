const admin = require("../config/firebase");
const User = require('../model/user'); // Update the path as needed

// Endpoint to send notifications
const sendNotification = async ({senderName, fcmToken, title, message , receiverId}) => {
 
  if (!fcmToken || !title || !message || !senderName || !receiverId) {
    console.log("Error: Missing required parameters");
    return { success: false, error: "Missing required fields." };
  }
  // console.log(senderName ,"notificationsss");
  try {
  const notificationPayload = {
    notification: {
      title: `${senderName} says: ${title}`,
      body: message,
    },
    token: fcmToken,
  };

  // console.log(notificationPayload ,"notificationPayload");
  
    // Send the notification using FCM
    const response = await admin.messaging().send(notificationPayload);
     // Find the receiver user and store the notification in their profile
     const receiver = await User.findById(receiverId);
     if (!receiver) {
       return { success: false, error: "Receiver not found." };
     }
 
     // Store notification in the receiver's notifications array
     receiver.notifications.push({
       senderName,
       title,
       message,
     });
     await receiver.save();
 
     return { success: true, response };

  } catch (error) {
    console.error("Error sending notification:", error);
    // return res.status(500).json({ error: "Failed to send notification." });
  }
};

module.exports = {
  sendNotification,
};
