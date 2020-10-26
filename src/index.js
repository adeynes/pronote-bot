const credentials = require('./../config/.credentials.js');
const pronote = require('pronote-api');
const Twitter = require('twitter');

async function main() {
    const pronote_creds = credentials.pronote();
    const pronote_session = await pronote.login(pronote_creds.url, pronote_creds.username, pronote_creds.password, pronote_creds.cas);

    const twitter_creds = credentials.twitter();
    const twitter_client = new Twitter({
        consumer_key: twitter_creds.consumer_key,
        consumer_secret: twitter_creds.consumer_secret,
        access_token_key: twitter_creds.access_key,
        access_token_secret: twitter_creds.access_secret
    });

    // from now to a week from now
    const homework = await pronote_session.homeworks(new Date(Date.now()), new Date(Date.now() + 1000 * 14 * 86400));

    const date_options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    homework.forEach(function (assignment) {
        let date_str = assignment.for.toLocaleDateString('fr-FR', date_options);
        console.log(`Travail pour le ${date_str} en ${assignment.subject}: ${assignment.description}`)
        // twitter_client.post(
        //     'statuses/update',
        //     { status: `Travail pour le ${date_str} en ${assignment.subject}: ${assignment.description}` }
        // );
    });
}

main();