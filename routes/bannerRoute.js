const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const {
  addbanner,
  getUserByBanner,
  updateBanner,
  deleteBanner,
  getAllBanners,
  getBanners,
  addBannerMobile,
  updateBannerMobile,
  getUserByBannerMobile,
  getUserBannerMobile,
  deleteBannerMobile,
} = require("../controllers/bannerController");
const { verifyToken } = require("../middleware/auth");
cloudinary.config({
  cloud_name: "dosudib3y",
  api_key: "159347713485299",
  api_secret: "TZ724I7MWn1BJ6eBt7nboJY-4h4", // Click 'View API Keys' above to copy your API secret
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "banner",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [
      {
        crop: "fill",
        gravity: "center",
        quality: "auto:best", // Automatically optimizes quality while maintaining visual fidelity
      },
    ],
  },
});
const upload = multer({ storage: storage });
router.post("/addBanner", verifyToken, upload.single("banner"), addbanner);
router.post("/addBannerMobile", upload.single("banner"), addBannerMobile);
router.get("/getUserByBanner/:bannerId", getUserByBanner);
router.post(
  "/updateBanner",
  verifyToken,
  upload.single("banner"),
  updateBanner
);
router.post("/updateBannerMobile", upload.single("banner"), updateBannerMobile);
router.delete("/deleteBanner", verifyToken, deleteBanner);
router.delete("/deleteBannerMobile", deleteBannerMobile);
router.get("/getBanners", verifyToken, getBanners);
router.post("/getUserBannerMobile", getUserBannerMobile);
router.post("/getUserByBannerMobile", getUserByBannerMobile);
router.get("/getAllBanners", getAllBanners);
router.post("/getAllBannersMobile", getAllBanners);

module.exports = router;
