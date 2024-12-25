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
    const userId = req.user.id; // Assume authentication middleware sets `req.user`

    // Validate input
    if (!serviceProviderId || !rating) {
      return res
        .status(400)
        .json({ message: "Service provider ID and rating are required." });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5." });
    }

    // Find the service provider
    const serviceProvider = await User.findById(serviceProviderId).select(
      "ratings averageRating"
    );
    if (!serviceProvider) {
      return res.status(404).json({ message: "Service provider not found." });
    }

    // Check if the user has already rated this service provider
    const existingRating = serviceProvider.ratings.find(
      (r) => r.user.toString() === userId.toString()
    );

    let updateQuery = {};
    const arrayFilters = existingRating
      ? [{ "elem.user": userId }]
      : undefined; // Only use arrayFilters if updating an existing rating

    if (existingRating) {
      // Update the existing rating
      updateQuery = {
        $set: {
          "ratings.$[elem].rating": rating,
          "ratings.$[elem].comment": comment,
        },
      };
    } else {
      // Add a new rating
      updateQuery = {
        $push: {
          ratings: {
            user: userId,
            rating,
            comment,
            date: new Date(),
          },
        },
      };
    }

    // Recalculate the average rating
    const newRatings = existingRating
      ? serviceProvider.ratings.map((r) =>
          r.user.toString() === userId.toString() ? { ...r, rating } : r
        )
      : [...serviceProvider.ratings, { user: userId, rating }];
    const averageRating =
      newRatings.reduce((sum, r) => sum + r.rating, 0) / newRatings.length;

    // Add average rating to the update query
    updateQuery.$set = { ...updateQuery.$set, averageRating };

    // Execute the update
    await User.findByIdAndUpdate(serviceProviderId, updateQuery, {
      new: true,
      arrayFilters, // Only include this if updating an existing rating
    });

    const updatedServiceProvider = await User.findById(serviceProviderId)
      .select("ratings averageRating")
      .lean(); // Strips Mongoose metadata

    res.status(200).json({
      message: "Rating submitted successfully.",
      ratings: updatedServiceProvider.ratings,
      averageRating: updatedServiceProvider.averageRating,
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
        .json({ message: "Service provider ID is required." });
    }

    // Find the service provider
    const serviceProvider = await User.findById(userId).select(
      "name email ratings averageRating"
    );
    console.log(serviceProvider, "sp");
    if (!serviceProvider) {
      return res.status(404).json({ message: "Service provider not found." });
    }

    // Find the user's rating
    const userRating = serviceProvider.ratings.find(
      (rating) => rating.user.toString() === userId.toString()
    );

    const userAvgRating = serviceProvider.averageRating;
    console.log(userAvgRating, "avg");

    if (!userRating) {
      return res
        .status(404)
        .json({ message: "No rating found for this user." });
    }

    res.status(200).json({
      message: "User rating retrieved successfully.",
      rating: userRating,
      average: userAvgRating,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { addRating, getUserRating };
