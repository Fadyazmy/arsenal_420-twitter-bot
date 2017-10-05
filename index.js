var Twit = require('twit');
var request = require('request');
var every = require('schedule').every;
var analyze = require('Sentimental').analyze;
var fs = require("fs");
var config = require('./config');
var behaviour = require('./behaviour');
var jokes = fs.readFileSync("yo_mama_jokes.txt").toString().split("\n");
var express = require('express');
var yo_Mammma = require('yo-mamma').default;
var app = express();

var bot = new Twit({
    // consumer_key: process.env.TWITTER_consumer_key,
    consumer_key: config.consumer_key,
    // consumer_secret: process.env.TWITTER_consumer_secret,
    consumer_secret: config.consumer_secret,
    // access_token: process.env.TWITTER_access_token,
    access_token: config.access_token,
    // access_token_secret: process.env.TWITTER_access_token_secret,
    access_token_secret: config.access_token_secret,
    timeout_ms: 60*1000
});



// Where light begins
start(chronJOB());




//First one
function start()
{
    startStream("arsenal");
}

function chronJOB(){
    console.log("##### Chron timer initiated #### \n");
    // Then after every x mins repeat
    // TODO: Print time / maybe use time for when on server incase server fails/restarts
    every('15m').do(function() {
        // startStream("arsenal", false, startStream("tottenham, liverpool, chelsea ", true));
        startStream("arsenal");

    });

    // Follow back users at the end of day (if any)
    every('1d').do(function () {
        behaviour.followBackDaily();
    });
}


//
function startStream(team){
  console.log("BEGIN STREAMING for: "+team+"\n");

  var stream = bot.stream('statuses/filter',{
    track: team
  });

  var numTweets = 0;

  stream.on('tweet', function(tweet){
    // Get the tweet text, userID and twitter handle
    var tweet_text = tweet.text;
    var userName = tweet.user.screen_name;
    var statusID = tweet.id_str;
    var limit = 2; // control variable
    var tweetSentiment = analyze(tweet_text).score;

    // Responding to team fans/insulting fans
    if (JSON.stringify(tweetSentiment >3 && numTweets <limit )) {
        var body = yo_Mammma();
        console.log("INSULTING\n- USER: @" + tweet.user.screen_name +"\n- +ve score: "+ tweetSentiment+"\n- text: " + tweet_text+"\n");

/** INSULTS
        request(('https://insult.mattbas.org/api/en/insult.txt?who='+team), function (error, response, body) {
            respondToBastard(("@"+userName+" "+body),statusID); // dirty work of
            likeTweet(statusID); // like the status
        });
**/
        // Like the tweet, and throw a yo mama joke at them
        behaviour.likeTweet(statusID); // like the status
        behaviour.tweetUser(("@"+userName+" "+body),statusID); // TODO: change this to reply
        numTweets ++;
    } // if user supporting rival retweet
    else if (JSON.stringify(tweetSentiment < 3 && numTweets <limit )){

        // like the tweet and retweet
        behaviour.likeTweet(statusID);
        behaviour.retweetUser(statusID);
        numTweets ++;
    }
    if (numTweets >= limit){
      stream.stop();
      // reset tweet streak
      numTweets = 0;
      console.log("STOPPED retweeting for TEAM: " + team + "\n");
    }
  });
}


app.listen(3000 || process.env.PORT, function () {
    console.log("\n####### SERVER RUNNING\n")
});





