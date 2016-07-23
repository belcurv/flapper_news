/*
 * Users model
 *
 * Users log in with username and password.
 * Will hash the password prior to storing it.
 *   Hash using 'pbkdf2()' function from node's native crypto module.
 * Will generate and save a salt whenever we set the password.
 *
 * The pbkdf2Sync() function takes four parameters:
 *   password, salt, iterations, and key length.
 * The iterations and key length in our setPassword() method must
 * match the ones in our validPassword() method.
*/

var mongoose = require('mongoose'),
    crypto   = require('crypto'),
    jwt      = require('jsonwebtoken');


var UserSchema = new mongoose.Schema({
    username: {
        type      : String,
        lowercase : true,
        unique    : true
    },
    hash: String,
    salt: String
});


UserSchema.methods.setPassword = function (password) {
    // generate the salt
    this.salt = crypto.randomBytes(16).toString('hex');
    // hash password with salt
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function (password) {
    // compares password to the stored hash, returning a boolean
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

    return this.hash === hash;
};

UserSchema.methods.generateJWT = function () {
    // set expiration to 60 days
    var today = new Date(),
        exp   = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
        _id: this._id,
        username: this.username,
        exp: parseInt(exp.getTime() / 1000, 10)
    }, 'SECRET');
};


mongoose.model('User', UserSchema);