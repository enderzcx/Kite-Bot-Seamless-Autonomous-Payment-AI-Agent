# Gokite Account Abstraction SDK

> 简化 ERC-4337 账户抽象，一键完成转账

---

## 项目概述

Gokite Account Abstraction SDK 是一个专为 Kite Chain 设计的 JavaScript SDK，提供完整的 ERC-4337 账户抽象解决方案。通过单文件集成，开发者可以快速实现无 gas 交易、批量转账和 ERC20 代币操作。

---

## 核心特性

### ✨ 单文件集成
- **300 行代码**：所有功能封装在一个文件中
- **零依赖**：只需 ethers.js
- **即插即用**：复制即可使用
- **ES Module**：支持现代前端框架

### 🚀 功能完整
- ✅ ETH 转账
- ✅ 批量交易
- ✅ ERC20 代币转账
- ✅ ERC20 授权
- ✅ 余额查询
- ✅ MetaMask 钱包连接

### 🎨 现代化 UI
- React + Vite 前端
- 响应式设计
- 实时状态更新
- 清晰的错误提示

---

## 快速开始

### 安装依赖

```bash
cd SDK/frontend
npm install
```

### 配置环境变量

创建 `.env` 文件：

```env
VITE_KITE_RPC_URL=https://rpc-testnet.gokite.ai
VITE_BUNDLER_URL=https://bundler-service.staging.gokite.ai/rpc/
VITE_USER_PRIVATE_KEY=你的私钥
VITE_AA_WALLET_ADDRESS=0xca38E92a709a3bA0704Eb16609E6C89a0C9DF21F
```

### 启动开发服务器

```bash
npm run dev
```

### 使用 SDK

```javascript
import { GokiteAASDK } from './gokite-aa-sdk';

const sdk = new GokiteAASDK({
  rpcUrl: 'https://rpc-testnet.gokite.ai',
  bundlerUrl: 'https://bundler-service.staging.gokite.ai/rpc/',
  entryPointAddress: '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108',
  proxyAddress: '0xca38E92a709a3bA0704Eb16609E6C89a0C9DF21F'
});

// 发送 ETH
const result = await sdk.sendUserOperationAndWait({
  target: '0x接收地址',
  value: ethers.parseEther('0.001'),
  callData: '0x'
}, async (userOpHash) => {
  return signer.signMessage(ethers.getBytes(userOpHash));
});

console.log('交易哈希:', result.transactionHash);
```

---

## 技术架构

```
┌─────────────────────────────────────┐
│         用户界面 (React)         │
├─────────────────────────────────────┤
│                                  │
│  ┌─────────────────────────────┐  │
│  │   GokiteAASDK (SDK)    │  │
│  ├─────────────────────────────┤  │
│  │  • sendUserOperation     │  │
│  │  • sendBatchUserOperation│  │
│  │  • getBalance             │  │
│  │  • sendERC20             │  │
│  └─────────────────────────────┘  │
│                                  │
├─────────────────────────────────────┤
│         Bundler Service            │
├─────────────────────────────────────┤
│         EntryPoint Contract          │
├─────────────────────────────────────┤
│         GokiteAccount Proxy         │
├─────────────────────────────────────┤
│         Kite Chain RPC             │
└─────────────────────────────────────┘
```

---

## 合约地址

### Kite Testnet
- **RPC**: https://rpc-testnet.gokite.ai
- **Bundler**: https://bundler-service.staging.gokite.ai/rpc/
- **EntryPoint**: 0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108
- **GokiteAccount**: 0xca38E92a709a3bA0704Eb16609E6C89a0C9DF21F

---

## 文件结构

```
SDK/frontend/
├── src/
│   ├── App.jsx              # 主应用组件
│   ├── Transfer.jsx         # 转账组件
│   ├── gokite-aa-sdk.js   # SDK 核心类
│   ├── App.css             # 样式文件
│   └── main.jsx            # 入口文件
├── .env                  # 环境变量
├── package.json            # 依赖配置
├── vite.config.js          # Vite 配置
└── index.html             # HTML 模板
```

---

## API 参考

### GokiteAASDK 类

| 方法 | 说明 |
|------|------|
| `sendUserOperationAndWait()` | 发送单笔交易并等待确认 |
| `sendBatchUserOperationAndWait()` | 发送批量交易 |
| `sendERC20()` | 发送 ERC20 代币 |
| `approveERC20()` | 授权 ERC20 代币 |
| `getBalance()` | 查询 ETH 余额 |
| `getERC20Balance()` | 查询 ERC20 余额 |

---

## 前端组件

### Transfer 组件

**功能：**
- 连接 MetaMask 钱包
- 显示 AA 钱包地址和余额
- 填写接收地址和金额
- 执行转账
- 显示交易结果
- 自动更新余额

**状态管理：**
- `aaWallet` - AA 钱包地址
- `owner` - 钱包所有者地址
- `senderBalance` - AA 钱包余额
- `recipient` - 接收地址
- `amount` - 转账金额
- `loading` - 加载状态
- `status` - 交易状态
- `txHash` - 交易哈希
- `userOpHash` - UserOperation 哈希

---

## 使用示例

### 1. 连接钱包

```javascript
// 点击"连接钱包"按钮后
const handleConnectWallet = async () => {
  if (typeof window.ethereum !== 'undefined') {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    setOwner(address);
    setAAWallet(sdk.config.proxyAddress);
    
    const balance = await sdk.getBalance();
    setSenderBalance(ethers.formatEther(balance));
    
    alert(`钱包已连接: ${address}`);
  }
};
```

### 2. 发送 ETH

```javascript
const handleTransfer = async () => {
  const result = await sdk.sendUserOperationAndWait({
    target: recipient,
    value: ethers.parseEther(amount),
    callData: '0x'
  }, signFunction);

  if (result.status === 'success') {
    const newBalance = await sdk.getBalance();
    setSenderBalance(ethers.formatEther(newBalance));
  }
};
```

### 3. 批量交易

```javascript
const batchRequest = {
  targets: ['0x地址1', '0x地址2'],
  values: [ethers.parseEther('0.001'), ethers.parseEther('0.002')],
  callDatas: ['0x', '0x']
};

const result = await sdk.sendBatchUserOperationAndWait(batchRequest, signFunction);
```

---

## 常见问题

### Q: 如何获取私钥？
**A:** 请妥善保管私钥，不要泄露给他人。私钥用于签名交易，拥有私钥即可控制 AA 钱包。

### Q: 转账失败怎么办？
**A:** 检查以下内容：
1. AA 钱包余额是否充足
2. 接收地址是否正确
3. Gas 费用是否足够
4. Bundler 服务是否正常运行

### Q: 如何查看交易详情？
**A:** 使用区块链浏览器：
- Kite Testnet Explorer: https://testnet.gokite.ai
- 输入交易哈希或地址即可查询

---

## 技术支持

- **React 19.2+**
- **Vite 7.3+**
- **Ethers.js 6.9+**
- **ES6+ Modules**
- **Node.js 18+**

---

## License

MIT License

---

## 联系方式

- **GitHub Issues**: [项目地址]
- **Email**: [联系邮箱]
- **Discord**: [社区频道]

---

**Gokite Account Abstraction SDK** - 让区块链转账更简单！
