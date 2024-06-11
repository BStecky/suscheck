import admin from "firebase-admin";
import {
  getFirestore,
  CollectionReference,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { getTokenMetadata } from "./getTokenData2"; // Ensure this path is correct
const serviceAccount = require("./firebase.json");
import dotenv from "dotenv";
dotenv.config();

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore();

async function updateTokenMetadata() {
  const raydiumTokensRef: CollectionReference<DocumentData> =
    db.collection("raydiumTokens");
  let lastVisible: QueryDocumentSnapshot<DocumentData> | null = null;
  let continueFetching = true;

  while (continueFetching) {
    let query = raydiumTokensRef.orderBy("timestamp").limit(100);
    if (lastVisible) {
      query = query.startAfter(lastVisible);
    }

    const querySnapshot = await query.get();
    if (querySnapshot.empty) {
      console.log("No more documents to update.");
      continueFetching = false;
      break;
    }

    const updatePromises = [];
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      if (!data.tokenName) {
        console.log("QUICKNODE_RPC_URL:", process.env.QUICKNODE_RPC_URL);
        console.log(
          `Fetching metadata for token at address: ${data.tokenAddress}`
        );
        updatePromises.push(
          getTokenMetadata(data.tokenAddress).then((metadata) => {
            return raydiumTokensRef.doc(doc.id).update({
              tokenName: metadata.name,
              tokenSymbol: metadata.symbol,
              tokenImage: metadata.image || "",
              tokenSupply: metadata.supply || 0,
              tokenDescription: metadata.description || "",
              mintAuthorityAddress: metadata.mintAuthorityAddress || "",
              freezeAuthorityAddress: metadata.freezeAuthorityAddress || "",
              decimals: metadata.decimals || 0,
            });
          })
        );
      } else {
        console.log(`Metadata already present for document ${doc.id}`);
      }
    }

    // Wait for all updates in the current batch to complete
    await Promise.all(updatePromises);
    console.log(
      `Updated metadata for batch ending with document ${
        querySnapshot.docs[querySnapshot.docs.length - 1].id
      }`
    );

    // Delay before processing the next batch
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 seconds delay

    lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
  }
}

updateTokenMetadata().catch(console.error);
