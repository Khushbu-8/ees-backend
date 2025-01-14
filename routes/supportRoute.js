const express = require("express");
const { addIssue, getTickets, updateTicketStatus, getUserTickets, getActiveTicket } = require("../controllers/supportController");
const { verifyToken } = require("../middleware/auth");
const router = express.Router();

router.post("/addIssue",verifyToken,addIssue);
router.get('/getTickets', verifyToken, getTickets);
router.get('/getActiveTicket', verifyToken, getActiveTicket);
router.get('/userTickets', verifyToken, getUserTickets);

// Route for updating ticket status (Admin Only)
router.put('/updateTicketStatus/:id/status', verifyToken, updateTicketStatus);

module.exports = router;
