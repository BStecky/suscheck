import React, { useState, useCallback } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../database/firebaseConfig";
import useStore from "../store/store";

const SearchBar: React.FC = () => {
  const { setSearchResults } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const searchTokens = useCallback(async () => {
    if (searchQuery.trim() === "") return;

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
      tokenAddress: doc.data().tokenAddress,
      sus: doc.data().sus,
    }));
    setSearchResults(foundTokens);
    setLoading(false);
  }, [searchQuery, setSearchResults]);

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
      {loading && <p className="ml-4 text-teal-700">Searching...</p>}
    </div>
  );
};

export default SearchBar;
