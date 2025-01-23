const mongoose = require("mongoose");

const supportSchema = new mongoose.Schema({
  issue: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved", "Closed"],
    default: "Pending",
  },
  resolutionMessage: {
    type: String,
    trim: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update `updatedAt` field on every update
supportSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Support = mongoose.model("Support", supportSchema);

module.exports = Support;
