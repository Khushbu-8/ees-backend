const express = require("express");
const {
  sentRequest,
  getUserRequests,
  getAllRequests,
  receivedRequest,
  cancelRequest,
  workDone,
  deleteRequest,
  sentRequestMobile,
  getUserRequestsMobile,
  receivedRequestMobile,
  cancelRequestMobile,
  workDoneMobile,
} = require("../controllers/requestController");
const { verifyToken } = require("../middleware/auth");
const {
  getNotifications,
  deleteNotification,
  getNotificationsMobile,
} = require("../controllers/sendController");
const router = express.Router();
router.post("/sentRequest", verifyToken, sentRequest);
router.post("/sentRequestMobile", sentRequestMobile);

router.get("/getUserRequests", verifyToken, getUserRequests);
router.get("/getUserRequestsMobile", getUserRequestsMobile);

router.get("/getAllRequests", getAllRequests);

router.post("/receivedRequest", verifyToken, receivedRequest);
router.post("/receivedRequestMobile", receivedRequestMobile);

router.post("/cancelRequest", verifyToken, cancelRequest);
router.post("/cancelRequestMobile", cancelRequestMobile);

router.post("/workDone", verifyToken, workDone);
router.post("/workDoneMobile", workDoneMobile);

router.get("/getNotifications", verifyToken, getNotifications);
router.post("/getNotificationsMobile", getNotificationsMobile);

router.delete("/deleteNotification", verifyToken, deleteNotification);

router.delete("/deleteRequest", deleteRequest);

module.exports = router;
