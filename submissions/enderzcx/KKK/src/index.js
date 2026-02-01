/**
 * Gokite Account Abstraction SDK (ERC-4337 v0.6)
 * 
 * A JavaScript SDK for interacting with GokiteAccount contracts
 * using ERC-4337 Account Abstraction principles on Kite Chain.
 * 
 * @module gokite-aa-sdk
 */

const { ethers } = require('ethers');

/**
 * UserOperation Builder for ERC-4337 v0.6
 */
class UserOpBuilder {
  /**
   * @param {ethers.Provider} provider - Ethers provider
   * @param {Object} config - Configuration object
   * @param {string} config.proxyAddress - GokiteAccount proxy address
   * @param {string} config.entryPointAddress - EntryPoint contract address
   */
  constructor(provider, config) {
    this.provider = provider;
    this.config = config;
    
    // EntryPoint ABI for getNonce
    this.entryPointAbi = [
      'function getNonce(address sender, uint192 key) view returns (uint256)',
      'function getUserOpHash(tuple(address sender, uint256 nonce, bytes initCode, bytes callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 preVerificationGas, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, bytes paymasterAndData, bytes signature) userOp) view returns (bytes32)'
    ];
    
    this.entryPoint = new ethers.Contract(
      config.entryPointAddress,
      this.entryPointAbi,
      provider
    );

    // GokiteAccount ABI for execute and executeBatch
    this.accountAbi = [
      'function execute(address dest, uint256 value, bytes calldata func) external',
      'function executeBatch(address[] calldata dest, uint256[] calldata value, bytes[] calldata func) external'
    ];

    this.account = new ethers.Contract(
      config.proxyAddress,
      this.accountAbi,
      provider
    );
  }

  /**
   * Get the account nonce from EntryPoint
   * @param {number} key - Nonce key (default: 0)
   * @returns {Promise<bigint>} The nonce
   * @throws {Error} If failed to get nonce
   */
  async getNonce(key = 0) {
    try {
      const nonce = await this.entryPoint.getNonce(this.config.proxyAddress, key);
      return BigInt(nonce.toString());
    } catch (error) {
      throw new Error(`Failed to get nonce from EntryPoint: ${error.message}`);
    }
  }

  /**
   * Build a single UserOperation (ERC-4337 v0.6 format)
   * 
   * @param {Object} request - Transaction request
   * @param {string} request.target - Destination address
   * @param {bigint} request.value - Amount of ETH to send
   * @param {string} request.callData - Calldata for the transaction
   * @param {Object} options - Optional parameters
   * @param {bigint} options.callGasLimit - Call gas limit
   * @param {bigint} options.verificationGasLimit - Verification gas limit
   * @param {bigint} options.preVerificationGas - Pre-verification gas
   * @param {bigint} options.maxFeePerGas - Max fee per gas
   * @param {bigint} options.maxPriorityFeePerGas - Max priority fee per gas
   * @returns {Promise<Object>} UserOperation object (v0.6 format)
   */
  async buildUserOp(request, options = {}) {
    const { target, value, callData } = request;

    // Encode the execute call
    const executeCallData = this.account.interface.encodeFunctionData('execute', [
      target,
      value,
      callData
    ]);

    // Get the nonce
    const nonce = await this.getNonce();

    // Build the UserOperation (v0.6 format)
    const userOp = {
      sender: this.config.proxyAddress,
      nonce: nonce.toString(),
      initCode: '0x',
      callData: executeCallData,
      callGasLimit: (options.callGasLimit || 100000n).toString(),
      verificationGasLimit: (options.verificationGasLimit || 100000n).toString(),
      preVerificationGas: (options.preVerificationGas || 50000n).toString(),
      maxFeePerGas: (options.maxFeePerGas || 1000000000n).toString(),
      maxPriorityFeePerGas: (options.maxPriorityFeePerGas || 1000000000n).toString(),
      paymasterAndData: '0x',
      signature: '0x'
    };

    return userOp;
  }

  /**
   * Build a batch UserOperation (ERC-4337 v0.6 format)
   * 
   * @param {Object} batchRequest - Batch transaction request
   * @param {string[]} batchRequest.targets - Array of destination addresses
   * @param {bigint[]} batchRequest.values - Array of values to send
   * @param {string[]} batchRequest.callDatas - Array of calldatas
   * @param {Object} options - Optional parameters
   * @returns {Promise<Object>} UserOperation object (v0.6 format)
   */
  async buildBatchUserOp(batchRequest, options = {}) {
    const { targets, values, callDatas } = batchRequest;

    // Ensure arrays have the same length
    if (targets.length !== callDatas.length) {
      throw new Error('targets and callDatas must have the same length');
    }

    // Convert values to proper format
    const normalizedValues = values.length === 0 
      ? new Array(targets.length).fill(0n)
      : values;

    if (normalizedValues.length !== targets.length) {
      throw new Error('values length must match targets length');
    }

    // Encode the executeBatch call
    const executeBatchCallData = this.account.interface.encodeFunctionData('executeBatch', [
      targets,
      normalizedValues,
      callDatas
    ]);

    // Get the nonce
    const nonce = await this.getNonce();

    // Build the UserOperation (v0.6 format)
    const userOp = {
      sender: this.config.proxyAddress,
      nonce: nonce.toString(),
      initCode: '0x',
      callData: executeBatchCallData,
      callGasLimit: (options.callGasLimit || 200000n).toString(),
      verificationGasLimit: (options.verificationGasLimit || 200000n).toString(),
      preVerificationGas: (options.preVerificationGas || 100000n).toString(),
      maxFeePerGas: (options.maxFeePerGas || 1000000000n).toString(),
      maxPriorityFeePerGas: (options.maxPriorityFeePerGas || 1000000000n).toString(),
      paymasterAndData: '0x',
      signature: '0x'
    };

    return userOp;
  }

  /**
   * Get the UserOperation hash
   * 
   * @param {Object} userOp - UserOperation object
   * @returns {Promise<string>} UserOperation hash
   */
  async getUserOpHash(userOp) {
    try {
      // Convert string values to proper format for EntryPoint
      const formattedUserOp = {
        sender: userOp.sender,
        nonce: userOp.nonce,
        initCode: userOp.initCode,
        callData: userOp.callData,
        callGasLimit: userOp.callGasLimit,
        verificationGasLimit: userOp.verificationGasLimit,
        preVerificationGas: userOp.preVerificationGas,
        maxFeePerGas: userOp.maxFeePerGas,
        maxPriorityFeePerGas: userOp.maxPriorityFeePerGas,
        paymasterAndData: userOp.paymasterAndData,
        signature: userOp.signature
      };

      const userOpHash = await this.entryPoint.getUserOpHash(formattedUserOp);
      return userOpHash;
    } catch (error) {
      // Fallback: calculate hash locally
      return this.calculateUserOpHash(userOp);
    }
  }

  /**
   * Calculate UserOperation hash locally (ERC-4337 v0.6)
   * 
   * @param {Object} userOp - UserOperation object
   * @returns {string} UserOperation hash
   */
  calculateUserOpHash(userOp) {
    const packed = ethers.AbiCoder.defaultAbiCoder().encode(
      [
        'address',
        'uint256',
        'bytes32',
        'bytes32',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'bytes32'
      ],
      [
        userOp.sender,
        userOp.nonce,
        ethers.keccak256(userOp.initCode),
        ethers.keccak256(userOp.callData),
        userOp.callGasLimit,
        userOp.verificationGasLimit,
        userOp.preVerificationGas,
        userOp.maxFeePerGas,
        userOp.maxPriorityFeePerGas,
        ethers.keccak256(userOp.paymasterAndData)
      ]
    );

    // Add EntryPoint address and chainId
    const chainId = this.config.chainId || 1;
    const finalPacked = ethers.concat([
      ethers.keccak256(packed),
      this.entryPoint.target,
      ethers.zeroPadValue(ethers.toBeHex(chainId), 32)
    ]);

    return ethers.keccak256(finalPacked);
  }
}

/**
 * Bundler Client for ERC-4337 v0.6
 */
class BundlerClient {
  /**
   * @param {string} bundlerUrl - Bundler RPC URL
   */
  constructor(bundlerUrl) {
    this.bundlerUrl = bundlerUrl;
  }

  /**
   * Send a UserOperation to the bundler (ERC-4337 v0.6 format)
   * 
   * @param {Object} userOp - UserOperation object
   * @param {string} entryPointAddress - EntryPoint contract address
   * @returns {Promise<string>} UserOperation hash
   */
  async sendUserOperation(userOp, entryPointAddress) {
    // Convert values to hex strings for bundler compatibility
    const toHex = (value) => {
      if (typeof value === 'bigint') {
        return '0x' + value.toString(16);
      }
      if (typeof value === 'number') {
        return '0x' + value.toString(16);
      }
      if (typeof value === 'string') {
        if (value.startsWith('0x')) return value;
        return '0x' + BigInt(value).toString(16);
      }
      return '0x0';
    };

    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_sendUserOperation',
      params: [
        {
          sender: userOp.sender,
          nonce: toHex(userOp.nonce),
          initCode: userOp.initCode,
          callData: userOp.callData,
          callGasLimit: toHex(userOp.callGasLimit),
          verificationGasLimit: toHex(userOp.verificationGasLimit),
          preVerificationGas: toHex(userOp.preVerificationGas),
          maxFeePerGas: toHex(userOp.maxFeePerGas),
          maxPriorityFeePerGas: toHex(userOp.maxPriorityFeePerGas),
          paymasterAndData: userOp.paymasterAndData,
          signature: userOp.signature
        },
        entryPointAddress
      ]
    };

    const response = await this.sendRequest(request);
    
    if (response.error) {
      throw new Error(`Bundler error: ${response.error.message}`);
    }

    return response.result;
  }

  /**
   * Estimate gas for a UserOperation (ERC-4337 v0.6 format)
   * 
   * @param {Object} userOp - UserOperation object
   * @param {string} entryPointAddress - EntryPoint contract address
   * @returns {Promise<Object>} Gas estimates
   */
  async estimateUserOperationGas(userOp, entryPointAddress) {
    const toHex = (value) => {
      if (typeof value === 'bigint') {
        return '0x' + value.toString(16);
      }
      if (typeof value === 'number') {
        return '0x' + value.toString(16);
      }
      if (typeof value === 'string') {
        if (value.startsWith('0x')) return value;
        return '0x' + BigInt(value).toString(16);
      }
      return '0x0';
    };

    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_estimateUserOperationGas',
      params: [
        {
          sender: userOp.sender,
          nonce: toHex(userOp.nonce),
          initCode: userOp.initCode,
          callData: userOp.callData,
          callGasLimit: toHex(userOp.callGasLimit || 0),
          verificationGasLimit: toHex(userOp.verificationGasLimit || 0),
          preVerificationGas: toHex(userOp.preVerificationGas || 0),
          maxFeePerGas: toHex(userOp.maxFeePerGas || 0),
          maxPriorityFeePerGas: toHex(userOp.maxPriorityFeePerGas || 0),
          paymasterAndData: userOp.paymasterAndData,
          signature: userOp.signature || '0x'
        },
        entryPointAddress
      ]
    };

    const response = await this.sendRequest(request);
    
    if (response.error) {
      throw new Error(`Bundler error: ${response.error.message}`);
    }

    return response.result;
  }

  /**
   * Get UserOperation receipt
   * 
   * @param {string} userOpHash - UserOperation hash
   * @returns {Promise<Object|null>} Receipt or null if not found
   */
  async getUserOperationReceipt(userOpHash) {
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getUserOperationReceipt',
      params: [userOpHash]
    };

    const response = await this.sendRequest(request);
    
    if (response.error) {
      throw new Error(`Bundler error: ${response.error.message}`);
    }

    return response.result;
  }

  /**
   * Get UserOperation by hash
   * 
   * @param {string} userOpHash - UserOperation hash
   * @returns {Promise<Object|null>} UserOperation or null if not found
   */
  async getUserOperationByHash(userOpHash) {
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getUserOperationByHash',
      params: [userOpHash]
    };

    const response = await this.sendRequest(request);
    
    if (response.error) {
      throw new Error(`Bundler error: ${response.error.message}`);
    }

    return response.result;
  }

  /**
   * Get supported entry points
   * 
   * @returns {Promise<string[]>} Array of supported EntryPoint addresses
   */
  async getSupportedEntryPoints() {
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_supportedEntryPoints',
      params: []
    };

    const response = await this.sendRequest(request);
    
    if (response.error) {
      throw new Error(`Bundler error: ${response.error.message}`);
    }

    return response.result;
  }

  /**
   * Wait for a UserOperation to be mined
   * 
   * @param {string} userOpHash - UserOperation hash
   * @param {number} timeout - Timeout in milliseconds (default: 60000)
   * @param {number} pollInterval - Poll interval in milliseconds (default: 2000)
   * @returns {Promise<Object>} Receipt
   */
  async waitForUserOperation(userOpHash, timeout = 60000, pollInterval = 2000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const receipt = await this.getUserOperationReceipt(userOpHash);
      
      if (receipt) {
        return {
          success: receipt.success,
          transactionHash: receipt.receipt?.transactionHash,
          blockNumber: receipt.receipt?.blockNumber,
          gasUsed: receipt.receipt?.gasUsed,
          actualGasCost: receipt.actualGasCost,
          actualGasUsed: receipt.actualGasUsed,
          receipt: receipt
        };
      }

      await this.sleep(pollInterval);
    }

    throw new Error(`Timeout waiting for UserOperation ${userOpHash}`);
  }

  /**
   * Send a JSON-RPC request to the bundler
   * 
   * @param {Object} request - JSON-RPC request object
   * @returns {Promise<Object>} JSON-RPC response
   */
  async sendRequest(request) {
    try {
      const response = await fetch(this.bundlerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Fallback for environments without fetch (Node.js < 18)
      return this.sendRequestWithHttp(request);
    }
  }

  /**
   * Send a JSON-RPC request using Node.js http module (fallback)
   * 
   * @param {Object} request - JSON-RPC request object
   * @returns {Promise<Object>} JSON-RPC response
   */
  async sendRequestWithHttp(request) {
    const http = require('http');
    const https = require('https');

    const parsedUrl = new URL(this.bundlerUrl);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    return new Promise((resolve, reject) => {
      const req = client.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve(response);
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(JSON.stringify(request));
      req.end();
    });
  }

  /**
   * Sleep for a specified duration
   * 
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Gokite Account Abstraction SDK (ERC-4337 v0.6)
 */
class GokiteAASDK {
  /**
   * @param {Object} config - SDK configuration
   * @param {string} config.network - Network name (e.g., 'kite_testnet')
   * @param {string} config.rpcUrl - Kite RPC URL
   * @param {string} config.bundlerUrl - Bundler RPC URL
   * @param {string} config.entryPointAddress - EntryPoint contract address
   * @param {string} config.proxyAddress - GokiteAccount proxy address
   * @param {number} [config.chainId] - Chain ID (optional, defaults to 1)
   */
  constructor(config) {
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.userOpBuilder = new UserOpBuilder(this.provider, config);
    this.bundlerClient = new BundlerClient(config.bundlerUrl);
  }

  /**
   * Get the AA wallet address
   * @returns {string} The AA wallet address (proxy address)
   */
  getAccountAddress() {
    return this.config.proxyAddress;
  }

  /**
   * Send a single user operation and wait for it to be mined
   * 
   * @param {Object} request - Transaction request
   * @param {string} request.target - Destination address
   * @param {bigint} request.value - Amount of ETH to send (in wei)
   * @param {string} request.callData - Calldata for the transaction
   * @param {Function} signFunction - Async function to sign the userOpHash
   * @param {Object} options - Optional gas parameters
   * @returns {Promise<Object>} Transaction result with status and transactionHash
   */
  async sendUserOperationAndWait(request, signFunction, options = {}) {
    try {
      // Build the user operation
      const userOp = await this.userOpBuilder.buildUserOp(request, options);
      
      // Get the userOpHash
      const userOpHash = await this.userOpBuilder.getUserOpHash(userOp);
      
      // Sign the userOpHash
      const signature = await signFunction(userOpHash);
      userOp.signature = signature;

      // Send to bundler
      const userOpHashFromBundler = await this.bundlerClient.sendUserOperation(
        userOp,
        this.config.entryPointAddress
      );

      // Wait for the transaction to be mined
      const receipt = await this.bundlerClient.waitForUserOperation(userOpHashFromBundler);

      return {
        status: receipt.success ? 'success' : 'failed',
        transactionHash: receipt.transactionHash,
        userOpHash: userOpHashFromBundler,
        receipt: receipt
      };
    } catch (error) {
      return {
        status: 'failed',
        reason: error.message,
        error: error
      };
    }
  }

  /**
   * Send a batch of user operations
   * 
   * @param {Object} batchRequest - Batch transaction request
   * @param {string[]} batchRequest.targets - Array of destination addresses
   * @param {bigint[]} batchRequest.values - Array of values to send
   * @param {string[]} batchRequest.callDatas - Array of calldatas
   * @param {Function} signFunction - Async function to sign the userOpHash
   * @param {Object} options - Optional gas parameters
   * @returns {Promise<Object>} Transaction result
   */
  async sendBatchUserOperationAndWait(batchRequest, signFunction, options = {}) {
    try {
      // Build the batch user operation
      const userOp = await this.userOpBuilder.buildBatchUserOp(batchRequest, options);
      
      // Get the userOpHash
      const userOpHash = await this.userOpBuilder.getUserOpHash(userOp);
      
      // Sign the userOpHash
      const signature = await signFunction(userOpHash);
      userOp.signature = signature;

      // Send to bundler
      const userOpHashFromBundler = await this.bundlerClient.sendUserOperation(
        userOp,
        this.config.entryPointAddress
      );

      // Wait for the transaction to be mined
      const receipt = await this.bundlerClient.waitForUserOperation(userOpHashFromBundler);

      return {
        status: receipt.success ? 'success' : 'failed',
        transactionHash: receipt.transactionHash,
        userOpHash: userOpHashFromBundler,
        receipt: receipt
      };
    } catch (error) {
      return {
        status: 'failed',
        reason: error.message,
        error: error
      };
    }
  }

  /**
   * Send ERC20 tokens
   * 
   * @param {Object} request - ERC20 transfer request
   * @param {string} request.tokenAddress - ERC20 token contract address
   * @param {string} request.recipient - Token recipient address
   * @param {bigint} request.amount - Amount of tokens to transfer
   * @param {Function} signFunction - Async function to sign the userOpHash
   * @param {Object} options - Optional gas parameters
   * @returns {Promise<Object>} Transaction result
   */
  async sendERC20(request, signFunction, options = {}) {
    const { tokenAddress, recipient, amount } = request;

    // Create ERC20 interface
    const erc20Interface = new ethers.Interface([
      'function transfer(address to, uint256 amount) returns (bool)'
    ]);

    // Encode the transfer call
    const callData = erc20Interface.encodeFunctionData('transfer', [recipient, amount]);

    // Send the user operation
    return this.sendUserOperationAndWait({
      target: tokenAddress,
      value: 0n,
      callData: callData
    }, signFunction, options);
  }

  /**
   * Approve ERC20 tokens for a spender
   * 
   * @param {Object} request - ERC20 approve request
   * @param {string} request.tokenAddress - ERC20 token contract address
   * @param {string} request.spender - Spender address
   * @param {bigint} request.amount - Amount to approve
   * @param {Function} signFunction - Async function to sign the userOpHash
   * @param {Object} options - Optional gas parameters
   * @returns {Promise<Object>} Transaction result
   */
  async approveERC20(request, signFunction, options = {}) {
    const { tokenAddress, spender, amount } = request;

    // Create ERC20 interface
    const erc20Interface = new ethers.Interface([
      'function approve(address spender, uint256 amount) returns (bool)'
    ]);

    // Encode the approve call
    const callData = erc20Interface.encodeFunctionData('approve', [spender, amount]);

    // Send the user operation
    return this.sendUserOperationAndWait({
      target: tokenAddress,
      value: 0n,
      callData: callData
    }, signFunction, options);
  }

  /**
   * Get the account nonce from the EntryPoint
   * @param {number} key - Nonce key (default: 0)
   * @returns {Promise<bigint>} The nonce
   */
  async getNonce(key = 0) {
    return this.userOpBuilder.getNonce(key);
  }

  /**
   * Get the account balance
   * @returns {Promise<bigint>} Balance in wei
   */
  async getBalance() {
    return this.provider.getBalance(this.config.proxyAddress);
  }

  /**
   * Get ERC20 token balance
   * @param {string} tokenAddress - Token contract address
   * @returns {Promise<bigint>} Token balance
   */
  async getERC20Balance(tokenAddress) {
    const erc20Interface = new ethers.Interface([
      'function balanceOf(address account) view returns (uint256)'
    ]);

    const data = erc20Interface.encodeFunctionData('balanceOf', [this.config.proxyAddress]);
    const result = await this.provider.call({
      to: tokenAddress,
      data: data
    });

    return ethers.getBigInt(result);
  }

  /**
   * Estimate gas for a UserOperation
   * @param {Object} request - Transaction request
   * @param {Object} options - Optional parameters
   * @returns {Promise<Object>} Gas estimates
   */
  async estimateUserOperationGas(request, options = {}) {
    const userOp = await this.userOpBuilder.buildUserOp(request, options);
    
    // Add dummy signature for estimation
    userOp.signature = '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c';
    
    return this.bundlerClient.estimateUserOperationGas(
      userOp,
      this.config.entryPointAddress
    );
  }

  /**
   * Get supported entry points from bundler
   * @returns {Promise<string[]>} Array of supported EntryPoint addresses
   */
  async getSupportedEntryPoints() {
    return this.bundlerClient.getSupportedEntryPoints();
  }
}

module.exports = { GokiteAASDK, UserOpBuilder, BundlerClient };
