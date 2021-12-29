// Imports
const router = require("express").Router();


const Post = require("../models/Post");
const User = require("../models/User");



// ** API Calls **


// ** Create a Post **
router.post('/', async (req, res) => {

    // Create a new Post using data from the request body
    const newPost = await new Post(req.body);

    try {
        // Save the post in the database and send a success message with post in body
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);

    } catch(err) {
        // Deal with any errors
        res.status(500).json(err);
    }
});




// ** Update a Post **
router.put('/:id', async (req, res) => {

    try {
        // Find the Post in the database
        const post = await Post.findById(req.params.id);

        // Check the user Ids match
        if (post.userId === req.body.userId) {

            // Update the Post in the database and send a success response with the new post
            await post.updateOne({ $set: req.body });
            res.status(200).json("The post has been updated");

        } else {
            // Send failure response if user ids dont match
            res.status(403).json("You can only update your own posts");
        }

    } catch(err) {
        // Deal with any errors
        res.status(500).json(err);
    }
});




// ** Delete a Post **
router.delete('/:id', async (req, res) => {

    try {
        // Find the Post in the database
        const post = await Post.findById(req.params.id);

        // Check the user Ids match
        if (post.userId === req.body.userId) {

            // Delete the Post in the database and send a success response with the new post
            await post.deleteOne();
            res.status(200).json("The post has been deleted");

        } else {
            // Send failure response if user ids dont match
            res.status(403).json("You can only delete your own posts");
        }

    } catch(err) {
        // Deal with any errors
        res.status(500).json(err);
    }
});





// ** Like a Post **
router.put('/:id/like', async (req, res) => {

    try {
        // Find the Post in the database
        const post = await Post.findById(req.params.id);

        // Check the user has already liked the post
        if (!post.likes.includes(req.body.userId)) {

            // Add user id to likes array in database and send response message
            await post.updateOne({ $push: { likes: req.body.userId } });
            res.status(200).json("The post has been liked");

        } else {
            // Remove user id from likes array in database and send response message
            await post.updateOne({ $pull: { likes: req.body.userId } });
            res.status(200).json("The post has been disliked");
        }

    } catch(err) {
        // Deal with any errors
        res.status(500).json(err);
    }
});






// ** Get a Post **
router.get('/:id', async (req, res) => {

    try {
        // Find the Post in the datbase and return it in a success response
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);

    } catch(err) {
        // Deal with any errors
        res.status(500).json(err);
    }
});




// Get timeline
router.get('/timeline/:userId', async (req, res) => {

    try {
        // Find the current user and their posts in the database
        const currentUser = await User.findById(req.params.userId);

        // Find all the posts from current user
        const userPosts = await Post.find({ userId: currentUser._id });

        // Use promises to Collect all posts made by their friends
        const friendPosts = await Promise.all(
            // Loop through every friend in the following array
            currentUser.following.map(friendId => {
                // Find all posts of each friend
                return Post.find({ userId: friendId });
            })
        );

        // Join the 2 groups of Posts
        res.status(200).json(userPosts.concat(...friendPosts));
        

    } catch(err) {
        // Deal with any errors
        res.status(500).json(err);
    }
});



// Get all posts from a User
router.get('/profile/:username', async (req, res) => {

    try {

        // Get the User from datbase using Username in params
        const user = await User.findOne({ username: req.params.username });
        
        // Get all the Posts in database that match User's userID - return success response containing posts
        const posts = await Post.find({ userId: user._id });
        res.status(200).json(posts);

    } catch(err) {
        // Deal with any errors
        res.status(500).json(err);
    }
});




module.exports = router;