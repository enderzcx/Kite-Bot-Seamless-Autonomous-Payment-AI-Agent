# KITE BOT

命令你的AI,让他像仆人一样做事

## 安装

## 环境配置与运行

本仓库包含：前端（SDK/frontend）、后端（backend）、Hardhat（hardhat）。

### 1) 前端
1. 复制环境变量模板：
   - `SDK/frontend/.env.example` → `SDK/frontend/.env`
2. 按需填写：
   - `VITE_KITE_RPC_URL`（可保持 `/rpc`，使用 Vite 代理）
   - `VITE_BUNDLER_URL`（可保持 `/bundler`，使用 Vite 代理）
   - `VITE_AA_WALLET_ADDRESS`
   - `VITE_USER_PRIVATE_KEY`
   - `VITE_SETTLEMENT_TOKEN`
   - `VITE_VAULT_ADDRESS`
3. 启动：
   ```bash
   cd SDK/frontend
   npm install
   npm run dev
   ```

### 2) 后端（记录保存）
1. 复制环境变量模板：
   - `backend/.env.example` → `backend/.env`（可选）
2. 启动：
   ```bash
   cd backend
   npm install
   npm start
   ```
3. 接口：
   - `GET /api/records`
   - `POST /api/records`

### 3) Hardhat（可选）
1. 复制环境变量模板：
   - `hardhat/.env.example` → `hardhat/.env`
2. 按需填写：
   - `KITE_RPC_URL`
   - `PRIVATE_KEY`
3. 常用命令：
   ```bash
   cd hardhat
   npm install
   npx hardhat test
   ```

### 4) Vite 代理说明
前端默认通过 Vite 代理访问 RPC/Bundler/后端：
- `/rpc` → Kite RPC
- `/bundler` → Bundler
- `/api` → `http://localhost:3001`

## 快速开始

```javascript
const { GokiteAASDK } = require('./src');
const { ethers } = require('ethers');

// 初始化 SDK
const sdk = new GokiteAASDK({
  network: 'kite_testnet',
  rpcUrl: 'https://rpc-testnet.gokite.ai',
  bundlerUrl: 'https://bundler-service.staging.gokite.ai/rpc/',
  entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  proxyAddress: '0xca38E92a709a3bA0704Eb16609E6C89a0C9DF21F'
});

// 创建签名者
const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
const signer = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);

// 定义签名函数
const signFunction = async (userOpHash) => {
  return signer.signMessage(ethers.getBytes(userOpHash));
};

// 发送 ETH
const result = await sdk.sendUserOperationAndWait({
  target: '0xRecipientAddress',
  value: ethers.parseEther('0.001'),
  callData: '0x'
}, signFunction);

console.log('交易哈希:', result.transactionHash);
```

### Gas 估算

```javascript
// 发送前估算 Gas
const gasEstimate = await sdk.estimateUserOperationGas({
  target: '0xRecipientAddress',
  value: ethers.parseEther('0.001'),
  callData: '0x'
});

console.log('Gas 估算:', gasEstimate);

// 使用自定义 Gas 选项发送
const result = await sdk.sendUserOperationAndWait({
  target: '0xRecipientAddress',
  value: ethers.parseEther('0.001'),
  callData: '0x'
}, signFunction, {
  callGasLimit: 150000n,
  verificationGasLimit: 150000n,
  maxFeePerGas: 2000000000n
});
```

## 配置

| 参数 | 描述 | 必填 |
|-----------|-------------|----------|
| `network` | 网络名称（例如 'kite_testnet'） | 是 |
| `rpcUrl` | Kite RPC URL | 是 |
| `bundlerUrl` | Bundler RPC URL | 是 |
| `entryPointAddress` | EntryPoint 合约地址 | 是 |
| `proxyAddress` | GokiteAccount 代理地址 | 是 |
| `chainId` | 链 ID（可选，默认为 1） | 否 |

## 架构

所有 SDK 功能都包含在单个文件（`src/index.js`）中，包含三个主要类：
- `GokiteAASDK` - 用于发送交易的主要 SDK 类
- `UserOpBuilder` - 构建 ERC-4337 v0.6 UserOperations
- `BundlerClient` - 与 Bundler 服务通信

## API 参考

### GokiteAASDK

#### `sendUserOperationAndWait(request, signFunction)`

发送单个交易并等待确认。

**参数：**
- `request` (Object): 交易请求
  - `target` (string): 目标地址
  - `value` (bigint): 要发送的 ETH 数量（以 wei 为单位）
  - `callData` (string): 交易的调用数据
- `signFunction` (Function): 用于签名 userOpHash 的异步函数

**返回值：** Promise<Object>，包含 `status`、`transactionHash`、`userOpHash`

#### `sendBatchUserOperationAndWait(batchRequest, signFunction)`

在单个 UserOperation 中发送多个交易。

**参数：**
- `batchRequest` (Object): 批量请求
  - `targets` (string[]): 目标地址数组
  - `values` (bigint[]): 要发送的值数组
  - `callDatas` (string[]): 调用数据数组
- `signFunction` (Function): 用于签名 userOpHash 的异步函数

#### `sendERC20(request, signFunction)`

发送 ERC20 代币。

**参数：**
- `request` (Object):
  - `tokenAddress` (string): ERC20 代币合约地址
  - `recipient` (string): 代币接收者地址
  - `amount` (bigint): 要转账的代币数量
- `signFunction` (Function): 用于签名 userOpHash 的异步函数

#### `approveERC20(request, signFunction)`

为支出者授权 ERC20 代币。

**参数：**
- `request` (Object):
  - `tokenAddress` (string): ERC20 代币合约地址
  - `spender` (string): 支出者地址
  - `amount` (bigint): 要授权的数量
- `signFunction` (Function): 用于签名 userOpHash 的异步函数

#### `getBalance()`

获取账户 ETH 余额。

**返回值：** Promise<bigint>

#### `getERC20Balance(tokenAddress)`

获取 ERC20 代币余额。

**参数：**
- `tokenAddress` (string): 代币合约地址

**返回值：** Promise<bigint>

#### `getNonce()`

从 EntryPoint 获取账户 nonce。

**返回值：** Promise<bigint>

## 示例

### 发送 ETH

```bash
node examples/send-eth.js
```

### 发送 ERC20 代币

```bash
node examples/send-erc20.js
```

### 批量交易

```bash
node examples/batch-transactions.js
```

## 合约地址（Kite 测试网）

- **代理合约**: `0xca38E92a709a3bA0704Eb16609E6C89a0C9DF21F`
- **实现合约**: `0xF7681F4f70a2F2d114D03e6B93189cb549B8A503`
- **结算代币**: `0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63`
- **EntryPoint**: `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`

## 架构

```
┌─────────────────┐
│   GokiteAASDK   │
│  (index.js)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐  ┌──▼──────┐
│UserOp │  │ Bundler │
│Builder│  │ Client  │
└───┬───┘  └────┬────┘
    │           │
    └─────┬─────┘
          │
    ┌─────▼──────┐
    │  Bundler   │
    │   Service  │
    └─────┬──────┘
          │
    ┌─────▼──────┐
    │ EntryPoint │
    └─────┬──────┘
          │
    ┌─────▼──────┐
    │   Proxy    │
    │  Contract  │
    └─────┬──────┘
          │ delegatecall
    ┌─────▼──────┐
    │GokiteAccount│
    │Implementation
    └────────────┘
```

**注意：** 所有类都从单个文件 `src/index.js` 导出，以便于维护。

## 许可证

MIT
