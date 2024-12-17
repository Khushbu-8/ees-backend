const mongoose = require('mongoose');
const bannerSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true,
        trim: true, 
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true, // Ensure a user ID is always provided
    },
    createdAt: {
        type: Date,
        default: Date.now, 
    }
});
const Banner = mongoose.model('Banner', bannerSchema);
module.exports = Banner;