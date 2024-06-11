import admin from "firebase-admin";
import fetch from "node-fetch";
import {
  getFirestore,
  Timestamp,
  CollectionReference,
  DocumentData,
} from "firebase-admin/firestore";
const serviceAccount = require("./firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore();

interface TokenDetails {
  name: string;
  description: string;
  image: string;
}

async function getTokenDetails(tokenAddress: string): Promise<TokenDetails> {
  const rpcUrl =
    process.env.NEXT_PUBLIC_HELIUS_RPC_URL ||
    "https://api.mainnet-beta.solana.com";
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "string",
      method: "getAsset",
      params: {
        id: tokenAddress,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("data : ", data);
  console.log("data files : ", data.result.content.files);
  console.log("data metadata : ", data.result.content.metadata);
  console.log("data links : ", data.result.content.links);

  if (!data.result || !data.result.content || !data.result.content.metadata) {
    throw new Error("Invalid response structure");
  }

  return {
    name: data.result.content.metadata.name,
    description: data.result.content.metadata.description,
    image: data.result.content.files[0].cdn_uri,
  };
}

getTokenDetails("3S8qX1MsMqRbiwKg2cQyx7nis1oHMgaCuc9c4VfvVdPN")
  .then((details) => console.log(details))
  .catch((error) => console.error("Error fetching token details:", error));

//gets token data using get assets from helius
