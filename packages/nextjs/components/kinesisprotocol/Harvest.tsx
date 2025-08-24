import { FormEvent, useEffect, useRef, useState } from "react";
import { Address, IntegerInput } from "../scaffold-eth";
import KPUSDCBalance from "./KPUSDCBalance";
import { showTxnNotification } from "./Notify";
import USDCBalance from "./USDCBalance";
import { erc20Abi, parseUnits } from "viem";
import { readContract, writeContract } from "viem/actions";
import { arbitrumSepolia } from "viem/chains";
import { useWeb3Auth } from "~~/context/Web3Context";
import { ARBKPContractABI, ARBKPContractAddress, ARBSEP_USDC_CONTRACT, OPKPContractAddress } from "~~/helpers/config";
import { getTotalSupply, getUserShares, previewAssetsToShares } from "~~/utils/contract";
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  WalletIcon, 
  ChartBarIcon, 
  CogIcon, 
  SparklesIcon,
  ShieldCheckIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline";

const Harvest = () => {
  const { walletClient, userAddresses } = useWeb3Auth();
  const [activeTab, setActiveTab] = useState("Deposit");
  const [amount, setAmount] = useState<any>("");
  const [preview, setPreview] = useState<any>();
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refresh, setRefresh] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [userShares, setUserShares] = useState<any>(null);
  const [totalSupply, setTotalSupply] = useState<any>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tab: string) => setActiveTab(tab);

  const validateInputs = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setStatus("Invalid amount.");
      return false;
    }
    return true;
  };

  const openModal = () => {
    setStatus(null);
    if (!walletClient) {
      setStatus("Please reconnect your wallet and try again.");
      return;
    }

    if (!validateInputs()) return;

    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleApprove = async (amount: bigint) => {
    try {
      const approvalTx = await writeContract(walletClient!, {
        address: ARBSEP_USDC_CONTRACT,
        abi: erc20Abi,
        functionName: "approve",
        args: [ARBKPContractAddress, amount],
        chain: arbitrumSepolia,
        account: userAddresses[0],
      });

      showTxnNotification("Approval successful!", `https://sepolia.arbiscan.io/tx/${approvalTx}`);
      return true;
    } catch (error) {
      console.error("Approval failed:", error);
      setStatus("Approval failed. Please try again.");
      return false;
    }
  };

  const handleDeposit = async (amount: bigint) => {
    try {
      const depositTx = await writeContract(walletClient!, {
        address: ARBKPContractAddress,
        abi: ARBKPContractABI,
        functionName: "userDeposit",
        args: [amount],
        chain: arbitrumSepolia,
        account: userAddresses[0],
      });

      showTxnNotification("Deposit successful!", `https://sepolia.arbiscan.io/tx/${depositTx}`);
    } catch (error) {
      console.error("Deposit failed:", error);
      setStatus("Deposit failed. Please try again.");
    }
  };

  const handleWithdraw = async (amount: bigint) => {
    try {
      const withdrawTx = await writeContract(walletClient!, {
        address: ARBKPContractAddress,
        abi: ARBKPContractABI,
        functionName: "userWithdraw",
        args: [amount],
        chain: arbitrumSepolia,
        account: userAddresses[0],
      });

      showTxnNotification("Withdrawal successful!", `https://sepolia.arbiscan.io/tx/${withdrawTx}`);
    } catch (error) {
      console.error("Withdrawal failed:", error);
      setStatus("Withdrawal failed. Please try again.");
    }
  };

  const handleConfirmAction = async () => {
    if (!walletClient) {
      setStatus("Wallet client is not available. Please try again.");
      return;
    }

    setIsLoading(true);
    try {
      const depositAmount = BigInt(Number(amount) * 1e6);

      if (activeTab === "Deposit") {
        const userBalance = await readContract(walletClient, {
          address: ARBSEP_USDC_CONTRACT,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [userAddresses[0]],
        });

        if (userBalance < depositAmount) {
          setStatus("Insufficient USDC balance.");
          setIsLoading(false);
          return;
        }

        const isApproved = await handleApprove(depositAmount);
        if (!isApproved) {
          setIsLoading(false);
          return;
        }

        await handleDeposit(depositAmount);
      } else if (activeTab === "Withdraw") {
        const withdrawAmountInWei = parseUnits(preview, 18);
        await handleWithdraw(withdrawAmountInWei);
      }

      setStatus(`${activeTab} successful! 🎉`);
      setTimeout(closeModal, 2000);
      setRefresh(true);
    } catch (error) {
      console.error(`${activeTab} failed:`, error);
      setStatus(`Failed to ${activeTab.toLowerCase()}. Please try again.`);
    } finally {
      setIsLoading(false);
      setRefresh(false);
    }
  };

  useEffect(() => {
    if (walletClient && userAddresses.length) {
      getUserShares(walletClient, ARBKPContractAddress, userAddresses[0], ARBKPContractABI).then(setUserShares);
      getTotalSupply(walletClient, ARBKPContractAddress, ARBKPContractABI).then(setTotalSupply);
    }
  }, [walletClient, userAddresses, refresh]);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (walletClient && userAddresses.length && amount && Number(amount) > 0) {
        await updatePreview();
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [amount, activeTab]);

  const updatePreview = async () => {
    const parsedAmount = BigInt(Number(amount) * 1e6);

    try {
      let result;
      result = await previewAssetsToShares(walletClient, ARBKPContractAddress, ARBKPContractABI, parsedAmount);

      setPreview(result || "0");
    } catch (error) {
      console.error("Error updating preview:", error);
      setPreview("0");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                KinesisProtocol Vault
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Manage your cross-chain yield farming positions with advanced DeFi strategies
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {walletClient && userAddresses.length ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {/* USDC Balances Card */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mr-4">
                      <WalletIcon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">USDC Balances</h4>
                  </div>
                  <div className="space-y-4">
                    <KPUSDCBalance />
                    <USDCBalance />
                  </div>
                </div>

                {/* KP Shares Card */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4">
                      <ChartBarIcon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">KinesisProtocol Shares</h4>
                  </div>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                      <span className="font-medium text-gray-700">Your KP Shares</span>
                      <span className="text-lg font-bold text-gray-900">
                        {userShares ? (
                          `${userShares.toString()} KP`
                        ) : (
                          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                      <span className="font-medium text-gray-700">Total KP Supply</span>
                      <span className="text-lg font-bold text-gray-900">
                        {totalSupply ? (
                          `${totalSupply.toString()} KP`
                        ) : (
                          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Smart Contracts Card */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                      <CogIcon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Smart Contracts</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <div className="text-sm text-gray-500 mb-2 font-medium">Arbitrum Sepolia</div>
                      <Address address={ARBKPContractAddress} />
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <div className="text-sm text-gray-500 mb-2 font-medium">Optimism Sepolia</div>
                      <Address disableAddressLink={true} address={OPKPContractAddress} />
                    </div>
                  </div>
                </div>

                {/* Vault Performance Card */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-4">
                      <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Vault Performance</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white text-center">
                      <div className="text-3xl font-bold mb-2">5.6%</div>
                      <div className="text-sm opacity-90">Current APY</div>
                    </div>
                    <div className="text-sm text-gray-600 text-center">
                      Powered by AAVE & Chainlink CCIP
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md border border-gray-100">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheckIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Welcome to KinesisProtocol</h3>
                <p className="text-gray-600 leading-relaxed">
                  Sign in to access your cross-chain yield farming vault and start earning optimized returns
                </p>
              </div>
            </div>
          )}

          {/* Action Section */}
          <div className="w-full max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Vault Actions</h3>
              
              {/* Modern Tabs */}
              <div className="flex bg-gray-100 rounded-2xl p-2 mb-8">
                <button
                  role="tab"
                  className={`flex-1 flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === "Deposit" 
                      ? "bg-white text-blue-600 shadow-md" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => handleTabChange("Deposit")}
                >
                  <ArrowUpIcon className="w-5 h-5 mr-2" />
                  Deposit
                </button>
                <button
                  role="tab"
                  className={`flex-1 flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === "Withdraw" 
                      ? "bg-white text-blue-600 shadow-md" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => handleTabChange("Withdraw")}
                >
                  <ArrowDownIcon className="w-5 h-5 mr-2" />
                  Withdraw
                </button>
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {activeTab === "Deposit" && (
                  <form
                    onSubmit={(e: FormEvent) => {
                      e.preventDefault();
                      openModal();
                    }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-gray-700">Amount to Deposit</label>
                      <IntegerInput
                        disabled={!walletClient || !userAddresses.length}
                        placeholder="Enter USDC amount"
                        value={amount}
                        onChange={e => setAmount(e)}
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-gray-700">Estimated KP to receive</label>
                      <IntegerInput
                        disabled={true}
                        placeholder="Calculating..."
                        value={preview}
                        onChange={e => setAmount(e)}
                      />
                    </div>
                    <button 
                      disabled={!walletClient || !userAddresses.length} 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <ArrowUpIcon className="w-5 h-5 mr-2 inline" />
                      Deposit USDC
                    </button>
                  </form>
                )}
                
                {activeTab === "Withdraw" && (
                  <form
                    onSubmit={(e: FormEvent) => {
                      e.preventDefault();
                      openModal();
                    }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-gray-700">Amount of USDC to withdraw</label>
                      <IntegerInput
                        placeholder="Enter USDC amount"
                        value={amount}
                        onChange={e => setAmount(e)}
                        disabled={!walletClient || !userAddresses.length}
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-gray-700">Estimated shares to burn</label>
                      <IntegerInput
                        placeholder="Calculating..."
                        value={preview}
                        onChange={e => setAmount(e)}
                        disabled={true}
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={!walletClient || !userAddresses.length} 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <ArrowDownIcon className="w-5 h-5 mr-2 inline" />
                      Withdraw USDC
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="bg-white rounded-3xl shadow-2xl relative z-10 p-0 min-w-[400px] max-w-[500px] w-full mx-4" ref={modalRef}>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-3xl">
              <h3 className="text-xl font-bold text-center">Confirm {activeTab}</h3>
            </div>
            
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="text-3xl font-bold text-gray-900 mb-2">{amount} USDC</div>
                <div className="text-gray-600">
                  {activeTab === "Deposit" ? "into" : "from"} KinesisProtocol Vault
                </div>
              </div>

              <div className="mb-8">
                {isLoading ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="text-gray-600 font-medium">Processing transaction...</div>
                  </div>
                ) : (
                  status && (
                    <div className={`p-4 rounded-2xl font-medium flex items-center justify-center gap-3 ${
                      status.includes("Failed") 
                        ? "bg-red-50 text-red-700 border border-red-200" 
                        : "bg-green-50 text-green-700 border border-green-200"
                    }`}>
                      {status.includes("Failed") ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {status}
                    </div>
                  )
                )}
              </div>
              
              <div className="flex gap-4">
                <button 
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200" 
                  onClick={closeModal} 
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  onClick={handleConfirmAction}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Harvest;
