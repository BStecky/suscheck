import React from "react";
import useTokenFetch from "../hooks/useTokenFetch";
import SearchBar from "./SearchBar";
import TokenList from "./TokenList";

const TokenGrid: React.FC = () => {
  const { loading, loader } = useTokenFetch();

  return (
    <main className="flex flex-col items-center w-[80%]">
      <SearchBar />
      <TokenList />
      {loading && (
        <p className="text-center text-xl text-teal-700">Loading...</p>
      )}
      <div ref={loader} style={{ height: "1px" }} />{" "}
    </main>
  );
};

export default TokenGrid;
