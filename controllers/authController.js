const UserModel = require("../model/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { v4: uuidv4 } = require("uuid");
const { distributeReferralRewards } = require("../services/referralService");

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

// const registerUserweb = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       password,
//       confirmpassword,
//       phone,
//       address: { area, city, state, country, pincode }, // Destructure address fields
//       businessCategory,
//       businessName,
//       businessAddress,
//       fcmToken,
//     } = req.body;
//     console.log(req.body,"register web");
    

//     const referralCode = req.body.referralCode;
//     // console.log(req.body,"reffrele");

//     // Check for required fields
//     if (
//       !name ||
//       !email ||
//       !password ||
//       !confirmpassword ||
//       !phone ||
//       !area ||
//       !city ||
//       !state ||
//       !country ||
//       !pincode
//     ) {
//       return res
//         .status(400)
//         .send({ success: false, message: "Please fill all the fields" });
//     }

//     // Validate password and confirm password
//     if (password !== confirmpassword) {
//       return res.status(400).send({
//         success: false,
//         message: "Password and Confirm Password don't match",
//       });
//     }

//     // Check if email already exists
//     const userExist = await UserModel.findOne({ email: email });
//     if (userExist) {
//       return res
//         .status(400)
//         .send({ success: false, message: "Email already exists" });
//     }

//     let referrer = null;
//     if (referralCode) {
//       referrer = await UserModel.findOne({ referralCode });
//       if (!referrer) {
//         return res.status(400).send({
//           success: false,
//           message: "Invalid referral code",
//         });
//       }
//     }

//     // Hash the password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Generate a unique referral code for the new user
//     const newReferralCode = uuidv4();

//     // Create new user
//     const user = new UserModel({
//       name,
//       email,
//       password: hashedPassword,
//       phone,
//       address: {
//         area,
//         city,
//         state,
//         country,
//         pincode,
//       },
//       businessCategory,
//       businessName,
//       businessAddress,
//       fcmToken,
//       referralCode: newReferralCode,
//       referredBy: referrer ? referrer._id : [],
//       isAdminApproved: false,
//     });

//     // Check for JWT_SECRET
//     console.log("JWT_SECRET:", process.env.JWT_SECRET);
//     if (!process.env.JWT_SECRET) {
//       throw new Error("JWT_SECRET environment variable is not defined");
//     }

//     // Save the user to the database
//     await user.save();

//     if (referrer) {
//       await updateReferralChain(referrer._id, user._id);
//     }
//     // Generate JWT token
//     const token = jwt.sign({ id: user._id ,  isAdminApproved: false }, process.env.JWT_SECRET, {
//       expiresIn: "24h",
//     });

//     // Set the token as a cookie
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: true, // Set to 'true' in production
//       sameSite: "None", // Adjust as necessary
//       maxAge: 3600000, // 1 hour
//     });

//     const referralLink = `${process.env.API_URL}/auth/registerUserweb?referralCode=${newReferralCode}`;
//     console.log(referralLink);
    
//     // Respond with success
//     return res.status(200).send({
//       success: true,
//       message: "User registered successfully, awaiting admin approval",
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         referralCode: newReferralCode,
//         referralLink,
//       },
//       token,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send({
//       success: false,
//       message: "An error occurred during registration",
//       error: error.message,
//     });
//   }
// };
// // Function to update the referral chain
// const updateReferralChain = async (referrerId, newUserId) => {
//   // Find the referrer
//   const referrer = await UserModel.findById(referrerId);
//     if (referrer) {
//       if (!referrer.referrals.includes(newUserId)) {
//         referrer.referrals.push(newUserId);
//         await referrer.save();
//       }
//     // Recursively update the chain for each referrer in the chain
//     for (const parentReferrerId of referrer.referredBy) {
//       await updateReferralChain(parentReferrerId, newUserId);
//     }
//   }
// };

const registerUserweb = async (req, res) => {
  try {
    // console.log('Received files:', JSON.stringify(req.files, null, 3));
    // console.log("Receiveds files:",JSON.stringify(req.files.profilePic));

    // Check if all required files are uploaded
    if (
      !req.files ||
      !req.files.frontAadhar ||
      !req.files.frontAadhar[0].path ||
      !req.files.backAadhar ||
      !req.files.backAadhar[0].path ||
      !req.files.profilePic ||
      !req.files.profilePic[0].path
    ) {
      return res.status(400).json({ message: "Please upload all required files." });
    }
    
    // Get the URLs of the uploaded files from Cloudinary
    const frontAadharUrl = req.files.frontAadhar[0].path;
    const backAadharUrl = req.files.backAadhar[0].path;
    const profilePicUrl = req.files.profilePic[0].path; // Ensure this is checked
    
    // console.log(frontAadharUrl, "frontAadharUrl");
    // console.log(backAadharUrl, "backAadharUrl");
    // console.log(profilePicUrl, "profilePicUrl");
    
    // You can now proceed with further processing, such as saving the URLs to the database
    
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
      businessDetaile,
      fcmToken,
    } = req.body;
     // Parse the address from JSON string to object
     let parsedAddress = {};
     if (address) {
       parsedAddress = JSON.parse(address); // Convert string back to object
     }
    const { area, city, state, country, pincode } = parsedAddress;  // Destructure address

    // Log or process the form data
    console.log({
      name, email, phone, password, confirmpassword, 
      area, city, state, country, pincode, 
      businessCategory, businessName, businessAddress, fcmToken
    });
// console.log(req.body,"all data");

    const referralCode = req.body.referralCode;
    
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
      console.log("Please fill all the fields")
      return res.status(400).send({ success: false, message: "Please fill all the fields" });
    }

    // Validate password and confirm password
    if (password !== confirmpassword) {
      return res.status(400).send({ success: false, message: "Password and Confirm Password don't match" });
    }

    // Check if email already exists
    const userExist = await UserModel.findOne({ email: email });
    if (userExist) {
      return res.status(400).send({ success: false, message: "Email already exists" });
    }

    let referrer = null;
    if (referralCode) {
      referrer = await UserModel.findOne({ referralCode });
      if (!referrer) {
        return res.status(400).send({ success: false, message: "Invalid referral code" });
      }
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a unique referral code for the new user
    const newReferralCode = uuidv4();

    // Create new user with default wallet balance of 0
    const user = new UserModel({
      name,
      email,
      password: hashedPassword,
      phone,
      address: { area, city, state, country, pincode },
      businessCategory,
      businessName,
      businessAddress,
      businessDetaile,
      fcmToken,
      referralCode: newReferralCode,
      referredBy: referrer ? [referrer._id] : [],
      isAdminApproved: false,
      walletBalance: 0,
      frontAadhar:frontAadharUrl,
      backAadhar : backAadharUrl,
      profilePic : profilePicUrl
    });

    // Save the user to the database
    await user.save();

    // Update referral chain and distribute rewards if a referrer exists
    if (referrer) {
      await distributeReferralRewards(referrer._id, 20, user._id); // Direct referrer gets ₹20
      await updateReferralChain(referrer._id, user._id); // Update the referral chain
  
      let currentReferrer = referrer;
      let levels = [20, 15, 10, 5]; // Rewards for 2nd to 5th level
      for (let i = 0; i < levels.length; i++) {
          if (currentReferrer.referredBy.length > 0) {
              const nextReferrer = await UserModel.findById(currentReferrer.referredBy[0]);
              if (nextReferrer) {
                  await distributeReferralRewards(nextReferrer._id, levels[i], user._id);
                  currentReferrer = nextReferrer;
              } else {
                  break; // Stop if there is no next level referrer
              }
          } else {
              break; // Stop if there are no more referrers in the chain
          }
      }
  }
  
    // Generate JWT token
    const token = jwt.sign({ id: user._id, isAdminApproved: false }, process.env.JWT_SECRET, { expiresIn: "24h" });

    // Set the token as a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 3600000, // 1 hour
    });

    // Generate referral link for the new user
    const referralLink = `${process.env.API_URL}/auth/registerUserweb?referralCode=${newReferralCode}`;

    // Respond with success
    return res.status(200).send({
      success: true,
      message: "User registered successfully, awaiting admin approval",
      user: { id: user._id, name: user.name, email: user.email, referralCode: newReferralCode, referralLink },
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

// Function to update the referral chain
const updateReferralChain = async (referrerId, newUserId) => {
  const referrer = await UserModel.findById(referrerId);
  if (referrer) {
    if (!referrer.referrals.includes(newUserId)) {
      referrer.referrals.push(newUserId); // Add new user to the referrer's referrals list
      await referrer.save();
    }
    
    // Recursively update the chain for each referrer in the chain
    for (const parentReferrerId of referrer.referredBy) {
      await updateReferralChain(parentReferrerId, newUserId); // Call recursively
    }
  }
};


const approveUser = async (req, res) => {
  try {
    const {userId} = req.body;
    console.log(req.body);
    

    // Find the user by ID
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(400).send({ success: false, message: "User not found" });
    }

    // Update the user's approval status
    user.isAdminApproved = true;
    await user.save();

    return res.status(200).send({
      success: true,
      message: "User approved successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error approving user",
      error: error.message,
    });
  }
};

const loginUserweb = async (req, res) => { 
  try {
    console.log(req.body,"body");

    const { phone, password, fcmToken } = req.body; // Include fcmToken in the request body
    if (!phone || !password) {
      return res.status(400).send({
        success: false,
        message: "Phone and Password are required",
      });
    }

    // Check if user exists
    const user = await UserModel.findOne({ phone });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Phone or Password",
      });
    }

     // Check if user is approved by admin
     if (!user.isAdminApproved) {
      return res.status(400).send({
        success: false,
        message: "Your account is pending admin approval",
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

    // Update FCM token if provided
    if (fcmToken) {
      user.fcmToken = fcmToken; // Ensure your UserModel schema has an `fcmToken` field
      await user.save();
    }

    // Generate token and set cookie
    const token = jwt.sign({ id: user._id , isAdminApproved: user.isAdminApproved }, process.env.JWT_SECRET, {
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
    // console.log(user);

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

// const logout = async (req, res) => {
//   try {
//     // Clear the refreshToken cookie
//     res.clearCookie("refreshToken", {
//       httpOnly: true,
//       secure: true, // Use true in production (HTTPS)
//       sameSite: "None", // Match the sameSite attribute when the cookie was set
//       path: "/", // Ensure the path matches when the cookie was set
//     });

//     console.log("Logout successful");

//     return res.status(200).send({
//       success: true,
//       message: "Logout successful",
//     });
//   } catch (error) {
//     console.error("Logout error:", error);
//     return res.status(500).send({
//       success: false,
//       message: "An error occurred during logout",
//       error: error.message,
//     });
//   }
// };
 
const logout = async (req, res) => {
  try {
    res.setHeader("Set-Cookie", "refreshToken=; HttpOnly; SameSite=None; Secure; Path=/; Max-Age=0");

    console.log("Logout successful");

    return res.status(200).send({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).send({
      success: false,
      message: "An error occurred during logout",
      error: error.message,
    });
  }
};



const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Assumes you have middleware setting req.user
   
    
    // Extract fields from the request body
    const {
      name,
      email,
      phone,
      address, // Address should be sent as a JSON object from the frontend
      businessCategory,
      businessName,
      businessAddress,
      businessDetaile,
      fcmToken,
    } = req.body;

    // Prepare the fields to be updated
    const updatedFields = {};

    if (name) updatedFields.name = name;
    if (email) updatedFields.email = email;
    if (phone) updatedFields.phone = phone;
    if (address) {
      try {
        // If address is sent as a JSON string, parse it
        const parsedAddress = typeof address === "string" ? JSON.parse(address) : address;
        updatedFields.address = parsedAddress;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid address format. Address must be a valid JSON object.",
        });
      }
    }
    if (profilePic) updatedFields.profilePic = profilePic;
    if (businessCategory) updatedFields.businessCategory = businessCategory;
    if (businessName) updatedFields.businessName = businessName;
    if (businessAddress) updatedFields.businessAddress = businessAddress;
    if (businessDetaile) updatedFields.businessDetaile = businessDetaile;
    if (fcmToken) updatedFields.fcmToken = fcmToken;

    // Update user data in the database
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updatedFields },
      { new: true, runValidators: true } // Validate fields before updating
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
      businessDetaile,
      
    } = req.body;

    // Validate input fields
    if (
      !name &&
      !email &&
      !phone &&
      !address &&
      !businessCategory &&
      !businessName &&
      !businessAddress &&
      !businessDetaile
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
    if (businessDetaile) updatedFields.businessDetaile = businessDetaile;

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

const setUserStatus = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming the user ID is in `req.user` after authentication

    const { userstatus } = req.body;

    // Validate status
    if (!userstatus || !["available", "unavailable"].includes(userstatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status value. Please choose 'available' or 'unavailable'.",
      });
    }

    // Update user status in the database
    const updatedUserstatus = await UserModel.findByIdAndUpdate(
      userId,
      { userstatus },
      { new: true, runValidators: true } // Ensure validation is applied
    );

    // If user not found, return an error
    if (!updatedUserstatus) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Respond with success
    return res.status(200).json({
      success: true,
      message: `User status updated to ${userstatus}`,
      user: updatedUserstatus,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the user status",
      error: error.message,
    });
  }
};

const updateRoleByEmail = async (req, res) => {
  try {
    const { email, role } = req.body;

    // Validate role
    if (!role || !['User', 'Admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role value. Please choose 'User' or 'Admin'.",
      });
    }

    // Find the user by email and update their role
    const updatedUser = await UserModel.findOneAndUpdate(
      { email: email },
      { role: role },
      { new: true, runValidators: true }
    );

    // If user not found, return an error
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Respond with success
    return res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the user role",
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
  setUserStatus,
  updateRoleByEmail,
  approveUser
};
