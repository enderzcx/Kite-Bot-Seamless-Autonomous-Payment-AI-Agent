import { useState } from 'react';
import { ethers } from 'ethers';

const TOKEN_DECIMALS = 18;
const DEFAULT_TOKEN = '0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63';

const accountInterface = new ethers.Interface([
  {
    inputs: [
      { internalType: 'bytes32', name: 'sessionId', type: 'bytes32' },
      { internalType: 'address', name: 'agent', type: 'address' },
      {
        components: [
          { internalType: 'uint256', name: 'timeWindow', type: 'uint256' },
          { internalType: 'uint160', name: 'budget', type: 'uint160' },
          { internalType: 'uint96', name: 'initialWindowStartTime', type: 'uint96' },
          { internalType: 'bytes32[]', name: 'targetProviders', type: 'bytes32[]' }
        ],
        internalType: 'struct SessionManager.Rule[]',
        name: 'rules',
        type: 'tuple[]'
      }
    ],
    name: 'createSession',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'sessionId', type: 'bytes32' },
      {
        components: [
          { internalType: 'uint256', name: 'timeWindow', type: 'uint256' },
          { internalType: 'uint160', name: 'budget', type: 'uint160' },
          { internalType: 'uint96', name: 'initialWindowStartTime', type: 'uint96' },
          { internalType: 'bytes32[]', name: 'targetProviders', type: 'bytes32[]' }
        ],
        internalType: 'struct SessionManager.Rule[]',
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
      { internalType: 'address', name: 'token', type: 'address' }
    ],
    name: 'addSupportedToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
]);

function AgentSettingsPage({ onBack }) {
  const [sessionKey, setSessionKey] = useState('');
  const [sessionPrivKey, setSessionPrivKey] = useState('');
  const [agentAddress, setAgentAddress] = useState(
    import.meta.env.VITE_AA_WALLET_ADDRESS || ''
  );
  const [singleLimit, setSingleLimit] = useState('5');
  const [dailyLimit, setDailyLimit] = useState('50');
  const [allowedToken, setAllowedToken] = useState(DEFAULT_TOKEN);
  const [status, setStatus] = useState('');

  const rpcUrl = import.meta.env.VITE_KITE_RPC_URL || '/rpc';
  const accountAddress = import.meta.env.VITE_AA_WALLET_ADDRESS || '';
  const privateKey = import.meta.env.VITE_USER_PRIVATE_KEY || '';

  const generateSessionKey = () => {
    const wallet = ethers.Wallet.createRandom();
    setSessionKey(wallet.address);
    setSessionPrivKey(wallet.privateKey);
  };

  const getSigner = () => {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    return new ethers.Wallet(privateKey, provider);
  };

  const buildRules = () => {
    const nowTs = Math.floor(Date.now() / 1000);
    return [
      [0, ethers.parseUnits(singleLimit || '0', TOKEN_DECIMALS), 0, []],
      [86400, ethers.parseUnits(dailyLimit || '0', TOKEN_DECIMALS), nowTs, []]
    ];
  };

  const handleSetAllowedToken = async () => {
    if (!privateKey) {
      setStatus('缺少私钥，无法设置 Token。');
      return;
    }
    if (!allowedToken) {
      setStatus('请输入 Token 地址。');
      return;
    }
    try {
      setStatus('设置 Token 中...');
      const signer = getSigner();
      const data = accountInterface.encodeFunctionData('addSupportedToken', [
        allowedToken
      ]);
      const tx = await signer.sendTransaction({ to: accountAddress, data });
      await tx.wait();
      setStatus(`Token 已添加: ${tx.hash}`);
    } catch (err) {
      setStatus(`设置失败: ${err.message}`);
    }
  };

  const handleCreateSession = async () => {
    if (!privateKey) {
      setStatus('缺少私钥，无法创建会话。');
      return;
    }
    if (!sessionKey) {
      setStatus('请先生成 Session Key。');
      return;
    }
    if (!accountAddress) {
      setStatus('缺少 AA 钱包地址。');
      return;
    }
    try {
      setStatus('创建中...');
      const signer = getSigner();
      const sessionId = ethers.keccak256(
        ethers.toUtf8Bytes(`${sessionKey}-${Date.now()}`)
      );
      const rules = buildRules();
      const data = accountInterface.encodeFunctionData('createSession', [
        sessionId,
        agentAddress || accountAddress,
        rules
      ]);
      const tx = await signer.sendTransaction({ to: accountAddress, data });
      await tx.wait();
      setStatus(`创建会话成功: ${tx.hash}\nSessionId: ${sessionId}`);
    } catch (err) {
      setStatus(`创建失败: ${err.message}`);
    }
  };

  const handleUpdateRules = async () => {
    if (!privateKey) {
      setStatus('缺少私钥，无法设置规则。');
      return;
    }
    if (!sessionKey) {
      setStatus('请先生成 Session Key。');
      return;
    }
    try {
      setStatus('更新规则中...');
      const signer = getSigner();
      const sessionId = ethers.keccak256(
        ethers.toUtf8Bytes(`${sessionKey}-${Date.now()}`)
      );
      const rules = buildRules();
      const data = accountInterface.encodeFunctionData('setSpendingRules', [
        sessionId,
        rules
      ]);
      const tx = await signer.sendTransaction({ to: accountAddress, data });
      await tx.wait();
      setStatus(`规则已更新: ${tx.hash}\nSessionId: ${sessionId}`);
    } catch (err) {
      setStatus(`更新失败: ${err.message}`);
    }
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

      <h1>Agent支付设置</h1>

      <div className="vault-card">
        <h2>Session Key</h2>
        <div className="vault-actions">
          <button onClick={generateSessionKey}>生成 Session Key</button>
        </div>
        {sessionKey && (
          <div className="rules-list">
            <div className="result-row">
              <span className="label">Session Key 地址：</span>
              <span className="value hash">{sessionKey}</span>
            </div>
            <div className="result-row">
              <span className="label">Session Private Key：</span>
              <span className="value hash">{sessionPrivKey}</span>
            </div>
            <div className="request-error">
              请妥善保存私钥，仅在本地使用。
            </div>
          </div>
        )}
      </div>

      <div className="vault-card">
        <h2>允许的 Token</h2>
        <div className="vault-actions">
          <div className="vault-input">
            <label>Token 地址</label>
            <input
              type="text"
              value={allowedToken}
              onChange={(e) => setAllowedToken(e.target.value)}
              placeholder={DEFAULT_TOKEN}
            />
          </div>
          <button onClick={handleSetAllowedToken}>设为允许 Token</button>
        </div>
      </div>

      <div className="vault-card">
        <h2>权限与额度</h2>
        <div className="vault-actions">
          <div className="vault-input">
            <label>Agent 地址</label>
            <input
              type="text"
              value={agentAddress}
              onChange={(e) => setAgentAddress(e.target.value)}
              placeholder={accountAddress || '0x...'}
            />
          </div>
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
        </div>
        <div className="vault-actions">
          <button onClick={handleCreateSession}>创建 Session 并应用规则</button>
          <button onClick={handleUpdateRules}>仅更新规则</button>
        </div>
        {status && <div className="request-error">{status}</div>}
      </div>
    </div>
  );
}

export default AgentSettingsPage;
