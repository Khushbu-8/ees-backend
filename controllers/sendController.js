const admin = require("../config/firebase");
// Endpoint to send notifications
const sendNotification = async (req, res) => {
  const { senderName, fcmToken, title, message } = req.body;
  // console.log(req.body, "send req");
  
  // if (!fcmToken || !title || !message || !senderName) {
  //   return res.status(400).json({ error: "Missing required fields." });
  // }
  if (!fcmToken || !title || !message || !senderName) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  console.log(req.body, "send req");
  
  const notificationPayload = {
    notification: {
      title: `${senderName} says: ${title}`,
      body: message,
    },
    token: fcmToken,
  };

  try {
    // Send the notification using FCM
    const response = await admin.messaging().send(notificationPayload);
    return res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("Error sending notification:", error);
    return res.status(500).json({ error: "Failed to send notification." });
  }
};

module.exports = {
  sendNotification,
};
