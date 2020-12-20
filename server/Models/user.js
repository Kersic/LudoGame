const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    'email': {
        type: String,
        required: true,
    },
    'username': {
        type: String,
        required: true,
    },
    'password':{
        type: String,
        required: true,
    },
    'points': {
        type: Number,
        required: true,
    },
    'numberOfPlayedGames': {
        type: Number,
        required: true,
    },
    'numberOfWins': {
        type: Number,
        required: true,
    },
});

userSchema.statics.authenticate = function (email, password, callback) {
    User.findOne({ email: email }).exec(function (err, user) {

        if (err) {
            console.log(err);
            return callback(err)

        } else if (!user) {

            err = new Error('User not found.');
            err.status = 401;
            return callback(err);

        }

        bcrypt.compare(password, user.password, function (err, result) {
            if (result === true) {

                return callback(null, user);

            } else {

                return callback();

            }
        });
    });
}

userSchema.pre('save', function (next) {
    var user = this;
    if(user.password.length < 40)
    {
        bcrypt.hash(user.password, 10, function (err, hash) {
            if (err) {
                console.log(err);
                return next(err);
            }
            user.password = hash;
            next();
        });
    }
    else
    {
        next();
    }
});

var User = mongoose.model('User', userSchema);
module.exports = User;