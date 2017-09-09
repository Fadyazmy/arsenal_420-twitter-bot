var Twit = require('twit');
var request = require('request');
var every = require('schedule').every;
var analyze = require('Sentimental').analyze;
var fs = require("fs");
var config = require('./config');

var jokes = fs.readFileSync("yo_mama_jokes.txt").toString().split("\n");


var bot = new Twit({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  access_token: config.access_token,
  access_token_secret: config.access_token_secret,
  timeout_ms: 60*1000
});


// Where light begins
first(chronJOB());




//First one
function first ()
{
    startStream("arsenal", false, startStream("tottenham, liverpool, chelsea ", true));
}
function chronJOB(){
// Then after every x mins repeat
    every('15m').do(function() {
        startStream("arsenal", false, startStream("tottenham, liverpool, chelsea ", true));
    });

    // Follow users at the end of day
    every('1d').do(function{
        followBack();
    });
}


function followBack(){
        bot.get('followers/list'
            , { screen_name: 'arsenal_420', count:200}
            , (err, data, response) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log("Following back twitter friends");
                    data.users.forEach(user => {
                    // If the user is following the bot (only) then we gotta follow back
                    if (user.connections.length == 1 && user.connections[1] == 'followed_by'){
                        console.log("Following @"+user.screen_name);
                        followBackAccount(user.screen_name);
                    }
            })
        }
        });
}

function followBackAccount(screenName){
    bot.post('friendships/create', {
        screen_name: screenName
    }, (err, data, response) => {
        if (err) {
            console.log(err)
        } else {
            console.log(data)
        }
    })
}


//
function startStream(team, supporter){
  console.log("STREAMING for: "+team+"\n");

  var stream = bot.stream('statuses/filter',{
    track: team
  });

  var numTweets = 0;

  stream.on('tweet', function(tweet){
    // Get the tweet text, userID and twitter handle
    var tweet_text = tweet.text;
    var userName = tweet.user.screen_name;
    var statusID = tweet.id_str;
    var limit = 3; // control variable

    // if user's tweet is somewhat positive
    if (JSON.stringify(analyze(tweet_text).score) >3 && numTweets <limit && !supporter){
      console.log("INSULTing \n");

      console.log("USER: @" + tweet.user.screen_name + " & statusID:"+ statusID);

      // Get insult
      request(('https://insult.mattbas.org/api/en/insult.txt?who='+team), function (error, response, body) {
        respondBastard(("@"+userName+" "+body),statusID); // dirty work of
        likeTweet(statusID); // like the status
      });

      numTweets ++;
    } // if supporter (tottenham) retweet
    else if (JSON.stringify(analyze(tweet_text).score) > 3 && numTweets <limit && supporter){
      retweetBastard(statusID);

      // like the status
      likeTweet(statusID);
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


// Retweeting to someone
function retweetBastard(satusID){
  bot.post('statuses/retweet/:id', { id: satusID }, function (err, data, response) {
          if (err){
              console.log("ERROR WITH statusID:  "+satusID+ "\n" +  err);
          } else {
                  console.log("RETWEET: @"+data.user.screen_name+" \n" +data.text );
          }
      });
}


// Respond to someone
function respondBastard(text, bastardStatusID){
  bot.post('statuses/update', {status: text //text
  , in_reply_to_status_id: bastardStatusID}
  , function (err, data, response){
    if (err){
      console.log(err);
    } else {
      console.log("RESPOND: @"+data.user.screen_name+"\n"+ data.text)

    }
  })
}


//Like a tweet or to unlike 'favorites/destroy'
function likeTweet(BastardStatusID) {
  bot.post('favorites/create', {id: BastardStatusID}
  , function (err, data, response){
    if(err){
      console.log(err);
    }else {
      console.log("LIKED: @"+data.user.screen_name+" \n"+data.text);
    }
  })
}


