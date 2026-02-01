# Gokite AA SDK 示例

所有功能集成在单个文件中：`gokite-sdk-demo.js`

## 快速开始

```bash
# 设置私钥（可选，也可在交互式模式中输入）
export PRIVATE_KEY="0xYourPrivateKeyHere"

# 启动交互式模式
node examples/gokite-sdk-demo.js interactive
```

## 使用方式

### 1. 交互式模式（推荐）

```bash
node examples/gokite-sdk-demo.js interactive
```

然后按提示选择操作：
- 查询余额
- 检查 Bundler
- 浏览器链接
- 发送 ETH
- 发送 ERC20
- 批量交易

### 2. 命令行模式

```bash
# 查询余额
node examples/gokite-sdk-demo.js balance

# 检查 Bundler 状态
node examples/gokite-sdk-demo.js bundler

# 获取浏览器链接
node examples/gokite-sdk-demo.js links

# 发送 ETH
node examples/gokite-sdk-demo.js send-eth --to 0x... --amount 0.001

# 发送 ERC20
node examples/gokite-sdk-demo.js send-erc20 --to 0x... --amount 100

# 批量交易
node examples/gokite-sdk-demo.js batch
```

### 3. 查看帮助

```bash
node examples/gokite-sdk-demo.js --help
```

## 配置

默认配置：

| 参数 | 值 |
|------|-----|
| Network | `kite_testnet` |
| RPC URL | `https://rpc-testnet.gokite.ai` |
| Bundler URL | `https://bundler-service.staging.gokite.ai/rpc/` |
| EntryPoint | `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789` (v0.6) |
| AA Wallet | `0xca38E92a709a3bA0704Eb16609E6C89a0C9DF21F` |

## API 使用示例

如果你想在自己的代码中使用，可以导入功能函数：

```javascript
const { ethers } = require('ethers');
const { GokiteAASDK } = require('./src');

// 初始化 SDK
const sdk = new GokiteAASDK({
  network: 'kite_testnet',
  rpcUrl: 'https://rpc-testnet.gokite.ai',
  bundlerUrl: 'https://bundler-service.staging.gokite.ai/rpc/',
  entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  proxyAddress: '0xca38E92a709a3bA0704Eb16609E6C89a0C9DF21F'
});

// 创建签名器
const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

// 签名函数
const signFunction = async (userOpHash) => {
  return signer.signMessage(ethers.getBytes(userOpHash));
};

// 查询余额
const balance = await sdk.getBalance();

// 发送 ETH
const result = await sdk.sendUserOperationAndWait({
  target: '0xRecipientAddress',
  value: ethers.parseEther('0.001'),
  callData: '0x'
}, signFunction);

// 发送 ERC20
const result = await sdk.sendERC20({
  tokenAddress: '0xTokenAddress',
  recipient: '0xRecipientAddress',
  amount: ethers.parseUnits('100', 18)
}, signFunction);

// 批量交易
const result = await sdk.sendBatchUserOperationAndWait({
  targets: ['0xAddr1', '0xAddr2'],
  values: [ethers.parseEther('0.001'), 0n],
  callDatas: ['0x', '0x...']
}, signFunction);
```

## 可用代币

| 名称 | 地址 |  decimals |
|------|------|----------|
| Settlement Token | `0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63` | 18 |

## 浏览器链接

- Kite Testnet: https://testnet.gokite.ai
- 文档: https://docs.gokite.ai/
