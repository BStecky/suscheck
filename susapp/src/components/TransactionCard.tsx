import React from "react";

interface TransactionCardProps {
  signature: string;
  isPoolInitialization: boolean;
  solAmount: number;
  solInitializeAmount: number;
  tokenAmount: number;
  totalTokenSupply: number;
  decimals: number;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  signature,
  isPoolInitialization,
  solInitializeAmount,
  solAmount,
  tokenAmount,
  totalTokenSupply,
  decimals,
}) => {
  const formatTokenAmount = (amount: number, decimals: number): bigint => {
    const tokenAmount = BigInt(amount);
    const formattedAmount = tokenAmount / BigInt(10 ** decimals);
    return formattedAmount;
  };

  const formattedTokenSupply = formatTokenAmount(totalTokenSupply, decimals);
  const tokenPercentage = (tokenAmount / Number(formattedTokenSupply)) * 100;

  return (
    <div className="flex flex-col bg-gray-700 text-white p-4 m-2 rounded-sm shadow gap-4 break-words">
      {isPoolInitialization ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="outline outline-1 outline-gray-900 p-2 rounded-sm">
            <p className="text-md">
              Pool initialized with {solInitializeAmount} SOL and{" "}
              {Math.abs(tokenAmount).toLocaleString()} tokens.{" "}
            </p>
          </div>
          <div className="outline outline-1 outline-gray-900 p-2 rounded-sm">
            <p className="text-sm">Percentage of Tokens Deposited</p>
            <p>{Math.abs(tokenPercentage).toFixed(2)}%</p>
          </div>
        </section>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border-2 border-rose-500 p-2 rounded-sm">
            <p className="text-md">SOL Spent: {solAmount.toLocaleString()}</p>
            <p className="text-md">
              Tokens Sniped: {tokenAmount.toLocaleString()}
            </p>
          </div>
          <div className="p-2 rounded-sm border-2 border-rose-500">
            <p className="text-sm">Percentage of Total Supply Sniped:</p>
            <p className="text-lg">{tokenPercentage.toFixed(2)}%</p>
          </div>
        </section>
      )}
      <h3 className="text-xs sm:text-sm md:text-md font-semibold break-words">
        Transaction Signature: {signature}
      </h3>
    </div>
  );
};

export default TransactionCard;
