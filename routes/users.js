// Imports
const router = require("express").Router();
const bcrypt = require("bcrypt");

const User = require("../models/User");





// ** API Calls **


//  ** Update User **
router.put('/:id', async (req, res) => {

    // Check userId in request body matches userId of user to be changed - or user is an Admin
    if (req.body.userId === req.params.id || req.body.isAdmin) {

        // Check if there is a password in request body
        if (req.body.password) {
            try {
                // Encrypt password in the request body
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);

            } catch(err) {
                // Deal with any errors
                return res.status(500).json(err);
            }
        }

        try {
            // Update the User in the database - return success response if update successful
            const user = await User.findByIdAndUpdate(req.params.id, { $set: req.body });
            res.status(200).json("Account has been updated");

        } catch(err) {
            // Deal with any errors
                return res.status(500).json(err);
        }

    } else {
        // Return failure response if User iDs dont match - or user isnt admin
        return res.status(403).json("You can only update your account");
    }
});






// ** Delete User **
router.delete('/:id', async (req, res) => {

    // Check userId in request body matches userId of user to be deleted - or user is an Admin
    if (req.body.userId === req.params.id || req.body.isAdmin) {

        try {
            // Delete the User in the database - return success response if update successful
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account has been deleted");

        } catch(err) {
            // Deal with any errors
            return res.status(500).json(err);
        }

    } else {
        // Return failure response if User iDs dont match - or user isnt admin
        return res.status(403).json("You can only delete your account");
    }
});




// ** Get User **
router.get('/', async (req, res) => {

    // Store UserId and username - depending on which on is included in query
    const userId = req.query.userId;
    const username = req.query.username;

    try {
        // Locate the user in the database using id or username - return success response with user if successful
        const user = userId ? await User.findById(userId) : await User.findOne({ username: username });

        // Destructure out information we don't want to send in response
        const { password, updatedAt, ...other } = user._doc;
        // Return the user without the sensitive information
        res.status(200).json(other);

    } catch(err) {
        // Deal with any errors
        res.status(500).json(err);
    }
});



// ** Get Friends **
router.get('/friends/:userId', async (req, res) => {
    try {
        // Find the User in Database
        const user = await User.findById(req.params.userId);

        // Find all the friends of this user
        const friends = await Promise.all(
            user.following.map(friendId => {
                return User.findById(friendId);
            })
        );

        let friendList = [];
        
        // Destructure out the required data from each friend and push to friends list array
        friends.map(friend => {
            const { _id, username, profilePicture } = friend;
            friendList.push({ _id, username, profilePicture });
        });

        res.status(200).json(friendList);

    } catch (err) {
        // Deal with any errors
        res.status(500).json(err);
    }
})




// ** Follow User **
router.put('/:id/follow', async (req, res) => {

    // Check that the user Ids are different
    if (req.body.userId !== req.params.id) {

        try {
            // Locate the Current User and the User to be followed in the database
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);

            // Check that the current user isn't already in the followers list
            if (!user.followers.includes(req.body.userId)) {

                // Update the followers list of the user to be liked - update following list of current user
                await user.updateOne({ $push: { followers: req.body.userId } });
                await currentUser.updateOne({ $push: { following: req.params.id } });
                res.status(200).json("User has been followed");

            } else {
                // Send failure response if the user is already in the followers list
                res.status(403).json("You already follow this user");
            }

        } catch(err) {
            // Deal with any errors
            res.status(500).json(err);
        }

    } else {
        // Send failure response if the the user Ids are the same
        res.status(403).json("You can't follow yourself");
    }
});






// ** Unfollow User **
router.put('/:id/unfollow', async (req, res) => {

    // Check that the user Ids are different
    if (req.body.userId !== req.params.id) {

        try {
            // Locate the Current User and the User to be unfollowed in the database
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);

            // Check that the current user is already in the followers list
            if (user.followers.includes(req.body.userId)) {

                // Update the followers list of the user to be unliked - update following list of current user
                await user.updateOne({ $pull: { followers: req.body.userId } });
                await currentUser.updateOne({ $pull: { following: req.params.id } });
                res.status(200).json("User has been unfollowed");

            } else {
                // Send failure response if the user isnt already in the followers list
                res.status(403).json("You don't follow this user");
            }

        } catch(err) {
            // Deal with any errors
            res.status(500).json(err);
        }

    } else {
        // Send failure response if the the user Ids are the same
        res.status(403).json("You can't unfollow yourself");
    }
});




// Export Router
module.exports = router;