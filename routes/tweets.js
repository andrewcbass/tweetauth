"use strict"

var Twitter = require("twitter");
require("dotenv").config();

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

router.get("/", function(req, res) {
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
