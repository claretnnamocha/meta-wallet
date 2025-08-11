import React from 'react';
import { ExternalLink, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import { WalletState } from '../types';

interface TransactionHistoryProps {
  walletState: WalletState;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ walletState }) => {
  const activeAccount = walletState.accounts.find(acc => acc.id === walletState.activeAccountId);
  
  const accountTransactions = walletState.transactions.filter(
    tx => activeAccount && tx.from.toLowerCase() === activeAccount.address.toLowerCase()
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!activeAccount) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-gray-500">
          <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No active account</p>
          <p className="text-sm">Please select an account first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Transaction History</h2>
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {accountTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ArrowUpRight className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No transactions yet</p>
            <p className="text-sm">Your sent transactions will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {accountTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <ArrowUpRight className="w-4 h-4 text-purple-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          Sent {transaction.value} {transaction.token || 'ETH'}
                        </span>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(transaction.status)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <div>To: <span className="font-mono">{transaction.to}</span></div>
                        <div>Hash: <span className="font-mono">{transaction.hash}</span></div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(transaction.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => window.open(`https://etherscan.io/tx/${transaction.hash}`, '_blank')}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-1"
                    title="View on Etherscan"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;