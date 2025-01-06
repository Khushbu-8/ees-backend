const UserModel = require("../model/user"); // Adjust path based on your project structure
const { distributeReferralRewards } = require("../services/referralService"); // If you create a referral service later

// View a user's referrals
const getReferrals = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await UserModel.findById(userId)
      .select(
        "-password -sended_requests -received_requests -businessCategory -businessName -businessAddress -ratings -earningsHistory -address -profilePic"
      )
      .populate("referrals", "name email _id");

    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    return res.status(200).send({
      success: true,
      referrals: user.referrals,
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
      .populate("referredBy", "name email");

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

module.exports = {
  getReferrals,
  getReferredBy,
  getEarnings,
  distributeRewards,
};
