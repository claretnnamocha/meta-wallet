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
    console.log('state', state);
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
  console.log('newState', newState);
  saveWalletState(newState);
  return newState;
};

export const addToken = (token: Token): WalletState => {
  const state = loadWalletState();
  const newState = {
    ...state,
    tokens: [...state.tokens, token]
  };
  console.log('newState', newState);
  saveWalletState(newState);
  return newState;
};

export const addTransaction = (transaction: Transaction): WalletState => {
  const state = loadWalletState();
  const newState = {
    ...state,
    transactions: [transaction, ...state.transactions]
  };
  console.log('newState', newState);
  saveWalletState(newState);
  return newState;
};

export const setActiveAccount = (accountId: string): WalletState => {
  const state = loadWalletState();
  const newState = {
    ...state,
    activeAccountId: accountId
  };
  console.log('newState', newState);
  saveWalletState(newState);
  return newState;
};

export const updateRpcNetwork = (network: RpcNetwork): WalletState => {
  const state = loadWalletState();
  const newState = {
    ...state,
    rpcNetwork: network
  };
  console.log('newState', newState);
  saveWalletState(newState);
  return newState;
};

export const deleteAccount = (accountId: string): WalletState => {
  const state = loadWalletState();
  const newAccounts = state.accounts.filter(account => account.id !== accountId);
  
  // If we're deleting the active account, set a new active account or null
  let newActiveAccountId = state.activeAccountId;
  if (state.activeAccountId === accountId) {
    newActiveAccountId = newAccounts.length > 0 ? newAccounts[0].id : null;
  }
  
  const newState = {
    ...state,
    accounts: newAccounts,
    activeAccountId: newActiveAccountId
  };
  saveWalletState(newState);
  return newState;
};

export const deleteToken = (tokenId: string): WalletState => {
  const state = loadWalletState();
  const newState = {
    ...state,
    tokens: state.tokens.filter(token => token.id !== tokenId)
  };
  saveWalletState(newState);
  return newState;
};

export const clearAllTransactions = (): WalletState => {
  const state = loadWalletState();
  const newState = {
    ...state,
    transactions: []
  };
  saveWalletState(newState);
  return newState;
};