const express = require("express");
const { addRating, getUserRating } = require("../controllers/ratingController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.post("/rate", verifyToken, addRating);
router.get("/getRate", verifyToken, getUserRating);

module.exports = router;
