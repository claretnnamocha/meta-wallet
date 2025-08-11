import React, { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { WalletState, Transaction } from '../types';
import { createProvider, createWallet, sendEther, sendToken, isValidAddress } from '../utils/web3';
import { addTransaction } from '../utils/storage';

interface SendTransactionProps {
  walletState: WalletState;
  onStateChange: (state: WalletState) => void;
}

const SendTransaction: React.FC<SendTransactionProps> = ({ walletState, onStateChange }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ recipient?: string; amount?: string }>({});

  const activeAccount = walletState.accounts.find(acc => acc.id === walletState.activeAccountId);

  const validateForm = () => {
    const newErrors: { recipient?: string; amount?: string } = {};

    if (!recipient) {
      newErrors.recipient = 'Recipient address is required';
    } else if (!isValidAddress(recipient)) {
      newErrors.recipient = 'Invalid Ethereum address';
    }

    if (!amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = async () => {
    if (!activeAccount || !validateForm()) return;

    setLoading(true);
    const provider = createProvider(walletState.rpcNetwork.url);
    const wallet = createWallet(activeAccount.privateKey, provider);

    try {
      let txResponse;
      let tokenSymbol = 'ETH';

      if (selectedToken === 'ETH') {
        txResponse = await sendEther(wallet, recipient, amount);
      } else {
        const token = walletState.tokens.find(t => t.id === selectedToken);
        if (!token) throw new Error('Token not found');
        
        txResponse = await sendToken(wallet, token, recipient, amount);
        tokenSymbol = token.symbol;
      }

      const transaction: Transaction = {
        id: Date.now().toString(),
        hash: txResponse.hash,
        from: activeAccount.address,
        to: recipient,
        value: amount,
        token: selectedToken === 'ETH' ? undefined : tokenSymbol,
        timestamp: Date.now(),
        status: 'pending'
      };

      const newState = addTransaction(transaction);
      onStateChange(newState);

      // Clear form
      setRecipient('');
      setAmount('');
      setSelectedToken('ETH');
      
      alert(`Transaction sent! Hash: ${txResponse.hash}`);
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Please try again.');
    }

    setLoading(false);
  };

  if (!activeAccount) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-gray-500">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No active account</p>
          <p className="text-sm">Please select an account first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Transaction</h2>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Account</label>
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="font-semibold">{activeAccount.name}</div>
              <div className="text-sm text-gray-600 font-mono">{activeAccount.address}</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset</label>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ETH">ETH (Ethereum)</option>
              {walletState.tokens.map((token) => (
                <option key={token.id} value={token.id}>
                  {token.symbol} ({token.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Address</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.recipient ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0x..."
            />
            {errors.recipient && (
              <p className="text-red-500 text-sm mt-1">{errors.recipient}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>

          <button
            onClick={handleSend}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Sending...' : 'Send Transaction'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendTransaction;