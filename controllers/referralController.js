const UserModel = require("../model/user"); // Adjust path based on your project structure
const { distributeReferralRewards } = require("../services/referralService"); // If you create a referral service later

// View a user's referrals
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
          path: "referrals", // Populate referrals of the referrals
          select: "name phone email",
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
          path: "referrals", // Populate referrals of the referred users
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


const getReferredBy = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await UserModel.findById(userId)
      .select("-password -referrals")
      .populate("referredBy", "name phone");

    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
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

// View a user's earnings
const getEarnings = async (req, res) => {
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
      earnings: user.earnings,
      earningsHistory: user.earningsHistory,
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

// // Manually trigger rewards distribution after a payment
// const distributeRewards = async (req, res) => {
//   try {
//     const { userId, paymentAmount } = req.body;

//     // Validate input
//     if (!userId || !paymentAmount) {
//       return res.status(400).send({ success: false, message: "Invalid data" });
//     }

//     // Distribute rewards
//     await distributeReferralRewards(userId, paymentAmount);

//     return res.status(200).send({
//       success: true,
//       message: "Payment processed and rewards distributed",
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send({
//       success: false,
//       message: "Error distributing rewards",
//       error: error.message,
//     });
//   }
// };

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
const getUserWalletBalance = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    return res.status(200).send({
      success: true,
      walletBalance: user.walletBalance,
      earningsHistory: user.earningsHistory,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: "Error fetching wallet balance" });
  }
};


module.exports = {
  getReferrals,
  getReferredBy,
  getEarnings,
  distributeRewards,
  getUserWalletBalance
};
