/*
 * /routes/index.js
*/

var express  = require('express'),
    router   = express.Router(),
    path       = require('path'),
    mongoose = require('mongoose'),
    Post     = mongoose.model('Post'),
    Comment  = mongoose.model('Comment');


// API ROUTES =================================================================

// GET /posts - return a list of posts and associated metadata
// Testing:
//   curl http://localhost:3000/posts
router.get('/posts', function (req, res, next) {
    Post.find(function (err, posts) {
        if (err) {
            return next(err);
        }
        
        res.json(posts);
    });
});

// POST /posts - create a new post
// Using cURL:
//   curl --data 'title=test&link=http://test.com' http://localhost:3000/posts
router.post('/posts', function (req, res, next) {
    var post = new Post(req.body);
    
    post.save(function (err, post) {
        if (err) {
            return next(err);
        }
        
        res.json(post);
    });
});

// Route middleware to preload post objects by param: 'id'
/*
   Now when we define a route URL with :post in it, this function will be run
   first. Assuming the :post parameter contains an ID, our function will
   retrieve the post object from the database and attach it to the req
   object after which the route handler function will be called.
   More info: http://expressjs.com/4x/api.html#app.param
*/
router.param('post', function (req, res, next, id) {
    var query = Post.findById(id);
    
    query.exec(function (err, post) {
        if (err) {
            return next(err);
        }
        
        if (!post) {
            return next(new Error('cannot find specific post'));
        }
        
        req.post = post;
        return next();
    });
});

// Route middleware to preload comment by param: 'id'
router.param('comment', function (req, res, next, id) {
    var query = Comment.findById(id);
    
    query.exec(function (err, comment) {
        if (err) {
            return next(err);
        }
        
        if (!comment) {
            return next(new Error('cannot find specific comment'));
        }
        
        req.comment = comment;
        return next();
    });
});

// GET /posts/:post - return an individual post with associated comments
// The populate() method loads all the comments associated with a post
// Test it:
//   curl http://localhost:3000/posts/<POST ID>
router.get('/posts/:post', function (req, res, next) {
    req.post.populate('comments', function (err, post) {
        if (err) {
            return next(err);
        }
        
        res.json(req.post);
    });
});

// PUT /posts/:post/upvote - upvote a post, notice we use the post ID in the URL
// Test it:
//   curl -X PUT http://localhost:3000/posts/<POST ID>/upvote
router.put('/posts/:post/upvote', function (req, res, next) {
    req.post.upvote(function (err, post) {
        if (err) {
            return next(err);
        }
        
        res.json(post);
    });
});

// POST /posts/:post/comments - add a new comment to a post by ID
router.post('/posts/:post/comments', function (req, res, next) {
    var comment = new Comment(req.body);
    comment.post = req.post;
    
    comment.save(function (err, comment) {
        if (err) {
            return next(err);
        }
        
        req.post.comments.push(comment);
        req.post.save(function (err, post) {
            if (err) {
                return next(err);
            }
            
            res.json(comment);
        });
    });
});

// PUT /posts/:post/comments/:comment/upvote - upvote a comment
router.put('/posts/:post/comments/:comment/upvote', function (req, res, next) {
    req.comment.upvote(function (err, comment) {
        if (err) {
            return next(err);
        }
        
        res.json(comment);
    });
});


// APPLICATION ROUTES =========================================================

// load the view file (angular handles front-end page changes)
router.get('*', function (req, res) {    
    res.sendFile(path.join(__dirname, '/public/index.html'));
});


module.exports = router;