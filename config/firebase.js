
require('dotenv').config()
const admin = require("firebase-admin");
const serviceAccount = require('./serviceAccountKey.json'); // Adjust the path if needed
  
// const serviceAccount = process.env.FIREBASE_ADMIN_KEY;

if (!serviceAccount) {
  throw new Error("FIREBASE_ADMIN_KEY environment variable is not set.");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;