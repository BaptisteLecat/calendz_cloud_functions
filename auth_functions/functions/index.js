const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

exports.setupFirestoreUser = functions.region('europe-west1').auth.user().onCreate(async(user) => {
    await admin.firestore().collection("users").doc(user.uid).set({
        email: user.email,
    }).then(() => {
        console.log(`Successfully created user ${user.uid}`);
    }).catch((err) => {
        console.error(`Error creating user ${user.uid}`, err);
    });
});