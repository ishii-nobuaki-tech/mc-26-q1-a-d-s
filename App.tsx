import React, { useState, useEffect } from 'react';
import EffectCalculator from './components/EffectCalculator';

const App: React.FC = () => {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccess = () => {
      try {
        // 1. iframe内かどうかの判定
        const inIframe = window.self !== window.top || window !== window.parent;
        
        // 2. リファラー（遷移元）がSharePointかどうかの判定
        const referrer = document.referrer.toLowerCase();
        const fromSharePoint = referrer.includes('sharepoint.com');

        // iframe内、またはSharePointからのリンク遷移であれば許可
        return inIframe || fromSharePoint;
      } catch (e) {
        // クロスオリジン制約でエラーが出た場合は確実にiframe内
        return true;
      }
    };

    setIsAllowed(checkAccess());
  }, []);

  // Show nothing while checking
  if (isAllowed === null) {
    return null;
  }

  // If not in an iframe, show an access restricted message
  if (!isAllowed) {
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