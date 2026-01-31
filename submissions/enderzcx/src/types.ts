export interface TransferWithAuthorization {
  from: string;
  to: string;
  value: string;
  validAfter: number;
  validBefore: number;
  nonce: string;
  v: number;
  r: string;
  s: string;
}

export interface TokenInfo {
  address: string;
  balance_threshold: string;
  decimals: number;
  eip712_name: string;
  eip712_version: string;
  minimum_transfer_amount: string;
  name: string;
  symbol: string;
}

export interface RelayerResponse {
  status: 'success' | 'error';
  txHash?: string;
  amount?: string;
  to?: string;
  from?: string;
  error?: string;
}
