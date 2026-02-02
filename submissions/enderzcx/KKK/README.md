# KITE BOT 前端（Kite AI Payment Demo）

这是一个面向 Kite Testnet 的前端 Demo，用于展示 **AI Agent 自动支付 + 金库额度规则 + 交易记录** 的完整流程。
Demo 视频: https://www.bilibili.com/video/BV1bzFPzGEkH/
请参考官方文档生成AA地址https://docs.gokite.ai/kite-chain/account-abstraction-sdk ：
初始化 SDK

```
import { GokiteAASDK } from 'gokite-aa-sdk';

const sdk = new GokiteAASDK(
  'kite_testnet',                                  // Network name
  'https://rpc-testnet.gokite.ai',                // Kite RPC URL
  'https://bundler-service.staging.gokite.ai/rpc/' // Bundler RPC
);
```
获取账户抽象钱包地址

```
const signer = '0xYourEOAAddress';

const aaWalletAddress = sdk.getAccountAddress(signer);

console.log('AA Wallet:', aaWalletAddress);
```
验证
signFunction使用您首选的钱包/认证 SDK进行实现：


```
// example with ethers: 
const signFunction = async (userOpHash: string): Promise<string> => {
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!);
  return signer.signMessage(ethers.getBytes(userOpHash));
};
```
## 主要功能(务必在生成AA地址和金库地址后向其转入Kite测试网USDThttps://faucet.gokite.ai/)

- **登录页**： 前端入口：http://localhost:5173/ 一键进入系统（提示分配专属 KITE BOT）
- **需求下单**：输入需求 → 自动触发 USDT 转账 → 返回交易哈希/物流信息
- **转账页**：手动转账 USDT（AA 账号发起）
- **金库管理**：查看余额 / 设置单笔&日额度 / 充值 / 提现到 Owner
- **Agent 支付设置**：
  - 允许的 Token
  - 创建 Session 并应用规则
  - 更新规则 / 读取规则
- **转账记录**：保存到本地后端并可回溯（时间/类型/金额/Token/收款/TxHash/状态）

## 运行前准备

### 1) 安装依赖

```bash
cd SDK/frontend
npm install
```

### 2) 配置环境变量

创建 `.env` 文件（可参考 `.env.example`）：

```env
VITE_KITE_RPC_URL=https://rpc-testnet.gokite.ai/
VITE_BUNDLER_URL=https://bundler-service.staging.gokite.ai/rpc/
VITE_USER_PRIVATE_KEY=你的私钥
VITE_AA_WALLET_ADDRESS=你的私钥对应的钱包生成的AA地址
VITE_SETTLEMENT_TOKEN=0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63
VITE_VAULT_ADDRESS=你生成的金库合约地址
```

> **重要提示**：请自己生成属于你的 AA 地址和金库地址然后填入 `.env` 文件，不要使用示例中的默认地址。

> 请确保 `vite.config.js` 已配置 `/rpc`、`/bundler`、`/api`。

### 3) 在这个SDK\frontend目录下启动前端

```bash
npm run dev
```

## 后端（记录保存）

转账记录保存在本地后端：

```bash
cd backend
npm install
npm start
```

接口：
- `GET /api/records`
- `POST /api/records`

## 页面入口说明

- **登录页**：点击按钮进入需求页
- **需求页**：
  - 进入转账页面
  - 进入金库页面
  - 进入 Agent 支付设置
  - 查看转账记录

## 关键地址（Kite Testnet）

- **Settlement Token (USDT)**: `0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63`
- **AA Wallet / Agent**: `你的私钥对应的钱包生成的AA地址`
- **Vault**: `你生成的金库合约地址`
- **EntryPoint**: `0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108`

## 目录结构

```
SDK/frontend/
├─ src/
│  ├─ App.jsx
│  ├─ App.css
│  ├─ LoginPage.jsx
│  ├─ RequestPage.jsx
│  ├─ Transfer.jsx
│  ├─ VaultPage.jsx
│  ├─ AgentSettingsPage.jsx
│  ├─ RecordsPage.jsx
│  └─ gokite-aa-sdk.js
├─ vite.config.js
├─ package.json
└─ .env.example
```

## 常见问题

**Q: 为什么转账/设置规则失败？**
A: 请确认：
1) `.env` 私钥正确且有余额
2) RPC/Bundler 可用
3) 先创建 Session，再更新/读取规则

**Q: 转账记录看不到？**
A: 确认后端已启动，并在前端访问 `/api/records`。

---

KITE BOT - 无感支付 AI Agent Demo






