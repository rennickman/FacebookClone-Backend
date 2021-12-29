// Imports
const router = require("express").Router();
const bcrypt = require("bcrypt");

const User = require("../models/User");





// ** API Calls **


// ** Register a New User **
router.post("/register", async (req, res) => {

    try {
        // Encrypt password in the request body
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create a new user using data from request body and the encrypted password
        const newUser = await new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });

        // Save User in Database
        const user = await newUser.save();

        // Return success response and new user
        res.status(200).send(user);

    } catch(err) {
        // Deal with any errors
        res.status(500).json(err);
    }
});



// ** Log-In a User **
router.post("/login", async (req, res) => {

    try {
        // Find User in database using email from request body - send failure response if User not found
        const user = await User.findOne({ email: req.body.email });
        !user && res.status(404).json("user not found");

        // Check if the password in request body matches encrypted password in database - send failure response if it doesnt
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        !validPassword && res.status(400).json("not a valid password");

        // Return success response with user in body if login successful
        res.status(200).json(user);

    } catch(err) {
        // Deal with any errors
        res.status(500).json(err);
    }
});







// Export Router
module.exports = router;