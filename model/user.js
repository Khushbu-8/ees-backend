const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
      date: {
        type: Date,
        default: Date.now,
      },
    },
],

}, { timestamps: true }); // Adds createdAt and updatedAt fields

module.exports = mongoose.model('User', userSchema);
