import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { GokiteAASDK } from './gokite-aa-sdk';

const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS || '0x5495Ec647FA715d9348Aa09eAca750FaE24A3aff';
const SETTLEMENT_TOKEN = import.meta.env.VITE_SETTLEMENT_TOKEN || '0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63';
const TOKEN_DECIMALS = 18;

const vaultInterface = new ethers.Interface([
  {
    inputs: [],
    name: 'getAvailableBalance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getSpendingRules',
    outputs: [
      {
        components: [
          {
            components: [
              { internalType: 'uint256', name: 'timeWindow', type: 'uint256' },
              { internalType: 'uint160', name: 'budget', type: 'uint160' },
              { internalType: 'uint96', name: 'initialWindowStartTime', type: 'uint96' },
              { internalType: 'bytes32[]', name: 'targetProviders', type: 'bytes32[]' }
            ],
            internalType: 'struct IClientAgentVault.Rule',
            name: 'rule',
            type: 'tuple'
          },
          {
            components: [
              { internalType: 'uint128', name: 'amountUsed', type: 'uint128' },
              { internalType: 'uint128', name: 'currentTimeWindowStartTime', type: 'uint128' }
            ],
            internalType: 'struct IClientAgentVault.Usage',
            name: 'usage',
            type: 'tuple'
          }
        ],
        internalType: 'struct IClientAgentVault.SpendingRule[]',
        name: '',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'uint256', name: 'timeWindow', type: 'uint256' },
          { internalType: 'uint160', name: 'budget', type: 'uint160' },
          { internalType: 'uint96', name: 'initialWindowStartTime', type: 'uint96' },
          { internalType: 'bytes32[]', name: 'targetProviders', type: 'bytes32[]' }
        ],
        internalType: 'struct IClientAgentVault.Rule[]',
        name: 'rules',
        type: 'tuple[]'
      }
    ],
    name: 'setSpendingRules',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'withdrawFunds',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
]);

const erc20Interface = new ethers.Interface([
  'function transfer(address to, uint256 amount) returns (bool)'
]);

function VaultPage({ onBack }) {
  const [vaultBalance, setVaultBalance] = useState('0');
  const [singleLimit, setSingleLimit] = useState('5');
  const [dailyLimit, setDailyLimit] = useState('50');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [rules, setRules] = useState([]);
  const [vaultStatus, setVaultStatus] = useState('');

  const rpcUrl = import.meta.env.VITE_KITE_RPC_URL || '/rpc';
  const bundlerUrl = import.meta.env.VITE_BUNDLER_URL || '/bundler';

  const sdk = new GokiteAASDK({
    rpcUrl,
    bundlerUrl,
    entryPointAddress: '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108',
    proxyAddress: import.meta.env.VITE_AA_WALLET_ADDRESS || '0xca38E92a709a3bA0704Eb16609E6C89a0C9DF21F'
  });

  const privateKey = import.meta.env.VITE_USER_PRIVATE_KEY || '';

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

  const getSigner = () => {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    return new ethers.Wallet(privateKey, provider);
  };

  const loadVaultBalance = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const data = vaultInterface.encodeFunctionData('getAvailableBalance', []);
      const result = await provider.call({ to: VAULT_ADDRESS, data });
      const balance = ethers.getBigInt(result);
      setVaultBalance(ethers.formatUnits(balance, TOKEN_DECIMALS));
    } catch (err) {
      setVaultStatus(`查询余额失败: ${err.message}`);
    }
  };

  const loadRules = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const data = vaultInterface.encodeFunctionData('getSpendingRules', []);
      const result = await provider.call({ to: VAULT_ADDRESS, data });
      const decoded = vaultInterface.decodeFunctionResult('getSpendingRules', result)[0];
      setRules(decoded);
    } catch (err) {
      setVaultStatus(`查询规则失败: ${err.message}`);
    }
  };

  useEffect(() => {
    loadVaultBalance();
    loadRules();
  }, []);

  const handleSetRules = async () => {
    if (!privateKey) {
      setVaultStatus('缺少私钥，无法设置规则。');
      return;
    }
    try {
      setVaultStatus('设置中...');
      const signer = getSigner();
      const nowTs = Math.floor(Date.now() / 1000);

      const rulesToSet = [
        [0, ethers.parseUnits(singleLimit || '0', TOKEN_DECIMALS), 0, []],
        [86400, ethers.parseUnits(dailyLimit || '0', TOKEN_DECIMALS), nowTs, []]
      ];

      const data = vaultInterface.encodeFunctionData('setSpendingRules', [rulesToSet]);
      const tx = await signer.sendTransaction({
        to: VAULT_ADDRESS,
        data
      });
      await tx.wait();
      setVaultStatus(`规则已更新: ${tx.hash}`);
      await loadRules();
    } catch (err) {
      setVaultStatus(`设置失败: ${err.message}`);
    }
  };

  const handleDeposit = async () => {
    if (!privateKey) {
      setVaultStatus('缺少私钥，无法充值。');
      return;
    }
    if (!depositAmount) {
      setVaultStatus('请输入充值金额。');
      return;
    }
    try {
      setVaultStatus('充值中...');
      const signer = getSigner();
      const data = erc20Interface.encodeFunctionData('transfer', [
        VAULT_ADDRESS,
        ethers.parseUnits(depositAmount, TOKEN_DECIMALS)
      ]);
      const tx = await signer.sendTransaction({
        to: SETTLEMENT_TOKEN,
        data
      });
      await tx.wait();
      setVaultStatus(`充值成功: ${tx.hash}`);
      setDepositAmount('');
      await loadVaultBalance();

      await logRecord({
        type: '金库',
        amount: depositAmount,
        token: SETTLEMENT_TOKEN,
        recipient: VAULT_ADDRESS,
        txHash: tx.hash,
        status: 'success'
      });
    } catch (err) {
      setVaultStatus(`充值失败: ${err.message}`);
      await logRecord({
        type: '金库',
        amount: depositAmount,
        token: SETTLEMENT_TOKEN,
        recipient: VAULT_ADDRESS,
        txHash: '',
        status: 'error'
      });
    }
  };

  const handleWithdraw = async () => {
    if (!privateKey) {
      setVaultStatus('缺少私钥，无法提现吗。');
      return;
    }
    if (!withdrawAmount) {
      setVaultStatus('请输入提现金额。');
      return;
    }
    try {
      setVaultStatus('提现中...');
      const signer = getSigner();
      const data = vaultInterface.encodeFunctionData('withdrawFunds', [
        SETTLEMENT_TOKEN,
        ethers.parseUnits(withdrawAmount, TOKEN_DECIMALS)
      ]);
      const tx = await signer.sendTransaction({
        to: VAULT_ADDRESS,
        data
      });
      await tx.wait();
      setVaultStatus(`提现成功: ${tx.hash}`);
      setWithdrawAmount('');
      await loadVaultBalance();

      await logRecord({
        type: '金库',
        amount: withdrawAmount,
        token: SETTLEMENT_TOKEN,
        recipient: signer.address,
        txHash: tx.hash,
        status: 'success'
      });
    } catch (err) {
      setVaultStatus(`提现失败: ${err.message}`);
      await logRecord({
        type: '金库',
        amount: withdrawAmount,
        token: SETTLEMENT_TOKEN,
        recipient: '',
        txHash: '',
        status: 'error'
      });
    }
  };

  const renderRuleLabel = (timeWindow) => {
    if (timeWindow === 0) return '单笔支出';
    if (timeWindow === 86400) return '每日支出';
    return '周期支出';
  };

  return (
    <div className="transfer-container">
      <div className="top-entry">
        {onBack && (
          <button className="link-btn" onClick={onBack}>
            返回需求页面
          </button>
        )}
      </div>

      <h1>金库管理</h1>

      <div className="vault-card">
        <h2>金库余额与额度规则</h2>
        <div className="result-row">
          <span className="label">金库地址：</span>
          <span className="value hash">{VAULT_ADDRESS}</span>
        </div>
        <div className="result-row">
          <span className="label">当前余额：</span>
          <span className="value">{vaultBalance} USDT</span>
        </div>

        <div className="vault-actions">
          <div className="vault-input">
            <label>单笔上限 (USDT)</label>
            <input
              type="text"
              value={singleLimit}
              onChange={(e) => setSingleLimit(e.target.value)}
              placeholder="5"
            />
          </div>
          <div className="vault-input">
            <label>日上限 (USDT)</label>
            <input
              type="text"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              placeholder="50"
            />
          </div>
          <button onClick={handleSetRules}>更新额度规则</button>
        </div>

        <div className="vault-actions">
          <div className="vault-input">
            <label>充值金额 (USDT)</label>
            <input
              type="text"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0.3"
            />
          </div>
          <button onClick={handleDeposit}>充值到金库</button>
        </div>

        <div className="vault-actions">
          <div className="vault-input">
            <label>提现金额 (USDT)</label>
            <input
              type="text"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="1.0"
            />
          </div>
          <button onClick={handleWithdraw}>提现到 Owner 钱包</button>
        </div>

        {rules.length > 0 && (
          <div className="rules-list">
            <h3>当前规则</h3>
            {rules.map((item, index) => (
              <div className="result-row" key={`rule-${index}`}>
                <span className="label">规则 {index + 1}：</span>
                <span className="value">
                  {renderRuleLabel(Number(item.rule.timeWindow))} 上限 {ethers.formatUnits(item.rule.budget, TOKEN_DECIMALS)} USDT 已用 {ethers.formatUnits(item.usage.amountUsed, TOKEN_DECIMALS)}
                </span>
              </div>
            ))}
          </div>
        )}

        {vaultStatus && <div className="request-error">{vaultStatus}</div>}
      </div>
    </div>
  );
}

export default VaultPage;
