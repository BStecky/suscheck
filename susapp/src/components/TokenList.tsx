import React from "react";
import useStore from "../store/store";
import TokenCard from "./TokenCard";

const TokenList: React.FC = () => {
  const { tokens, searchResults } = useStore();
  const displayedTokens = searchResults.length > 0 ? searchResults : tokens;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-8 w-full text-gray-900">
      {displayedTokens.map((token) => (
        <TokenCard key={token.id} token={token} />
      ))}
    </section>
  );
};

export default TokenList;
