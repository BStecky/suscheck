import React from "react";
import { Token } from "../store/store";
import { useRouter } from "next/router"; // Import useRouter

interface TokenCardProps {
  token: Token;
}

const formatTokenSupply = (tokenSupply: number, decimals: number): string => {
  const supply = BigInt(tokenSupply);
  const formattedSupply = supply / BigInt(10 ** decimals);
  return formattedSupply.toLocaleString();
};

const TokenCard: React.FC<TokenCardProps> = ({ token }) => {
  const router = useRouter(); // Initialize useRouter
  const defaultTokenImage = "/assets/default-token-image.png";

  // Function to handle click event
  const handleCardClick = () => {
    router.push(`/${token.tokenAddress}`); // Navigate to token address page
  };

  return (
    <main
      key={token.id}
      className={`flex flex-col justify-between p-6 shadow-lg rounded-sm text-gray-200 ${
        token.sus ||
        token.freezeAuthorityAddress != "N/A" ||
        token.mintAuthorityAddress != "N/A"
          ? "border-2 border-rose-500 hover:bg-rose-900"
          : "border-2 border-emerald-500 hover:bg-emerald-900"
      } hover:scale-105 transform transition-transform duration-300 ease-in-out hover:cursor-pointer`}
      onClick={handleCardClick} // Add onClick event handler
    >
      {token.tokenAddress && (
        <section>
          <div className="flex flex-row gap-4 items-center align-middle p-4">
            <div className="w-20 h-20">
              {token.tokenImage ? (
                <img
                  src={token.tokenImage}
                  alt={token.tokenName || "Token Image"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={defaultTokenImage}
                  alt={token.tokenName || "Token Image"}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div>
              <h4 className="text-lg">
                {token.tokenName || "Unknown Token Name"}
              </h4>
              <span className="text-md">${token.tokenSymbol || "N/A"}</span>
            </div>
          </div>
          <h3 className="text-xs break-words">{token.tokenAddress}</h3>

          <div className="flex flex-col mt-2 gap-2">
            <p className="text-sm">
              {token.description || "No description available."}
            </p>

            <span className="text-sm">
              Supply:{" "}
              {token.tokenSupply
                ? formatTokenSupply(token.tokenSupply, token.decimals)
                : "N/A"}
            </span>

            <span
              className={`${
                token.mintAuthorityAddress != "N/A"
                  ? " border border-red-500 p-4 text-lg font-bold"
                  : ""
              }`}
            >
              {token.mintAuthorityAddress != "N/A"
                ? " More tokens can be minted"
                : ""}
            </span>
            <span
              className={`${
                token.freezeAuthorityAddress != "N/A"
                  ? "border border-red-500 p-4 font-bold text-lg"
                  : ""
              }`}
            >
              {token.freezeAuthorityAddress != "N/A"
                ? " Token freezing possible"
                : ""}
            </span>
            <span
              className={`${
                token.sus ? "border border-red-500 p-4 font-bold text-lg" : ""
              }`}
            >
              {token.sus && "Tokens sniped with Jito Bundles"}
            </span>
          </div>
        </section>
      )}
      <section
        className={`mt-4 rounded-sm p-2 w-fit text-white ${
          token.sus ||
          token.freezeAuthorityAddress != "N/A" ||
          token.mintAuthorityAddress != "N/A"
            ? "bg-rose-400"
            : "bg-emerald-400"
        }`}
      >
        {token.sus ||
        token.freezeAuthorityAddress != "N/A" ||
        token.mintAuthorityAddress != "N/A"
          ? "SUS"
          : "Not Sus"}
      </section>
    </main>
  );
};

export default TokenCard;
