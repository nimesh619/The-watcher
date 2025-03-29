import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import Sidebar from './Sidebar';
import Header from './Header';
import Notification from './Notification';

// Sound effects
const playDetectionSound = () => {
  const audio = new Audio('./assets/sounds/quest-complete.mp3');
  audio.play().catch(e => console.error('Error playing sound:', e));
};

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  const [connectedDevices, setConnectedDevices] = useState<any[]>([]);
  const [threatLevel, setThreatLevel] = useState<'normal' | 'warning' | 'danger'>('normal');
  
  // Simulate USB detection
  useEffect(() => {
    // Mock data - in a real app, this would come from electron's main process
    const mockDevices = [
      { id: 1, name: 'Kingston DataTraveler', type: 'usb', status: 'connected', path: 'E:', size: '16GB', lastConnected: new Date() },
      { id: 2, name: 'Western Digital HDD', type: 'hdd', status: 'connected', path: 'D:', size: '1TB', lastConnected: new Date() }
    ];
    
    setConnectedDevices(mockDevices);
    
    // Simulate detection of a new device after 10 seconds
    const timer = setTimeout(() => {
      const newDevice = { 
        id: 3, 
        name: 'Unknown USB Device', 
        type: 'usb', 
        status: 'warning', 
        path: 'F:', 
        size: '32GB', 
        lastConnected: new Date() 
      };
      
      setConnectedDevices(prev => [...prev, newDevice]);
      setThreatLevel('warning');
      
      // Show notification and play sound
      setNotifications(prev => [
        ...prev, 
        { 
          id: Date.now(), 
          title: 'Unknown USB Device Detected', 
          message: 'An unrecognized USB device has been connected to your system.',
          type: 'warning',
          time: new Date()
        }
      ]);
      
      playDetectionSound();
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleStartScan = () => {
    setIsScanning(true);
  };
  
  const handleStopScan = () => {
    setIsScanning(false);
  };
  
  const handleNavigate = (page: string) => {
    setActivePage(page);
  };
  
  const dismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <div id="app">
      <Header 
        isScanning={isScanning} 
        onStartScan={handleStartScan} 
        onStopScan={handleStopScan}
        threatLevel={threatLevel}
      />
      
      <div className="app-content">
        <Sidebar 
          activePage={activePage} 
          onNavigate={handleNavigate}
        />
        
        <Dashboard 
          isScanning={isScanning} 
          devices={connectedDevices} 
          threatLevel={threatLevel}
        />
      </div>
      
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          id={notification.id}
          title={notification.title}
          message={notification.message}
          type={notification.type}
          onDismiss={dismissNotification}
        />
      ))}
    </div>
  );
};

export default App; 