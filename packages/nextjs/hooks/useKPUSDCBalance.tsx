import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { erc20Abi } from "viem";
import { readContract } from "viem/actions";
import { useWeb3Auth } from "~~/context/Web3Context";

export const useKPUSDCBalance = (usdcContractAddress: string, kpContractAddress: string) => {
  const { publicClient } = useWeb3Auth();
  const [balance, setBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (publicClient && kpContractAddress && usdcContractAddress) {
          const kpUSDCBalanceBigInt = await readContract(publicClient, {
            address: usdcContractAddress,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [kpContractAddress],
          });
          setBalance(formatUnits(kpUSDCBalanceBigInt, 6));
        }
      } catch (error) {
        console.error("Error fetching KP contract balance:", error);
        setError("Failed to fetch balance. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [publicClient, usdcContractAddress, kpContractAddress]);

  return { balance, isLoading, error };
}; 