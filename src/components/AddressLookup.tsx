import React, { useState } from 'react';
import { Search, Eye, Shield } from 'lucide-react';
import { WalletState } from '../types';
import { createProvider, getBalance, getTokenBalance, isContract, isValidAddress } from '../utils/web3';

interface AddressLookupProps {
  walletState: WalletState;
}

const AddressLookup: React.FC<AddressLookupProps> = ({ walletState }) => {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    ethBalance: string;
    tokenBalances: { [symbol: string]: string };
    isContract: boolean;
  } | null>(null);
  const [error, setError] = useState('');

  const handleLookup = async () => {
    if (!address) return;

    if (!isValidAddress(address)) {
      setError('Invalid Ethereum address');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    const provider = createProvider(walletState.rpcNetwork.url);

    try {
      const [ethBalance, isContractResult] = await Promise.all([
        getBalance(address, provider),
        isContract(address, provider)
      ]);

      const tokenBalances: { [symbol: string]: string } = {};

      for (const token of walletState.tokens) {
        try {
          const balance = await getTokenBalance(token.address, address, provider);
          tokenBalances[token.symbol] = balance;
        } catch (error) {
          console.error(`Error fetching balance for token ${token.symbol}:`, error);
          tokenBalances[token.symbol] = '0';
        }
      }

      setResults({
        ethBalance,
        tokenBalances,
        isContract: isContractResult
      });
    } catch (error) {
      setError('Failed to lookup address. Please check the RPC connection.');
    }

    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLookup();
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Address Lookup</h2>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter Ethereum address (0x...)"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <button
            onClick={handleLookup}
            disabled={loading}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Looking up...' : 'Lookup'}</span>
          </button>
        </div>
      </div>

      {results && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Address Information</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">ETH Balance</h4>
                <div className="text-2xl font-bold text-gray-800">
                  {parseFloat(results.ethBalance).toFixed(6)} ETH
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Account Type</h4>
                <div className="flex items-center space-x-2">
                  <Shield className={`w-5 h-5 ${results.isContract ? 'text-orange-500' : 'text-green-500'}`} />
                  <span className="font-semibold">
                    {results.isContract ? 'Smart Contract' : 'External Account'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {walletState.tokens.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Token Balances</h3>
              <div className="space-y-3">
                {walletState.tokens.map((token) => (
                  <div key={token.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-xs">{token.symbol.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-semibold">{token.symbol}</div>
                        <div className="text-sm text-gray-600">{token.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {parseFloat(results.tokenBalances[token.symbol] || '0').toFixed(4)}
                      </div>
                      <div className="text-sm text-gray-600">{token.symbol}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressLookup;