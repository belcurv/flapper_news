/*
 * Model for storing comments
*/

var mongoose = require('mongoose');


var CommentSchema = new mongoose.Schema({
    body    : String,
    author  : String,
    upvotes : {type: Number, default: 0},
    post    : {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Post'
    }
});


CommentSchema.methods
    
    // Add 1 to the count and then save it
    .upvote = function (cb) {
        this.upvotes += 1;
        this.save(cb);
    };


mongoose.model('Comment', CommentSchema);