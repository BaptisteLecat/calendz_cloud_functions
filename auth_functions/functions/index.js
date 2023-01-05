const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

exports.setupFirestoreUser = functions
    .region("europe-west1")
    .auth.user()
    .onCreate(async(user) => {
        var firestoreUser = {
            uid: user.uid,
            email: user.email,
        };
        user.providerData.forEach((profile, index) => {
            if (
                index === 0 &&
                profile.displayName != null &&
                profile.displayName != undefined
            ) {
                firestoreUser.displayName = profile.displayName;
            }
            if (profile.providerId === "google.com") {
                firestoreUser.googleProfile = {
                    email: profile.email != null && profile.email != undefined ?
                        profile.email :
                        null,
                    photoURL: profile.photoURL != null && profile.photoURL != undefined ?
                        profile.photoURL :
                        null,
                    uid: profile.uid != null && profile.uid != undefined ?
                        profile.uid :
                        null,
                };
            }

            if (profile.providerId === "apple.com") {
                firestoreUser.appleProfile = {
                    email: profile.email != null && profile.email != undefined ?
                        profile.email :
                        null,
                    photoURL: profile.photoURL != null && profile.photoURL != undefined ?
                        profile.photoURL :
                        null,
                    uid: profile.uid != null && profile.uid != undefined ?
                        profile.uid :
                        null,
                };
            }
        });
        await admin
            .firestore()
            .collection("users")
            .doc(user.uid)
            .set(firestoreUser)
            .then(() => {
                console.log(user.providerData[0]);
                console.log(`Successfully created user ${user.uid}`);
            })
            .catch((err) => {
                console.error(`Error creating user ${user.uid}`, err);
            });
    });