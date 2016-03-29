"use strict";

var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var jwt = require("jwt-simple");
require("dotenv").config();

const SECRET = process.env.JWT_SECRET;

var User;

//define the User Object formatting
var userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: {type: String, required: true },
  interests: [String]
});

//make a cookie for a user.
userSchema.methods.generateToken = function() {
  var payload = {
    userId: this._id,
    iat: Date.now() //issued at time, iat
  };
  var token = jwt.encode(payload, SECRET);
  return token;
};

//to register a NEW user
userSchema.statics.register = function(userObj, cb) {
  bcrypt.hash(userObj.password, 10, function(err, hash) {
    if(err) {
      return cb(err);
    }
    User.create({
      username: userObj.username,
      password: hash,
      interests: userObj.interests
    }, function(err, user) {
      if(err) {
        cb(err);
      } else {
        user.password = null;
        cb(err, user);
      }
    });
  });
};

//log in an existing user
userSchema.statics.authenticate = function(userObj, cb) {
  User.findOne({ username: userObj.username}, function(err, dbUser) {
    if(err || !dbUser) {
      return cb("Authentication failed!");
    }
    bcrypt.compare(userObj.password, dbUser.password, function(err, isGood) {
      if(err || !isGood) {
        return cb("Authentication failed!");
      }
      dbUser.password = null;
      cb(null, dbUser);
    });
  });
};

//middleware to verify user is logged in and actual user
userSchema.statics.authMiddleware = function(req, res, next) {
  var token = req.cookies.userCookie;
  try {
    var payload = jwt.decode(token, SECRET);
  } catch(err) {
    return res.clearCookie("userCookie").status(401).send();
  }
  //token is valid, so we return the user interests
  User.findById(payload.userId).select({password: 0}).exec(function(err, user) {
    if(err || !user) {
      //err or user doesn't exist
      return res.clearCookie("userCookie").status(401).send(err);
    }
    req.user = user;
    next();
  });
};

// //edit the likes of a logged in user
// userSchema.statics.editLikes = function(userObj, ) {
//   User.findByIdAndUpdate(req.user._id, , function(req, user) {
//     if(err || !user) {
//       return res.status(400).send("Error with request!");
//     } else {
//       res.send(user);
//     };
//   });
// };


User = mongoose.model("User", userSchema);

module.exports = User;
