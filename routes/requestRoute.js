const express = require("express");
const {
  sentRequest,
  getUserRequests,
  getAllRequests,
  receivedRequest,
  cancelRequest,
  workDone,
} = require("../controllers/requestController");
const { verifyToken } = require("../middleware/auth");
const router = express.Router();
router.post("/sentRequest", verifyToken, sentRequest);
router.get("/getUserRequests", verifyToken, getUserRequests);
router.get("/getAllRequests", getAllRequests);
router.post("/receivedRequest", verifyToken, receivedRequest);
router.post("/cancelRequest", verifyToken, cancelRequest);
router.post("/workDone", verifyToken, workDone);
module.exports = router;
