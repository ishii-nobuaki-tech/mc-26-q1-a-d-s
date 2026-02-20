import React from 'react';
import EffectCalculator from './components/EffectCalculator';
import RefererGuard from "./RefererGuard";

const App: React.FC = () => {
  return (
    <RefererGuard>
    <div className="min-h-screen bg-gray-50">
      <EffectCalculator />
    </div>
    </RefererGuard>
  );
};

export default App;
