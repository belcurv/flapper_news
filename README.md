# flapper_news
Based on this tutorial:

https://thinkster.io/mean-stack-tutorial


## MongoDB stuff

I'm using M-Lab instead of a local MongoDB server.

If you peek at app.js, you'll notice that we require a file (db.js) from a folder (/config) that isn't tracked by Git:

app.js:
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

When adding API routes, a little more than 1/2 way throught he tutorial, the app will crash on startup.  I found that in app.js, if I require the models before initializing the routes, then it works.

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