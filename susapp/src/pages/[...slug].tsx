import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../database/firebaseConfig";
import TokenPage from "@/components/TokenPage"; // Import the new TokenPage component

const SlugPage: React.FC = () => {
  const router = useRouter();
  const [tokenData, setTokenData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const tokenAddress = router.query.slug ? router.query.slug[0] : null;

  useEffect(() => {
    const fetchTokenData = async () => {
      if (!tokenAddress || tokenAddress.length !== 44) {
        setTokenData(null);
        return;
      }
      setIsLoading(true);
      const q = query(
        collection(db, "raydiumTokens"),
        where("tokenAddress", "==", tokenAddress)
      );
      const docSnapshots = await getDocs(q);
      const data = docSnapshots.docs.map((doc) => doc.data());
      if (data.length > 0) {
        setTokenData(data[0]);
      } else {
        setTokenData(null);
      }
      setIsLoading(false);
    };

    fetchTokenData();
  }, [tokenAddress]);

  if (isLoading) {
    return <div className="text-gray-200 text-center m-8">Loading...</div>;
  }

  return <TokenPage tokenData={tokenData} />;
};

export default SlugPage;
