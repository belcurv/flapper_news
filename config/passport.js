/*
 * Passport Local strategy
 *
 * Logic to authenticate a user given a username and password.
 * Calls 'validPassword()' method defined on our 'User' model.
*/

var passport      = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    mongoose      = require('mongoose'),
    User          = mongoose.model('User');

passport.use(new LocalStrategy(
    function (username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            
            if (err) {
                return done(err);
            }
            
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            
            return done(null, user);
        });
    }
));