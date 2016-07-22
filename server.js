/*
 * server.js 
*/

// SETUP= =====================================================================
var express    = require('express'),
    app        = express(),
    mongoose   = require('mongoose'),
    passport   = require('passport'),
    path       = require('path'),
    favicon    = require('serve-favicon'),
    morgan     = require('morgan'),
    bodyParser = require('body-parser'),
    db         = require('./config/db'),
    port       = process.env.PORT || 3000;


// DB MODELS ==================================================================
require('./models/Posts');
require('./models/Comments');
require('./models/Users');
require('./config/passport');  // Passport config must be AFTER User model
mongoose.connect(db.url);


// ROUTING ====================================================================
var routes = require('./routes/index'),
    users  = require('./routes/users');


// CONFIG =====================================================================
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

app.use('/', routes);
app.use('/users', users);


// START APP ==================================================================
app.listen(port, function () {
    console.log('Server listening on port ' + port);
});