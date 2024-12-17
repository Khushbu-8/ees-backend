const Banner = require('../model/banner')
const cloudinary = require('cloudinary').v2;
const Category = require('../model/category')
const getPublicIdFromUrl = (url) => {
    const regex = /\/(?:v\d+\/)?([^\/]+)\/([^\/]+)\.[a-z]+$/;
    const match = url.match(regex);
    if (match) {
      return `${match[1]}/${match[2]}`; // captures the folder and file name without versioning or extension
    }
    return null;
};
const addCategory = async (req, res) => {
    try {
        const { categoryName } = req.body; // Extract category name from the request body
        const  imageUrl = req.file.path; // Extract uploaded image URL from Cloudinary

        // Check if category already exists
        const existingCategory = await Category.findOne({ categoryName });
        if (existingCategory) {
            return res.status(400).send({
                success: false,
                message: "Category already exists",
            });
        }

        // Create a new category
        const category = new Category({
            categoryName,
            image: imageUrl,
        });

        // Save category to the database
        await category.save();

        return res.status(201).send({
            success: true,
            message: "Category added successfully",
            category,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "An error occurred while adding the category",
            error: error.message,
        });
    }
};
const updateCategory = async(req,res) => {
    try {
        const {categorId,categoryName} = req.body
        const category = await Category.findById(categorId)
        if (!category) {
            return res.status(404).json({ success: false, message: "category not found" });
        }
        let imageUrl = category.image
        if(req.file){
            if(imageUrl){
                const publicId = getPublicIdFromUrl(imageUrl)
                if(publicId){
                    const result = await cloudinary.uploader.destroy(publicId)
                }else{
                    console.log("Could not extract publicId from URL:", imageUrl);
                }
            }
            imageUrl = req.file.path
        }
        category.imageUrl = imageUrl
        category.categoryName = categoryName
        await category.save()
        res.status(200).json({ success: true, message: "banner updated successfully", category });
    } catch (error) {
        console.error("Error in bannerupdate:", error);
      res.status(500).json({ success: false, message: "Server error", error });
    }
}
const deleteCategory = async(req,res) => {
    try {
        const { categorId } = req.body; 
        console.log(req.body);
        
        const category = await Category.findById(categorId);
        if (!category) {
          return res.status(404).json({ success: false, message: "category not found" });
        }
        if (category.image) {
          const publicId = getPublicIdFromUrl(category.image); 
          if (publicId) {
            const result = await cloudinary.uploader.destroy(publicId);
            console.log("Cloudinary deletion result:", result);
          } else {
            console.log("Could not extract publicId from image URL:", category.image);
          }
        }
        await Category.findByIdAndDelete(categorId);
    
        res.status(200).json({ success: true, message: "category deleted successfully" });
      } catch (error) {
        console.error("Error in deleteProduct:", error);
        res.status(500).json({ success: false, message: "Server error", error });
      }
}
const getAllCategory = async(req,res) => {
    try {
        const category = await Category.find({})
        return res.status(200).send({
            success: true,
            message: "Banners fetched successfully",
            category,
        });
    } catch (error) {
        console.error("Error :", error);
        res.status(500).json({ success: false, message: "Server error", error });
    }
}
module.exports = {
    addCategory,updateCategory,deleteCategory,getAllCategory
}