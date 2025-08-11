import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Copy, Check, Eye, EyeOff, Wallet } from 'lucide-react';
import { Account, Token, WalletState } from '../types';
import { getAddressFromPrivateKey, createProvider, getBalance, getTokenBalance } from '../utils/web3';
import { addAccount, setActiveAccount, loadWalletState } from '../utils/storage';

interface AccountManagerProps {
  walletState: WalletState;
  onStateChange: (state: WalletState) => void;
}

const AccountManager: React.FC<AccountManagerProps> = ({ walletState, onStateChange }) => {
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newPrivateKey, setNewPrivateKey] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [balances, setBalances] = useState<{ [key: string]: { eth: string; tokens: { [tokenId: string]: string } } }>({});
  const [loading, setLoading] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const fetchBalances = async () => {
    if (!walletState.activeAccountId) return;
    
    setLoading(true);
    const provider = createProvider(walletState.rpcNetwork.url);
    const activeAccount = walletState.accounts.find(acc => acc.id === walletState.activeAccountId);
    
    if (!activeAccount) {
      setLoading(false);
      return;
    }

    try {
      const ethBalance = await getBalance(activeAccount.address, provider);
      const tokenBalances: { [tokenId: string]: string } = {};

      for (const token of walletState.tokens) {
        try {
          const balance = await getTokenBalance(token.address, activeAccount.address, provider);
          tokenBalances[token.id] = balance;
        } catch (error) {
          console.error(`Error fetching balance for token ${token.symbol}:`, error);
          tokenBalances[token.id] = '0';
        }
      }

      setBalances(prev => ({
        ...prev,
        [activeAccount.id]: {
          eth: ethBalance,
          tokens: tokenBalances
        }
      }));
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchBalances();
  }, [walletState.activeAccountId, walletState.rpcNetwork.url, walletState.tokens]);

  const handleAddAccount = () => {
    if (!newAccountName || !newPrivateKey) return;

    try {
      const address = getAddressFromPrivateKey(newPrivateKey);
      const account: Account = {
        id: Date.now().toString(),
        name: newAccountName,
        privateKey: newPrivateKey,
        address
      };

      const newState = addAccount(account);
      onStateChange(newState);
      setNewAccountName('');
      setNewPrivateKey('');
      setShowAddAccount(false);
    } catch (error) {
      alert('Invalid private key');
    }
  };

  const handleAccountSwitch = (accountId: string) => {
    const newState = setActiveAccount(accountId);
    onStateChange(newState);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(`${type}-${text}`);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const activeAccount = walletState.accounts.find(acc => acc.id === walletState.activeAccountId);
  const activeBalances = activeAccount ? balances[activeAccount.id] : null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Accounts</h2>
        <div className="flex space-x-3">
          <button
            onClick={fetchBalances}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddAccount(!showAddAccount)}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {showAddAccount && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Account</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
              <input
                type="text"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="My Account"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Private Key</label>
              <div className="relative">
                <input
                  type={showPrivateKey ? "text" : "password"}
                  value={newPrivateKey}
                  onChange={(e) => setNewPrivateKey(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0x..."
                />
                <button
                  type="button"
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              onClick={handleAddAccount}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              Add Account
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {walletState.accounts.map((account) => (
          <div
            key={account.id}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              account.id === walletState.activeAccountId
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleAccountSwitch(account.id)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{account.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-600 font-mono">{account.address}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(account.address, 'address');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {copiedAddress === `address-${account.address}` ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              
              {account.id === walletState.activeAccountId && activeBalances && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {parseFloat(activeBalances.eth).toFixed(4)} ETH
                  </div>
                  {walletState.tokens.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {walletState.tokens.map((token) => (
                        <div key={token.id} className="text-sm text-gray-600">
                          {activeBalances.tokens[token.id] ? 
                            `${parseFloat(activeBalances.tokens[token.id]).toFixed(4)} ${token.symbol}` : 
                            `- ${token.symbol}`
                          }
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {walletState.accounts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No accounts added yet</p>
          <p className="text-sm">Click "Add Account" to get started</p>
        </div>
      )}
    </div>
  );
};

export default AccountManager;