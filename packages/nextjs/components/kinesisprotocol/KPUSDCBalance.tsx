import React, { useState } from "react";
import {
  ARBKPContractAddress,
  ARBSEP_USDC_CONTRACT,
  OPKPContractAddress,
  OPSEP_USDC_CONTRACT,
} from "~~/helpers/config";
import { useKPUSDCBalance } from "~~/hooks/useKPUSDCBalance";

const KPUSDCBalance = () => {
  const [selectedChain, setSelectedChain] = useState("Arbitrum");

  const chainConfig = {
          Arbitrum: {
        usdcContractAddress: ARBSEP_USDC_CONTRACT,
        kpContractAddress: ARBKPContractAddress,
      },
      Optimism: {
        usdcContractAddress: OPSEP_USDC_CONTRACT,
        kpContractAddress: OPKPContractAddress,
      },
  };

  const { usdcContractAddress, kpContractAddress } = chainConfig[selectedChain as keyof typeof chainConfig];
  const { balance, isLoading, error } = useKPUSDCBalance(usdcContractAddress, kpContractAddress);

  const handleChainChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedChain(event.target.value);
  };

  if (isLoading) {
    return <div className="text-xl">Loading...</div>;
  }

  if (error) {
    return <div className="text-xl">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col space-y-2">
      <select
        value={selectedChain}
        onChange={handleChainChange}
        className="select select-bordered w-full max-w-xs"
      >
        <option value="Arbitrum">Arbitrum Sepolia</option>
        <option value="Optimism">Optimism Sepolia</option>
      </select>
      <div className="text-xl">KP Vault {parseFloat(balance).toFixed(2)} USDC</div>
    </div>
  );
};

export default KPUSDCBalance; 