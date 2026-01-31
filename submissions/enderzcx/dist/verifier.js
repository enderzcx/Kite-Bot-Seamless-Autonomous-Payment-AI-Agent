"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EIP3009Verifier = void 0;
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || '0x2eed6D0736B5cF79F8C4964353dbe1640069Cff4';
class EIP3009Verifier {
    constructor(name, version, tokenAddress) {
        this.name = name;
        this.version = version;
        this.tokenAddress = tokenAddress;
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
    verify(auth) {
        try {
            const valueStruct = {
                from,
                to,
                value,
                validAfter,
                validBefore,
                nonce
            };
            const recoveredAddress = ethers_1.ethers.verifyTypedData(this.domain, this.types, valueStruct, v, r, s);
            return recoveredAddress.toLowerCase() === from.toLowerCase();
        }
        catch (error) {
            console.error('Signature verification failed:', error);
            return false;
        }
    }
}
exports.EIP3009Verifier = EIP3009Verifier;
