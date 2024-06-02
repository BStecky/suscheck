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
  const { tokens, addTokens } = useStore();
  const [lastVisible, setLastVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(false);
  const loader = useRef<HTMLDivElement | null>(null);

  const fetchTokens = useCallback(async () => {
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
      tokenAddress: doc.data().tokenAddress,
      sus: doc.data().sus,
    }));
    console.log("New tokens:", newTokens);
    addTokens(newTokens);
    setLastVisible(
      documentSnapshots.docs[documentSnapshots.docs.length - 1] || null
    );
    setLoading(false);
  }, [lastVisible, addTokens]);

  useEffect(() => {
    const currentLoader = loader.current;
    const observer = new IntersectionObserver(
      (entries) => {
        console.log("Intersection observed:", entries[0].isIntersecting);
        if (entries[0].isIntersecting) {
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
  }, [fetchTokens]);

  return { tokens, loading, loader };
};

export default useTokenFetch;
