import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || '0x2eed6D0736B5cF79F8C4964353dbe1640069Cff4';

export class EIP3009Verifier {
  private domain: any;
  private types: any;

  constructor(
    private name: string,
    private version: string,
    private tokenAddress: string
  ) {
    this.domain = {
      name,
      version,
      chainId: 2368,
      verifyingContract: tokenAddress
    };

    this.types = {
      TransferWithAuthorization: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'validAfter', type: 'uint256' },
        { name: 'validBefore', type: 'uint256' },
        { name: 'nonce', type: 'bytes32' }
      ]
    };
  }

  verify(auth: {
    from: string;
    to: string;
    value: string;
    validAfter: number;
    validBefore: number;
    nonce: string;
    v: number;
    r: string;
    s: string;
  }): boolean {
    try {
      const valueStruct = {
        from,
        to,
        value,
        validAfter,
        validBefore,
        nonce
      };

      const recoveredAddress = ethers.verifyTypedData(
        this.domain,
        this.types,
        valueStruct,
        v,
        r,
        s
      );

      return recoveredAddress.toLowerCase() === from.toLowerCase();
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }
}
