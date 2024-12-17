const dotenv = require('dotenv')
const express = require('express');
const app = express();
const connectDB = require('./config/db');
const port = process.env.PORT || 3000;
connectDB()
dotenv.config()
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = {
    origin: 'https://ess-frontend-eight.vercel.app', // Allow only your frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true, // If using cookies or authorization headers
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded());

app.use('/', require('./routes/indexRoute'))

app.listen(port, (err) => {
    if (err) {
        console.log(err);
        return false;
    }
    console.log(`Server is running on port ${port}`)
})