import { Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export async function getTokenMetadata(tokenAddress: string) {
  const connection = new Connection(process.env.QUICKNODE_RPC_URL);
  const metaplex = Metaplex.make(connection);
  const mintAddress = new PublicKey(tokenAddress);

  let tokenName = "",
    tokenSymbol = "",
    tokenLogo = "",
    tokenSupply = "0",
    freezeAuthorityAddress = "",
    mintAuthorityAddress = "",
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
    tokenLogo = token.json?.image;
    tokenSupply = new BN(token.mint.supply.basisPoints).toString();
    mintAuthorityAddress = token.mint.mintAuthorityAddress?.toString() || "";
    freezeAuthorityAddress =
      token.mint.freezeAuthorityAddress?.toString() || "";
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
