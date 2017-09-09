var Twit = require('twit');
var request = require('request');
var every = require('schedule').every;
var analyze = require('Sentimental').analyze;
var config = require('./config');

var bot = new Twit({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  access_token: config.access_token,
  access_token_secret: config.access_token_secret,
  timeout_ms: 60*1000
})

// ###### Getting a stream of data

//First one
startStream("arsenal", false
            ,startStream("tottenham", true));

// startStream("tottenham, chealse", true);


//After the first
every('15m').do(function() {
  console.log("CHRON JOB");
  if (Math.random() >.6){
    console.log("ARSENAL SCOUTING \n");
    startStream("arsenal", false);
  } else {
    console.log("MANUTD SCOUTING \n");
    startStream("manutd"), false;
  }
});

//
function startStream(team, supporter){
  console.log("STREAMING for: "+team+"\n");

  var stream = bot.stream('statuses/filter',{
    track: team
  });

  var numTweets = 0;

  stream.on('tweet', function(tweet){
    tweet_text = tweet.text

    if (JSON.stringify(analyze(tweet_text).score) > 3 && numTweets <3 && !supporter){
      console.log("INSULT wip \n");
      // Get the userID and twitter handle
      var userName = tweet.user.screen_name;
      var statusID = ""+ tweet.id_str;
      console.log("USERID: " + tweet.user.screen_name + "statusID"+ statusID);

      // Get insult
      request(('https://insult.mattbas.org/api/en/insult.txt?who='+team), function (error, response, body) {
        respondBastard(("@"+userName+" "+body),statusID); // dirty work of
        likeTweet(statusID); // like the status
      });

      numTweets ++;
    } // if supporter (chelsea OR tottenham) retweet
    else if (JSON.stringify(analyze(tweet_text).score) > 3 && numTweets <3 && supporter){
      retweetBastard(statusID); // dirty work of
      likeTweet(statusID); // like the status
      numTweets ++;
    }
    if (numTweets >= 14){
      stream.stop();
      numTweets = 0;
      console.log("STOPPED retweeting for TEAM: " + team) + "\n";
    }
  });
}


// Retweeting to someone
function retweetBastard(satusID){
  bot.post('statuses/retweet/:id', { id: satusID }, function (err, data, response) {
          if (err){
              console.log("ERROR WITH statusID:  "+satusID+ "\n" +  err);
          } else {
                  console.log(data.text + " has been retweeted.");
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
      console.log("RETWEETED \n")

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
      console.log("LIKED: \n"+data.text);
    }
  })
}

// Retweet positive tweets about Chelsea

// bulk following

// Followback
