const express = require("express");
const {
  CreateOrder,
  verifyPayment,
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/create-order", CreateOrder);
router.post("/verify-payment", verifyPayment);

module.exports = router;
