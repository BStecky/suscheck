import { Firestore, doc, setDoc } from "firebase/firestore";

export async function storeRaydiumTokenData(db: any, tokenData: any) {
  try {
    const tokenRef = db.collection("raydiumTokens").doc(tokenData.tokenAddress);
    const doc = await tokenRef.get();
    if (!doc.exists) {
      console.log(
        "Document does not exist, creating new document with token data."
      );
      await tokenRef.set({
        ...tokenData,
        processed: false,
      });
      return true;
    } else {
      console.log("Document already exists.");
      return false;
    }
  } catch (error) {
    console.error("Error accessing Firestore:", error);
    throw error;
  }
}

export async function markRaydiumTokenAsProcessed(
  db: any,
  tokenAddress: string,
  transactionsData: any,
  transactionSigs: any,
  txAmount: any
) {
  const tokenRef = db.collection("raydiumTokens").doc(tokenAddress);
  let sus = txAmount > 1;

  try {
    let serializedTransactions = {};
    transactionsData.forEach((transaction: any) => {
      const signature = transaction.transaction.signatures[0];
      (serializedTransactions as any)[signature] = {
        meta: JSON.stringify(transaction.meta),
        transaction: JSON.stringify(transaction.transaction),
      };
    });

    // const serializedTransactionData = JSON.stringify(
    //   transactionsData,
    //   (key, value) => (typeof value === "undefined" ? null : value) // Convert undefined to null
    // );

    await tokenRef.update({
      processed: true,
      processedTransactions: serializedTransactions,
      transactionSignatures: transactionSigs,
      processedTransactionsCount: txAmount,
      sus: sus,
    });
  } catch (error) {
    console.error("Failed to mark token as processed:", error);
    throw error;
  }
}
