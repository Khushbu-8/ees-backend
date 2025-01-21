const UserModel = require("../model/user");

const distributeReferralRewards = async (userId, amount, referrerId) => {
  const user = await UserModel.findById(userId);
  
  if (user) {
    user.walletBalance += amount;

    // Create earnings history with sourceUser (referrer)
    const earningsEntry = {
      amount,
      type: "Referral",
      sourceUser: referrerId, // Reference to the referrer
      date: new Date(),
    };

    // Push earnings entry to the user's earnings history
    user.earningsHistory.push(earningsEntry);
    await user.save();
  }
};


module.exports = {
  distributeReferralRewards,
};
