const express = require("express");
const {
  CreateOrder,
  verifyPayment,
} = require("../controllers/paymentController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.post("/create-order", CreateOrder);
router.get("/verify-payment/:payment_id", verifyPayment);

module.exports = router;
