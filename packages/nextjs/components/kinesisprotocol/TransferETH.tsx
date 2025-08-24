import React, { FormEvent, useRef, useState } from "react";
import { Address, AddressInput, EtherInput } from "../scaffold-eth";
import { showTxnNotification } from "./Notify";
import { isAddress, parseUnits } from "viem";
import { useWeb3Auth } from "~~/context/Web3Context";

export const TransferETH = () => {
  const { walletClient, sendTransaction } = useWeb3Auth();
  const [recipient, setRecipient] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [transferStatus, setTransferStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const modalRef = useRef<HTMLDivElement>(null);

  const openModal = () => {
    setTransferStatus(null);

    if (!recipient || !isAddress(recipient)) {
      setTransferStatus("Invalid recipient address.");
      return;
    }

    if (!value || isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
      setTransferStatus("Invalid value. Please enter a positive number.");
      return;
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    openModal();
  };

  const handleConfirmTransfer = async () => {
    if (!walletClient) {
      setTransferStatus("Wallet client is not available. Please try again.");
      return;
    }

    setIsLoading(true);
    try {
      const txResponse = await sendTransaction(recipient, parseUnits(value, 18));

      const txHash = txResponse;
      setTransferStatus("Transfer successful! 🎉");
      showTxnNotification(`Transaction successful`, `https://sepolia.arbiscan.io/tx/${txHash}`);
      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (error) {
      console.error("Transfer failed 😔:", error);
      setTransferStatus("Failed to transfer ETH. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full justify-center items-center flex-col space-y-4 p-4">
      <div className="min-h-10">
        {transferStatus && (
          <div className={`mt-4 text-center px-4 py-3 rounded-2xl font-medium ${
            transferStatus.includes("successful") 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : transferStatus.includes("Failed") || transferStatus.includes("Error") || transferStatus.includes("Invalid")
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-blue-50 text-blue-700 border border-blue-200"
          }`}>
            {transferStatus}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-8 w-full">
        <AddressInput
          placeholder="Recipient address"
          value={recipient}
          onChange={e => setRecipient(e)}
          disabled={!walletClient || isLoading}
        />
        <EtherInput
          placeholder="Value in ETH"
          value={value}
          onChange={e => setValue(e)}
          disabled={!walletClient || isLoading}
        />
        <button 
          type="submit" 
          className={`w-full py-4 px-6 rounded-2xl font-semibold text-white text-lg transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
            !walletClient || isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/25 active:from-blue-700 active:to-purple-700"
          }`}
          disabled={!walletClient || isLoading}
        >
          {isLoading ? "Processing..." : "Transfer ETH"}
        </button>
      </form>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-fit max-w-md mx-4" ref={modalRef}>
            <h3 className="font-bold text-center text-2xl text-gray-900 mb-6">Confirm Transfer</h3>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
              <div className="text-center space-y-3">
                <div className="text-4xl">⚡</div>
                <div className="text-lg text-gray-700">
                  Sending <span className="font-bold text-blue-600">{value} ETH</span>
                </div>
                <div className="text-sm text-gray-600">to</div>
                <div className="bg-white rounded-xl p-3 border border-gray-200">
                  <Address address={recipient} />
                </div>
              </div>
            </div>

            <div className="mb-6">
              {isLoading ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="text-center text-gray-600 font-medium">Processing Transaction...</div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ) : (
                transferStatus && (
                  <div className={`text-center px-4 py-3 rounded-2xl font-medium ${
                    transferStatus.includes("successful") 
                      ? "bg-green-50 text-green-700 border border-green-200" 
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    {transferStatus}
                  </div>
                )
              )}
            </div>
            <div className="flex justify-between space-x-4">
              <button 
                className="flex-1 py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={closeModal} 
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className={`flex-1 py-3 px-6 font-semibold rounded-2xl transition-all duration-200 ${
                  isLoading 
                    ? "bg-gray-400 text-white cursor-not-allowed" 
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25 active:from-blue-700 active:to-purple-700"
                }`}
                onClick={handleConfirmTransfer}
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
