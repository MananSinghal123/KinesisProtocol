"use client";

import { useEffect, useState } from "react";
import {
  // COREKIT_STATUS,
  // EnableMFAParams,
  // FactorKeyTypeShareDescription,
  // generateFactorKey,
  keyToMnemonic,
} from "@web3auth/mpc-core-kit";
import { BN } from "bn.js";
import { useWeb3Auth } from "~~/context/Web3Context";
import { getWeb3AuthInstance } from "~~/helpers/web3Auth";
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  UserIcon,
  CogIcon,
  QuestionMarkCircleIcon
} from "@heroicons/react/24/outline";

const SettingsPage = () => {
  const { user } = useWeb3Auth();
  const [coreInstance, setCoreInstance] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initCoreInstance = async () => {
      try {
        const instance = await getWeb3AuthInstance();
        setCoreInstance(instance);

        if (!coreInstance) {
          setError("User is not logged in.");
        }
      } catch (err: any) {
        console.error("Error initializing core instance:", err);
        setError(err.message);
      }
    };

    initCoreInstance();
  }, [user]);

  const enableMFA = async () => {
    if (!coreInstance) {
      console.error("Web3Auth CoreKit not initialized");
      return;
    }
    try {
      const factorKey = await coreInstance.enableMFA({});
      const factorKeyMnemonic = keyToMnemonic(factorKey);
      localStorage.setItem("factorKey", factorKey);
      console.log(
        "MFA enabled, device factor stored in local store, deleted hashed cloud key, your backup factor key: ",
        factorKeyMnemonic,
      );
      console.log("MFA Enabled");
    } catch (error) {
      console.error("Error enabling MFA:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Signed In</h2>
          <p className="text-gray-600">Please sign in to access your settings.</p>
        </div>
      </div>
    );
  }

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
                Account Settings
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Manage your account security and preferences
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CogIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Security Settings</h2>
              <p className="text-gray-600">Configure your account security preferences</p>
            </div>

            {/* MFA Section */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200 mb-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Multi-Factor Authentication</h3>
                  <p className="text-red-700 mb-4">
                    <strong>Warning:</strong> Enabling MFA will store a device factor in your local storage and delete the hashed cloud key. 
                    Make sure to save your backup factor key securely - you might lose access to your account if you don't!
                  </p>
                  <button 
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200 flex items-center space-x-2"
                    onClick={enableMFA}
                  >
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>Enable MFA</span>
                  </button>
                </div>
              </div>
            </div>

            {/* User Info Section */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                Account Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Name:</span>
                  <span className="text-gray-900 font-semibold">{user.name}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Email:</span>
                  <span className="text-gray-900 font-semibold">{user.email}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Provider:</span>
                  <span className="text-gray-900 font-semibold capitalize">Google</span>
                </div>
              </div>
            </div>

            {/* Support Section */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center space-x-3 mb-3">
                <QuestionMarkCircleIcon className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Need Help?</h3>
              </div>
              <p className="text-blue-800 mb-4">
                If you need assistance with your account or have questions about security settings, 
                our support team is here to help.
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
