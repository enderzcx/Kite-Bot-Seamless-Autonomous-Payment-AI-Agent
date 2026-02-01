import { useState } from 'react';
import Transfer from './Transfer';
import LoginPage from './LoginPage';
import RequestPage from './RequestPage';
import VaultPage from './VaultPage';
import AgentSettingsPage from './AgentSettingsPage';
import RecordsPage from './RecordsPage';
import './App.css';

function App() {
  const [view, setView] = useState('login');

  return (
    <div className="app">
      {view === 'login' && <LoginPage onLogin={() => setView('request')} />}
      {view === 'request' && (
        <RequestPage
          onOpenTransfer={() => setView('transfer')}
          onOpenVault={() => setView('vault')}
          onOpenAgentSettings={() => setView('agent-settings')}
          onOpenRecords={() => setView('records')}
        />
      )}
      {view === 'transfer' && (
        <Transfer onBack={() => setView('request')} />
      )}
      {view === 'vault' && (
        <VaultPage onBack={() => setView('request')} />
      )}
      {view === 'agent-settings' && (
        <AgentSettingsPage onBack={() => setView('request')} />
      )}
      {view === 'records' && (
        <RecordsPage onBack={() => setView('request')} />
      )}
    </div>
  );
}

export default App;
