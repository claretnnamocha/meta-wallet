import React, { useState } from "react";
import { Settings as SettingsIcon, Globe } from "lucide-react";
import { WalletState, RpcNetwork } from "../types";
import { updateRpcNetwork } from "../utils/storage";

interface SettingsProps {
  walletState: WalletState;
  onStateChange: (state: WalletState) => void;
}

const Settings: React.FC<SettingsProps> = ({ walletState, onStateChange }) => {
  const [rpcUrl, setRpcUrl] = useState(walletState.rpcNetwork.url);
  const [rpcName, setRpcName] = useState(walletState.rpcNetwork.name);

  const handleUpdateRpc = () => {
    if (!rpcUrl || !rpcName) return;

    const network: RpcNetwork = {
      name: rpcName,
      url: rpcUrl,
    };

    const newState = updateRpcNetwork(network);
    onStateChange(newState);
  };

  const presetNetworks = [
    { name: "Keeway", url: "https://rpc.keeway.io" },
    { name: "Ganache", url: "http://localhost:8545" },
    { name: "Hardhat", url: "http://localhost:8545" },
    {
      name: "Ethereum Mainnet",
      url: "https://mainnet.infura.io/v3/YOUR_PROJECT_ID",
    },
    {
      name: "Sepolia Testnet",
      url: "https://sepolia.infura.io/v3/YOUR_PROJECT_ID",
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Globe className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">RPC Network Configuration</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Network Name
            </label>
            <input
              type="text"
              value={rpcName}
              onChange={(e) => setRpcName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Network Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RPC URL
            </label>
            <input
              type="text"
              value={rpcUrl}
              onChange={(e) => setRpcUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="http://localhost:8545"
            />
          </div>

          <button
            onClick={handleUpdateRpc}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            Update Network
          </button>
        </div>

        <div className="mt-8">
          <h4 className="font-medium text-gray-700 mb-3">Quick Presets</h4>
          <div className="grid gap-2">
            {presetNetworks.map((network, index) => (
              <button
                key={index}
                onClick={() => {
                  setRpcName(network.name);
                  setRpcUrl(network.url);
                }}
                className="text-left p-3 border border-gray-200 rounded-md hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <div className="font-semibold text-sm">{network.name}</div>
                <div className="text-xs text-gray-600">{network.url}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start space-x-2">
            <SettingsIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Important Notes</h4>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>
                  • For mainnet/testnet access, replace YOUR_PROJECT_ID with
                  your actual Infura project ID
                </li>
                <li>
                  • Always verify the RPC endpoint before adding accounts or
                  tokens
                </li>
                <li>
                  • Local networks (Ganache/Hardhat) should use
                  http://localhost:8545
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
