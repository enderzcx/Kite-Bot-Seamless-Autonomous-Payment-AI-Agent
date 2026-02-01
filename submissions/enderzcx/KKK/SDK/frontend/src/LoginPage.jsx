import { useState } from 'react';

function LoginPage({ onLogin }) {
  const [showToast, setShowToast] = useState(false);

  const handleLogin = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onLogin();
    }, 1400);
  };

  return (
    <div className="login-page">
      {showToast && (
        <div className="login-toast">已为您分配专属KITE BOT!</div>
      )}
      <button className="login-btn" onClick={handleLogin}>
        领取你的专属KITE BOT
      </button>
    </div>
  );
}

export default LoginPage;
