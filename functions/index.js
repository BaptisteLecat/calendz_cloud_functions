// Example combined from these docs:
//  https://developers.google.com/calendar/v3/reference/events/insert#examples
//  https://cloud.google.com/solutions/authentication-in-http-cloud-functions#writing_the_cloud_function
//  https://firebase.google.com/docs/functions/http-events

// using another name other than "google" seems to cause error!!
const { google } = require('googleapis')

const calendar = google.calendar('v3')
const functions = require('firebase-functions')
const admin = require('firebase-admin')
    //Set the firebase admin json key file
admin.initializeApp({
    credential: admin.credential.cert(require('./assets/calendz-app-8020974a15f5.json')),
})

exports.generateFirebaseToken = functions.https.onRequest(async(req, res) => {
    let token = await admin.auth().createCustomToken('some-uid')
    res.send(token)
})

// This example assumes an HTTP call
exports.addToCalendar = functions.https.onRequest((req, res) => {
    const { eventData } = req.query
    const accessToken = getAccessToken(req)
    return addEventToGoogleCalendar(eventData, accessToken)
        .then(() => {
            res.stats(200).send('yay')
        })
        .catch((e) => res.status(500).send({ error: e.message }))
})

function addEventToGoogleCalendar(eventData, accessToken) {
    const authClient = getOauthClient(accessToken)
    return new Promise((resolve, reject) => {
        calendar.events.insert({
                auth: authClient,
                calendarId: 'primary',
                resource: eventData,
            },
            (err) => {
                if (err) {
                    console.error(err)
                    reject(err)
                } else {
                    resolve()
                }
            }
        )
    })
}

function getOauthClient(accessToken) {
    const oauth = new google.auth.OAuth2()
    oauth.setCredentials({ access_token: accessToken })
    return oauth
}

function getAccessToken(req) {
    const header = req.get('Authorization')
    if (header) {
        const match = header.match(/^Bearer\s+([^\s]+)$/)
        if (match) {
            return match[1]
        }
    }
    return null
}