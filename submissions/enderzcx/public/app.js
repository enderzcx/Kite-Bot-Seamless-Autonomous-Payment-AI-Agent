const API_BASE = 'http://localhost:3000';

const MAX_DAILY_TRANSFERS = 10;
const MAX_DAILY_VALUE = 100;

async function fetchBalance() {
  try {
    const addressInput = document.getElementById('addressInput').value.trim();
    let url = `${API_BASE}/balance`;
    
    if (addressInput) {
      url += `?address=${encodeURIComponent(addressInput)}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    document.getElementById('balance').textContent = `${data.balance || '0'} KAT`;
    if (data.address) {
      document.getElementById('walletInfo').textContent = `当前地址：${data.address.slice(0, 10)}...${data.address.slice(-8)}`;
    } else {
      document.getElementById('walletInfo').textContent = '当前地址：未知';
    }
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    document.getElementById('balance').textContent = '0 KAT';
    document.getElementById('walletInfo').textContent = '当前地址：未知';
  }
}

async function fetchLimits() {
  try {
    const addressInput = document.getElementById('addressInput').value.trim();
    let url = `${API_BASE}/limits`;
    
    if (addressInput) {
      url += `?address=${encodeURIComponent(addressInput)}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    const count = data.count || 0;
    const value = parseFloat(data.value) || 0;
    const remainingCount = MAX_DAILY_TRANSFERS - count;
    const remainingValue = MAX_DAILY_VALUE - value;

    document.getElementById('transferCount').textContent = `${count}/${MAX_DAILY_TRANSFERS}`;
    document.getElementById('remainingCount').textContent = remainingCount;
    document.getElementById('transferValue').textContent = `${value.toFixed(2)}/${MAX_DAILY_VALUE}`;
    document.getElementById('remainingValue').textContent = remainingValue.toFixed(2);

    if (remainingCount <= 0) {
      document.getElementById('transferCount').style.color = '#dc3545';
    } else if (remainingCount <= 3) {
      document.getElementById('transferCount').style.color = '#ffc107';
    } else {
      document.getElementById('transferCount').style.color = '#1a1a2e';
    }

    if (remainingValue <= 0) {
      document.getElementById('transferValue').style.color = '#dc3545';
    } else if (remainingValue <= 10) {
      document.getElementById('transferValue').style.color = '#ffc107';
    } else {
      document.getElementById('transferValue').style.color = '#1a1a2e';
    }
  } catch (error) {
    console.error('Failed to fetch limits:', error);
    document.getElementById('transferCount').textContent = '0/10';
    document.getElementById('transferValue').textContent = '0/100';
  }
}

async function fetchHistory() {
  try {
    const addressInput = document.getElementById('addressInput').value.trim();
    let url = `${API_BASE}/history`;
    
    if (addressInput) {
      url += `?address=${encodeURIComponent(addressInput)}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    const historyList = document.getElementById('historyList');

    if (data.history && data.history.length > 0) {
      historyList.innerHTML = data.history.map((item, index) => {
        const date = new Date(item.date);
        const formattedDate = date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });

        return `
          <div class="history-item">
            <div class="history-item-left">
              <div class="history-item-date">${formattedDate}</div>
              <div>转账 ${item.amount} KAT</div>
            </div>
            <div class="history-item-right">
              <a href="https://testnet.kitescan.ai/tx/${item.txHash}" target="_blank" class="history-item-hash">
                ${item.txHash.slice(0, 10)}...${item.txHash.slice(-8)}
              </a>
            </div>
          </div>
        `;
      }).join('');
    } else {
      historyList.innerHTML = '<div class="history-empty">暂无转账记录</div>';
    }
  } catch (error) {
    console.error('Failed to fetch history:', error);
    document.getElementById('historyList').innerHTML = '<div class="history-empty">加载失败</div>';
  }
}

function generateRandomAddress() {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  document.getElementById('to').value = address;
}

function setMaxAmount() {
  const balanceText = document.getElementById('balance').textContent;
  const balance = parseFloat(balanceText.replace(' KAT', ''));
  if (!isNaN(balance) && balance > 0) {
    document.getElementById('amount').value = Math.min(balance, MAX_DAILY_VALUE).toFixed(2);
  }
}

function clearAddress() {
  document.getElementById('addressInput').value = '';
  fetchBalance();
  fetchLimits();
  fetchHistory();
}

async function handleTransfer(event) {
  event.preventDefault();

  const to = document.getElementById('to').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);

  if (!to) {
    showResult('warning', '⚠️ 请输入接收地址或点击"随机地址"生成');
    return;
  }

  if (!amount || amount <= 0) {
    showResult('warning', '⚠️ 请输入有效的转账金额');
    return;
  }

  if (amount > MAX_DAILY_VALUE) {
    showResult('warning', `⚠️ 单笔转账金额不能超过 ${MAX_DAILY_VALUE} KAT`);
    return;
  }

  const loading = document.getElementById('loading');
  const submitBtn = document.getElementById('submitBtn');
  const result = document.getElementById('result');

  loading.style.display = 'block';
  submitBtn.disabled = true;
  result.style.display = 'none';

  try {
    const response = await fetch(`${API_BASE}/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to,
        amount
      })
    });

    const data = await response.json();

    if (data.success) {
      showResult(
        'success',
        `✅ 转账成功！<br><br>
        交易哈希: <a href="https://testnet.kitescan.ai/tx/${data.txHash}" target="_blank">${data.txHash.slice(0, 20)}...</a><br><br>
        转账金额: ${amount} KAT<br>
        接收地址: ${to.slice(0, 10)}...${to.slice(-8)}`
      );

      await fetchBalance();
      await fetchLimits();
      await fetchHistory();
    } else {
      if (data.error && data.error.includes('Insufficient balance')) {
        showResult('error', `❌ 转账失败：余额不足`);
      } else if (data.error && data.error.includes('Daily transfer limit')) {
        showResult('error', `❌ 转账失败：已达今日转账次数上限`);
      } else if (data.error && data.error.includes('Daily value limit')) {
        showResult('error', `❌ 转账失败：已达今日转账金额上限`);
      } else {
        showResult('error', `❌ 转账失败：${data.error || '未知错误'}`);
      }
    }
  } catch (error) {
    showResult('error', `❌ 网络错误：${error.message}`);
  } finally {
    loading.style.display = 'none';
    submitBtn.disabled = false;
  }
}

function showResult(type, content) {
  const result = document.getElementById('result');
  const title = document.getElementById('resultTitle');
  const resultContent = document.getElementById('resultContent');

  result.className = `result ${type}`;
  title.textContent = type === 'success' ? '✅ 成功' : (type === 'error' ? '❌ 失败' : '⚠️ 提示');
  resultContent.innerHTML = content;
  result.style.display = 'block';

  result.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

document.getElementById('transferForm').addEventListener('submit', handleTransfer);

fetchBalance();
fetchLimits();
fetchHistory();

setInterval(fetchBalance, 30000);
setInterval(fetchLimits, 30000);
setInterval(fetchHistory, 30000);
