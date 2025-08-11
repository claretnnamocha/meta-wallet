import { ethers } from 'ethers';
import { Token } from '../types';

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 value) returns (bool)'
];

export const createProvider = (rpcUrl: string) => {
  return new ethers.JsonRpcProvider(rpcUrl);
};

export const createWallet = (privateKey: string, provider: ethers.Provider) => {
  return new ethers.Wallet(privateKey, provider);
};

export const getBalance = async (address: string, provider: ethers.Provider): Promise<string> => {
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
};

export const getTokenBalance = async (
  tokenAddress: string,
  walletAddress: string,
  provider: ethers.Provider
): Promise<string> => {
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const balance = await contract.balanceOf(walletAddress);
  const decimals = await contract.decimals();
  return ethers.formatUnits(balance, decimals);
};

export const getTokenInfo = async (
  tokenAddress: string,
  provider: ethers.Provider
): Promise<{ name: string; symbol: string; decimals: number }> => {
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const [name, symbol, decimals] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.decimals()
  ]);
  return { name, symbol, decimals };
};

export const sendEther = async (
  wallet: ethers.Wallet,
  to: string,
  amount: string
): Promise<ethers.TransactionResponse> => {
  const tx = {
    to,
    value: ethers.parseEther(amount)
  };
  return await wallet.sendTransaction(tx);
};

export const sendToken = async (
  wallet: ethers.Wallet,
  token: Token,
  to: string,
  amount: string
): Promise<ethers.TransactionResponse> => {
  const contract = new ethers.Contract(token.address, ERC20_ABI, wallet);
  const value = ethers.parseUnits(amount, token.decimals);
  return await contract.transfer(to, value);
};

export const isContract = async (address: string, provider: ethers.Provider): Promise<boolean> => {
  const code = await provider.getCode(address);
  return code !== '0x';
};

export const isValidAddress = (address: string): boolean => {
  return ethers.isAddress(address);
};

export const getAddressFromPrivateKey = (privateKey: string): string => {
  const wallet = new ethers.Wallet(privateKey);
  return wallet.address;
};