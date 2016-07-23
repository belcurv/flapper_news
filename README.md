# flapper_news
Based on this tutorial:

https://thinkster.io/mean-stack-tutorial


## MongoDB stuff

I'm using M-Lab instead of a local MongoDB server.

If you peek at server.js, you'll notice that we require a file (db.js) from a folder (/config) that isn't tracked by Git:

server.js:
```javascript
    var db = require('./config/db');
    
    // ... >>snip<< ... //
    
    mongoose.connect(db.url);
```

To make this MongoDB configuration work, you're going to need to add the folder and file. Create a new sandbox database at mlab.com. Replace the url path with whatever MLab gives you for your database, and obviously the `<username>` and `<password>` bits with the user credentials you created for your database.

As an example:

/config/db.js

```javascript
    module.exports = {
        url : 'mongodb://<username>:<password>@ds015881.mlab.com:15881/flapper_news_tut'
    }
```

## Tutorial Errors

#### Router / Model ordering issue

When adding API routes, a little more than 1/2 way throught the tutorial, the app will crash on startup.  I found that in server.js, if I require the models before initializing the routes, then it works.

Instead of this:

```javascript
    // ROUTES =====================================
    var routes = require('./routes/index'),
        users = require('./routes/users');
        
    // DB MODELS ==================================
    require('./models/Posts');
    require('./models/Comments');
    mongoose.connect(db.url);    
```

Do this:

```javascript
    // DB MODELS ==================================
    require('./models/Posts');
    require('./models/Comments');
    mongoose.connect(db.url);


    // ROUTES =====================================
    var routes = require('./routes/index'),
    users = require('./routes/users');
```

#### Post author not showing issue

Once JWT token authentication is implemented, the tutorial adds the post author's username to the list of posts in the `home.html` template.  But, the username is not being saved to the database, so there's no username to display in the template.  The problem is that the Post Schema (/models/Posts.js) does not account for username!

Tutorial code:

```javascript
    var PostSchema = new mongoose.Schema({
        title   : String,
        link    : String,
        upvotes : {type: Number, default: 0},
        comments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref : 'Comment'
        }]
    });
```

The fix:

```javascript
    var PostSchema = new mongoose.Schema({
        title   : String,
        link    : String,
        author  : String,   // <-- you need this
        upvotes : {type: Number, default: 0},
        comments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref : 'Comment'
        }]
    });
```