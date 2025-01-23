const express = require("express");
const {
  addIssue,
  getTickets,
  updateTicketStatus,
  getUserTickets,
  getActiveTicket,
  addIssueMobile,
  getActiveTicketMobile,
  getUserTicketsMobile,
  deleteTicket,
} = require("../controllers/supportController");
const { verifyToken } = require("../middleware/auth");
const router = express.Router();

router.post("/addIssue", verifyToken, addIssue);
router.get("/getActiveTicket", verifyToken, getActiveTicket);
router.get("/userTickets", verifyToken, getUserTickets);
router.delete("/deleteTicket", deleteTicket);

router.post("'addIssueMobile", addIssueMobile);
router.post("/getActiveTicketMobile", getActiveTicketMobile);
router.post("/getUserTicketsMobile", getUserTicketsMobile);

// Route for updating ticket status (Admin Only)
router.put("/updateTicketStatus/:id/status", verifyToken, updateTicketStatus);
router.get("/getTickets", verifyToken, getTickets);

module.exports = router;
