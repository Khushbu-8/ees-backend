const express = require("express");
const router = express.Router();
const {
  getReferrals,
  getEarnings,
  distributeRewards,
  getReferredBy,
  getUserWalletBalance,
  getReferralsMobile,
  getReffaredById,
} = require("../controllers/referralController");

// Route to view a user's referrals
router.get("/getreferrals/:id", getReferrals);
router.post("/getReferralsMobile", getReferralsMobile);
router.get("/getReferredBy/:id", getReferredBy);
router.get("/getReffaredById", getReffaredById);

// Route to view a user's earnings
router.get("/earnings/:id", getEarnings);
router.get("/getUserWalletBalance/:id", getUserWalletBalance);

// Route to manually distribute rewards after a payment
router.post("/distribute-rewards", distributeRewards);

module.exports = router;
