const admin = require("firebase-admin");
require('dotenv').config();  // Load the environment variables from the .env file

// const serviceAccount = require('./serviceAccountKey.json'); // Adjust the path if needed

const firebaseAdminKey = process.env.FIREBASE_ADMIN_KEY;
const serviceAccount = JSON.parse(firebaseAdminKey);


if (!serviceAccount) {
  throw new Error("FIREBASE_ADMIN_KEY environment variable is not set.");
}
// console.log(serviceAccount);


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;