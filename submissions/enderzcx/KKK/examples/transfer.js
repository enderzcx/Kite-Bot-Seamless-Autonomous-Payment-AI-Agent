/**
 * 精简版转账示例
 * 
 * 使用方法：
 * 1. 确保 SDK/.env 文件中有正确的配置
 * 2. 运行: node examples/transfer.js
 */

const { ethers } = require('ethers');
const { GokiteAASDK } = require('../gokite-aa-sdk');
require('dotenv').config();

const CONFIG = {
  rpcUrl: process.env.KITE_RPC_URL,
  bundlerUrl: process.env.BUNDLER_URL,
  entryPointAddress: '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108',
  proxyAddress: process.env.AA_WALLET_ADDRESS
};

const PRIVATE_KEY = process.env.USER_PRIVATE_KEY;
const RECIPIENT = process.env.TESTNET_TRANSFER_TO;
const AMOUNT = '0.001';

async function transfer() {
  try {
    const sdk = new GokiteAASDK(CONFIG);
    const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log('=== Gokite Account Abstraction SDK ===\n');
    console.log('AA 钱包:', CONFIG.proxyAddress);
    console.log('Owner:', signer.address);
    console.log('接收地址:', RECIPIENT);

    const balance = await sdk.getBalance();
    const recipientBalance = await provider.getBalance(RECIPIENT);

    console.log('\n转账前余额:');
    console.log(`  ${CONFIG.proxyAddress}: ${ethers.formatEther(balance)} ETH`);
    console.log(`  ${RECIPIENT}: ${ethers.formatEther(recipientBalance)} ETH`);

    const signFunction = async (userOpHash) => {
      return signer.signMessage(ethers.getBytes(userOpHash));
    };

    console.log(`\n发送 ${AMOUNT} ETH 到 ${RECIPIENT}...`);

    const result = await sdk.sendUserOperationAndWait({
      target: RECIPIENT,
      value: ethers.parseEther(AMOUNT),
      callData: '0x'
    }, signFunction);

    if (result.status === 'success') {
      console.log('\n✅ 转账成功!');
      console.log('交易哈希:', result.transactionHash);
      console.log('UserOp Hash:', result.userOpHash);

      const newBalance = await sdk.getBalance();
      const newRecipientBalance = await provider.getBalance(RECIPIENT);

      console.log('\n转账后余额:');
      console.log(`  ${CONFIG.proxyAddress}: ${ethers.formatEther(newBalance)} ETH`);
      console.log(`  ${RECIPIENT}: ${ethers.formatEther(newRecipientBalance)} ETH`);
    } else {
      console.log('\n❌ 转账失败:', result.reason);
    }
  } catch (error) {
    console.error('错误:', error.message);
  }
}

transfer();
