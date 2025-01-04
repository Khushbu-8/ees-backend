const User = require("../model/user");

// const addRating = async (req, res) => {
//   try {
//     const { serviceProviderId, rating, comment } = req.body;
//     const userId = req.user.id; // Assume authentication middleware sets `req.user`
//       console.log(req.body);
      
//     // Validate input
//     if (!userId || !rating) {
//       return res
//         .status(400)
//         .json({ message: "Service provider ID and rating are required." });
//     }

//     if (rating < 1 || rating > 5) {
//       return res
//         .status(400)
//         .json({ message: "Rating must be between 1 and 5." });
//     }

//     // Find the service provider
//     const serviceProvider = await User.findById(serviceProviderId).select(
//       "ratings averageRating"
//     );
//     if (!serviceProvider) {
//       return res.status(404).json({ message: "Service provider not found." });
//     }

//     // Check if the user has already rated this service provider
//     const existingRating = serviceProvider.ratings.find(
//       (r) => r.user.toString() === userId.toString()
//     );

//     let updateQuery = {};
//     if (existingRating) {
//       // Update the existing rating
//       updateQuery = {
//         $set: {
//           "ratings.$[elem].rating": rating,
//           "ratings.$[elem].comment": comment,
//         },
//       };
//     } else {
//       // Add a new rating
//       updateQuery = {
//         $push: {
//           ratings: {
//             user: userId,
//             rating,
//             comment,
//             date: new Date(),
//           },
//         },
//       };
//     }

//     // Recalculate the average rating
//     const newRatings = existingRating
//       ? serviceProvider.ratings.map((r) =>
//           r.user.toString() === userId.toString() ? { ...r, rating } : r
//         )
//       : [...serviceProvider.ratings, { user: userId, rating }];
//     const averageRating =
//       newRatings.reduce((sum, r) => sum + r.rating, 0) / newRatings.length;

//     // Add average rating to the update query
//     updateQuery.$set = { ...updateQuery.$set, averageRating };

//     // Execute the update
//     await User.findByIdAndUpdate(serviceProviderId, updateQuery, {
//       new: true,
//       arrayFilters: [{ "elem.user": userId }], // Required for updating the correct array element
//     });

//     const updatedServiceProvider = await User.findById(serviceProviderId)
//       .select("ratings averageRating")
//       .lean(); // Strips Mongoose metadata

//     res.status(200).json({
//       message: "Rating submitted successfully.",
//       ratings: updatedServiceProvider.ratings,
//       averageRating: updatedServiceProvider.averageRating,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

const addRating = async (req, res) => {
  try {
    const { serviceProviderId, rating, comment } = req.body;
    const userId = req.user.id; // Assume `req.user` is set by authentication middleware

    // Validate input
    if (!serviceProviderId || !rating) {
      return res
        .status(400)
        .json({ message: "Service provider ID and rating are required." });
    }

    if (rating < 1 || rating > 10) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 10." });
    }

    // Find the service provider
    const serviceProvider = await User.findById(serviceProviderId).select(
      "ratings averageRating"
    );

    if (!serviceProvider) {
      return res.status(404).json({ message: "Service provider not found." });
    }

    // Check if the user has already rated
    const existingRatingIndex = serviceProvider.ratings.findIndex(
      (r) => r.user.toString() === userId.toString()
    );

    if (existingRatingIndex !== -1) {
      // Update the existing rating
      serviceProvider.ratings[existingRatingIndex].rating = rating;
      serviceProvider.ratings[existingRatingIndex].comment = comment || "";
      serviceProvider.ratings[existingRatingIndex].date = new Date();
    } else {
      // Add a new rating
      serviceProvider.ratings.push({
        user: userId,
        rating,
        comment: comment || "",
        date: new Date(),
      });
    }

    // Recalculate the average rating
    const totalRatings = serviceProvider.ratings.reduce(
      (sum, r) => sum + r.rating,
      0
    );
    serviceProvider.averageRating =
      totalRatings / serviceProvider.ratings.length;

    // Save the updated service provider
    await serviceProvider.save();

    res.status(200).json({
      message: "Rating submitted successfully.",
      ratings: serviceProvider.ratings,
      averageRating: serviceProvider.averageRating,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};


const getUserRating = async (req, res) => {
  try {
    const userId = req.user.id; // Assume authentication middleware sets `req.user`

    // Validate input
    if (!userId) {
      return res
        .status(400)
        .json({ message: "User ID is required." });
    }

    // Find the user
    const user = await User.findById(userId).select(
      "name email ratings averageRating"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Retrieve the user's rating (if it exists)
    const userRating = user.ratings.find(
      (rating) => rating.user.toString() === userId.toString()
    );

    // Calculate the average rating or set it to 0 if there are no ratings
    const userAvgRating = user.averageRating || 0;

    res.status(200).json({
      message: "User rating retrieved successfully.",
      rating: userRating || null, // Return `null` if no specific rating is found
      average: userAvgRating,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};


module.exports = { addRating, getUserRating };
