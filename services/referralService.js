const UserModel = require("../model/user");

// const distributeReferralRewards = async (userId, paymentAmount) => {
//   let currentUserId = userId;
//   let rewardPercent = 5; // Start with 5% of the paymentAmount as the reward

//   while (currentUserId && rewardPercent > 0.1) {
//     const user = await UserModel.findById(currentUserId);
//     if (!user || !user.referredBy) break;

//     const referrer = await UserModel.findById(user.referredBy);
//     if (!referrer) break;

//     const reward = (paymentAmount * rewardPercent) / 100;
//     referrer.earnings += reward;
//     referrer.earningsHistory.push({
//       amount: reward,
//       sourceUser: userId,
//     });
//     await referrer.save();

//     // Halve the reward for the next level
//     rewardPercent /= 2;
//     currentUserId = referrer._id;
//   }
// };

// const distributeReferralRewards = async (userId, amount) => {
//   const user = await UserModel.findById(userId);
//   if (user) {
//     // Check the user’s wallet balance before distributing rewards
//     if (user.walletBalance >= 5) {
//       // Add ₹15 to the user's wallet balance after the first reward
//       if (amount === 20) {
//         user.walletBalance += 20; // Initial ₹20 for the first reward
//       } else {
//         user.walletBalance += 15; // ₹15 for subsequent rewards
//       }
      
//       // Add the reward to the earnings history
//       user.earningsHistory.push({ amount, date: new Date() });
//       await user.save();
//       console.log(`₹${amount} distributed to user: ${user.name}`);
//     } else {
//       console.log(`User has ₹5 or less in wallet, no further rewards will be added.`);
//     }
//   } else {
//     console.log(`User not found for reward distribution`);
//   }
// };
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
