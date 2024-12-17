// const UserModle = require("../model/UserModel")
// const BussinessModel = require("../model/UserModel")
// const createUser = async (req, res) => {
//     try {
//          const { name, email, password, cpassword, contact, address, role, businessCategory, businessName, businessAddress, send_request, received_request } = req.body
//         //   console.log(req.body);
//         if (!name || !email || !password || !cpassword || !contact || !address) {
//             return res.status(400).send({
//                 success: false,
//                 message: "Please fill all the fields"
//             })
//         }
//         if (password !== cpassword) {
//             return res.status(400).send({
//                 success: false,
//                 message: "Password and Confirm Password doesn't match"
//             })
//         }
//         const userExist = await UserModle.findOne({ email: email })
//         if (userExist) {
//             return res.status(400).send({
//                 success: false,
//                 message: "Email already exist"
//             })
//         }
//         let user = await UserModle.create({
//             name: name,
//             email: email,
//             password: password,
//             cpassword: cpassword,
//             contact: contact,
//             address: address,
//             role: role,
//             businessCategory: businessCategory,
//             businessName: businessName,
//             businessAddress: businessAddress,
//             send_request: send_request,
//             received_request: received_request

//         })
//         res.status(201).send({
//             success: true,
//             message: "User created successfully",
//             user: user
//         })
//     } catch (err) {
//         res.status(500).json({
//             success: false,
//             message: err.message
//         })
//     }


// }
// const viewUser = async (req, res) => {
//     try {
//         const user = await UserModle.find()
//         return res.status(200).send({
//             success: true,
//             message: "User view successfully",
//             user
//         })
//     } catch (error) {
//         return res.status(500).send({
//             success: false,
//             message: error,
//         })
//     }


// }
// // https://right-seagull-lightly.ngrok-free.app/admin/deleteUser
// const deleteUser = async (req, res) => {
//     try {

//         const { id } = req.body;
//         console.log(id);
//         await UserModle.findByIdAndDelete(id)
//         return res.status(200).send({
//             success: true,
//             message: "User deleted successfully"
//         })
//     } catch (error) {
//         return res.status(500).send({
//             success: false,
//             message: error
//         })
//     }

// }
// const updateUser = async (req, res) => {
//     try {
//         const { name, email, password, cpassword, contact, address, role, businessCategory, businessName, businessAddress, send_request, received_request } = req.body
//         const { id } = req.body;
//         const updatedUser = await UserModle.findByIdAndUpdate(id, {
//             name: name,
//             email: email,
//             password: password,
//             cpassword: cpassword,
//             contact: contact,
//             address: address,
//             role: role,
//             businessCategory: businessCategory,
//             businessName: businessName,
//             businessAddress: businessAddress,
//             send_request: send_request,
//             received_request: received_request,
//         })

//         return res.status(200).send({
//             success: true,
//             message: "User updated successfully",
//             user: updatedUser

//         })
//     } catch (error) {
//         return res.status(500).send({
//             success: false,
//             message: error
//         })
//     }

// }
// module.exports = { createUser,viewUser, deleteUser, updateUser };