import { useState } from 'react';
import { ethers } from 'ethers';
import { GokiteAASDK } from './gokite-aa-sdk';

const productLinks = [
  'https://shop.example.com/product/airfryer-01',
  'https://shop.example.com/product/airfryer-02',
  'https://shop.example.com/product/airfryer-03'
];

const SETTLEMENT_TOKEN = import.meta.env.VITE_SETTLEMENT_TOKEN || '0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63';
const TOKEN_DECIMALS = 18;
const MERCHANT_ADDRESS = '0x6D705b93F0Da7DC26e46cB39Decc3baA4fb4dd29';

function RequestPage({ onOpenTransfer, onOpenVault, onOpenAgentSettings, onOpenRecords }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const rpcUrl = import.meta.env.VITE_KITE_RPC_URL || '/rpc';
  const bundlerUrl = import.meta.env.VITE_BUNDLER_URL || '/bundler';

  const sdk = new GokiteAASDK({
    rpcUrl,
    bundlerUrl,
    entryPointAddress: '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108',
    proxyAddress: import.meta.env.VITE_AA_WALLET_ADDRESS || '0xca38E92a709a3bA0704Eb16609E6C89a0C9DF21F'
  });

  const privateKey = import.meta.env.VITE_USER_PRIVATE_KEY || '';

  const getSigner = () => {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    return new ethers.Wallet(privateKey, provider);
  };

  const logRecord = async (record) => {
    try {
      await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
    } catch {
      // ignore logging errors
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    if (!query.trim()) {
      setError('请输入你的需求。');
      return;
    }
    if (!privateKey) {
      setError('缺少私钥配置，无法发起转账。');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const signer = getSigner();

      const signFunction = async (userOpHash) => {
        return signer.signMessage(ethers.getBytes(userOpHash));
      };

      const transferResult = await sdk.sendERC20({
        tokenAddress: SETTLEMENT_TOKEN,
        recipient: MERCHANT_ADDRESS,
        amount: ethers.parseUnits('0.05', TOKEN_DECIMALS)
      }, signFunction);

      if (transferResult.status !== 'success') {
        await logRecord({
          type: '下单',
          amount: '0.05',
          token: SETTLEMENT_TOKEN,
          recipient: MERCHANT_ADDRESS,
          txHash: transferResult.transactionHash || '',
          status: 'failed'
        });
        throw new Error(transferResult.reason || '转账失败');
      }

      const randomLink = productLinks[Math.floor(Math.random() * productLinks.length)];

      setResult({
        txHash: transferResult.transactionHash,
        productUrl: randomLink
      });

      await logRecord({
        type: '下单',
        amount: '0.05',
        token: SETTLEMENT_TOKEN,
        recipient: MERCHANT_ADDRESS,
        txHash: transferResult.transactionHash,
        status: 'success'
      });
    } catch (err) {
      setError(err.message || '发生错误');
      await logRecord({
        type: '下单',
        amount: '0.05',
        token: SETTLEMENT_TOKEN,
        recipient: MERCHANT_ADDRESS,
        txHash: '',
        status: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="request-page">
      <div className="top-entry">
        <button className="link-btn" onClick={onOpenTransfer}>
          进入转账页面
        </button>
        <button className="link-btn" onClick={onOpenVault}>
          进入金库页面
        </button>
        <button className="link-btn" onClick={onOpenAgentSettings}>
          Agent支付设置
        </button>
        <button className="link-btn" onClick={onOpenRecords}>
          转账记录
        </button>
      </div>

      <div className="request-card">
        <h1>你想要什么？</h1>
        <div className="request-input">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="例如：帮我买一个最好评的空气炸锅"
            disabled={loading}
          />
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? '发送中...' : '发送'}
          </button>
        </div>
        {error && <div className="request-error">{error}</div>}
      </div>

      {result && (
        <div className="result-card">
          <h2>已购买最好评的空气炸锅</h2>
          <div className="result-row">
            <span className="label">详情：</span>
            <span className="value">{result.productUrl}</span>
          </div>
          <div className="result-row">
            <span className="label">价格：</span>
            <span className="value">0.05USDT</span>
          </div>
          <div className="result-row">
            <span className="label">物流编号：</span>
            <span className="value">88886666687</span>
          </div>
          <div className="result-row">
            <span className="label">链上交易哈希：</span>
            <span className="value hash">{result.txHash}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default RequestPage;
