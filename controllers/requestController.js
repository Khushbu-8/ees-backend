const User = require('../model/user'); // Update the path as needed

const sentRequest = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user.id;

        // Validate if both senderId and receiverId exist
        if (!receiverId || !senderId) {
            return res.status(400).send({
                success: false,
                message: "Sender or receiver ID is missing.",
            });
        }

        // Ensure the sender is not sending a request to themselves
        if (senderId.toString() === receiverId) {
            return res.status(400).send({
                success: false,
                message: "You cannot send a request to yourself.",
            });
        }

        // Fetch the complete user data for sender and receiver
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);
console.log(receiver);

        if (!sender || !receiver) {
            return res.status(404).send({
                success: false,
                message: "Sender or receiver not found.",
            });
        }

        // Update the sender's `sended_requests` array with the receiver's full data
        await User.findByIdAndUpdate(senderId, {
            $addToSet: { sended_requests: { user: receiver } }, // Prevent duplicates
        });

        // Update the receiver's `received_requests` array with the sender's full data
        await User.findByIdAndUpdate(receiverId, {
            $addToSet: { received_requests: { user: sender } }, // Prevent duplicates
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
    sentRequest,getUserRequests,getAllRequests
}