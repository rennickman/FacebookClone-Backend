// Imports
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const path = require("path");

const userRoute = require("./routes/users.js");
const authRoute = require("./routes/auth.js");
const postRoute = require("./routes/posts.js");




// ** App config **

// Create express server
const app = express();

// Set up dotenv for secret keys
dotenv.config()

// Connect to MongoDB database
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true }, () => console.log("Connected to MongoDB!"));

// Set the path of images to the Public Folder
app.use("/images", express.static(path.join(__dirname, "public/images")));




// ** Middleware **

// Turn response to json
app.use(express.json());

// Add security to headers
app.use(helmet());

// Log info about api calls to console
app.use(morgan("common"));



// Setting storage details for uploading Files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images");
    },

    filename: (req, file, cb) => {
        cb(null, req.body.name);
    }
});

// For uploading Files
const upload = multer({ storage });



// Upload a file using Multer
app.post("/api/upload", upload.single("file"), (req, res) => {

    try {
        // Return success response if successful
        return res.status(200).json("File uploaded successfully");

    } catch (err) {
        // Deal with any errors
        console.log(err);
    }
})



// Set up routes
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);






// ** API Calls **

// Test call to homepage
app.get('/', (req, res) => {
    res.send("Welcome to homepage!!");
})





// Listener
app.listen(8800, () => console.log("Backend server is running!"));