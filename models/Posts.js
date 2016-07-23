/*
 * Define a model 'Post' with attributes describing data we expect to store.
 * 'Upvotes' is initialized to 0
 *
 * 'Comments' is an array of 'Comment' references. This allows us to use
 * Mongoose's built-in `[populate()]mongoose` populate method to easily
 * retrieve all comments associated with a given post
*/


var mongoose = require('mongoose');


var PostSchema = new mongoose.Schema({
        title   : String,
        link    : String,
        author  : String,
        upvotes : {type: Number, default: 0},
        comments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref : 'Comment'
        }]
    });


PostSchema.methods
    
    // Add 1 to the count and then save it
    .upvote = function (cb) {
        this.upvotes += 1;
        this.save(cb);
    };


mongoose.model('Post', PostSchema);