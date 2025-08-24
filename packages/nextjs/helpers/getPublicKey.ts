import { EthereumSigningProvider } from "@web3auth/ethereum-mpc-provider";
import { COREKIT_STATUS, makeEthereumSigner, Web3AuthMPCCoreKit } from "@web3auth/mpc-core-kit";
import { createWalletClient, custom } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { chainConfig } from "~~/helpers/config";

export const getPublicKey = async (coreInstance: Web3AuthMPCCoreKit): Promise<string> => {
  if (!coreInstance) throw new Error("Core instance not provided");
  if (coreInstance.status !== COREKIT_STATUS.LOGGED_IN) throw new Error("User is not logged in");

  const evmProvider = new EthereumSigningProvider({ config: { chainConfig } });
  await evmProvider.setupProvider(makeEthereumSigner(coreInstance));

  const walletClient = createWalletClient({ chain: arbitrumSepolia, transport: custom(evmProvider) });
  const addresses = await walletClient.getAddresses();
  if (!addresses.length) throw new Error("No addresses available");

  return addresses[0];
}; 