/**
 * Gokite Account Abstraction SDK (精简版)
 * 
 * 单文件版本，包含所有 ERC-4337 转账功能
 * 
 * @example
 * const sdk = new GokiteAASDK({
 *   rpcUrl: 'https://rpc-testnet.gokite.ai',
 *   bundlerUrl: 'https://bundler-service.staging.gokite.ai/rpc/',
 *   entryPointAddress: '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108',
 *   proxyAddress: '0xca38E92a709a3bA0704Eb16609E6C89a0C9DF21F'
 * });
 */

const { ethers } = require('ethers');

class GokiteAASDK {
  constructor(config) {
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    
    this.entryPointAbi = [
      'function getNonce(address sender, uint192 key) view returns (uint256)',
      'function getUserOpHash(tuple(address sender, uint256 nonce, bytes initCode, bytes callData, bytes32 accountGasLimits, uint256 preVerificationGas, bytes32 gasFees, bytes paymasterAndData, bytes signature) userOp) view returns (bytes32)'
    ];
    
    this.entryPoint = new ethers.Contract(config.entryPointAddress, this.entryPointAbi, this.provider);
    
    this.accountAbi = [
      'function execute(address dest, uint256 value, bytes calldata func) external',
      'function executeBatch(address[] calldata dest, uint256[] calldata value, bytes[] calldata func) external',
      'function getNonce() view returns (uint256)'
    ];
    
    this.account = new ethers.Contract(config.proxyAddress, this.accountAbi, this.provider);
  }

  async getNonce() {
    try {
      return await this.entryPoint.getNonce(this.config.proxyAddress, 0);
    } catch {
      return 0n;
    }
  }

  packAccountGasLimits(verificationGasLimit, callGasLimit) {
    const packed = (verificationGasLimit << 128n) | callGasLimit;
    return ethers.zeroPadValue(ethers.toBeHex(packed), 32);
  }

  packGasFees(maxPriorityFeePerGas, maxFeePerGas) {
    const packed = (maxPriorityFeePerGas << 128n) | maxFeePerGas;
    return ethers.zeroPadValue(ethers.toBeHex(packed), 32);
  }

  async getUserOpHash(userOp) {
    const accountGasLimits = this.packAccountGasLimits(userOp.verificationGasLimit, userOp.callGasLimit);
    const gasFees = this.packGasFees(userOp.maxPriorityFeePerGas, userOp.maxFeePerGas);
    
    const formattedUserOp = {
      sender: userOp.sender,
      nonce: userOp.nonce,
      initCode: userOp.initCode,
      callData: userOp.callData,
      accountGasLimits: accountGasLimits,
      preVerificationGas: userOp.preVerificationGas,
      gasFees: gasFees,
      paymasterAndData: userOp.paymasterAndData,
      signature: userOp.signature
    };

    return await this.entryPoint.getUserOpHash(formattedUserOp);
  }

  async sendUserOperationAndWait(request, signFunction) {
    try {
      const nonce = await this.getNonce();
      const executeCallData = this.account.interface.encodeFunctionData('execute', [
        request.target,
        request.value,
        request.callData
      ]);

      const userOp = {
        sender: this.config.proxyAddress,
        nonce: nonce.toString(),
        initCode: '0x',
        callData: executeCallData,
        callGasLimit: 100000n,
        verificationGasLimit: 100000n,
        preVerificationGas: 50000n,
        maxFeePerGas: 1000000000n,
        maxPriorityFeePerGas: 1000000000n,
        paymasterAndData: '0x',
        signature: '0x'
      };

      const userOpHash = await this.getUserOpHash(userOp);
      const signature = await signFunction(userOpHash);
      userOp.signature = signature;

      const userOpHashFromBundler = await this.sendToBundler(userOp);
      const receipt = await this.waitForUserOperation(userOpHashFromBundler);

      return {
        status: receipt.success ? 'success' : 'failed',
        transactionHash: receipt.transactionHash,
        userOpHash: userOpHashFromBundler,
        receipt: receipt
      };
    } catch (error) {
      return { status: 'failed', reason: error.message, error: error };
    }
  }

  async sendBatchUserOperationAndWait(batchRequest, signFunction) {
    try {
      const nonce = await this.getNonce();
      const normalizedValues = batchRequest.values.length === 0 
        ? new Array(batchRequest.targets.length).fill(0n)
        : batchRequest.values;

      const executeBatchCallData = this.account.interface.encodeFunctionData('executeBatch', [
        batchRequest.targets,
        normalizedValues,
        batchRequest.callDatas
      ]);

      const userOp = {
        sender: this.config.proxyAddress,
        nonce: nonce.toString(),
        initCode: '0x',
        callData: executeBatchCallData,
        callGasLimit: 200000n,
        verificationGasLimit: 200000n,
        preVerificationGas: 100000n,
        maxFeePerGas: 1000000000n,
        maxPriorityFeePerGas: 1000000000n,
        paymasterAndData: '0x',
        signature: '0x'
      };

      const userOpHash = await this.getUserOpHash(userOp);
      const signature = await signFunction(userOpHash);
      userOp.signature = signature;

      const userOpHashFromBundler = await this.sendToBundler(userOp);
      const receipt = await this.waitForUserOperation(userOpHashFromBundler);

      return {
        status: receipt.success ? 'success' : 'failed',
        transactionHash: receipt.transactionHash,
        userOpHash: userOpHashFromBundler,
        receipt: receipt
      };
    } catch (error) {
      return { status: 'failed', reason: error.message, error: error };
    }
  }

  async sendERC20(request, signFunction) {
    const erc20Interface = new ethers.Interface([
      'function transfer(address to, uint256 amount) returns (bool)'
    ]);

    return this.sendUserOperationAndWait({
      target: request.tokenAddress,
      value: 0n,
      callData: erc20Interface.encodeFunctionData('transfer', [request.recipient, request.amount])
    }, signFunction);
  }

  async approveERC20(request, signFunction) {
    const erc20Interface = new ethers.Interface([
      'function approve(address spender, uint256 amount) returns (bool)'
    ]);

    return this.sendUserOperationAndWait({
      target: request.tokenAddress,
      value: 0n,
      callData: erc20Interface.encodeFunctionData('approve', [request.spender, request.amount])
    }, signFunction);
  }

  async getBalance() {
    return this.provider.getBalance(this.config.proxyAddress);
  }

  async getERC20Balance(tokenAddress) {
    const erc20Interface = new ethers.Interface([
      'function balanceOf(address account) view returns (uint256)'
    ]);

    const data = erc20Interface.encodeFunctionData('balanceOf', [this.config.proxyAddress]);
    const result = await this.provider.call({ to: tokenAddress, data: data });
    return ethers.getBigInt(result);
  }

  async sendToBundler(userOp) {
    const formatHex = (value) => {
      if (typeof value === 'bigint' || typeof value === 'number') {
        return '0x' + value.toString(16);
      }
      if (typeof value === 'string' && value.startsWith('0x')) {
        return value;
      }
      return '0x' + BigInt(value).toString(16);
    };

    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_sendUserOperation',
      params: [
        {
          sender: userOp.sender,
          nonce: formatHex(userOp.nonce),
          initCode: userOp.initCode,
          callData: userOp.callData,
          callGasLimit: formatHex(userOp.callGasLimit),
          verificationGasLimit: formatHex(userOp.verificationGasLimit),
          preVerificationGas: formatHex(userOp.preVerificationGas),
          maxFeePerGas: formatHex(userOp.maxFeePerGas),
          maxPriorityFeePerGas: formatHex(userOp.maxPriorityFeePerGas),
          paymasterAndData: userOp.paymasterAndData,
          signature: userOp.signature
        },
        this.config.entryPointAddress
      ]
    };

    const response = await fetch(this.config.bundlerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`Bundler error: ${result.error.message}`);
    }

    return result.result;
  }

  async waitForUserOperation(userOpHash, timeout = 60000, pollInterval = 2000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const receipt = await this.getUserOperationReceipt(userOpHash);
      
      if (receipt) {
        return {
          success: receipt.success,
          transactionHash: receipt.receipt.transactionHash,
          blockNumber: receipt.receipt.blockNumber,
          gasUsed: receipt.receipt.gasUsed,
          actualGasCost: receipt.actualGasCost,
          actualGasUsed: receipt.actualGasUsed,
          receipt: receipt
        };
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Timeout waiting for UserOperation ${userOpHash}`);
  }

  async getUserOperationReceipt(userOpHash) {
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getUserOperationReceipt',
      params: [userOpHash]
    };

    const response = await fetch(this.config.bundlerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`Bundler error: ${result.error.message}`);
    }

    return result.result;
  }
}

module.exports = { GokiteAASDK };
