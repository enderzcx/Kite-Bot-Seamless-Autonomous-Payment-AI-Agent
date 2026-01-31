import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const RPC_URL = process.env.KITE_RPC_URL || 'https://rpc-testnet.gokite.ai';
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || '0x2eed6D0736B5cF79F8C4964353dbe1640069Cff4';
const AUTHORIZED_AGENT_ADDRESS = process.env.AUTHORIZED_AGENT_ADDRESS || '';

export class RelayerService {
  private provider: ethers.JsonRpcProvider;
  private tokenContract: ethers.Contract;

  constructor(
    private rpcUrl: string,
    private privateKey: string,
    private tokenAddress: string,
    private authorizedAgentAddress: string
  ) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.tokenContract = new ethers.Contract(
      tokenAddress,
      [
        'function transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s) external returns (bool)',
        'function balanceOf(address account) view returns (uint256)',
        'function decimals() view returns (uint8)'
      ],
      new ethers.Wallet(privateKey, this.provider)
    );
  }

  async checkBalance(address: string): Promise<bigint> {
    try {
      const balance = await this.tokenContract.balanceOf(address);
      return balance;
    } catch (error) {
      console.error('Error checking balance:', error);
      return 0n;
    }
  }

  async getDecimals(): Promise<number> {
    try {
      const decimals = await this.tokenContract.decimals();
      return decimals;
    } catch (error) {
      console.error('Error getting decimals:', error);
      return 18;
    }
  }

  async executeGaslessTransfer(auth: {
    from: string;
    to: string;
    value: string;
    validAfter: number;
    validBefore: number;
    nonce: string;
    v: number;
    r: string;
    s: string;
  }): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const now = Math.floor(Date.now() / 1000);
      console.log('Executing gasless transfer:', {
        from: auth.from,
        to: auth.to,
        value: auth.value,
        currentTime: now,
        validAfter: auth.validAfter,
        validBefore: auth.validBefore,
        isValid: now >= auth.validAfter && now <= auth.validBefore,
        expiresIn: `${Math.floor((auth.validBefore - now) / 60)} minutes`
      });

      if (now < auth.validAfter) {
        return {
          success: false,
          error: `Authorization not yet valid. Valid after: ${new Date(auth.validAfter * 1000).toISOString()}`
        };
      }

      if (now > auth.validBefore) {
        return {
          success: false,
          error: `Authorization expired at: ${new Date(auth.validBefore * 1000).toISOString()}. Current time: ${new Date(now * 1000).toISOString()}`
        };
      }

      const tx = await this.tokenContract.transferWithAuthorization(
        auth.from,
        auth.to,
        auth.value,
        auth.validAfter,
        auth.validBefore,
        auth.nonce,
        auth.v,
        auth.r,
        auth.s
      );

      console.log('Transaction submitted:', tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt?.hash);

      return {
        success: true,
        txHash: receipt?.hash
      };
    } catch (error: any) {
      console.error('Transaction execution failed:', error);

      if (error.reason) {
        console.error('Revert reason:', error.reason);
      }

      if (error.code === 'CALL_EXCEPTION') {
        const revertReason = error.reason || error.data?.message || 'Unknown revert reason';
        console.error('Contract call failed:', revertReason);

        if (revertReason.includes('expired') || revertReason.includes('Auth expired')) {
          return {
            success: false,
            error: 'Transfer authorization has expired. Please try again with a fresh authorization.'
          };
        }
      }

      return {
        success: false,
        error: error.reason || error.message || 'Transaction execution failed'
      };
    }
  }
}
