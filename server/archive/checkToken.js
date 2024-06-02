const tokenAddress = "2evVcWVLLDstSBJjXGf7WBzFp8GgE58B48uAPvf5UrND";
let ammId = "";

const { Connection, PublicKey } = require("@solana/web3.js");

// async function findRaydiumPairForToken(tokenAddress) {
//   const url = "https://api.raydium.io/v2/main/pairs";

//   try {
//     const response = await fetch(url);
//     const data = await response.json();

//     // Filter pairs to find those that include the token address
//     const pairs = data.filter(
//       (pair) =>
//         pair.baseMint === tokenAddress || pair.quoteMint === tokenAddress
//     );

//     // Optional: Sort by liquidity or volume if needed
//     pairs.sort((a, b) => b.liquidity - a.liquidity);

//     // Return the first pair (highest liquidity) or handle multiple pairs as needed
//     return pairs[0];
//   } catch (error) {
//     console.error("Error fetching or processing data:", error);
//     return null;
//   }
// }

// findRaydiumPairForToken(tokenAddress).then(async (pair) => {
//   if (pair) {
//     console.log("Found pair:", pair);
//     // Get the ammId from the pair
//     ammId = pair.ammId;

//     // Find the transaction that initialized the ammID account
//     const connection = new solanaWeb3.Connection(rpcUrl);
//     try {
//       const accountInfo = await connection.getAccountInfo(new solanaWeb3.PublicKey(ammId));
//       if (accountInfo) {
//         console.log("Account Info:", accountInfo);
//       } else {
//         console.log("No account info found for ammId:", ammId);
//       }
//     } catch (error) {
//       console.error("Error fetching account info for ammId:", ammId, error);
//     }
//   } else {
//     console.log("No pair found for the given token address.");
//   }
// });

async function findCreationTransaction(accountId) {
  const connection = new Connection(rpcUrl);
  const publicKey = new PublicKey(accountId);
  let before = undefined;
  let firstTransactionSignature = null;
  let secondTransactionSignature = null;
  let count = 0;

  while (true) {
    const options = {
      limit: 1000,
      before: before,
    };
    const signatures = await connection.getSignaturesForAddress(
      publicKey,
      options
    );

    count += signatures.length;
    console.log("sig count: ", count); // Log the running total of signatures processed

    if (signatures.length < 1000) {
      // If fewer than 1000 signatures, we've reached the start of the history
      secondTransactionSignature = signatures[signatures.length - 2].signature;
      firstTransactionSignature = signatures[signatures.length - 1].signature;
      break;
    }

    // Update 'before' to the last signature in the current batch for the next iteration
    before = signatures[signatures.length - 1].signature;
  }

  console.log("First transaction signature:", firstTransactionSignature);
  console.log("Second transaction signature:", secondTransactionSignature);
  //   if (signatures.length > 0) {
  //     // Assume the first transaction is the creation if the account has not been closed and recreated
  //     const creationSignature = signatures[0].signature;

  //     // Fetch the full transaction details
  //     const transaction = await connection.getTransaction(creationSignature, {
  //       maxSupportedTransactionVersion: 1, // Specify the transaction version if known; adjust as needed
  //     });
  //     if (transaction) {
  //       console.log("Creation Sig: ", creationSignature);
  //       console.log("Creation transaction details:", transaction);
  //       console.log("Block time:", transaction.blockTime);
  //       console.log("Slot:", transaction.slot);
  //       return transaction;
  //     } else {
  //       console.log("No transaction found for the given signature.");
  //       return null;
  //     }
  //   } else {
  //     console.log("No signatures found for this account.");
  //     return null;
  //   }
}

// Example usage
const poolAccountId = "AnSD6e9SNmryPyMsMvpb64Si5ZAnX2Btiyy5BuND5FEG";
findCreationTransaction(poolAccountId);

/* 
With this method it will take a LONG time to find the first token creation transaction for anything minted longer than a day ago
 on top of this, it looks like if the transactions landed in the same block (i.e the same time) then the ordering may be messed up! 
 example :
    First transaction signature: 4hBVdgkoUQaMSvCqG9fGMG1M3X52Wcp16Zs9jBgsHJn4mpjvNs7Gbyt2WcG8iEaMxZFsyQe4XngnTHmurw3ws13V (20 WSOL came from where fam?)
    Second transaction signature: 5PMQ8mFCoaXfSsWtLxRwNgZeL5p2JzTkf3DNJn9eZRbT9uPXi8uNgcjavLTpcXSCbQBaMmb87cemFiZjVszH8e3o (this actually looks like the raydium creation?)

    Alternative - monitor all new token pairs on raydium - and find the first tx (or txs) that was created for that pair - maybe we grab the first tx, then we grab all other tx's in the same block as that first tx 
    this may be a quick way to see  if the token is sus or not.
 
    Alternative - try and find the first mint TX of the token? I'm not sure if this is easier or worse - birdeye keeps track of this maybe can steal from there? who knows, from there can look for a raydium pool creation tx 
 
    */
