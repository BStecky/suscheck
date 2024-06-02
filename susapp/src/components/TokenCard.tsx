import React from "react";

interface TokenCardProps {
  token: {
    id: string;
    tokenAddress: string;
    sus: boolean;
  };
}

const TokenCard: React.FC<TokenCardProps> = ({ token }) => {
  return (
    <div
      key={token.id}
      className={`flex flex-col p-6 shadow-lg rounded-sm text-gray-200 ${
        token.sus
          ? "border-2 border-rose-500 hover:bg-rose-900"
          : "border-2 border-emerald-500 hover:bg-emerald-900"
      } hover:scale-105 transform transition-transform duration-300 ease-in-out`}
    >
      <h2 className="text-md font-bold ">Token Address:</h2>
      <h3 className="text-xs break-words">{token.tokenAddress}</h3>
      <div
        className={`mt-4 rounded-sm p-2 w-fit text-white ${
          token.sus ? "bg-rose-400" : "bg-emerald-400"
        }`}
      >
        {token.sus ? "SUS" : "Not Sus"}
      </div>
    </div>
  );
};

export default TokenCard;
