const express = require("express");
const {
  registerUser,
  loginUser,
  registerUserweb,
  loginUserweb,
  getalluser,
  getUser,
  logout,
  getAdmin,
  updateProfile,
  deleteUser,
  UpdateUser,
  updateRoleByEmail,
  setUserStatus,
  approveUser,
} = require("../controllers/authController");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { verifyToken, isAdmin } = require("../middleware/auth");
const { sendNotification } = require("../controllers/sendController");
const router = express.Router();
cloudinary.config({
  cloud_name: "dosudib3y",
  api_key: "159347713485299",
  api_secret: "TZ724I7MWn1BJ6eBt7nboJY-4h4", // Click 'View API Keys' above to copy your API secret
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user",
    allowed_formats: ["jpg", "png", "jpeg","webp"],
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
router.post("/registerUser", registerUser);
router.post("/loginUser", loginUser);
router.post(
  "/registerUserweb",
  upload.fields([
    { name: 'frontAadhar', maxCount: 1 },
    { name: 'backAadhar', maxCount: 1 },
    { name: 'profilePic', maxCount: 1 },
  ]),
  
  registerUserweb
);
// router.post("/registerUserweb",upload.single("image"), registerUserweb);
router.post("/loginUserweb", loginUserweb);
router.put("/approveUser", approveUser);

router.post(
  "/updateProfile",
  verifyToken,
  upload.single("profilePic"),
  updateProfile
);

router.delete("/deleteUser", deleteUser);
router.put("/UpdateUser", UpdateUser);
router.get("/getAdmin", isAdmin, getAdmin);
router.get("/getAllUser", getalluser);
router.get("/getUser", verifyToken, getUser);
router.get("/logout", logout);
router.put("/updateRoleByEmail", updateRoleByEmail);
router.put("/setUserStatus",verifyToken, setUserStatus);
// router.post("/send", sendNotification);
module.exports = router;
