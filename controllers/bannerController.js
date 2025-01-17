const Banner = require('../model/banner')
const cloudinary = require('cloudinary').v2;
const UserModel = require("../model/user"); // Adjust path based on your project structure
const mongoose = require('mongoose');

const getPublicIdFromUrl = (url) => {
    const regex = /\/(?:v\d+\/)?([^\/]+)\/([^\/]+)\.[a-z]+$/;
    const match = url.match(regex);
    if (match) {
        return `${match[1]}/${match[2]}`; // captures the folder and file name without versioning or extension
    }
    return null;
};

const addbanner = async (req, res) => {
    try {
        const imageUrl = req.file.path; // Get the uploaded image URL from Cloudinary
        const userId = req.user.id; // Extract user ID from the request
        // Check for an existing banner for the user
        const existingBanner = await Banner.findOne({ userId });
        if (existingBanner) {
            return res.status(400).send({
                success: false,
                message: "A banner already exists. Please delete the current banner before adding a new one.",
            });
        }

        // Create and save a new Banner instance
        const newBanner = new Banner({ imageUrl, userId });
        await newBanner.save();

        return res.status(201).send({
            success: true,
            message: "Banner added successfully",
            banner: newBanner,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "An error occurred while adding the banner",
            error: error.message,
        });
    }
};

const getBanners = async (req, res) => {
    // console.log('req.user:', req.user); // Log req.user for debugging

    if (!req.user || !req.user.id) {
        return res.status(400).send({ message: 'User not authenticated' });
    }

    try {
        const banners = await Banner.find({ userId: req.user.id });
        return res.status(200).send({ success: true, banners });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ success: false, message: 'An error occurred', error: error.message });
    }
};
// const getUserByBanner = async (req, res) => {
//     try {
//         const  userId  = req.user.id;
//         const banner = await Banner.findOne({userId})
//         if (!banner) {
//             return res.status(404).send({
//                 success: false,
//                 message: "Banner not found",
//             });
//         }
//         return res.status(200).send({
//             success: true,
//             message: "User fetched successfully",
//             banner
//         });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).send({
//             success: false,
//             message: "An error occurred while fetching the user",
//             error: error.message,
//         });
//     }
// };
const getUserByBanner = async (req, res) => {
    const { bannerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bannerId)) {
        return res.status(400).json({ message: 'Invalid bannerId format' });
    }

    try {
        const banner = await Banner.findById(bannerId);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        const user = await UserModel.findById(banner.userId, 'name email profilePic address businessCategory ratings userstatus');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching user data by bannerId:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const updateBanner = async (req, res) => {
    try {
        const { bannerId } = req.body
        const banner = await Banner.findById(bannerId)
        if (!banner) {
            return res.status(404).json({ success: false, message: "banner not found" });
        }
        let imageUrl = banner.imageUrl
        if (req.file) {
            if (imageUrl) {
                const publicId = getPublicIdFromUrl(imageUrl)
                if (publicId) {
                    const result = await cloudinary.uploader.destroy(publicId)
                } else {
                    console.log("Could not extract publicId from URL:", imageUrl);
                }
            }
            imageUrl = req.file.path
        }
        banner.imageUrl = imageUrl
        await banner.save()
        res.status(200).json({ success: true, message: "banner updated successfully", banner });
    } catch (error) {
        console.error("Error in bannerupdate:", error);
        res.status(500).json({ success: false, message: "Server error", error });
    }
}
const deleteBanner = async (req, res) => {
    try {
        const { bannerId } = req.body;
        console.log(req.body);

        const banner = await Banner.findById(bannerId);
        if (!banner) {
            return res.status(404).json({ success: false, message: "banner not found" });
        }
        if (banner.imageUrl) {
            const publicId = getPublicIdFromUrl(banner.imageUrl);
            if (publicId) {
                const result = await cloudinary.uploader.destroy(publicId);
                console.log("Cloudinary deletion result:", result);
            } else {
                console.log("Could not extract publicId from image URL:", banner.imageUrl);
            }
        }
        await Banner.findByIdAndDelete(bannerId);

        res.status(200).json({ success: true, message: "banner deleted successfully" });
    } catch (error) {
        console.error("Error in deleteProduct:", error);
        res.status(500).json({ success: false, message: "Server error", error });
    }
}
const getAllBanners = async (req, res) => {
    try {
        // const banners = await Banner.find();
        const banners = await Banner.find().populate('userId', 'name email userstatus address businessCategory'); // Select only required fields like name and email

        return res.status(200).send({
            success: true,
            message: "Banners fetched successfully",
            banners,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "An error occurred while fetching banners",
            error: error.message,
        });
    }
}
module.exports = {
    addbanner, getUserByBanner, updateBanner, deleteBanner, getAllBanners, getBanners
}