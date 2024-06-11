import express from "express";
import bodyParser from "body-parser";
import admin from "firebase-admin";
const serviceAccount = require("./firebase.json");
import { parseBlock } from "./parseBlock";
import { storeRaydiumTokenData, markRaydiumTokenAsProcessed } from "./database";
import { Timestamp } from "firebase-admin/firestore";
import { getTokenMetadata } from "./getTokenData2";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const PORT = process.env.PORT || 3000;
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });
app.use(bodyParser.json());

app.post("/", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const expectedAuthHeader = "Bearer heliussssssletsgooooooooooo";

  if (!authHeader || authHeader !== expectedAuthHeader) {
    return res.status(401).send("Unauthorized");
  }

  const data = req.body[0];

  // if (
  //   !data.instructions ||
  //   data.instructions.length <= 4 ||
  //   !data.instructions[4].accounts ||
  //   data.instructions[4].accounts.length <= 4
  // ) {
  //   return res.status(400).send("Invalid data structure");
  // }

  // console.log(" tx sig: ", data.signature);
  // console.log(" data instructions: ", data.instructions);
  // console.log("account list... : ", data.instructions[4].accounts);
  let raydiumPoolAddress = "";

  for (const instruction of data.instructions) {
    if (
      instruction.programId === "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"
    ) {
      if (instruction.accounts && instruction.accounts.length > 4) {
        raydiumPoolAddress = instruction.accounts[4];
        break;
      }
    }
  }

  const tokenTransfers = data.tokenTransfers;
  const txSignature = data.signature;
  const block = data.slot;
  const timestamp = Timestamp.fromMillis(data.timestamp * 1000); // Convert Unix timestamp to Firestore Timestamp

  // console.log("---------------------------------------------------");
  // console.log("tx signature: ", txSignature);
  // console.log("block ", block);
  // console.log("timestamp", timestamp);
  // console.log("Pool Address:", raydiumPoolAddress);

  let solAmount = 0;
  let solAddress = "So11111111111111111111111111111111111111112";
  let tokenAmount = 0;
  let tokenAddress = "";
  let liquidityTokenAmount = 0;
  let liquidityTokenAddress = "";
  let creatorsWallet = "";

  for (let i = 0; i < tokenTransfers.length; i++) {
    let mint = tokenTransfers[i].mint;
    let transferAmount = tokenTransfers[i].tokenAmount;
    let fromUserAccount = tokenTransfers[i].fromUserAccount;

    if (fromUserAccount == "") {
      liquidityTokenAmount = transferAmount;
      liquidityTokenAddress = mint;
    }
    if (mint == solAddress) {
      solAmount = transferAmount;
      creatorsWallet = fromUserAccount;
    } else if (fromUserAccount != "") {
      tokenAmount = transferAmount;
      tokenAddress = mint;
    }
  }

  // console.log("Summary of processed data:");
  // console.log("SOL Amount: ", solAmount);
  // console.log("SOL Address: ", solAddress);
  // console.log("Token Amount: ", tokenAmount);
  // console.log("Token Address: ", tokenAddress);
  // console.log("Liquidity Token Amount: ", liquidityTokenAmount);
  // console.log("Liquidity Token Address: ", liquidityTokenAddress);
  // console.log("Creator's Wallet: ", creatorsWallet);
  // console.log("---------------------------------------------------");

  let tokenMetadata = await getTokenMetadata(tokenAddress);
  let tokenName = tokenMetadata.name;
  let tokenSymbol = tokenMetadata.symbol;
  let tokenImage = tokenMetadata.image;
  let tokenSupply = tokenMetadata.supply;
  let tokenDescription = tokenMetadata.description;
  let mintAuthorityAddress = tokenMetadata.mintAuthorityAddress;
  let freezeAuthorityAddress = tokenMetadata.freezeAuthorityAddress;
  let decimals = tokenMetadata.decimals;

  let tokenData = {
    txSignature,
    block,
    timestamp,
    raydiumPoolAddress,
    solAmount,
    solAddress,
    tokenAmount,
    tokenAddress,
    liquidityTokenAmount,
    liquidityTokenAddress,
    creatorsWallet,
    tokenName,
    tokenSymbol,
    tokenImage,
    tokenSupply,
    tokenDescription,
    mintAuthorityAddress,
    freezeAuthorityAddress,
    decimals,
  };

  let savedResult = await storeRaydiumTokenData(db, tokenData);
  if (savedResult) {
    let processedResult = await parseBlock(block, raydiumPoolAddress);
    if (processedResult) {
      let txCount = processedResult.transactionArray.length;
      let transactionSigs = processedResult.transactionSignatures;
      let transactionData = processedResult.transactionArray;
      markRaydiumTokenAsProcessed(
        db,
        tokenAddress,
        transactionData,
        transactionSigs,
        txCount
      );
      if (txCount > 1) {
        console.log("SUSPICIOUS ACTIVITY DETECTED IN CREATION BLOCK");
        processedResult.transactionArray.forEach((transaction) => {
          console.log(transaction.transaction.signatures);
        });
      }
    }
    console.log("Token finished processing: ", tokenAddress);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
