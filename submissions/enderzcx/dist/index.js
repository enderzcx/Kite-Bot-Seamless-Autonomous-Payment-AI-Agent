"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const url_1 = require("url");
const ethers_1 = require("ethers");
const relayer_js_1 = require("./relayer.js");
const verifier_js_1 = require("./verifier.js");
dotenv_1.default.config();
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
const relayerService = new relayer_js_1.RelayerService(process.env.KITE_RPC_URL || 'https://rpc-testnet.gokite.ai', process.env.RELAYER_PRIVATE_KEY || '', process.env.TOKEN_ADDRESS || '0x2eed6D0736B5cF79F8C4964353dbe1640069Cff4', process.env.AUTHORIZED_AGENT_ADDRESS || '0xca38E92a709a3bA0704Eb16609E6C89a0C9DF21F');
const verifier = new verifier_js_1.EIP3009Verifier('Kite Agent Token', '1', process.env.TOKEN_ADDRESS || '0x2eed6D0736B5cF79F8C4964353dbe1640069Cff4');
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});
app.get('/supported_tokens', async (req, res) => {
    try {
        const tokenInfo = {
            address: process.env.TOKEN_ADDRESS || '0x2eed6D0736B5cF79F8C4964353dbe1640069Cff4',
            balance_threshold: '0',
            decimals: 18,
            eip712_name: 'Kite Agent Token',
            eip712_version: '1',
            minimum_transfer_amount: '10000000000000000',
            name: 'Kite Agent Token',
            symbol: 'KAT'
        };
        res.json({
            testnet: [tokenInfo],
            mainnet: []
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/balance', async (req, res) => {
    try {
        let address = req.query.address;
        if (!address) {
            address = process.env.USER_PRIVATE_KEY ? new ethers_1.ethers.Wallet(process.env.USER_PRIVATE_KEY).address : '';
        }
        if (!address) {
            return res.status(400).json({ error: 'No address available' });
        }
        const balance = await relayerService.checkBalance(address);
        const decimals = await relayerService.getDecimals();
        res.json({
            address: address,
            balance: ethers_1.ethers.formatUnits(balance, decimals)
        });
    }
    catch (error) {
        console.error('Balance check error:', error);
        res.status(500).json({ error: error.message });
    }
});
app.get('/aa-wallet/info', async (req, res) => {
    try {
        const { getAAWalletInfo } = require('./aa-wallet-service');
        const walletInfo = await getAAWalletInfo();
        res.json({
            address: walletInfo.address,
            balance: ethers_1.ethers.formatUnits(walletInfo.balance, walletInfo.decimals),
            decimals: walletInfo.decimals
        });
    }
    catch (error) {
        console.error('AA Wallet info error:', error);
        res.status(500).json({ error: error.message });
    }
});
app.post('/aa-wallet/transfer', async (req, res) => {
    try {
        const { to, amount } = req.body;
        if (!to) {
            return res.status(400).json({ error: 'Recipient address required' });
        }
        if (!amount || parseFloat(amount) <= 0) {
            return res.status(400).json({ error: 'Valid amount required' });
        }
        const { executeAAWalletTransfer } = require('./aa-wallet-service');
        const result = await executeAAWalletTransfer(to, amount);
        if (result.success) {
            res.json({
                success: true,
                txHash: result.txHash,
                amount,
                to,
                from: result.from
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    }
    catch (error) {
        console.error('AA Wallet transfer error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
app.post('/transfer', async (req, res) => {
    try {
        const { to, amount } = req.body;
        if (!to) {
            return res.status(400).json({ error: 'Recipient address required' });
        }
        if (!amount || parseFloat(amount) <= 0) {
            return res.status(400).json({ error: 'Valid amount required' });
        }
        const privateKey = process.env.USER_PRIVATE_KEY;
        if (!privateKey) {
            return res.status(500).json({ error: 'USER_PRIVATE_KEY not configured' });
        }
        const provider = new ethers_1.ethers.JsonRpcProvider(process.env.KITE_RPC_URL || 'https://rpc-testnet.gokite.ai');
        const wallet = new ethers_1.ethers.Wallet(privateKey, provider);
        const from = wallet.address;
        const decimals = await relayerService.getDecimals();
        const value = ethers_1.ethers.parseUnits(amount.toString(), decimals);
        const balance = await relayerService.checkBalance(from);
        if (balance < value) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }
        const now = Math.floor(Date.now() / 1000);
        const validAfter = now - 300;
        const validBefore = now + 3600;
        const nonce = ethers_1.ethers.hexlify(ethers_1.ethers.randomBytes(32));
        console.log('Transfer authorization time window:', {
            currentTime: now,
            validAfter: validAfter,
            validBefore: validBefore,
            validDuration: '60 minutes',
            expiresAt: new Date(validBefore * 1000).toISOString()
        });
        const domain = {
            name: 'Kite Agent Token',
            version: '1',
            chainId: 2368,
            verifyingContract: process.env.TOKEN_ADDRESS || '0x2eed6D0736B5cF79F8C4964353dbe1640069Cff4'
        };
        const types = {
            TransferWithAuthorization: [
                { name: 'from', type: 'address' },
                { name: 'to', type: 'address' },
                { name: 'value', type: 'uint256' },
                { name: 'validAfter', type: 'uint256' },
                { name: 'validBefore', type: 'uint256' },
                { name: 'nonce', type: 'bytes32' }
            ]
        };
        const valueStruct = {
            from,
            to,
            value: value.toString(),
            validAfter,
            validBefore,
            nonce
        };
        const signature = await wallet.signTypedData(domain, types, valueStruct);
        const { v, r, s } = ethers_1.ethers.Signature.from(signature);
        const auth = {
            from,
            to,
            value: value.toString(),
            validAfter,
            validBefore,
            nonce,
            v,
            r,
            s
        };
        const result = await relayerService.executeGaslessTransfer(auth);
        if (result.success) {
            await updateTransferHistory(from, to, amount, result.txHash);
            res.json({
                success: true,
                txHash: result.txHash,
                amount,
                to,
                from
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    }
    catch (error) {
        console.error('Transfer error:', error);
        const response = {
            status: 'error',
            error: error.message || 'Internal server error'
        };
        res.status(500).json(response);
    }
});
async function updateTransferHistory(from, to, amount, txHash) {
    const DATA_FILE = path_1.default.join(__dirname, '../transfer-limits.json');
    let data = {};
    try {
        if (fs_1.default.existsSync(DATA_FILE)) {
            data = JSON.parse(fs_1.default.readFileSync(DATA_FILE, 'utf-8'));
        }
    }
    catch (e) {
        console.warn('Could not read limits file:', e);
    }
    if (!data.limits) {
        data.limits = {};
    }
    if (!data.history) {
        data.history = [];
    }
    const now = Date.now();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    const dayStartTimestamp = dayStart.getTime();
    const addressLower = from.toLowerCase();
    if (!data.limits[addressLower]) {
        data.limits[addressLower] = {
            dailyCount: 0,
            dailyValue: '0',
            lastReset: dayStartTimestamp
        };
    }
    const limit = data.limits[addressLower];
    if (limit.lastReset < dayStartTimestamp) {
        limit.dailyCount = 0;
        limit.dailyValue = '0';
        limit.lastReset = dayStartTimestamp;
    }
    limit.dailyCount++;
    const decimals = await relayerService.getDecimals();
    const amountInWei = ethers_1.ethers.parseUnits(amount.toString(), decimals);
    limit.dailyValue = (BigInt(limit.dailyValue) + amountInWei).toString();
    data.history.push({
        address: from,
        timestamp: now,
        amount: amountInWei.toString(),
        txHash: txHash,
        to: to
    });
    data.lastUpdated = now;
    try {
        fs_1.default.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        console.log('✅ Transfer history updated');
    }
    catch (e) {
        console.error('❌ Failed to update transfer history:', e);
    }
}
app.get('/limits', (req, res) => {
    try {
        let address = req.query.address;
        if (!address) {
            address = process.env.USER_PRIVATE_KEY ? new ethers_1.ethers.Wallet(process.env.USER_PRIVATE_KEY).address : '';
        }
        const DATA_FILE = path_1.default.join(__dirname, '../transfer-limits.json');
        let limits = {};
        let history = [];
        try {
            if (fs_1.default.existsSync(DATA_FILE)) {
                const data = JSON.parse(fs_1.default.readFileSync(DATA_FILE, 'utf-8'));
                limits = data.limits || {};
                history = data.history || [];
            }
        }
        catch (e) {
            console.warn('Could not read limits file:', e);
        }
        if (address) {
            const limit = limits[address];
            const userHistory = history.filter(r => r.address.toLowerCase() === address.toLowerCase());
            const now = Date.now();
            const dayStart = new Date(now);
            dayStart.setHours(0, 0, 0, 0);
            const dayStartTimestamp = dayStart.getTime();
            const todayHistory = userHistory.filter(r => r.timestamp >= dayStartTimestamp);
            const totalValue = todayHistory.reduce((sum, r) => sum + BigInt(r.amount), 0n);
            res.json({
                count: todayHistory.length,
                value: ethers_1.ethers.formatUnits(totalValue, 18),
                address: address,
                resetTime: new Date(dayStartTimestamp + 86400000).toISOString()
            });
        }
        else {
            res.json({
                count: 0,
                value: '0',
                address: '',
                resetTime: new Date(Date.now() + 86400000 - (Date.now() % 86400000)).toISOString()
            });
        }
    }
    catch (error) {
        console.error('Limits error:', error);
        res.status(500).json({ error: error.message });
    }
});
app.get('/history', (req, res) => {
    try {
        let address = req.query.address;
        if (!address) {
            address = process.env.USER_PRIVATE_KEY ? new ethers_1.ethers.Wallet(process.env.USER_PRIVATE_KEY).address : '';
        }
        const DATA_FILE = path_1.default.join(__dirname, '../transfer-limits.json');
        let history = [];
        try {
            if (fs_1.default.existsSync(DATA_FILE)) {
                const data = JSON.parse(fs_1.default.readFileSync(DATA_FILE, 'utf-8'));
                history = data.history || [];
            }
        }
        catch (e) {
            console.warn('Could not read history file:', e);
        }
        let filteredHistory = history;
        if (address) {
            filteredHistory = history
                .filter(r => r.address.toLowerCase() === address.toLowerCase())
                .sort((a, b) => b.timestamp - a.timestamp);
        }
        else {
            filteredHistory = history
                .sort((a, b) => b.timestamp - a.timestamp);
        }
        const formattedHistory = filteredHistory.map((r) => ({
            txHash: r.txHash,
            amount: ethers_1.ethers.formatUnits(BigInt(r.amount), 18),
            date: new Date(r.timestamp).toISOString(),
            to: r.to,
            from: r.address
        }));
        res.json({
            history: formattedHistory,
            total: formattedHistory.length,
            address: address
        });
    }
    catch (error) {
        console.error('History error:', error);
        res.status(500).json({ error: error.message });
    }
});
app.listen(PORT, () => {
    console.log(`Kite Relayer Service running on port ${PORT}`);
    console.log(`Frontend: http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Supported tokens: http://localhost:${PORT}/supported_tokens`);
    console.log(`EOA transfer: POST http://localhost:${PORT}/transfer`);
    console.log(`AA Wallet info: GET http://localhost:${PORT}/aa-wallet/info`);
    console.log(`AA Wallet transfer: POST http://localhost:${PORT}/aa-wallet/transfer`);
    console.log(`Daily limits: GET http://localhost:${PORT}/limits`);
    console.log(`Transfer history: GET http://localhost:${PORT}/history`);
});
