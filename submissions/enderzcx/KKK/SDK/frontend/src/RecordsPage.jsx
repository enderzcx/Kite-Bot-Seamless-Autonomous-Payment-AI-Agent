import { useEffect, useState } from 'react';

function RecordsPage({ onBack }) {
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState('');

  const loadRecords = async () => {
    try {
      setStatus('???...');
      const res = await fetch('/api/records');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : [];
      setRecords(Array.isArray(data) ? data : []);
      setStatus('');
    } catch (err) {
      setStatus(`????: ${err.message}`);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  return (
    <div className="transfer-container records-page">
      <div className="top-entry">
        {onBack && (
          <button className="link-btn" onClick={onBack}>
            返回
          </button>
        )}
        <button className="link-btn" onClick={loadRecords}>
          刷新记录
        </button>
      </div>

      <h1>转账记录</h1>

      {status && <div className="request-error">{status}</div>}

      <div className="vault-card">
        <div className="records-head">
          <span>时间</span>
          <span>类型</span>
          <span>金额</span>
          <span>Token</span>
          <span>TO</span>
          <span>是否成功</span>
          <span>Tx Hash</span>
        </div>

        {records.length === 0 && <div className="result-row">????</div>}
        {records.map((record, index) => (
          <div className="records-row" key={`record-${index}`}>
            <span className="records-cell">{record.time}</span>
            <span className="records-cell">{record.type}</span>
            <span className="records-cell">{record.amount}</span>
            <span className="records-cell">{record.token}</span>
            <span className="records-cell hash">{record.recipient}</span>
            <span className={`records-cell status ${record.status}`}>{record.status}</span>
            <span className="records-cell hash">
              {record.txHash ? (
                <a
                  className="tx-link"
                  href={`https://testnet.kitescan.ai/tx/${record.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {record.txHash}
                </a>
              ) : (
                '-'
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecordsPage;
