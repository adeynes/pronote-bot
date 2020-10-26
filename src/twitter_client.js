const Twitter = require('twitter');
const credentials = require('../resources/credentials.js');

module.exports = {
    twitter: () => {
        const twitter_creds = credentials.twitter();
        return new Twitter({
            consumer_key: twitter_creds.consumer_key,
            consumer_secret: twitter_creds.consumer_secret,
            access_token_key: twitter_creds.access_key,
            access_token_secret: twitter_creds.access_secret
        });
    }
};