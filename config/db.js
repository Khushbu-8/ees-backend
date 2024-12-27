const mongoose = require('mongoose')
require('dotenv').config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb+srv://rajivmsurati11:rajivmsurati11@cluster0.p9hso.mongodb.net/EES-121_App')
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (error) {
        console.log(error);
        return false;

    }
}
module.exports = connectDB;
