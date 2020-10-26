const Pronote = require('pronote-api');
const TwitterClient = require('./twitter_client.js');
const credentials = require('./../resources/credentials.js');
const fs = require('fs');
const sha256 = require('sha256');

async function main() {
    const pronote_creds = credentials.pronote();
    const pronote_session = await Pronote.login(pronote_creds.url, pronote_creds.username, pronote_creds.password, pronote_creds.cas);

    const twitter_client = TwitterClient.twitter();

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
        console.log(`Travail pour le ${date_str} en ${assignment.subject}: ${assignment.description}`);
        fs.appendFile(
            __dirname + '/../resources/hw_history.txt',
            sha256(assignment.description) + '\n',
            (err) => { if (err) console.error(err) }
        );
        // twitter_client.post(
        //     'statuses/update',
        //     { status: `Travail pour le ${date_str} en ${assignment.subject}: ${assignment.description}` }
        // );
    });
}

main();