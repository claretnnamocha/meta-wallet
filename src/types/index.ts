export interface Account {
  id: string;
  name: string;
  privateKey: string;
  address: string;
}

export interface Token {
  id: string;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  token?: string;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
}

export interface RpcNetwork {
  name: string;
  url: string;
}

export interface WalletState {
  accounts: Account[];
  activeAccountId: string | null;
  tokens: Token[];
  transactions: Transaction[];
  rpcNetwork: RpcNetwork;
}