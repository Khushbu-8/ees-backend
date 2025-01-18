const dotenv = require("dotenv");
const express = require("express");
const app = express();
const connectDB = require("./config/db");
const port = process.env.PORT || 3000;
connectDB();
dotenv.config();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// app.use(bodyParser.urlencoded({ extended: true }));
const cors = require("cors");
const corsOptions = {
  origin: [
    // "https://ees121.com",
    // "https://www.ees121.com",
    "https://ess-frontend-eight.vercel.app",
    // "http://localhost:5173",
  ], // Replace with the public IP of your frontend
  methods: ["GET", "POST", "PUT", "DELETE"], // Add methods as needed
  credentials: true, // If your frontend sends cookies
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded());
app.get("/", (req, res) => {
  res.send("Hello, world!"); // Root route to test if the server is up
});
app.use("/", require("./routes/indexRoute"));

app.listen(port, (err) => {
  if (err) {
    console.log(err);
    return false;
  }
  console.log(`Server is running on port ${port}`);
});
