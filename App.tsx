import React, { useState, useEffect } from 'react';
import EffectCalculator from './components/EffectCalculator';

const App: React.FC = () => {
  const [isIframe, setIsIframe] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      // If window.self !== window.top, the page is embedded in an iframe
      setIsIframe(window.self !== window.top);
    } catch (e) {
      // A cross-origin error when accessing window.top means it's definitely in an iframe
      setIsIframe(true);
    }
  }, []);

  // Show nothing while checking
  if (isIframe === null) {
    return null;
  }

  // If not in an iframe, show an access restricted message
  if (!isIframe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md w-full">
          <h1 className="text-xl font-bold text-gray-800 mb-3">アクセスが制限されています</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            このページは直接アクセスできません。<br />
            指定されたポータルサイト（SharePoint）からご利用ください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EffectCalculator />
    </div>
  );
};

export default App;