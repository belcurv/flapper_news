## ObjectType

In Mongoose, we can create relationships between different data models using the `ObjectId` type. The `ObjectId` data type refers to a 12 byte **MongoDB ObjectId**, which is actually what is stored in the database. The `ref` property tells Mongoose what type of object the ID references and enables us to retrieve both items simultaneously.

It's used in both the Posts.js and Comments.js models:

Posts.js:

```javascript
    var PostSchema = new mongoose.Schema({
        title    : String,
        link     : String,
        upvotes  : {type: Number, default: 0},
        comments : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
    });
```

Comments.js:

```javascript
    var CommentSchema = new mongoose.Schema({
        body    : String,
        author  : string,
        upvotes : {type: Number, default: 0},
        post    : { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
    });
```