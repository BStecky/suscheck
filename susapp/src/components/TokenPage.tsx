import React, { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import TransactionCard from "./TransactionCard";
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";
import BN from "bn.js";

const inter = Inter({ subsets: ["latin"] });

interface TokenPageProps {
  tokenData: {
    tokenAddress: string;
    sus: boolean;
    description?: string;
    creatorsWallet?: string;
    liquidityTokenAddress?: string;
    liquidityTokenAmount?: number;
    solAddress?: string;
    solAmount?: number;
    timestamp?: { seconds: number };
    tokenSupply?: number;
    decimals?: number;
    processedTransactionsCount?: number;
    transactionSignatures?: string[];
    mintAuthorityAddress?: string;
    freezeAuthorityAddress?: string;
  };
}

interface TransactionAmounts {
  [signature: string]: {
    solAmount: number;
    tokenAmount: number;
    isPoolInitialization: boolean;
  };
}

export const formatTokenSupply = (
  tokenSupply: number,
  decimals: number
): string => {
  const supply = BigInt(tokenSupply);
  const formattedSupply = supply / BigInt(10 ** decimals);
  return formattedSupply.toLocaleString();
};

export async function getTokenMetadata(tokenAddress: string) {
  const connection = new Connection(
    process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL ||
      "https://api.mainnet-beta.solana.com"
  );
  const metaplex = Metaplex.make(connection);
  const mintAddress = new PublicKey(tokenAddress);

  let tokenName = "",
    tokenSymbol = "",
    tokenLogo = "",
    tokenSupply = "0",
    freezeAuthorityAddress = "N/A",
    mintAuthorityAddress = "N/A",
    decimals = 0,
    description = "";

  const metadataAccount = metaplex
    .nfts()
    .pdas()
    .metadata({ mint: mintAddress });
  const metadataAccountInfo = await connection.getAccountInfo(metadataAccount);

  if (metadataAccountInfo) {
    const token = await metaplex.nfts().findByMint({ mintAddress });
    tokenName = token.name;
    tokenSymbol = token.symbol;
    tokenLogo = token.json?.image || "";
    tokenSupply = new BN(token.mint.supply.basisPoints).toString();
    mintAuthorityAddress = token.mint.mintAuthorityAddress?.toString() || "N/A";
    freezeAuthorityAddress =
      token.mint.freezeAuthorityAddress?.toString() || "N/A";
    decimals = token.mint.decimals;
    description = token.json?.description || "";
  }

  return {
    name: tokenName,
    symbol: tokenSymbol,
    image: tokenLogo,
    description: description,
    supply: tokenSupply,
    mintAuthorityAddress: mintAuthorityAddress,
    freezeAuthorityAddress: freezeAuthorityAddress,
    decimals: decimals,
  };
}

const getTransactionDetails = async (
  signature: string,
  connection: Connection,
  tokenAddress: string
) => {
  try {
    const transaction = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
    console.log("Transaction details:", transaction);

    if (!transaction || !transaction.meta) {
      console.log("Transaction or transaction meta not available");
      return;
    }

    const { postTokenBalances, preTokenBalances, logMessages } =
      transaction.meta;
    const primarySigner =
      transaction.transaction.message.accountKeys[0].pubkey.toString();

    if (!preTokenBalances || !postTokenBalances) {
      console.log("Pre or post token balances not available");
      return;
    }

    let postSolAmount = 0;
    let postTokenAmount = 0;
    let preSolAmount = 0;
    let preTokenAmount = 0;
    let isPoolInitialization = false;

    if (logMessages) {
      const initializationKeywords = [
        "InitializeInstruction2",
        "InitializeMint",
        "InitializeAccount",
      ];
      const mintToPresent = logMessages.some((log) =>
        log.includes("Instruction: MintTo")
      );

      isPoolInitialization =
        mintToPresent &&
        logMessages.some((log) =>
          initializationKeywords.some((keyword) => log.includes(keyword))
        );
    }

    // Loop over postTokenBalances to accumulate amounts
    postTokenBalances.forEach((balance) => {
      const amount = balance.uiTokenAmount.uiAmount ?? 0;
      if (
        balance.mint.toString() ===
          "So11111111111111111111111111111111111111112" &&
        balance.owner?.toString() === primarySigner
      ) {
        postSolAmount += amount;
      }
      if (
        balance.mint.toString() === tokenAddress &&
        balance.owner?.toString() === primarySigner
      ) {
        postTokenAmount += amount;
      }
    });

    // Loop over preTokenBalances to accumulate amounts
    preTokenBalances.forEach((balance) => {
      const amount = balance.uiTokenAmount.uiAmount ?? 0;
      if (
        balance.mint.toString() ===
          "So11111111111111111111111111111111111111112" &&
        balance.owner?.toString() === primarySigner
      ) {
        preSolAmount += amount;
      }
      if (
        balance.mint.toString() === tokenAddress &&
        balance.owner?.toString() === primarySigner
      ) {
        preTokenAmount += amount;
      }
    });

    const solAmount = postSolAmount - preSolAmount;
    const tokenAmount = postTokenAmount - preTokenAmount;

    if (solAmount < 0 && tokenAmount < 0) {
      isPoolInitialization;
    }
    return { signature, tokenAmount, solAmount, isPoolInitialization };
  } catch (error) {
    console.error("Error fetching transaction details:", error);
  }
};

const TokenPage: React.FC<TokenPageProps> = ({ tokenData }) => {
  const [tokenAmounts, setTokenAmounts] = useState<TransactionAmounts>({});
  const [tokenName, setTokenName] = useState<string>("");
  const [tokenImage, setTokenImage] = useState<string>("");
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      if (tokenData && tokenData.transactionSignatures) {
        setLoading(true);
        // Get latest token data
        const latestTokenData = await getTokenMetadata(tokenData.tokenAddress);
        setTokenName(latestTokenData.name);
        setTokenSymbol(latestTokenData.symbol);
        setTokenImage(latestTokenData.image);
        tokenData.tokenSupply = parseInt(latestTokenData.supply);
        tokenData.mintAuthorityAddress = latestTokenData.mintAuthorityAddress;
        tokenData.freezeAuthorityAddress =
          latestTokenData.freezeAuthorityAddress;
        tokenData.decimals = latestTokenData.decimals;

        const connection = new Connection(
          process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL ||
            "https://api.mainnet-beta.solana.com"
        );

        // Process each transaction signature
        for (const signature of tokenData.transactionSignatures) {
          const result = await getTransactionDetails(
            signature,
            connection,
            tokenData.tokenAddress
          );
          if (result) {
            setTokenAmounts((prev) => ({
              ...prev,
              [result.signature]: {
                solAmount: result.solAmount,
                tokenAmount: result.tokenAmount,
                isPoolInitialization: result.isPoolInitialization,
              },
            }));
          }
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [tokenData]);

  if (!tokenData) {
    return (
      <div className="text-gray-200 text-center m-8">
        Token Not Found or invalid token address.
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen bg-gray-800 text-gray-200 p-4 break-words ${
        tokenData.sus ||
        tokenData.freezeAuthorityAddress !== "N/A" ||
        tokenData.mintAuthorityAddress !== "N/A"
          ? ""
          : ""
      }`}
    >
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="w-full md:w-[80%]">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Token Information
          </h1>
          <div
            className={`bg-gray-700 p-6 rounded-sm shadow-lg mb-4 ${
              tokenData.sus ||
              tokenData.freezeAuthorityAddress !== "N/A" ||
              tokenData.mintAuthorityAddress !== "N/A"
                ? "border-2 border-rose-500"
                : "border-2 border-emerald-500"
            }`}
          >
            <div className="flex items-center mb-4 justify-between">
              <div className="flex flex-row">
                <img
                  src={tokenImage || "/assets/default-token-image.png"}
                  alt={tokenName || "Token Image"}
                  className="w-16 h-16 object-cover rounded-full mr-4"
                />
                <div>
                  <h2 className="text-2xl font-semibold">
                    {tokenName || "Unknown Token Name"}
                  </h2>
                  <p className="text-lg text-gray-400">
                    ${tokenSymbol || "N/A"}
                  </p>
                </div>
              </div>
              <p
                className={`text-lg px-4 py-2  rounded-sm mb-2 ${
                  tokenData.sus ||
                  tokenData.mintAuthorityAddress !== "N/A" ||
                  tokenData.freezeAuthorityAddress !== "N/A"
                    ? "bg-rose-500"
                    : "bg-emerald-500"
                }`}
              >
                {tokenData.sus ||
                tokenData.mintAuthorityAddress !== "N/A" ||
                tokenData.freezeAuthorityAddress !== "N/A"
                  ? "SUS"
                  : "Not Sus"}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-md md:text-lg">
              <p>Address: {tokenData.tokenAddress}</p>
              <p>Creator: {tokenData.creatorsWallet}</p>
              <p>
                Pool Initialized:{" "}
                {tokenData.timestamp
                  ? new Date(
                      tokenData.timestamp.seconds * 1000
                    ).toLocaleString()
                  : "N/A"}
              </p>
              <p>
                Token Supply:{" "}
                {tokenData.tokenSupply && tokenData.decimals
                  ? formatTokenSupply(tokenData.tokenSupply, tokenData.decimals)
                  : "N/A"}
              </p>
            </div>

            <p className="text-lg my-4">
              {tokenData.description || "No description available."}
            </p>

            <section className="flex flex-row gap-2">
              <span
                className={`${
                  tokenData.mintAuthorityAddress != "N/A"
                    ? " border border-rose-500 p-4 text-lg font-bold"
                    : ""
                }`}
              >
                {tokenData.mintAuthorityAddress != "N/A"
                  ? " More tokens can be minted"
                  : ""}
              </span>
              <span
                className={`${
                  tokenData.freezeAuthorityAddress != "N/A"
                    ? "border border-rose-500 p-4 font-bold text-lg"
                    : ""
                }`}
              >
                {tokenData.freezeAuthorityAddress != "N/A"
                  ? " Token freezing possible"
                  : ""}
              </span>
              <span
                className={`${
                  tokenData.sus
                    ? "border border-rose-500 p-4 font-bold text-lg"
                    : ""
                }`}
              >
                {tokenData.sus && "Tokens were sniped using Jito Bundles"}
              </span>
            </section>
          </div>
          <div className="w-full">
            {Object.keys(tokenAmounts).map((signature) => (
              <TransactionCard
                key={signature}
                signature={signature}
                isPoolInitialization={
                  tokenAmounts[signature].isPoolInitialization
                }
                solInitializeAmount={tokenData.solAmount || 0}
                solAmount={tokenAmounts[signature].solAmount}
                tokenAmount={tokenAmounts[signature].tokenAmount}
                totalTokenSupply={tokenData.tokenSupply ?? 0}
                decimals={tokenData.decimals ?? 0}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenPage;
