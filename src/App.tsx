import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AccountManager from './components/AccountManager';
import TokenManager from './components/TokenManager';
import SendTransaction from './components/SendTransaction';
import TransactionHistory from './components/TransactionHistory';
import AddressLookup from './components/AddressLookup';
import Settings from './components/Settings';
import { WalletState } from './types';
import { loadWalletState } from './utils/storage';

function App() {
  const [activeTab, setActiveTab] = useState('accounts');
  const [walletState, setWalletState] = useState<WalletState>(loadWalletState());

  useEffect(() => {
    // Update document title based on active network
    document.title = `MetaWallet - ${walletState.rpcNetwork.name}`;
  }, [walletState.rpcNetwork]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'accounts':
        return <AccountManager walletState={walletState} onStateChange={setWalletState} />;
      case 'tokens':
        return <TokenManager walletState={walletState} onStateChange={setWalletState} />;
      case 'send':
        return <SendTransaction walletState={walletState} onStateChange={setWalletState} />;
      case 'history':
        return <TransactionHistory walletState={walletState} />;
      case 'lookup':
        return <AddressLookup walletState={walletState} />;
      case 'settings':
        return <Settings walletState={walletState} onStateChange={setWalletState} />;
      default:
        return <AccountManager walletState={walletState} onStateChange={setWalletState} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-auto">
        {renderActiveTab()}
      </div>
    </div>
  );
}

export default App;