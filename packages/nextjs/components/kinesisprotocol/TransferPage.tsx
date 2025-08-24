"use client";

import { useState } from "react";
import { TransferETH } from "./TransferETH";
import { TransferUSDC } from "~~/components/kinesisprotocol/TransferUSDC";
import { 
  CurrencyDollarIcon, 
  SparklesIcon,
  ArrowPathIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline";

const TransferPage = () => {
  const [activeTab, setActiveTab] = useState("USDC");

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
                Cross-Chain Transfer
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Seamlessly transfer your assets between different blockchain networks using Chainlink CCIP technology
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 mt-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <GlobeAltIcon className="w-5 h-5 text-blue-500" />
                <span>Multi-chain Support</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowPathIcon className="w-5 h-5 text-green-500" />
                <span>Instant Transfers</span>
              </div>
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-purple-500" />
                <span>CCIP Technology</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            {/* Modern Tabs */}
            <div className="flex bg-gray-100 rounded-2xl p-2 mb-8">
              <button
                role="tab"
                className={`flex-1 flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === "USDC" 
                    ? "bg-white text-blue-600 shadow-md" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab("USDC")}
              >
                <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                Transfer USDC
              </button>
              <button
                role="tab"
                className={`flex-1 flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === "ETH" 
                    ? "bg-white text-blue-600 shadow-md" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab("ETH")}
              >
                <SparklesIcon className="w-5 h-5 mr-2" />
                Transfer ETH
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px] flex items-center justify-center">
              {activeTab === "USDC" && <TransferUSDC />}
              {activeTab === "ETH" && <TransferETH />}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TransferPage;
