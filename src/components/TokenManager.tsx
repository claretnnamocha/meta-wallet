import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Token, WalletState } from "../types";
import { addToken, loadWalletState } from "../utils/storage";
import { createProvider, getTokenInfo } from "../utils/web3";
import Modal from "./Modal";
import { useModal } from "../hooks/useModal";

interface TokenManagerProps {
  walletState: WalletState;
  onStateChange: (state: WalletState) => void;
}

const TokenManager: React.FC<TokenManagerProps> = ({
  walletState,
  onStateChange,
}) => {
  const [showAddToken, setShowAddToken] = useState(false);
  const [tokenAddress, setTokenAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const { modalState, hideModal, showError } = useModal();

  const handleAddToken = async () => {
    if (!tokenAddress) return;

    setLoading(true);
    const provider = createProvider(walletState.rpcNetwork.url);

    try {
      const tokenInfo = await getTokenInfo(tokenAddress, provider);

      const token: Token = {
        id: Date.now().toString(),
        address: tokenAddress,
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
        decimals: Number(tokenInfo.decimals),
      };

      const newState = addToken(token);
      onStateChange(newState);
      setTokenAddress("");
      setShowAddToken(false);
    } catch (error) {
      showError("Failed to Add Token", "Failed to fetch token information. Please check the contract address and try again.");
    }

    setLoading(false);
  };

  const removeToken = (tokenId: string) => {
    const state = loadWalletState();
    const newState = {
      ...state,
      tokens: state.tokens.filter((token) => token.id !== tokenId),
    };
    onStateChange(newState);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Tokens</h2>
        <button
          onClick={() => setShowAddToken(!showAddToken)}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Token</span>
        </button>
      </div>

      {showAddToken && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">Add ERC20 Token</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token Contract Address
              </label>
              <input
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0x..."
              />
            </div>
            <button
              onClick={handleAddToken}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Loading..." : "Add Token"}
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {walletState.tokens.map((token) => (
          <div
            key={token.id}
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {token.symbol.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{token.name}</h3>
                    <p className="text-gray-600">{token.symbol}</p>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500 font-mono">
                  {token.address}
                </div>
                <div className="text-xs text-gray-400">
                  Decimals: {token.decimals}
                </div>
              </div>

              <button
                onClick={() => removeToken(token.id)}
                className="text-red-400 hover:text-red-600 p-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {walletState.tokens.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Plus className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No tokens added yet</p>
          <p className="text-sm">
            Click "Add Token" to start tracking ERC20 tokens
          </p>
        </div>
      )}

      <Modal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        showCancel={modalState.showCancel}
      />
    </div>
  );
};

export default TokenManager;
