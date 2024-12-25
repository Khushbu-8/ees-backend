const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
    },
    address: {
      area: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["User", "Admin"], // Restrict to specific values
      default: "User",
    },
    businessCategory: {
      type: Array,
    },
    businessName: {
      type: String,
    },
    businessAddress: {
      type: String,
    },
    sended_requests: [
      {
        user: {
          type: Object, // Store the entire user document
          required: true,
        },
        status: {
          type: String,
          default: "pending",
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    received_requests: [
      {
        user: {
          type: Object, // Store the entire user document
          required: true,
        },
        status: {
          type: String,
          default: "pending",
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId, // User who gave the rating
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5, // Restrict ratings between 1 and 5
        },
        comment: {
          type: String, // Optional feedback
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number, // Store the average rating for the user
      default: 0,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
