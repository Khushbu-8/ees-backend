const UserModel = require("../model/user");

const distributeReferralRewards = async (userId, paymentAmount) => {
  let currentUserId = userId;
  let rewardPercent = 50; // Start with 50% of the paymentAmount as the reward

  while (currentUserId && rewardPercent > 0.1) {
    const user = await UserModel.findById(currentUserId);
    if (!user || !user.referredBy) break;

    const referrer = await UserModel.findById(user.referredBy);
    if (!referrer) break;

    const reward = (paymentAmount * rewardPercent) / 100;
    referrer.earnings += reward;
    referrer.earningsHistory.push({
      amount: reward,
      sourceUser: userId,
    });
    await referrer.save();

    // Halve the reward for the next level
    rewardPercent /= 2;
    currentUserId = referrer._id;
  }
};

module.exports = {
  distributeReferralRewards,
};
