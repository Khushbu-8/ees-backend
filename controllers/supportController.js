const Support = require("../model/support");
const UserModel = require("../model/user"); // Adjust path based on your project structure
const { sendNotification } = require("./sendController");

// Controller function to add a new issue
const addIssue = async (req, res) => {
  const { issue, description } = req.body;
  const userId = req.user.id; // Assuming user ID is available from authentication middleware

  if (!issue || !description) {
    return res
      .status(400)
      .json({ message: "Issue and description are required" });
  }

  try {
    // Check if the user already has an active ticket
    const activeTicket = await Support.findOne({
      userId,
      status: { $in: ["Pending", "In Progress"] },
    });

    if (activeTicket) {
      return res.status(400).json({
        message:
          "You already have an active ticket. Please wait for the resolution or check your existing ticket.",
      });
    }
    // Create a new support ticket
    const newTicket = new Support({
      issue,
      description,
      userId,
      status: "Pending", // Default status for a new ticket
    });

    // Save the ticket to the database
    await newTicket.save();

    res.status(201).json({
      message: "Support ticket created successfully",
      ticket: newTicket,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while creating the support ticket",
      error: error.message,
    });
  }
};

const addIssueMobile = async (req, res) => {
  const { userId, issue, description } = req.body; // Expecting userId from the request body

  if (!issue || !description) {
    return res
      .status(400)
      .json({ message: "Issue and description are required" });
  }

  try {
    // Check if the user already has an active ticket
    const activeTicket = await Support.findOne({
      userId,
      status: { $in: ["Pending", "In Progress"] },
    });

    if (activeTicket) {
      return res.status(400).json({
        message:
          "You already have an active ticket. Please wait for the resolution or check your existing ticket.",
      });
    }

    // Create a new support ticket
    const newTicket = new Support({
      issue,
      description,
      userId,
      status: "Pending", // Default status for a new ticket
    });

    // Save the ticket to the database
    await newTicket.save();

    res.status(201).json({
      message: "Support ticket created successfully",
      ticket: newTicket,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while creating the support ticket",
      error: error.message,
    });
  }
};

// Route to get active ticket for the user
const getActiveTicket = async (req, res) => {
  const userId = req.user.id; // Assuming user ID is available from authentication middleware

  try {
    const activeTicket = await Support.findOne({
      userId,
      status: { $in: ["Pending", "In Progress"] },
    });

    if (!activeTicket) {
      return res
        .status(404)
        .json({ message: "No active ticket found for this user" });
    }

    res.status(200).json(activeTicket);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch active ticket", error: error.message });
  }
};

const getActiveTicketMobile = async (req, res) => {
  const { userId } = req.body; // Expecting userId from the request body

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const activeTicket = await Support.findOne({
      userId,
      status: { $in: ["Pending", "In Progress"] },
    });

    if (!activeTicket) {
      return res
        .status(404)
        .json({ message: "No active ticket found for this user" });
    }

    res.status(200).json(activeTicket);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch active ticket",
      error: error.message,
    });
  }
};

// Controller function to get all tickets (For Admin)
const getTickets = async (req, res) => {
  try {
    const tickets = await Support.find().populate("userId", "name email"); // Populate user info
    res.status(200).json(tickets);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch tickets", error: error.message });
  }
};

// Controller function to update ticket status (For Admin)
const updateTicketStatus = async (req, res) => {
  const { id } = req.params;
  const { status, resolutionMessage } = req.body; // Expected status (e.g., "Resolved")

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    const ticket = await Support.findById(id).populate(
      "userId",
      "name fcmToken"
    ); // Populate user info

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Update status and resolution message
    ticket.status = status;
    ticket.resolutionMessage = resolutionMessage || "";
    await ticket.save();

    // Send notification to the user
    const user = ticket.userId;
    const notificationResult = await sendNotification({
      senderName: "Support Team",
      fcmToken: user.fcmToken,
      title: `Your ticket has been ${status}`,
      message:
        resolutionMessage || "Please check your ticket for more details.",
      receiverId: user._id,
    });

    if (!notificationResult.success) {
      console.error("Failed to send notification:", notificationResult.error);
    }

    res.status(200).json({
      message: "Ticket status updated successfully",
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while updating the ticket status",
      error: error.message,
    });
  }
};

// Controller function to get the user's own tickets
const getUserTickets = async (req, res) => {
  const userId = req.user.id; // Assuming the user ID is available from authentication middleware

  try {
    const tickets = await Support.find({ userId }) // Fetch tickets only belonging to the user
      .populate("userId", "name email") // Populate the user information if needed
      .exec();

    if (tickets.length === 0) {
      return res
        .status(404)
        .json({ message: "No tickets found for this user" });
    }

    res.status(200).json(tickets);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch tickets", error: error.message });
  }
};

const getUserTicketsMobile = async (req, res) => {
  const { userId } = req.body; // Expecting userId from the request body

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const tickets = await Support.find({ userId }) // Fetch tickets belonging to the user
      .populate("userId", "name email") // Populate user details if needed
      .exec();

    if (tickets.length === 0) {
      return res
        .status(404)
        .json({ message: "No tickets found for this user" });
    }

    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tickets",
      error: error.message,
    });
  }
};

const deleteTicket = async (req, res) => {
  const { id } = req.body; // Extract id from the request body

  if (!id) {
    return res.status(400).json({ message: "Ticket ID is required" });
  }

  try {
    const ticket = await Support.findByIdAndDelete(id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while deleting the ticket",
      error: error.message,
    });
  }
};

module.exports = {
  addIssue,
  getTickets,
  updateTicketStatus,
  getUserTickets,
  getActiveTicket,
  getActiveTicketMobile,
  addIssueMobile,
  getUserTicketsMobile,
  deleteTicket,
};
