import { Connection, Keypair, PublicKey, Finality } from "@solana/web3.js";
import { writeFile } from "fs/promises";
import dotenv from "dotenv";

dotenv.config();
let rpcURL = process.env.QUICKNODE_RPC_URL || "";
const connection = new Connection(rpcURL);

export async function parseBlock(block: number, raydiumPoolID: string) {
  let delay = 10000;
  let retryCount = 100;

  for (let i = 0; i < retryCount; i++) {
    try {
      const rawConfig = {
        commitment: "finalized" as Finality,
        maxSupportedTransactionVersion: 1,
        rewards: false,
        transactionDetails: "full" as "full",
      };
      const blockData = await connection.getBlock(block, rawConfig);
      let resultObject: {
        transactionArray: any[];
        transactionSignatures: any[];
        foundTransaction: boolean;
      } = {
        transactionArray: [],
        transactionSignatures: [],
        foundTransaction: false,
      };
      if (blockData?.transactions) {
        for (let tx of blockData.transactions) {
          if (tx.transaction.message.staticAccountKeys) {
            let staticAccountKeys =
              tx.transaction.message.staticAccountKeys.map((key) =>
                key.toString()
              );
            const hasInnerInstructions =
              tx.meta?.innerInstructions &&
              tx.meta.innerInstructions.length > 0;
            if (
              staticAccountKeys.includes(raydiumPoolID) &&
              !tx.meta?.err &&
              hasInnerInstructions
            ) {
              // console.log("the transaction: ", tx);
              resultObject.transactionArray.push(tx);
              resultObject.transactionSignatures.push(
                tx.transaction.signatures[0]
              );
              resultObject.foundTransaction = true;
            }
          }
        }
      }
      return resultObject;
    } catch (error) {
      console.error("Error fetching block:", error);
      console.log(`Retrying to fetch block for slot ${block}...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

//AnSD6e9SNmryPyMsMvpb64Si5ZAnX2Btiyy5BuND5FEG
//263953152
// parseBlock(263953152, "AnSD6e9SNmryPyMsMvpb64Si5ZAnX2Btiyy5BuND5FEG");
// parseBlock(265082022, "7esmV9WK2aup2dQtXPC5LC8MCmcBd4aYDYCeHeHUDJWk"); // $DOUG

//   try {
//     const transactionsData = blockData.transactions.map((tx, index) => ({
//       index,
//       meta: tx.meta,
//       transaction: tx.transaction,
//     }));

//     const fileName = `block-${block}-transactions.json`;
//     await writeFile(fileName, JSON.stringify(transactionsData, null, 2));
//     console.log(`Saved all transactions to ${fileName}`);
//   } catch (e) {
//     console.error("Error processing transactions: ", e);
//   }
