import Image from "next/image";
import { Inter } from "next/font/google";
import TokenGrid from "@/components/TokenGrid";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`flex min-h-screen h-full bg-gray-800 flex-col items-center justify-start ${inter.className}`}
    >
      <div className="text-gray-200 text-center m-8">
        <h1 className="text-4xl font-bold">
          <span className="">SUS </span>CHECK
        </h1>
        <h2 className="text-2xl">
          Check solana tokens for suspicious activities.
        </h2>
      </div>

      <TokenGrid />
    </main>
  );
}
