const UserModel = require("../model/user"); // Adjust path based on your project structure
const { distributeReferralRewards } = require("../services/referralService"); // If you create a referral service later

// View a user's referrals (including multiple levels)
const getReferrals = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user and populate their direct referrals
    const user = await UserModel.findById(userId)
      .select("name phone email referrals")
      .populate({
        path: "referrals",
        select: "name phone email",
        populate: {
          path: "referrals", // Populate referrals of the referrals (second level)
          select: "name phone email",
          populate: {
            path: "referrals", // Populate referrals of the second-level referrals (third level)
            select: "name phone email",
          },
        },
      });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Find users who registered with this user's referral code
    const referredUsers = await UserModel.find({ referredBy: userId })
      .select("name phone email referrals")
      .populate({
        path: "referrals",
        select: "name phone email",
        populate: {
          path: "referrals", // Populate referrals of the referred users (second level)
          select: "name phone email",
        },
      });

    return res.status(200).send({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        referrals: user.referrals, // Direct referrals of the user
      },
      referredUsers: referredUsers, // Users who registered using this user's referral and their referrals
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error fetching referrals",
      error: error.message,
    });
  }
};


// View who referred the user
const getReferredBy = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await UserModel.findById(userId)
      .select("-password -referrals")
      .populate("referredBy", "name phone");

    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    return res.status(200).send({
      success: true,
      referredBy: user.referredBy,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error fetching referred by",
      error: error.message,
    });
  }
};


const getEarnings = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    // Filter out earnings history entries with sourceUser IDs that no longer exist
    const validEarningsHistory = [];
    for (const entry of user.earningsHistory) {
      const referrerExists = await UserModel.exists({ _id: entry.sourceUser });
      if (referrerExists) {
        // Fetching sourceUser details (you can customize this as needed)
        const referrer = await UserModel.findById(entry.sourceUser)
          .select('name email phone referrals'); // Select only relevant fields
        validEarningsHistory.push({
          ...entry,
          sourceUserDetails: referrer, // Attach source user details
        });
      }
    }

    // Optionally, update the user's earningsHistory with only valid entries (if you want to save the cleaned data)
    user.earningsHistory = validEarningsHistory;
    await user.save();

    return res.status(200).send({
      success: true,
      earnings: user.walletBalance, // Assuming `walletBalance` represents earnings
      earningsHistory: validEarningsHistory,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error fetching earnings",
      error: error.message,
    });
  }
};


// Manually trigger rewards distribution after a payment
const distributeRewards = async (req, res) => {
  try {
    const { userId, paymentAmount } = req.body;

    // Validate input
    if (!userId || !paymentAmount) {
      return res.status(400).send({ success: false, message: "Invalid data" });
    }

    // Distribute rewards
    await distributeReferralRewards(userId, paymentAmount);

    return res.status(200).send({
      success: true,
      message: "Payment processed and rewards distributed",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error distributing rewards",
      error: error.message,
    });
  }
};
// Get user by ID (for referredBy)
const getReffaredById = async (req, res) => {

  try {
    const { id } = req.query;  // Get the user ID from query params
    // console.log(id);
    
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // You can return the relevant user details or the whole user object based on your need
    res.json({
      name: user.name,
      email: user.email,
      phone: user.phone,  // Add any other fields you want to return
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};


// Get the current wallet balance of a user, including earnings
const getUserWalletBalance = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    return res.status(200).send({
      success: true,
      walletBalance: user.walletBalance,
      earningsHistory: user.earningsHistory, // Include the full earnings history
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ success: false, message: "Error fetching wallet balance" });
  }
};

const getReferralsMobile = async (req, res) => {
  try {
    const { userId } = req.body; // Expecting userId from the request body

    if (!userId) {
      return res.status(400).send({ message: "User ID is required" });
    }

    // Find the user and populate their direct referrals
    const user = await UserModel.findById(userId)
      .select("name phone email referrals")
      .populate({
        path: "referrals",
        select: "name phone email",
        populate: {
          path: "referrals", // Populate referrals of the referrals (second level)
          select: "name phone email",
          populate: {
            path: "referrals", // Populate referrals of the second-level referrals (third level)
            select: "name phone email",
          },
        },
      });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Find users who registered with this user's referral code
    const referredUsers = await UserModel.find({ referredBy: userId })
      .select("name phone email referrals")
      .populate({
        path: "referrals",
        select: "name phone email",
        populate: {
          path: "referrals", // Populate referrals of the referred users (second level)
          select: "name phone email",
        },
      });

    return res.status(200).send({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        referrals: user.referrals, // Direct referrals of the user
      },
      referredUsers: referredUsers, // Users who registered using this user's referral and their referrals
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error fetching referrals",
      error: error.message,
    });
  }
};

module.exports = {
  getReferrals,
  getReferredBy,
  getEarnings,
  distributeRewards,
  getReffaredById,
  getUserWalletBalance,
  getReferralsMobile,
};
