import admin from "firebase-admin";
import {
  getFirestore,
  Timestamp,
  CollectionReference,
  DocumentData,
} from "firebase-admin/firestore";
const serviceAccount = require("./firebase.json");

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore();

async function migrateTimestamps() {
  const raydiumTokensRef: CollectionReference<DocumentData> =
    db.collection("raydiumTokens");
  const querySnapshot = await raydiumTokensRef.get();

  querySnapshot.forEach(async (document) => {
    const unixTimestamp = document.data().timestamp;
    if (typeof unixTimestamp === "number") {
      // Ensure that the timestamp is a number
      const firestoreTimestamp = Timestamp.fromMillis(unixTimestamp * 1000);
      await raydiumTokensRef.doc(document.id).update({
        timestamp: firestoreTimestamp,
      });
      console.log(`Updated document ${document.id} with new timestamp.`);
    } else {
      console.log(
        `Skipped document ${document.id} - timestamp is not a number.`
      );
    }
  });
}

migrateTimestamps().catch(console.error);
