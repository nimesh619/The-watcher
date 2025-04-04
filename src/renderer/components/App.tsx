import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import Header from './Header';
import Notification from './Notification';

interface ScanResult {
  threatLevel: 'normal' | 'warning' | 'danger';
  detections: number;
  total: number;
  detectedBy: string[];
  permalink: string;
  scan_date: string;
  sha256: string;
  file_name: string;
}

const App: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [threatLevel, setThreatLevel] = useState<'normal' | 'warning' | 'danger'>('normal');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'info' | 'success' | 'warning' | 'error'} | null>(null);

  const handleScanComplete = (result: ScanResult) => {
    setScanResult(result);
    setThreatLevel(result.threatLevel);
    setIsScanning(false);
    
    // Update scan history
    setScanHistory(prevHistory => [result, ...prevHistory]);
    
    // Show notification based on threat level
    if (result.threatLevel === 'danger') {
      setNotification({
        message: `High threat detected! ${result.detections} malicious findings.`,
        type: 'error'
      });
    } else if (result.threatLevel === 'warning') {
      setNotification({
        message: `Warning: Potential threat detected with ${result.detections} findings.`,
        type: 'warning'
      });
    } else {
      setNotification({
        message: 'File scan completed: No threats detected.',
        type: 'success'
      });
    }
  };

  const handleScanStart = () => {
    setIsScanning(true);
    setScanResult(null);
  };

  const handleError = (errorMessage: string) => {
    setIsScanning(false);
    setNotification({
      message: `Error: ${errorMessage}`,
      type: 'error'
    });
  };

  useEffect(() => {
    // Load scan history on component mount
    const loadScanHistory = async () => {
      try {
        const history = await window.api.getScanHistory();
        setScanHistory(history);
        
        // If history exists, set the most recent scan result and threat level
        if (history.length > 0) {
          setScanResult(history[0]);
          setThreatLevel(history[0].threatLevel);
          
          // Show initial info notification
          setNotification({
            message: `Loaded ${history.length} previous scan${history.length !== 1 ? 's' : ''}`,
            type: 'info'
          });
        }
      } catch (error) {
        console.error('Failed to load scan history:', error);
      }
    };
    
    loadScanHistory();
  }, []);

  return (
    <div id="app">
      <Header 
        isScanning={isScanning} 
        onStartScan={handleScanStart}
        onStopScan={() => setIsScanning(false)}
        threatLevel={threatLevel}
      />
      
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      <div className="app-content">
        <Dashboard 
          isScanning={isScanning}
          onScanComplete={handleScanComplete}
          onError={handleError}
          scanResult={scanResult}
          threatLevel={threatLevel}
          scanHistory={scanHistory}
        />
      </div>
    </div>
  );
};

export default App;