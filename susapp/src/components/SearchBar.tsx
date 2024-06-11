import React, { useState, useCallback } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../database/firebaseConfig";
import useStore from "../store/store";

const SearchBar: React.FC = () => {
  const {
    setSearchResults,
    setLoading,
    isLoading,
    setIsSearching,
    isSearching,
  } = useStore();
  const [searchQuery, setSearchQuery] = useState("");

  const searchTokens = useCallback(async () => {
    if (searchQuery.trim() === "" || isLoading) return;

    console.log("Searching tokens...");
    setLoading(true);

    const q = query(
      collection(db, "raydiumTokens"),
      where("tokenAddress", "==", searchQuery.trim())
    );

    const documentSnapshots = await getDocs(q);
    console.log("Search results:", documentSnapshots.docs);
    const foundTokens = documentSnapshots.docs.map((doc) => ({
      id: doc.id,
      tokenAddress: doc.data().tokenAddress || "N/A",
      sus: doc.data().sus || false,
      tokenName: doc.data().tokenName || "N/A",
      tokenSymbol: doc.data().tokenSymbol || "N/A",
      tokenImage: doc.data().tokenImage || "N/A",
      tokenSupply: doc.data().tokenSupply || 0,
      freezeAuthorityAddress: doc.data().freezeAuthorityAddress || "N/A",
      mintAuthorityAddress: doc.data().mintAuthorityAddress || "N/A",
      decimals: doc.data().decimals || 0,
      description: doc.data().description || "No description available",
    }));
    setSearchResults(foundTokens);
    setIsSearching(true);
    setLoading(false);
  }, [searchQuery, setSearchResults, setLoading, isLoading, setIsSearching]);

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  };

  return (
    <div className="flex w-[80%] mb-4">
      <input
        type="text"
        placeholder="Search by Token Address"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-grow p-2 rounded-l-sm border-2 border-teal-500 focus:outline-none focus:border-teal-700"
      />
      <button
        onClick={searchTokens}
        className="px-4 py-2 rounded-r-sm bg-teal-500 text-white hover:bg-teal-700"
      >
        Search
      </button>
      {isSearching && (
        <button
          onClick={clearSearch}
          className="ml-2 px-4 py-2 rounded-sm bg-gray-500 text-white hover:bg-gray-700"
        >
          Clear
        </button>
      )}
      {isLoading && <p className="ml-4 text-teal-700">Searching...</p>}
    </div>
  );
};

export default SearchBar;
