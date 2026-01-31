# Kite Gasless Transfer Demo

一个基于 Kite Chain 的零Gas转账演示项目，使用 EIP-3009 标准实现。

## 功能特性

- 🚀 零Gas转账 - 使用 EIP-3009 标准，无需支付 Gas
- 📊 每日限额 - 每个地址每日转账次数和金额限制
- 📜 转账历史 - 完整的转账记录
- 📍 多地址支持 - 可查看任意地址的余额、限额和历史
- 🎨 中文界面 - 完全中文化的用户界面

## 技术栈

- **后端**: Node.js + Express + TypeScript
- **前端**: 原生 HTML + CSS + JavaScript
- **区块链**: Kite Chain (Testnet)
- **代币**: Kite Agent Token (KAT)

## 快速开始

### 1. 安装依赖

```bash
cd relayer-service
npm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
KITE_RPC_URL=https://rpc-testnet.gokite.ai
RELAYER_PRIVATE_KEY=your_private_key
USER_PRIVATE_KEY=your_private_key
TOKEN_ADDRESS=0x2eed6D0736B5cF79F8C4964353dbe1640069Cff4
PORT=3000
```

### 3. 启动服务器

```bash
npm run dev
```

服务器将在 http://localhost:3000 启动

### 4. 访问前端

打开浏览器访问：http://localhost:3000

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/balance` | GET | 查询余额（可选地址参数） |
| `/limits` | GET | 查询每日限额（可选地址参数） |
| `/history` | GET | 查询转账历史（可选地址参数） |
| `/transfer` | POST | 执行转账 |

## 使用说明

### 查看默认地址

留空地址输入框，使用默认地址查看：
- 账户余额
- 每日限额
- 转账历史

### 查看其他地址

在地址输入框中输入要查询的地址，查看该地址的：
- 账户余额
- 每日限额
- 转账历史

### 执行转账

1. 输入接收地址
2. 输入转账金额
3. 点击"立即转账"按钮

转账成功后：
- 转账次数自动 +1
- 转账金额自动累加
- 历史记录自动添加

## 每日限额规则

- **转账次数**: 10 次/天
- **转账金额**: 100 KAT/天
- **自动重置**: 每天 UTC 00:00

## 项目结构

```
relayer-service/
├── src/
│   ├── index.ts              # Express 服务器主文件
│   ├── relayer.ts           # Relayer 服务逻辑
│   ├── verifier.ts           # EIP-3009 签名验证
│   └── types.ts              # TypeScript 类型定义
├── public/
│   ├── index.html            # 前端页面
│   └── app.js                # 前端逻辑
├── package.json
├── tsconfig.json
├── .env                    # 环境变量配置
├── .env.example            # 环境变量示例
└── transfer-limits.json     # 转账限额数据（自动生成）
```

## 注意事项

1. **私钥安全**: 不要将私钥提交到 GitHub
2. **环境变量**: 使用 `.env.example` 作为模板，不要提交 `.env`
3. **数据文件**: `transfer-limits.json` 包含转账数据，不要提交到 GitHub
4. **测试网**: 当前使用 Kite 测试网

## 部署到生产环境

1. 修改 `.env` 中的 RPC URL 为生产网地址
2. 修改端口号为生产环境端口
3. 配置反向代理（如需要）
4. 设置环境变量 `NODE_ENV=production`

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
