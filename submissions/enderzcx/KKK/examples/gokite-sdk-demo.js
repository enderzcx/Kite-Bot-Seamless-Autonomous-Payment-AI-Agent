#!/usr/bin/env node

/**
 * Gokite AA SDK 综合示例
 * 
 * 包含所有功能的单文件示例：
 * - 查询余额
 * - 检查 Bundler
 * - 获取浏览器链接
 * - 发送 ETH
 * - 发送 ERC20
 * - 批量交易
 * 
 * 使用方法:
 *   node examples/gokite-sdk-demo.js [command] [options]
 * 
 * 命令:
 *   balance              查询余额
 *   bundler              检查 Bundler 状态
 *   links                获取浏览器链接
 *   send-eth             发送 ETH
 *   send-erc20           发送 ERC20 代币
 *   batch                执行批量交易
 *   interactive          交互式模式（默认）
 * 
 * 选项:
 *   --to <address>       接收地址
 *   --amount <amount>    金额（ETH 或代币数量）
 *   --token <address>    代币合约地址
 *   --private-key <key>  私钥（也可设置 PRIVATE_KEY 环境变量）
 * 
 * 示例:
 *   node examples/gokite-sdk-demo.js balance
 *   node examples/gokite-sdk-demo.js send-eth --to 0x... --amount 0.001
 *   node examples/gokite-sdk-demo.js send-erc20 --to 0x... --amount 100
 *   node examples/gokite-sdk-demo.js interactive
 */

const { ethers } = require('ethers');
const { GokiteAASDK, BundlerClient } = require('../src/index.js');
const readline = require('readline');

// ==================== 配置 ====================

const CONFIG = {
  network: 'kite_testnet',
  rpcUrl: 'https://rpc-testnet.gokite.ai',
  bundlerUrl: 'https://bundler-service.staging.gokite.ai/rpc/',
  entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  proxyAddress: '0xca38E92a709a3bA0704Eb16609E6C89a0C9DF21F',
  chainId: 1
};

const TOKENS = {
  settlement: {
    name: 'Settlement Token',
    address: '0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63',
    decimals: 18
  }
};

const ADDRESSES = {
  aaWallet: '0xca38E92a709a3bA0704Eb16609E6C89a0C9DF21F',
  recipient1: '0x6D705b93F0Da7DC26e46cB39Decc3baA4fb4dd29',
  recipient2: '0x4C8A301d3852118A544739Ee45957e8737e617b8',
  exampleTx: '0x61ae0cf0a4f5b14e6240ff71a1e9ef17fd6c7b81fed760eee7aa6bc9dda8f65d'
};

// ==================== 工具函数 ====================

function getPrivateKey() {
  const key = process.env.PRIVATE_KEY || process.argv.find((arg, i, arr) => 
    arg === '--private-key' && arr[i + 1]
  );
  if (key === '--private-key') {
    const index = process.argv.indexOf('--private-key');
    return process.argv[index + 1];
  }
  return key;
}

function getArg(flag) {
  const index = process.argv.indexOf(flag);
  return index !== -1 && process.argv[index + 1] ? process.argv[index + 1] : null;
}

function printExplorerLinks() {
  console.log('\n=== 浏览器链接 ===\n');
  
  const explorers = [
    { name: 'Kite Testnet', url: 'https://testnet.gokite.ai' }
  ];
  
  console.log('地址链接:');
  for (const [name, address] of Object.entries(ADDRESSES)) {
    console.log(`  ${name}: ${address}`);
    explorers.forEach(exp => {
      console.log(`    ${exp.name}: ${exp.url}/address/${address}`);
    });
  }
  
  console.log('\n交易链接:');
  console.log(`  示例交易: ${ADDRESSES.exampleTx}`);
  explorers.forEach(exp => {
    console.log(`    ${exp.name}: ${exp.url}/tx/${ADDRESSES.exampleTx}`);
  });
  
  console.log('\n文档:');
  console.log('  https://docs.gokite.ai/');
}

async function askQuestion(rl, question) {
  return new Promise(resolve => {
    rl.question(question, answer => resolve(answer.trim()));
  });
}

// ==================== 功能函数 ====================

async function checkBalances(sdk) {
  console.log('\n=== 余额查询 ===\n');
  console.log('AA Wallet:', sdk.getAccountAddress());
  
  // ETH 余额
  const ethBalance = await sdk.getBalance();
  console.log(`ETH 余额: ${ethers.formatEther(ethBalance)} ETH`);
  
  // Token 余额
  for (const [key, token] of Object.entries(TOKENS)) {
    try {
      const balance = await sdk.getERC20Balance(token.address);
      console.log(`${token.name} 余额: ${ethers.formatUnits(balance, token.decimals)}`);
    } catch (e) {
      console.log(`${token.name}: 查询失败`);
    }
  }
  
  // Nonce
  try {
    const nonce = await sdk.getNonce();
    console.log(`当前 Nonce: ${nonce}`);
  } catch (e) {
    console.log(`Nonce: 查询失败 - ${e.message}`);
  }
}

async function checkBundler() {
  console.log('\n=== Bundler 状态检查 ===\n');
  console.log('Bundler URL:', CONFIG.bundlerUrl);
  
  try {
    const bundlerClient = new BundlerClient(CONFIG.bundlerUrl);
    const entryPoints = await bundlerClient.getSupportedEntryPoints();
    
    console.log('✅ Bundler 在线');
    console.log('支持的 EntryPoints:', entryPoints);
    
    const isSupported = entryPoints.some(
      ep => ep.toLowerCase() === CONFIG.entryPointAddress.toLowerCase()
    );
    
    if (isSupported) {
      console.log('✅ 当前 EntryPoint 受支持');
    } else {
      console.log('⚠️  当前 EntryPoint 可能不受支持');
      console.log('   当前:', CONFIG.entryPointAddress);
    }
  } catch (error) {
    console.log('❌ Bundler 连接失败:', error.message);
  }
}

async function sendETH(sdk, signer, recipient, amount) {
  console.log('\n=== 发送 ETH ===\n');
  console.log('发送地址:', sdk.getAccountAddress());
  console.log('接收地址:', recipient);
  console.log('金额:', amount, 'ETH');
  
  const signFunction = async (userOpHash) => {
    return signer.signMessage(ethers.getBytes(userOpHash));
  };
  
  // Gas 估算
  console.log('\n估算 gas...');
  try {
    const gasEstimate = await sdk.estimateUserOperationGas({
      target: recipient,
      value: ethers.parseEther(amount),
      callData: '0x'
    });
    console.log('Gas 估算:', gasEstimate);
  } catch (e) {
    console.log('Gas 估算失败:', e.message);
  }
  
  // 发送交易
  console.log('\n发送交易...');
  const result = await sdk.sendUserOperationAndWait({
    target: recipient,
    value: ethers.parseEther(amount),
    callData: '0x'
  }, signFunction);
  
  if (result.status === 'success') {
    console.log('✅ 发送成功!');
    console.log('交易哈希:', result.transactionHash);
    console.log('UserOp 哈希:', result.userOpHash);
    console.log('区块:', result.receipt?.blockNumber);
  } else {
    console.log('❌ 发送失败:', result.reason);
  }
}

async function sendERC20(sdk, signer, tokenKey, recipient, amount) {
  console.log('\n=== 发送 ERC20 代币 ===\n');
  
  const token = TOKENS[tokenKey] || Object.values(TOKENS).find(t => t.address === tokenKey);
  if (!token) {
    console.log('❌ 未知的代币:', tokenKey);
    return;
  }
  
  console.log('代币:', token.name);
  console.log('合约:', token.address);
  console.log('接收地址:', recipient);
  console.log('金额:', amount);
  
  const signFunction = async (userOpHash) => {
    return signer.signMessage(ethers.getBytes(userOpHash));
  };
  
  // 发送前余额
  const balanceBefore = await sdk.getERC20Balance(token.address);
  console.log('\n发送前余额:', ethers.formatUnits(balanceBefore, token.decimals));
  
  // 发送
  console.log('\n发送交易...');
  const result = await sdk.sendERC20({
    tokenAddress: token.address,
    recipient: recipient,
    amount: ethers.parseUnits(amount, token.decimals)
  }, signFunction);
  
  if (result.status === 'success') {
    console.log('✅ 发送成功!');
    console.log('交易哈希:', result.transactionHash);
    
    const balanceAfter = await sdk.getERC20Balance(token.address);
    console.log('发送后余额:', ethers.formatUnits(balanceAfter, token.decimals));
  } else {
    console.log('❌ 发送失败:', result.reason);
  }
}

async function batchTransactions(sdk, signer) {
  console.log('\n=== 批量交易 ===\n');
  
  const token = TOKENS.settlement;
  const recipient1 = ADDRESSES.recipient1;
  const recipient2 = ADDRESSES.recipient2;
  
  const erc20Interface = new ethers.Interface([
    'function transfer(address to, uint256 amount) returns (bool)'
  ]);
  
  const batchRequest = {
    targets: [
      recipient1,           // 1. 发送 ETH
      token.address,        // 2. 发送代币
    ],
    values: [
      ethers.parseEther('0.001'),
      0n,
    ],
    callDatas: [
      '0x',
      erc20Interface.encodeFunctionData('transfer', [
        recipient2,
        ethers.parseUnits('10', token.decimals)
      ])
    ]
  };
  
  console.log('交易列表:');
  console.log('1. 发送 0.001 ETH 到', recipient1);
  console.log('2. 发送 10 个代币 到', recipient2);
  
  const signFunction = async (userOpHash) => {
    return signer.signMessage(ethers.getBytes(userOpHash));
  };
  
  console.log('\n执行批量交易...');
  const result = await sdk.sendBatchUserOperationAndWait(batchRequest, signFunction);
  
  if (result.status === 'success') {
    console.log('✅ 批量交易成功!');
    console.log('交易哈希:', result.transactionHash);
    console.log('实际 Gas 使用:', result.receipt?.actualGasUsed);
  } else {
    console.log('❌ 批量交易失败:', result.reason);
  }
}

// ==================== 交互式模式 ====================

async function interactiveMode() {
  console.log('\n');
  console.log('╔══════════════════════════════════════╗');
  console.log('║     Gokite AA SDK 交互式示例         ║');
  console.log('╚══════════════════════════════════════╝');
  console.log('\n配置:');
  console.log('  Network:', CONFIG.network);
  console.log('  AA Wallet:', CONFIG.proxyAddress);
  console.log('  EntryPoint:', CONFIG.entryPointAddress);
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const privateKey = getPrivateKey();
  if (!privateKey || privateKey === '0xYourPrivateKeyHere') {
    console.log('\n⚠️  请设置 PRIVATE_KEY 环境变量或提供 --private-key 参数');
    console.log('示例: PRIVATE_KEY=0x... node examples/gokite-sdk-demo.js interactive');
    rl.close();
    return;
  }
  
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);
  const sdk = new GokiteAASDK(CONFIG);
  
  console.log('\nOwner 地址:', signer.address);
  
  while (true) {
    console.log('\n─────────────────────────');
    console.log('请选择操作:');
    console.log('  1. 查询余额');
    console.log('  2. 检查 Bundler');
    console.log('  3. 浏览器链接');
    console.log('  4. 发送 ETH');
    console.log('  5. 发送 ERC20');
    console.log('  6. 批量交易');
    console.log('  0. 退出');
    console.log('─────────────────────────');
    
    const choice = await askQuestion(rl, '\n输入选项 (0-6): ');
    
    try {
      switch (choice) {
        case '1':
          await checkBalances(sdk);
          break;
        case '2':
          await checkBundler();
          break;
        case '3':
          printExplorerLinks();
          break;
        case '4': {
          const to = await askQuestion(rl, '接收地址: ');
          const amount = await askQuestion(rl, '金额 (ETH): ');
          await sendETH(sdk, signer, to || ADDRESSES.recipient1, amount || '0.001');
          break;
        }
        case '5': {
          const to = await askQuestion(rl, '接收地址: ');
          const amount = await askQuestion(rl, '金额: ');
          await sendERC20(sdk, signer, 'settlement', to || ADDRESSES.recipient1, amount || '10');
          break;
        }
        case '6':
          await batchTransactions(sdk, signer);
          break;
        case '0':
          console.log('\n再见!');
          rl.close();
          return;
        default:
          console.log('无效选项');
      }
    } catch (error) {
      console.log('错误:', error.message);
    }
  }
}

// ==================== 命令行模式 ====================

async function commandLineMode() {
  const command = process.argv[2];
  
  if (!command || command === 'help' || command === '-h' || command === '--help') {
    console.log(__filename.match(/\/\/[^\n]*\n/)[0].replace(/\/\/?\*?/g, '').trim());
    return;
  }
  
  if (command === 'links') {
    printExplorerLinks();
    return;
  }
  
  if (command === 'bundler') {
    await checkBundler();
    return;
  }
  
  // 需要私钥的命令
  const privateKey = getPrivateKey();
  if (!privateKey || privateKey === '0xYourPrivateKeyHere') {
    console.log('❌ 请设置 PRIVATE_KEY 环境变量或使用 --private-key 参数');
    process.exit(1);
  }
  
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);
  const sdk = new GokiteAASDK(CONFIG);
  
  switch (command) {
    case 'balance':
      await checkBalances(sdk);
      break;
      
    case 'send-eth': {
      const to = getArg('--to') || ADDRESSES.recipient1;
      const amount = getArg('--amount') || '0.001';
      await sendETH(sdk, signer, to, amount);
      break;
    }
      
    case 'send-erc20': {
      const to = getArg('--to') || ADDRESSES.recipient1;
      const amount = getArg('--amount') || '10';
      const token = getArg('--token') || 'settlement';
      await sendERC20(sdk, signer, token, to, amount);
      break;
    }
      
    case 'batch':
      await batchTransactions(sdk, signer);
      break;
      
    case 'interactive':
      await interactiveMode();
      break;
      
    default:
      console.log('❌ 未知命令:', command);
      console.log('可用命令: balance, bundler, links, send-eth, send-erc20, batch, interactive');
      process.exit(1);
  }
}

// ==================== 入口 ====================

if (require.main === module) {
  commandLineMode().catch(error => {
    console.error('错误:', error.message);
    process.exit(1);
  });
}

module.exports = {
  CONFIG,
  TOKENS,
  ADDRESSES,
  checkBalances,
  checkBundler,
  printExplorerLinks,
  sendETH,
  sendERC20,
  batchTransactions
};
