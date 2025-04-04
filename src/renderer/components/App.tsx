import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import Header from './Header';

const App: React.FC = () => {
  const [isScanning, setIsScanning] = useState(true);
  const [threatLevel, setThreatLevel] = useState<'normal' | 'warning' | 'danger'>('normal');

  return (
    <div id="app">
      <Header 
        isScanning={isScanning} 
        onStartScan={() => setIsScanning(true)}
        onStopScan={() => setIsScanning(false)}
        threatLevel={threatLevel}
      />
      
      <div className="app-content">
        <Dashboard 
          isScanning={isScanning}
          devices={[]}
          threatLevel={threatLevel}
        />
      </div>
    </div>
  );
};

export default App;