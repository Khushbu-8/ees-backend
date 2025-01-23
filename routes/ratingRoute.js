const express = require("express");
const {
  addRating,
  getUserRating,
  addRatingMobile,
  getProviderRating,
} = require("../controllers/ratingController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.post("/rate", verifyToken, addRating);
router.get("/getRate", verifyToken, getUserRating);
router.get('/getProviderRating/:userId',getProviderRating)
router.post("/addRatingMobile", addRatingMobile);

module.exports = router;
