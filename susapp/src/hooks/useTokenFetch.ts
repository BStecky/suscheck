import { useState, useCallback, useRef, useEffect } from "react";
import { db } from "../database/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  startAfter,
  limit,
  getDocs,
  where,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import useStore from "../store/store";

const useTokenFetch = () => {
  const { tokens, addTokens, setLoading, isLoading, isSearching } = useStore();
  const [lastVisible, setLastVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const loader = useRef<HTMLDivElement | null>(null);

  const fetchTokens = useCallback(async () => {
    if (isLoading || isSearching) return; // Check if searching
    console.log("Fetching tokens...");
    setLoading(true);

    let q = query(
      collection(db, "raydiumTokens"),
      where("processed", "==", true),
      orderBy("timestamp", "desc"),
      limit(20)
    );

    if (lastVisible) {
      q = query(q, startAfter(lastVisible));
    }

    const documentSnapshots = await getDocs(q);
    console.log("Fetched documents:", documentSnapshots.docs);
    const newTokens = documentSnapshots.docs.map((doc) => ({
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
    console.log("New tokens:", newTokens);
    addTokens(newTokens);
    setLastVisible(
      documentSnapshots.docs[documentSnapshots.docs.length - 1] || null
    );
    setLoading(false);
  }, [lastVisible, addTokens, setLoading, isLoading, isSearching]);

  useEffect(() => {
    const currentLoader = loader.current;
    const observer = new IntersectionObserver(
      (entries) => {
        console.log("Intersection observed:", entries[0].isIntersecting);
        if (entries[0].isIntersecting && !isSearching) {
          // Check if not searching
          fetchTokens();
        }
      },
      { threshold: 1.0 }
    );

    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [fetchTokens, isSearching]); // Add isSearching as a dependency

  return { tokens, loading: isLoading, loader };
};

export default useTokenFetch;
