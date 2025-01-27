const User = require("../model/user"); // Update the path as needed
const mongoose = require("mongoose");
const { sendNotification } = require("./sendController");

const sentRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !senderId) {
      return res.status(400).send({
        success: false,
        message: "Sender or receiver ID is missing.",
      });
    }

    if (senderId.toString() === receiverId) {
      return res.status(400).send({
        success: false,
        message: "You cannot send a request to yourself.",
      });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).send({
        success: false,
        message: "Sender or receiver not found.",
      });
    }
    const existingSentRequest = sender.sended_requests.find(
      (req) => req.user.toString() === receiverId && req.status === "pending"
    );

    if (existingSentRequest) {
      return res.status(400).send({
        success: false,
        message: "Already send request.",
      });
    }

    // Check if a pending request already exists from receiver to sender
    const existingReceivedRequest = receiver.received_requests.find(
      (req) => req.user.toString() === senderId && req.status === "pending"
    );

    if (existingReceivedRequest) {
      return res.status(400).send({
        success: false,
        message: "Already send request.",
      });
    }

    await User.findByIdAndUpdate(senderId, {
      $addToSet: { sended_requests: { user: receiver, status: "pending" } },
    });

    await User.findByIdAndUpdate(receiverId, {
      $addToSet: { received_requests: { user: sender, status: "pending" } },
    });
    // console.log(receiver._id,"seder token");

    const Notification = {
      senderName: sender.name,
      fcmToken: receiver.fcmToken,
      title: "New Request",
      message: `${sender.name} has sent you a request.`,
      receiverId: receiver._id, // Include the receiver's ID to store the notification
    };
    // console.log(Notification,"notif" );

    await sendNotification(Notification);

    const updatedSender = await User.findById(senderId).populate('sended_requests.user');
    const updatedReceiver = await User.findById(receiverId).populate('received_requests.user');

    return res.status(200).send({
      success: true,
      message: "Request sent successfully.",
      sender: updatedSender,
      receiver: updatedReceiver,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred during the request.",
      error: error.message,
    });
  }
};

const sentRequestMobile = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).send({
        success: false,
        message: "Sender or receiver ID is missing.",
      });
    }

    if (senderId === receiverId) {
      return res.status(400).send({
        success: false,
        message: "You cannot send a request to yourself.",
      });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).send({
        success: false,
        message: "Sender or receiver not found.",
      });
    }

    const existingSentRequest = sender.sended_requests.find(
      (req) => req.user.toString() === receiverId && req.status === "pending"
    );

    if (existingSentRequest) {
      return res.status(400).send({
        success: false,
        message: "Already sent request.",
      });
    }

    // Check if a pending request already exists from receiver to sender
    const existingReceivedRequest = receiver.received_requests.find(
      (req) => req.user.toString() === senderId && req.status === "pending"
    );

    if (existingReceivedRequest) {
      return res.status(400).send({
        success: false,
        message: "Already sent request.",
      });
    }

    await User.findByIdAndUpdate(senderId, {
      $addToSet: { sended_requests: { user: receiver, status: "pending" } },
    });

    await User.findByIdAndUpdate(receiverId, {
      $addToSet: { received_requests: { user: sender, status: "pending" } },
    });

    const Notification = {
      senderName: sender.name,
      fcmToken: receiver.fcmToken,
      title: "New Request",
      message: `${sender.name} has sent you a request.`,
      receiverId: receiver._id, // Include the receiver's ID to store the notification
    };

    await sendNotification(Notification);

    return res.status(200).send({
      success: true,
      message: "Request sent successfully.",
      sender,
      receiver,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred during the request.",
      error: error.message,
    });
  }
};

const receivedRequest = async (req, res) => {
  try {
    const { senderId } = req.body;
    const receiverId = req.user.id;

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    const sender = await User.findById(senderObjectId);
    const receiver = await User.findById(receiverObjectId);

    if (!sender || !receiver) {
      return res.status(404).send({
        success: false,
        message: "Sender or receiver not found.",
      });
    }

    const senderUpdateResult = await User.updateOne(
      { _id: senderObjectId, "sended_requests.user._id": receiverObjectId },
      {
        $set: {
          "sended_requests.$.status": "received",
          userstatus: "unavailable",
        },
      }
    );

    if (senderUpdateResult.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message: "No matching request found in sender's sended_requests.",
      });
    }

    const receiverUpdateResult = await User.updateOne(
      { _id: receiverObjectId, "received_requests.user._id": senderObjectId },
      {
        $set: {
          "received_requests.$.status": "received",
          userstatus: "unavailable",
        },
      }
    );

    if (receiverUpdateResult.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message: "No matching request found in receiver's received_requests.",
      });
    }

    // // Send notification to the sender that their request was received
    // await sendNotification({
    //   senderName: receiver.name,
    //   fcmToken: sender.fcmToken,
    //   title: 'Request Received',
    //   message: `${receiver.name} has received your request.`,
    // });

    const Notification = {
      senderName: receiver.name,
      fcmToken: sender.fcmToken,
      title: "Request Received",
      message: `${receiver.name} has received your request.`,
      receiverId: sender._id, // Include the receiver's ID to store the notification
    };
    // console.log(Notification,"notif" );

    await sendNotification(Notification);

    return res.status(200).send({
      success: true,
      message:
        "Request status updated to 'received', and both sender and receiver's userstatus set to 'unavailable'.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while updating the request.",
      error: error.message,
    });
  }
};

const receivedRequestMobile = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body; // receiverId and senderId provided in request body

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    const sender = await User.findById(senderObjectId);
    const receiver = await User.findById(receiverObjectId);

    if (!sender || !receiver) {
      return res.status(404).send({
        success: false,
        message: "Sender or receiver not found.",
      });
    }

    const senderUpdateResult = await User.updateOne(
      { _id: senderObjectId, "sended_requests.user._id": receiverObjectId },
      {
        $set: {
          "sended_requests.$.status": "received",
          userstatus: "unavailable",
        },
      }
    );

    if (senderUpdateResult.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message: "No matching request found in sender's sended_requests.",
      });
    }

    const receiverUpdateResult = await User.updateOne(
      { _id: receiverObjectId, "received_requests.user._id": senderObjectId },
      {
        $set: {
          "received_requests.$.status": "received",
          userstatus: "unavailable",
        },
      }
    );

    if (receiverUpdateResult.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message: "No matching request found in receiver's received_requests.",
      });
    }

    // Send notification to the sender that their request was received
    const Notification = {
      senderName: receiver.name,
      fcmToken: sender.fcmToken,
      title: "Request Received",
      message: `${receiver.name} has received your request.`,
      receiverId: sender._id, // Include the receiver's ID to store the notification
    };

    await sendNotification(Notification);

    return res.status(200).send({
      success: true,
      message:
        "Request status updated to 'received', and both sender and receiver's userstatus set to 'unavailable'.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while updating the request.",
      error: error.message,
    });
  }
};

const cancelRequest = async (req, res) => {
  try {
    const { senderId } = req.body;
    const receiverId = req.user.id;

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    const [sender, receiver] = await Promise.all([
      User.findById(senderObjectId),
      User.findById(receiverObjectId),
    ]);

    if (!sender || !receiver) {
      return res.status(404).send({
        success: false,
        message: "Sender or receiver not found.",
      });
    }

    const senderStatusUpdate = await User.updateOne(
      { _id: senderObjectId, "sended_requests.user._id": receiverObjectId },
      { $set: { "sended_requests.$.status": "canceled" } }
    );

    if (senderStatusUpdate.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message:
          "No matching request found in sender's sended_requests to update status.",
      });
    }

    const receiverStatusUpdate = await User.updateOne(
      { _id: receiverObjectId, "received_requests.user._id": senderObjectId },
      { $set: { "received_requests.$.status": "canceled" } }
    );

    if (receiverStatusUpdate.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message:
          "No matching request found in receiver's received_requests to update status.",
      });
    }

    const senderRequestRemoval = await User.updateOne(
      { _id: senderObjectId },
      { $pull: { sended_requests: { "user._id": receiverObjectId } } }
    );

    if (senderRequestRemoval.modifiedCount === 0) {
      return res.status(400).send({
        success: false,
        message: "Failed to remove request from sender's sended_requests.",
      });
    }

    const receiverRequestRemoval = await User.updateOne(
      { _id: receiverObjectId },
      { $pull: { received_requests: { "user._id": senderObjectId } } }
    );

    if (receiverRequestRemoval.modifiedCount === 0) {
      return res.status(400).send({
        success: false,
        message: "Failed to remove request from receiver's received_requests.",
      });
    }

    // Send notification to both sender and receiver that the request is canceled

    // Send notification about the cancellation to both sender and receiver
    await sendNotification({
      senderName: sender.name,
      fcmToken: receiver.fcmToken,
      title: "Request Canceled",
      message: `${sender.name} has canceled the request.`,
      receiverId: receiver._id, // Include the receiver's ID for storing notifications in the receiver's profile
    });

    await sendNotification({
      senderName: receiver.name,
      fcmToken: sender.fcmToken,
      title: "Request Canceled",
      message: `${receiver.name} has canceled the request.`,
      receiverId: sender._id, // Include the sender's ID for storing notifications in the sender's profile
    });

    return res.status(200).send({
      success: true,
      message: "Request status updated to 'canceled' and removed successfully.",
    });
  } catch (error) {
    console.error("Error during request cancellation:", error);
    return res.status(500).send({
      success: false,
      message: "An error occurred during cancellation.",
      error: error.message,
    });
  }
};

const cancelRequestMobile = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body; // receiverId and senderId provided in request body

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    const [sender, receiver] = await Promise.all([
      User.findById(senderObjectId),
      User.findById(receiverObjectId),
    ]);

    if (!sender || !receiver) {
      return res.status(404).send({
        success: false,
        message: "Sender or receiver not found.",
      });
    }

    const senderStatusUpdate = await User.updateOne(
      { _id: senderObjectId, "sended_requests.user._id": receiverObjectId },
      { $set: { "sended_requests.$.status": "canceled" } }
    );

    if (senderStatusUpdate.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message:
          "No matching request found in sender's sended_requests to update status.",
      });
    }

    const receiverStatusUpdate = await User.updateOne(
      { _id: receiverObjectId, "received_requests.user._id": senderObjectId },
      { $set: { "received_requests.$.status": "canceled" } }
    );

    if (receiverStatusUpdate.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message:
          "No matching request found in receiver's received_requests to update status.",
      });
    }

    const senderRequestRemoval = await User.updateOne(
      { _id: senderObjectId },
      { $pull: { sended_requests: { "user._id": receiverObjectId } } }
    );

    if (senderRequestRemoval.modifiedCount === 0) {
      return res.status(400).send({
        success: false,
        message: "Failed to remove request from sender's sended_requests.",
      });
    }

    const receiverRequestRemoval = await User.updateOne(
      { _id: receiverObjectId },
      { $pull: { received_requests: { "user._id": senderObjectId } } }
    );

    if (receiverRequestRemoval.modifiedCount === 0) {
      return res.status(400).send({
        success: false,
        message: "Failed to remove request from receiver's received_requests.",
      });
    }

    // Send notification to both sender and receiver that the request is canceled
    await sendNotification({
      senderName: sender.name,
      fcmToken: receiver.fcmToken,
      title: "Request Canceled",
      message: `${sender.name} has canceled the request.`,
      receiverId: receiver._id,
    });

    await sendNotification({
      senderName: receiver.name,
      fcmToken: sender.fcmToken,
      title: "Request Canceled",
      message: `${receiver.name} has canceled the request.`,
      receiverId: sender._id,
    });

    return res.status(200).send({
      success: true,
      message: "Request status updated to 'canceled' and removed successfully.",
    });
  } catch (error) {
    console.error("Error during request cancellation:", error);
    return res.status(500).send({
      success: false,
      message: "An error occurred during cancellation.",
      error: error.message,
    });
  }
};

const workDone = async (req, res) => {
  try {
    const { senderId } = req.body;
    const receiverId = req.user.id;

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    const [sender, receiver] = await Promise.all([
      User.findById(senderObjectId),
      User.findById(receiverObjectId),
    ]);

    if (!sender || !receiver) {
      return res.status(404).send({
        success: false,
        message: "Sender or receiver not found.",
      });
    }

    const senderStatusUpdate = await User.updateOne(
      { _id: senderObjectId, "sended_requests.user._id": receiverObjectId },
      { $set: { "sended_requests.$.status": "done" } }
    );

    if (senderStatusUpdate.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message:
          "No matching request found in sender's sended_requests to update status.",
      });
    }

    const receiverStatusUpdate = await User.updateOne(
      { _id: receiverObjectId, "received_requests.user._id": senderObjectId },
      { $set: { "received_requests.$.status": "done" } }
    );

    if (receiverStatusUpdate.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message:
          "No matching request found in receiver's received_requests to update status.",
      });
    }

    const receiverStatusUpdateResult = await User.updateOne(
      { _id: receiverObjectId },
      { $set: { userstatus: "available" } }
    );

    if (receiverStatusUpdateResult.modifiedCount === 0) {
      return res.status(400).send({
        success: false,
        message: "Failed to update receiver's user status to 'available'.",
      });
    }

    // Send notification to both sender and receiver about the work being done
    await sendNotification({
      senderName: receiver.name,
      fcmToken: sender.fcmToken,
      title: "Work Done",
      message: `${receiver.name} has completed the work.`,
    });

    const Notification = {
      senderName: sender.name,
      fcmToken: receiver.fcmToken,
      title: "Work Done",
      message: `${sender.name} has completed the work.`,
      receiverId: sender._id,
    };

    // const Notification = {
    //   senderName: receiver.name,
    //   fcmToken: sender.fcmToken,
    //   title: 'Request Received',
    //   message: `${receiver.name} has received your request.`,
    //   receiverId: sender._id, // Include the receiver's ID to store the notification
    // };
    await sendNotification(Notification);

    return res.status(200).send({
      success: true,
      message:
        "Request status updated, requests removed, and user status set to 'available'.",
    });
  } catch (error) {
    console.error("Error during work done operation:", error);
    return res.status(500).send({
      success: false,
      message: "An error occurred during the work done operation.",
      error: error.message,
    });
  }
};

const workDoneMobile = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body; // receiverId and senderId provided in request body

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    const [sender, receiver] = await Promise.all([
      User.findById(senderObjectId),
      User.findById(receiverObjectId),
    ]);

    if (!sender || !receiver) {
      return res.status(404).send({
        success: false,
        message: "Sender or receiver not found.",
      });
    }

    const senderStatusUpdate = await User.updateOne(
      { _id: senderObjectId, "sended_requests.user._id": receiverObjectId },
      { $set: { "sended_requests.$.status": "done" } }
    );

    if (senderStatusUpdate.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message:
          "No matching request found in sender's sended_requests to update status.",
      });
    }

    const receiverStatusUpdate = await User.updateOne(
      { _id: receiverObjectId, "received_requests.user._id": senderObjectId },
      { $set: { "received_requests.$.status": "done" } }
    );

    if (receiverStatusUpdate.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message:
          "No matching request found in receiver's received_requests to update status.",
      });
    }

    const receiverStatusUpdateResult = await User.updateOne(
      { _id: receiverObjectId },
      { $set: { userstatus: "available" } }
    );

    if (receiverStatusUpdateResult.modifiedCount === 0) {
      return res.status(400).send({
        success: false,
        message: "Failed to update receiver's user status to 'available'.",
      });
    }

    // Send notification to both sender and receiver about the work being done
    const notificationToSender = {
      senderName: receiver.name,
      fcmToken: sender.fcmToken,
      title: "Work Done",
      message: `${receiver.name} has completed the work.`,
      receiverId: sender._id,
    };

    const notificationToReceiver = {
      senderName: sender.name,
      fcmToken: receiver.fcmToken,
      title: "Work Done",
      message: `${sender.name} has completed the work.`,
      receiverId: receiver._id,
    };

    // Sending notifications
    await sendNotification(notificationToSender);
    await sendNotification(notificationToReceiver);

    return res.status(200).send({
      success: true,
      message:
        "Request status updated, requests removed, and user status set to 'available'.",
    });
  } catch (error) {
    console.error("Error during work done operation:", error);
    return res.status(500).send({
      success: false,
      message: "An error occurred during the work done operation.",
      error: error.message,
    });
  }
};

const getUserRequests = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming authenticated user ID is attached to req.user

    // Find user by ID and populate requests
    const user = await User.findById(userId)
      .populate({
        path: "sended_requests.user", // Populate user details in sent requests
        select: "name email", // Select specific fields to return
      })
      .populate({
        path: "received_requests.user", // Populate user details in received requests
        select: "name email", // Select specific fields to return
      });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).send({
      success: true,
      sendedRequests: user.sended_requests,
      receivedRequests: user.received_requests,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while retrieving user requests.",
      error: error.message,
    });
  }
};


const getUserRequestsMobile = async (req, res) => {
  try {
    const { userId } = req.body; // Assuming userId is provided in the request body

    // Find user by ID and populate requests
    const user = await User.findById(userId)
      .populate("sended_requests") // Populate details of sent requests
      .populate("received_requests"); // Populate details of received requests

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).send({
      success: true,
      sendedRequests: user.sended_requests,
      receivedRequests: user.received_requests,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while retrieving user requests.",
      error: error.message,
    });
  }
};

const getAllRequests = async (req, res) => {
  try {
    // Find all users and populate their requests
    const users = await User.find({})
      .populate("sended_requests.user", "name email") // Populate sent request user details
      .populate("received_requests.user", "name email"); // Populate received request user details

    // Create a summarized view of requests
    const allRequests = users.map((user) => ({
      userId: user._id,
      name: user.name,
      email: user.email,
      sendedRequests: user.sended_requests,
      receivedRequests: user.received_requests,
    }));

    return res.status(200).send({
      success: true,
      data: allRequests,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while retrieving all requests.",
      error: error.message,
    });
  }
};

const deleteRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).send({
        success: false,
        message: "Request ID is required.",
      });
    }

    const senderUpdateResult = await User.updateOne(
      { "sended_requests._id": requestId },
      { $pull: { sended_requests: { _id: requestId } } }
    );

    const receiverUpdateResult = await User.updateOne(
      { "received_requests._id": requestId },
      { $pull: { received_requests: { _id: requestId } } }
    );

    if (
      senderUpdateResult.modifiedCount === 0 &&
      receiverUpdateResult.modifiedCount === 0
    ) {
      return res.status(404).send({
        success: false,
        message: "Request not found.",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Request deleted successfully.",
    });
  } catch (error) {
    console.error("Error during request deletion:", error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while deleting the request.",
      error: error.message,
    });
  }
};

module.exports = {
  sentRequest,
  sentRequestMobile,
  getUserRequests,
  getAllRequests,
  receivedRequest,
  cancelRequest,
  workDone,
  deleteRequest,
  getUserRequestsMobile,
  receivedRequestMobile,
  cancelRequestMobile,
  workDoneMobile,
};
