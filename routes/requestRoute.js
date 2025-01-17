const express = require("express");
const {
  sentRequest,
  getUserRequests,
  getAllRequests,
  receivedRequest,
  cancelRequest,
  workDone,
  deleteRequest,
} = require("../controllers/requestController");
const { verifyToken } = require("../middleware/auth");
const { getNotifications, deleteNotification } = require("../controllers/sendController");
const router = express.Router();
router.post("/sentRequest", verifyToken, sentRequest);
router.get("/getUserRequests", verifyToken, getUserRequests);
router.get("/getAllRequests", getAllRequests);
router.post("/receivedRequest", verifyToken, receivedRequest);
router.post("/cancelRequest", verifyToken, cancelRequest);
router.post("/workDone", verifyToken, workDone);
router.get("/getNotifications",verifyToken, getNotifications);
router.delete("/deleteNotification",verifyToken, deleteNotification);
router.delete("/deleteRequest", deleteRequest);

module.exports = router;
