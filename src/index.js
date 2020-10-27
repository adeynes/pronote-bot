const Pronote = require('pronote-api');
const TwitterClient = require('./twitter_client.js');
const credentials = require('./../resources/credentials.js');
const fs = require('fs');
const sha256 = require('sha256');

async function main() {
    const pronote_creds = credentials.pronote();
    const pronote_session = await Pronote.login(pronote_creds.url, pronote_creds.username, pronote_creds.password, pronote_creds.cas);

    const twitter_client = TwitterClient.twitter();
}

const date_options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
};

async function checkHomework(pronote_session, twitter_client) {
    // from now to a week from now
    const homework = await pronote_session.homeworks(new Date(Date.now()), new Date(Date.now() + 1000 * 14 * 86400));


    let hw_history = [];
    try {
        hw_history = fs.readFileSync(__dirname + '/../resources/hw_history.txt').toString().split('\n');
    } catch (exception) {
        console.error(exception);
    }

    homework.filter((assignment) => hw_history.indexOf(sha256(assignment.description)) === -1).forEach((assignment) => {
        let date_str = assignment.for.toLocaleDateString('fr-FR', date_options);
        let assignment_str = `Travail pour le ${date_str} en ${assignment.subject}: ${assignment.description}`;
        console.log(assignment_str);
        fs.appendFile(
            __dirname + '/../resources/hw_history.txt',
            sha256(assignment.description) + '\n',
            (err) => { if (err) console.error(err) }
        );
        twitter_client.post(
            'statuses/update',
            { status: assignment_str }
        );
    });
}

async function checkGrades(pronote_session, twitter_client) {
    const grades = await pronote_session.marks();

    let grade_history = [];
    try {
        grade_history = fs.readFileSync(__dirname + '/../resources/grade_history.txt').toString().split('\n');
    } catch (exception) {
        console.error(exception);
    }

    grades.subjects.reduce(
        (accumulator, subject) => accumulator.concat(subject.marks.map(
            (grade) => ({ subject: subject.name, grade: grade })
        )),
        []
    ).filter((grade) => grade_history.indexOf(grade.grade.id) === -1).forEach((grade) => {
        let min_str = grade.grade.min.toString();
        let average_str = grade.grade.average.toString();
        let max_str = grade.grade.max.toString();
        let grade_str = `Nouvelle note en ${grade.subject}: ${grade.grade.title} (min ${min_str}/moy. ${average_str}/max ${max_str})`;
        console.log(grade_str);
        fs.appendFile(
            __dirname + '/../resources/grade_history.txt',
            grade.grade.id + '\n',
            (err) => { if (err) console.error(err) }
        );
        twitter_client.post(
            'statuses/update',
            { status: grade_str }
        );
    })
}

main();