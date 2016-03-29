"use strict";

var express = require('express');
var router = express.Router();

var User = require("../models/user");


//get listing of ALL users
router.get('/', function(req, res, next) {
  User.find({}, function(err, users) {
    res.status(err ? 400 : 200).send(err || users);
  });
});

//register new user, provide cookie
router.post("/register", function(req, res) {
  User.register(req.body, function(err, user) {

    if(err) {
      res.status(400).send(err);
    } else {
      var token = user.generateToken();
      res.cookie("userCookie", token).send(user);
    }
  });
});

//log-in an existing user, provide a cookie
router.post("/authenticate", function(req, res) {
  User.authenticate(req.body, function(err, user) {
    if(err) {
      res.status(400).send(err);
    } else {
      var token = user.generateToken();
      res.cookie("userCookie", token).send(user);
    }
  });
});

//log-out a user, delete the cookie
router.delete("/logout", function(req, res) {
  res.clearCookie("userCookie").send();
});

//////////////////////////////////
////////////// PROTECTED Routes
/////////////////////////////////

//get a users own likes
router.get("/profile/likes", User.authMiddleware, function(req, res) {
  res.send(req.user.interests);
});

//edit a users own likes
// router.put("/profile/likes", User.authMiddleware, function(req, res) {
//   console.log(req.user.interests);
//   res.send();
// });
//   User.editLikes(req.user, req.params.likes, function(err, user) {
//     if(err) {
//       res.status(400).send(err)
//     } else {
//       res.send(req.user.interests);
//     };
//   });
// });



module.exports = router;
