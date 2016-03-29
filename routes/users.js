"use strict";

var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var Twitter = require("twitter");
require("dotenv").config();

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

//get a users own interests
router.get("/profile/likes", User.authMiddleware, function(req, res) {
  res.send(req.user.interests);
});

// ADD more interests to a logged in user
router.put("/profile/likes", User.authMiddleware, function(req, res) {
var allInterests = req.user.interests.concat(req.body.interests);

 User.findByIdAndUpdate(req.user._id, {
   $set: {interests: allInterests}
 }, function(err, user) {
   if(err) {
     res.status(400).send(err);
   }
   res.send("Likes updated!");
 });
});

// CLEAR a users own interests
router.put("/profile/clear", User.authMiddleware, function(req, res) {

 User.findByIdAndUpdate(req.user._id, {
   $set: {interests: []}
 }, function(err, user) {
   if(err) {
     res.status(400).send(err);
   }
   res.send("All likes deleted!");
 });
});

///////////////// TWITTTER API //////////////////
//GET Tweets related to interests
var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

router.get("/tweets",  User.authMiddleware, function(req, res) {
  getTweets(req.user.interests);
  res.send();
});

function getTweets(interests) {
  interests.forEach(function(interest) {
    client.stream('statuses/filter', {track: interest}, function(stream) {
      stream.on('data', function(tweet) {
        console.log(tweet.text);
      });
      stream.on('error', function(error) {
        throw error;
      });
    });
  });
};


module.exports = router;
