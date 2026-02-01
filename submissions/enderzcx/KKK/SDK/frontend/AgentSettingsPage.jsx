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
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'sessionId', type: 'bytes32' }
    ],
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
            internalType: 'struct SessionManager.Rule',
            name: 'rule',
            type: 'tuple'
          },
          {
            components: [
              { internalType: 'uint128', name: 'amountUsed', type: 'uint128' },
              { internalType: 'uint128', name: 'currentTimeWindowStartTime', type: 'uint128' }
            ],
            internalType: 'struct SessionManager.Usage',
            name: 'usage',
            type: 'tuple'
          }
        ],
        internalType: 'struct SessionManager.SpendingRule[]',
        name: '',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
]);

function AgentSettingsPage({ onBack }) {
  const [agentAddress, setAgentAddress] = useState(
    import.meta.env.VITE_AA_WALLET_ADDRESS || ''
  );
  const [singleLimit, setSingleLimit] = useState('5');
  const [dailyLimit, setDailyLimit] = useState('50');
  const [allowedToken, setAllowedToken] = useState(DEFAULT_TOKEN);
  const [status, setStatus] = useState('');
  const [rulesPreview, setRulesPreview] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [sessionKeyAddress, setSessionKeyAddress] = useState('');
  const [sessionKeyPrivateKey, setSessionKeyPrivateKey] = useState('');

  const rpcUrl = import.meta.env.VITE_KITE_RPC_URL || '/rpc';
  const accountAddress = import.meta.env.VITE_AA_WALLET_ADDRESS || '';
  const privateKey = import.meta.env.VITE_USER_PRIVATE_KEY || '';

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

  const ensureSessionKey = () => {
    if (sessionKeyAddress && sessionKeyPrivateKey && sessionId) {
      return { sessionKeyAddress, sessionKeyPrivateKey, sessionId };
    }
    const wallet = ethers.Wallet.createRandom();
    const newSessionId = ethers.keccak256(
      ethers.toUtf8Bytes(wallet.address)
    );
    setSessionKeyAddress(wallet.address);
    setSessionKeyPrivateKey(wallet.privateKey);
    setSessionId(newSessionId);
    return { sessionKeyAddress: wallet.address, sessionKeyPrivateKey: wallet.privateKey, sessionId: newSessionId };
  };

  const handleSetAllowedToken = async () => {
    if (!privateKey) {
      setStatus('请先设置私钥以添加 Token?');
      return;
    }
    if (!allowedToken) {
      setStatus('请输入 Token 地址');
      return;
    }
    try {
      setStatus('正在添加 Token...');
      const signer = getSigner();
      const data = accountInterface.encodeFunctionData('addSupportedToken', [
        allowedToken
      ]);
      const tx = await signer.sendTransaction({ to: accountAddress, data });
      await tx.wait();
      setStatus(`Token 已添加: ${tx.hash}`);
    } catch (err) {
      setStatus(`错误: ${err.message}`);
    }
  };

  const handleCreateSession = async () => {
    if (!privateKey) {
      setStatus('请先设置私钥');
      return;
    }
    if (!accountAddress) {
      setStatus('请设置 AA 钱包地址');
      return;
    }
    try {
      setStatus('正在创建 Session...');
      const signer = getSigner();
      const { sessionKeyAddress: keyAddress, sessionId: sid } = ensureSessionKey();
      const rules = buildRules();
      const data = accountInterface.encodeFunctionData('createSession', [
        sid,
        keyAddress,
        rules
      ]);
      const tx = await signer.sendTransaction({ to: accountAddress, data });
      await tx.wait();
      setAgentAddress(keyAddress);
      setStatus(`Session 已创建: ${tx.hash}`);
    } catch (err) {
      setStatus(`错误: ${err.message}`);
    }
  };

  const handleUpdateRules = async () => {
    if (!privateKey) {
      setStatus('请先设置私钥');
      return;
    }
    if (!accountAddress) {
      setStatus('请设置 AA 钱包地址');
      return;
    }
    if (!sessionId) {
      setStatus('请先创建 Session');
      return;
    }
    try {
      setStatus('正在更新规则...');
      const signer = getSigner();
      const rules = buildRules();
      const data = accountInterface.encodeFunctionData('setSpendingRules', [
        sessionId,
        rules
      ]);
      const tx = await signer.sendTransaction({ to: accountAddress, data });
      await tx.wait();
      setStatus(`规则已更新: ${tx.hash}`);
    } catch (err) {
      setStatus(`更新规则错误: ${err.message}`);
    }
  };

  const handleReadRules = async () => {
    if (!accountAddress) {
      setStatus('请设置 AA 钱包地址');
      return;
    }
    if (!sessionId) {
      setStatus('请先创建 Session');
      return;
    }
    try {
      setStatus('正在读取规则...');
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const data = accountInterface.encodeFunctionData('getSpendingRules', [sessionId]);
      const result = await provider.call({ to: accountAddress, data });
      const decoded = accountInterface.decodeFunctionResult('getSpendingRules', result)[0];
      setRulesPreview(decoded || []);
      setStatus('读取成功');
    } catch (err) {
      setStatus(`读取规则错误: ${err.message}`);
    }
  };

  return (
    <div className="transfer-container">
      <div className="top-entry">
        {onBack && (
          <button className="link-btn" onClick={onBack}>
            返回
          </button>
        )}
      </div>

      <h1>Agent 设置</h1>

      <div className="vault-card">
        <h2>添加 Token</h2>
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
          <button onClick={handleSetAllowedToken}>添加 Token</button>
        </div>
      </div>

      <div className="vault-card">
        <h2>消费限制</h2>
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
            <label>单笔限额 (USDT)</label>
            <input
              type="text"
              value={singleLimit}
              onChange={(e) => setSingleLimit(e.target.value)}
              placeholder="5"
            />
          </div>
          <div className="vault-input">
            <label>每日限额 (USDT)</label>
            <input
              type="text"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              placeholder="50"
            />
          </div>
        </div>
        <div className="vault-actions">
          <button onClick={handleCreateSession}>创建 Session 并设置限额</button>
          <button onClick={handleUpdateRules}>更新限额</button>
          <button onClick={handleReadRules}>读取限额</button>
        </div>
        {status && <div className="request-error">{status}</div>}
        {rulesPreview.length > 0 && (
          <div className="rules-list">
            <h3>规则列表</h3>
            {rulesPreview.map((item, index) => (
              <div className="result-row" key={`rule-preview-${index}`}>
                <span className="label">规则 {index + 1}:</span>
                <span className="value">
                  {item.rule.timeWindow === 0 ? '单笔限额' : item.rule.timeWindow === 86400 ? '每日限额' : '其他限额'}
                  预算 {ethers.formatUnits(item.rule.budget, TOKEN_DECIMALS)} USDT
                  已用 {ethers.formatUnits(item.usage.amountUsed, TOKEN_DECIMALS)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AgentSettingsPage;
