/**
 * Created by developer on 9/30/17.
 */

var Twit = require('twit');
var request = require('request');
var fs = require("fs");
var config = require('./config');
var behaviour = require('./behaviour');


var bot = new Twit({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token: config.access_token,
    access_token_secret: config.access_token_secret,
    timeout_ms: 60*1000
});



module.exports = {
    followBackDaily: function(){
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
    },
    retweetUser: function(satusID){
        bot.post('statuses/retweet/:id', { id: satusID }, function (err, data, response) {
            if (err){
                console.log("ERROR WITH statusID:  "+satusID+ "\n" +  err);
            } else {
                console.log("RETWEET\n- user: @"+data.user.screen_name+" \n- text: " +data.text );
            }
        });
    },
    tweetUser: function(text, bastardStatusID){
        bot.post('statuses/update', {status: text //text
                , in_reply_to_status_id: bastardStatusID}
            , function (err, data, response){
                if (err){
                    console.log(err);
                } else {
                    console.log("INSULTING\n- user: @"+data.user.screen_name+"\n- text: "+ data.text)

                }
            })
    },
    likeTweet: function(BastardStatusID) {
        bot.post('favorites/create', {id: BastardStatusID}
            , function (err, data, response){
                if(err){
                    console.log(err);
                }else {
                    console.log("LIKED\n- user: @"+data.user.screen_name+" \n- text: "+data.text);
                }
            })
    }
};



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

