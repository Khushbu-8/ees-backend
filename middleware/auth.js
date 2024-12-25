const jwt = require("jsonwebtoken");
require("dotenv").config();
const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header or cookies
    let token = req.headers.authorization
      ? req.headers.authorization.split(" ")[1] // Extract token after "Bearer"
      : req.cookies.refreshToken;

    // Check if token exists
    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error("Token verification error:", err);
        return res.status(403).send({
          success: false,
          message: "Invalid or expired token.",
        });
      }

      // Attach user information to the request object
      req.user = user;

      // Proceed to the next middleware
      next();
    });
  } catch (error) {
    console.error("Error in token verification:", error);
    return res.status(500).send({
      success: false,
      message: "An error occurred during token verification.",
      error: error.message,
    });
  }
};
const isAdmin = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized. No token provided.",
      });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({
          success: false,
          message: "Invalid token. Authentication failed.",
        });
      }
      if (decoded.user.role !== "admin") {
        return res.status(403).send({
          success: false,
          message: "Access denied. Admins only.",
        });
      }
      req.user = decoded.user;
      next();
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "An error occurred while checking admin access.",
      error: error.message,
    });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
};
