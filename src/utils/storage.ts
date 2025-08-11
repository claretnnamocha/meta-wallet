import { WalletState, Account, Token, Transaction, RpcNetwork } from '../types';

const STORAGE_KEY = 'metamask-wallet-state';

const defaultState: WalletState = {
  accounts: [],
  activeAccountId: null,
  tokens: [],
  transactions: [],
  rpcNetwork: {
    name: 'Ganache',
    url: 'http://localhost:8545'
  }
};

export const loadWalletState = (): WalletState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultState, ...parsed };
    }
  } catch (error) {
    console.error('Error loading wallet state:', error);
  }
  return defaultState;
};

export const saveWalletState = (state: WalletState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving wallet state:', error);
  }
};

export const addAccount = (account: Account): WalletState => {
  const state = loadWalletState();
  const newState = {
    ...state,
    accounts: [...state.accounts, account],
    activeAccountId: state.activeAccountId || account.id
  };
  saveWalletState(newState);
  return newState;
};

export const addToken = (token: Token): WalletState => {
  const state = loadWalletState();
  const newState = {
    ...state,
    tokens: [...state.tokens, token]
  };
  saveWalletState(newState);
  return newState;
};

export const addTransaction = (transaction: Transaction): WalletState => {
  const state = loadWalletState();
  const newState = {
    ...state,
    transactions: [transaction, ...state.transactions]
  };
  saveWalletState(newState);
  return newState;
};

export const setActiveAccount = (accountId: string): WalletState => {
  const state = loadWalletState();
  const newState = {
    ...state,
    activeAccountId: accountId
  };
  saveWalletState(newState);
  return newState;
};

export const updateRpcNetwork = (network: RpcNetwork): WalletState => {
  const state = loadWalletState();
  const newState = {
    ...state,
    rpcNetwork: network
  };
  saveWalletState(newState);
  return newState;
};