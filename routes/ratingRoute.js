const express = require("express");
const {
  addRating,
  getUserRating,
  addRatingMobile,
  getProviderRating,
  rateProvider,
  rateUser,
  getUserRatings,
} = require("../controllers/ratingController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.post("/rate", verifyToken, addRating);
router.get("/getRate", verifyToken, getUserRating);
router.get('/getProviderRating/:userId',getProviderRating)
router.post("/addRatingMobile", addRatingMobile);
router.post("/rateUser",verifyToken, rateUser);
router.post("/rateProvider",verifyToken, rateProvider);
router.get("/getRatings/:userId", getUserRatings);

module.exports = router;
