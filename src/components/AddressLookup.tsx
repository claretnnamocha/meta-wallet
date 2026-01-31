import React, { useState } from 'react';
import { Search, Eye, Shield, FileText, Clock, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { ethers } from 'ethers';
import { WalletState } from '../types';
import { 
  createProvider, 
  getBalance, 
  getTokenBalance, 
  isContract, 
  isValidAddress,
  isValidTransactionHash,
  getTransaction,
  getTransactionReceipt,
  getBlock
} from '../utils/web3';
import { formatCurrency } from '../utils/formatCurrency';
import Modal from './Modal';
import { useModal } from '../hooks/useModal';

interface AddressLookupProps {
  walletState: WalletState;
}

type LookupType = 'address' | 'transaction';

interface AddressResults {
  type: 'address';
  ethBalance: string;
  tokenBalances: { [symbol: string]: string };
  isContract: boolean;
}

interface TransactionResults {
  type: 'transaction';
  hash: string;
  blockNumber: number | null;
  blockHash: string | null;
  from: string;
  to: string | null;
  value: string;
  gasPrice: string | null;
  gasLimit: string;
  gasUsed: string | null;
  status: number | null;
  confirmations: number | null;
  timestamp: number | null;
  data: string;
}

const AddressLookup: React.FC<AddressLookupProps> = ({ walletState }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AddressResults | TransactionResults | null>(null);
  const [lookupType, setLookupType] = useState<LookupType | null>(null);
  const { modalState, hideModal, showError } = useModal();

  const handleLookup = async () => {
    if (!input.trim()) return;

    const trimmedInput = input.trim();
    let currentLookupType: LookupType;

    // Determine what type of input this is
    if (isValidAddress(trimmedInput)) {
      currentLookupType = 'address';
    } else if (isValidTransactionHash(trimmedInput)) {
      currentLookupType = 'transaction';
    } else {
      showError('Invalid Input', 'Please enter a valid Ethereum address or transaction hash.');
      return;
    }

    setLoading(true);
    setResults(null);
    setLookupType(currentLookupType);

    const provider = createProvider(walletState.rpcNetwork.url);

    try {
      if (currentLookupType === 'address') {
        await handleAddressLookup(trimmedInput, provider);
      } else {
        await handleTransactionLookup(trimmedInput, provider);
      }
    } catch (error) {
      console.error('Lookup error:', error);
      showError('Lookup Failed', `Failed to lookup ${currentLookupType}. Please check the RPC connection and try again.`);
    }

    setLoading(false);
  };

  const handleAddressLookup = async (address: string, provider: any) => {
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
      type: 'address',
      ethBalance,
      tokenBalances,
      isContract: isContractResult
    });
  };

  const handleTransactionLookup = async (hash: string, provider: any) => {
    const [transaction, receipt] = await Promise.all([
      getTransaction(hash, provider),
      getTransactionReceipt(hash, provider)
    ]);

    if (!transaction) {
      showError('Transaction Not Found', 'The transaction hash you entered could not be found on the network.');
      return;
    }

    let timestamp: number | null = null;
    let confirmations: number | null = null;

    if (transaction.blockNumber) {
      try {
        const block = await getBlock(transaction.blockNumber, provider);
        timestamp = block?.timestamp ? Number(block.timestamp) * 1000 : null;
        const currentBlock = await provider.getBlockNumber();
        confirmations = currentBlock - transaction.blockNumber + 1;
      } catch (error) {
        console.error('Error fetching block info:', error);
      }
    }

    setResults({
      type: 'transaction',
      hash: transaction.hash,
      blockNumber: transaction.blockNumber,
      blockHash: transaction.blockHash,
      from: transaction.from,
      to: transaction.to,
      value: transaction.value ? ethers.formatEther(transaction.value) : '0',
      gasPrice: transaction.gasPrice ? ethers.formatUnits(transaction.gasPrice, 'gwei') : null,
      gasLimit: transaction.gasLimit ? transaction.gasLimit.toString() : '0',
      gasUsed: receipt?.gasUsed ? receipt.gasUsed.toString() : null,
      status: receipt?.status ?? null,
      confirmations,
      timestamp,
      data: transaction.data
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLookup();
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Address & Transaction Lookup</h2>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter Ethereum address (0x...) or transaction hash (0x...)"
            />
            <p className="text-gray-500 text-xs mt-1">
              Supports both Ethereum addresses and transaction hashes
            </p>
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

      {results && results.type === 'address' && (
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
                  {formatCurrency(results.ethBalance, 6)} ETH
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
                        {formatCurrency(results.tokenBalances[token.symbol] || '0', 4)}
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

      {results && results.type === 'transaction' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Transaction Information</h3>
            </div>
            
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-2">
                  {results.status === 1 ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : results.status === 0 ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className="font-semibold">
                    {results.status === 1 ? 'Success' : results.status === 0 ? 'Failed' : 'Pending'}
                  </span>
                </div>
                {results.confirmations !== null && (
                  <span className="text-sm text-gray-600">
                    {results.confirmations} confirmations
                  </span>
                )}
              </div>

              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Transaction Hash</h4>
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded break-all">{results.hash}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Block Number</h4>
                  <p className="text-sm">{results.blockNumber || 'Pending'}</p>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">From</h4>
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded break-all">{results.from}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">To</h4>
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded break-all">{results.to || 'Contract Creation'}</p>
                </div>
              </div>

              {/* Value and Gas */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Value</h4>
                  <p className="text-sm font-semibold">{formatCurrency(results.value, 6)} ETH</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Gas Price</h4>
                  <p className="text-sm">{results.gasPrice ? `${formatCurrency(results.gasPrice, 2)} Gwei` : 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Gas Used</h4>
                  <p className="text-sm">{results.gasUsed ? `${parseInt(results.gasUsed).toLocaleString()}` : 'N/A'}</p>
                </div>
              </div>

              {/* Timestamp */}
              {results.timestamp && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Timestamp</h4>
                  <p className="text-sm">{new Date(results.timestamp).toLocaleString()}</p>
                </div>
              )}

              {/* Transaction Data */}
              {results.data && results.data !== '0x' && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Input Data</h4>
                  <div className="bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                    <p className="text-xs font-mono break-all">{results.data}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
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

export default AddressLookup;