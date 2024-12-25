const UserModel = require("../model/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmpassword,
      phone,
      address,
      businessCategory,
      businessName,
      businessAddress,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !confirmpassword ||
      !phone ||
      !address
    ) {
      return res.status(400).send({
        success: false,
        message: "Please fill all the fields",
      });
    }

    if (password !== confirmpassword) {
      return res.status(400).send({
        success: false,
        message: "Password and Confirm Password don't match",
      });
    }

    const userExist = await UserModel.findOne({ email: email });
    if (userExist) {
      return res.status(400).send({
        success: false,
        message: "Email already exists",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new UserModel({
      name,
      email,
      password: hashedPassword, // Store hashed password
      phone,
      address,
      businessCategory,
      businessName,
      businessAddress,
    });
    await user.save();

    return res.status(200).send({
      success: true,
      message: "User registered successfully",
      user: user,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "An error occurred during registration",
      error: error.message,
    });
  }
};
const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).send({
        success: false,
        message: "Phone and Password are required",
      });
    }
    const user = await UserModel.findOne({ phone });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Phone or Password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Phone or Password",
      });
    }
    return res.status(200).json({
      success: true,
      message: `Login successful`,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "An error occurred during login",
      error: error.message,
    });
  }
};
const registerUserweb = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmpassword,
      phone,
      address: { area, city, state, country, pincode }, // Destructure address fields
      businessCategory,
      businessName,
      businessAddress,
    } = req.body;

    // Check for required fields
    if (
      !name ||
      !email ||
      !password ||
      !confirmpassword ||
      !phone ||
      !area ||
      !city ||
      !state ||
      !country ||
      !pincode
    ) {
      return res
        .status(400)
        .send({ success: false, message: "Please fill all the fields" });
    }

    // Validate password and confirm password
    if (password !== confirmpassword) {
      return res.status(400).send({
        success: false,
        message: "Password and Confirm Password don't match",
      });
    }

    // Check if email already exists
    const userExist = await UserModel.findOne({ email: email });
    if (userExist) {
      return res
        .status(400)
        .send({ success: false, message: "Email already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new UserModel({
      name,
      email,
      password: hashedPassword,
      phone,
      address: {
        area,
        city,
        state,
        country,
        pincode,
      },
      businessCategory,
      businessName,
      businessAddress,
    });

    // Check for JWT_SECRET
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not defined");
    }

    // Save the user to the database
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Set the token as a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to 'true' in production
      sameSite: "None", // Adjust as necessary
      maxAge: 3600000, // 1 hour
    });

    // Respond with success
    return res.status(200).send({
      success: true,
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred during registration",
      error: error.message,
    });
  }
};
const loginUserweb = async (req, res) => {
  try {
    console.log(req.body);

    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).send({
        success: false,
        message: "Phone and Password are required",
      });
    }
    const user = await UserModel.findOne({ phone });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Phone or Password",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Phone or Password",
      });
    }

    // Generate token and set cookie
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.cookie("refreshToken", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 3 * 60 * 60 * 1000, // 3 hours in milliseconds
    });

    return res.status(200).json({
      success: true,
      message: `Login successful`,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred during login",
      error: error.message,
    });
  }
};
const getAdmin = async (req, res) => {
  try {
    res.status(200).send({
      success: true,
      message: "Welcome, Admin! You have access to this route.",
      user: req.user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred during login",
      error: error.message,
    });
  }
};
const getalluser = async (req, res) => {
  try {
    const user = await UserModel.find({}).select(
      "-received_requests -sended_requests"
    );
    console.log(user);

    return res.status(200).json({
      success: true,
      message: "User Fetched Succesfully.",
      user,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "An error occurred during userfetch",
      error: error.message,
    });
  }
};
const getUser = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await UserModel.findById(id).select(
      "-received_requests -sended_requests"
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User Fetched Succesfully.",
      user,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "An error occurred during userfetch",
      error: error.message,
    });
  }
};
const logout = async (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true, // Ensure cookie is secure and inaccessible via JavaScript
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "lax",
    });

    return res.status(200).send({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "An error occurred during logout",
      error: error.message,
    });
  }
};
// const updateProfile = async (req, res) => {
//     try {
//         const userId = req.user.id; // Assuming the user's ID is stored in `req.user` after authentication middleware
//         const { name, email, phone, address, businessCategory, businessName, businessAddress } = req.body;

//         // Validate inputs
//         if (!name && !email && !phone && !address && !businessCategory && !businessName && !businessAddress) {
//             return res.status(400).send({
//                 success: false,
//                 message: "No fields to update provided",
//             });
//         }

//         // Prepare the update object
//         const updatedFields = {};
//         if (name) updatedFields.name = name;
//         if (email) updatedFields.email = email;
//         if (phone) updatedFields.phone = phone;
//         if (address) updatedFields.address = address;
//         if (businessCategory) updatedFields.businessCategory = businessCategory;
//         if (businessName) updatedFields.businessName = businessName;
//         if (businessAddress) updatedFields.businessAddress = businessAddress;

//         // Update user data in the database
//         const updatedUser = await UserModel.findByIdAndUpdate(
//             userId,
//             { $set: updatedFields },
//             { new: true, runValidators: true } // `new: true` returns the updated document
//         );

//         if (!updatedUser) {
//             return res.status(404).send({
//                 success: false,
//                 message: "User not found",
//             });
//         }

//         return res.status(200).send({
//             success: true,
//             message: "Profile updated successfully",
//             user: updatedUser,
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).send({
//             success: false,
//             message: "An error occurred while updating the profile",
//             error: error.message,
//         });
//     }
// };
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profilePic = req.file ? req.file.path : null;
    console.log(req.file, "file", req.body, "bocy", profilePic);

    // Parse the address field
    let address;
    if (req.body.address) {
      address = JSON.parse(req.body.address);
    }

    const {
      name,
      email,
      phone,
      businessCategory,
      businessName,
      businessAddress,
    } = req.body;

    // Prepare the fields to be updated
    const updatedFields = {};
    if (name) updatedFields.name = name;
    if (email) updatedFields.email = email;
    if (phone) updatedFields.phone = phone;
    if (address) {
      updatedFields.address = address; // Directly assign the parsed object
    }
    if (profilePic) updatedFields.profilePic = profilePic;
    if (businessCategory) updatedFields.businessCategory = businessCategory;
    if (businessName) updatedFields.businessName = businessName;
    if (businessAddress) updatedFields.businessAddress = businessAddress;

    // Update user data in the database
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updatedFields },
      { new: true, runValidators: true } // Validate inputs
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the profile",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.body.id;
    const user = await UserModel.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).send({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while updating the profile",
      error: error.message,
    });
  }
};
// const UpdateUser = async(req,res) => {
//     try {
//         const userId = req.body; // Assuming the user's ID is stored in `req.user` after authentication middleware
//         const { name, email, phone, address, businessCategory, businessName, businessAddress } = req.body;

//         // Validate inputs
//         if (!name && !email && !phone && !address && !businessCategory && !businessName && !businessAddress) {
//             return res.status(400).send({
//                 success: false,
//                 message: "No fields to update provided",
//             });
//         }

//         // Prepare the update object
//         const updatedFields = {};
//         if (name) updatedFields.name = name;
//         if (email) updatedFields.email = email;
//         if (phone) updatedFields.phone = phone;
//         if (address) updatedFields.address = address;
//         if (businessCategory) updatedFields.businessCategory = businessCategory;
//         if (businessName) updatedFields.businessName = businessName;
//         if (businessAddress) updatedFields.businessAddress = businessAddress;

//         // Update user data in the database
//         const updatedUser = await UserModel.findByIdAndUpdate(
//             userId,
//             { $set: updatedFields },
//             { new: true, runValidators: true } // `new: true` returns the updated document
//         );

//         if (!updatedUser) {
//             return res.status(404).send({
//                 success: false,
//                 message: "User not found",
//             });
//         }

//         return res.status(200).send({
//             success: true,
//             message: "Profile updated successfully",
//             user: updatedUser,
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).send({
//             success: false,
//             message: "An error occurred while updating the profile",
//             error: error.message,
//         });
//     }
// }
const UpdateUser = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId; // Use authenticated user's ID or extract from body
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
      });
    }

    const {
      name,
      email,
      phone,
      address,
      businessCategory,
      businessName,
      businessAddress,
    } = req.body;

    // Validate input fields
    if (
      !name &&
      !email &&
      !phone &&
      !address &&
      !businessCategory &&
      !businessName &&
      !businessAddress
    ) {
      return res.status(400).json({
        success: false,
        message: "No fields to update provided",
      });
    }

    // Build the update object
    const updatedFields = {};
    if (name) updatedFields.name = name;
    if (email) updatedFields.email = email;
    if (phone) updatedFields.phone = phone;
    if (address) {
      updatedFields.address = {
        ...address, // Spread operator to handle partial updates
      };
    }
    if (businessCategory) updatedFields.businessCategory = businessCategory;
    if (businessName) updatedFields.businessName = businessName;
    if (businessAddress) updatedFields.businessAddress = businessAddress;

    // Update user data in the database
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updatedFields },
      { new: true, runValidators: true } // `new` returns updated document, `runValidators` ensures schema validation
    );

    // Handle case when user is not found
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Respond with success
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the profile",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  registerUserweb,
  registerUserweb,
  loginUserweb,
  getalluser,
  getUser,
  logout,
  getAdmin,
  updateProfile,
  deleteUser,
  UpdateUser,
};
