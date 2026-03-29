const admin = require('firebase-admin');

let db = null;

function initFirebase() {
  // Only init if credentials provided
  if (!process.env.FIREBASE_PROJECT_ID) {
    console.log('⚠️  Firebase not configured — using in-memory store');
    return null;
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }

  db = admin.firestore();
  console.log('✅ Firebase connected');
  return db;
}

function getDb() { return db; }

module.exports = { initFirebase, getDb };
