
const User = require('../model/user'); // Update the path as needed
const mongoose = require("mongoose");
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
  
      await User.findByIdAndUpdate(senderId, {
        $addToSet: { sended_requests: { user: receiver, status: 'pending' } },
      });
  
      await User.findByIdAndUpdate(receiverId, {
        $addToSet: { received_requests: { user: sender, status: 'pending' } },
      });
  
      return res.status(200).send({
        success: true,
        message: "Request sent successfully.",
        sender,receiver
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

console.log(receiverId);

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

        console.log("Sender's sended_requests:", sender.sended_requests);

        // Update status in sender's `sended_requests`
        const senderUpdateResult = await User.updateOne(
            { _id: senderObjectId, "sended_requests.user._id": receiverObjectId },
            { $set: { "sended_requests.$.status": "received" } }
        );

        console.log("Sender Update Query Result:", senderUpdateResult);

        if (senderUpdateResult.matchedCount === 0) {
            return res.status(400).send({
                success: false,
                message: "No matching request found in sender's sended_requests.",
            });
        }

        const receiverUpdateResult = await User.updateOne(
            { _id: receiverObjectId, "received_requests.user._id": senderObjectId },
            { $set: { "received_requests.$.status": "received" } }
        );

        if (receiverUpdateResult.matchedCount === 0) {
            return res.status(400).send({
                success: false,
                message: "No matching request found in receiver's received_requests.",
            });
        }

        return res.status(200).send({
            success: true,
            message: "Request status updated to 'received'.",
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
// const cancelRequest = async (req, res) => {
//   try {
//     const { senderId } = req.body;
//     const receiverId = req.user.id;

//     const senderObjectId = new mongoose.Types.ObjectId(senderId);
//     const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

//     // Check if sender and receiver exist
//     const [sender, receiver] = await Promise.all([
//       User.findById(senderObjectId),
//       User.findById(receiverObjectId),
//     ]);

//     if (!sender || !receiver) {
//       return res.status(404).send({
//         success: false,
//         message: "Sender or receiver not found.",
//       });
//     }

//     // Update status in sender's `sended_requests`
//     const senderUpdateResult = await User.updateOne(
//       { _id: senderObjectId, "sended_requests.user._id": receiverObjectId },
//       { $set: { "sended_requests.$.status": "canceled" } }
//     );

//     if (senderUpdateResult.matchedCount === 0) {
//       return res.status(400).send({
//         success: false,
//         message: "No matching request found in sender's sended_requests.",
//       });
//     }

//     // Update status in receiver's `received_requests`
//     const receiverUpdateResult = await User.updateOne(
//       { _id: receiverObjectId, "received_requests.user._id": senderObjectId },
//       { $set: { "received_requests.$.status": "canceled" } }
//     );

//     if (receiverUpdateResult.matchedCount === 0) {
//       return res.status(400).send({
//         success: false,
//         message: "No matching request found in receiver's received_requests.",
//       });
//     }

//     return res.status(200).send({
//       success: true,
//       message: "Request canceled successfully.",
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send({
//       success: false,
//       message: "An error occurred during cancellation.",
//       error: error.message,
//     });
//   }
// };

const cancelRequest = async (req, res) => {
  try {
    const { senderId } = req.body; // ID of the sender
    const receiverId = req.user.id; // ID of the receiver (authenticated user)

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    // Check if sender and receiver exist
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

    // Step 1: Update the status in sender's `sended_requests`
    const senderStatusUpdate = await User.updateOne(
      { _id: senderObjectId, "sended_requests.user._id": receiverObjectId },
      { $set: { "sended_requests.$.status": "canceled" } }
    );

    if (senderStatusUpdate.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message: "No matching request found in sender's sended_requests to update status.",
      });
    }

    // Step 1: Update the status in receiver's `received_requests`
    const receiverStatusUpdate = await User.updateOne(
      { _id: receiverObjectId, "received_requests.user._id": senderObjectId },
      { $set: { "received_requests.$.status": "canceled" } }
    );

    if (receiverStatusUpdate.matchedCount === 0) {
      return res.status(400).send({
        success: false,
        message: "No matching request found in receiver's received_requests to update status.",
      });
    }

    // Step 2: Remove the request from sender's `sended_requests`
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

    // Step 2: Remove the request from receiver's `received_requests`
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

    // Successfully updated status and removed the request
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

const getUserRequests = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming authenticated user ID is attached to req.user

        // Find user by ID and populate requests
        const user = await User.findById(userId)
            .populate('sended_requests') // Populate details of sent requests
            .populate('received_requests'); // Populate details of received requests

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
            .populate('sended_requests.user', 'name email') // Populate sent request user details
            .populate('received_requests.user', 'name email'); // Populate received request user details

        // Create a summarized view of requests
        const allRequests = users.map(user => ({
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

module.exports = {
    sentRequest,getUserRequests,getAllRequests,receivedRequest,cancelRequest
}
