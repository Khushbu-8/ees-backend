const express = require("express");
const router = express.Router();
const {
  getReferrals,
  getEarnings,
  distributeRewards,
} = require("../controllers/referralController");

// Route to view a user's referrals
router.get("/referrals/:id", getReferrals);

// Route to view a user's earnings
router.get("/earnings/:id", getEarnings);

// Route to manually distribute rewards after a payment
router.post("/distribute-rewards", distributeRewards);

module.exports = router;
