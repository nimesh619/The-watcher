import React, { useState, useEffect, useRef } from 'react';
import FileScanner from './FileScanner';
import ScanResults from './ScanResults';
import SoundAlert from './SoundAlert';
import '../styles/file-scanner.css';

interface Device {
  id: number;
  name: string;
  type: string;
  status: string;
  path: string;
  size: string;
  lastConnected: Date;
}

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

interface DashboardProps {
  isScanning: boolean;
  threatLevel: 'normal' | 'warning' | 'danger';
  onScanComplete: (result: ScanResult) => void;
  onError: (message: string) => void;
  scanResult: ScanResult | null;
  scanHistory?: ScanResult[];
}

const Dashboard: React.FC<DashboardProps> = ({
  isScanning,
  threatLevel,
  onScanComplete,
  onError,
  scanResult,
  scanHistory = []
}) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [activities, setActivities] = useState<Array<{
    icon: string;
    title: string;
    desc: string;
    time: Date;
    type?: 'normal' | 'warning' | 'danger';
  }>>([
    {
      icon: 'fa-shield-alt',
      title: 'System Scan Completed',
      desc: 'No threats detected',
      time: new Date(Date.now() - 1800000)
    },
    {
      icon: 'fa-usb',
      title: 'USB Device Connected',
      desc: 'Kingston DataTraveler (E:)',
      time: new Date(Date.now() - 3600000)
    }
  ]);
  const [ecgPoints, setEcgPoints] = useState<string>('');
  const [showEcg, setShowEcg] = useState(false);
  const ecgAnimationRef = useRef<any>(null);
  const pulseIntervalRef = useRef<any>(null);
  const [pulseIntensity, setPulseIntensity] = useState(1);
  
  // Generate ECG points for the visualization
  const generateEcgPoints = (intensity = 1) => {
    const width = 1000;
    const height = 150;
    const midY = height / 2;
    
    let points = '';
    let x = 0;
    
    // Normal baseline with small variations
    while (x < width) {
      const variation = Math.random() * 5 - 2.5;
      points += `${x},${midY + variation} `;
      x += 10;
    }
    
    // For threat levels, add ECG-like spikes at intervals
    if (threatLevel === 'warning' || threatLevel === 'danger') {
      // Calculate spike positions
      const spikeCount = threatLevel === 'danger' ? 5 : 3;
      const spikeInterval = width / (spikeCount + 1);
      
      for (let i = 1; i <= spikeCount; i++) {
        const spikeX = i * spikeInterval;
        const spikeHeight = threatLevel === 'danger' ? 50 : 30;
        
        // Replace points around the spike with ECG pattern
        const spikePattern = generateSpikePattern(spikeX, midY, spikeHeight, intensity);
        
        // Insert the spike pattern into the points string
        const startIndex = Math.floor((spikeX - 40) / 10) * 10;
        const endIndex = Math.floor((spikeX + 40) / 10) * 10;
        
        // Create a new points string with the spike integrated
        const beforeSpike = points.split(' ')
          .filter(p => p && parseInt(p.split(',')[0]) < startIndex)
          .join(' ');
          
        const afterSpike = points.split(' ')
          .filter(p => p && parseInt(p.split(',')[0]) > endIndex)
          .join(' ');
          
        points = `${beforeSpike} ${spikePattern} ${afterSpike}`;
      }
    }
    
    return points;
  };
  
  // Generate a single ECG spike pattern
  const generateSpikePattern = (x: number, midY: number, height: number, intensity: number) => {
    const baseIntensity = threatLevel === 'danger' ? 1.5 : 1;
    const finalIntensity = baseIntensity * intensity;
    
    return `
      ${x - 20},${midY} 
      ${x - 15},${midY - 5 * finalIntensity} 
      ${x - 10},${midY + 10 * finalIntensity} 
      ${x - 5},${midY - height * finalIntensity} 
      ${x},${midY + height * 0.8 * finalIntensity} 
      ${x + 5},${midY - 10 * finalIntensity} 
      ${x + 15},${midY} 
    `;
  };
  
  // Update ECG visualization when threat level changes
  useEffect(() => {
    if (scanResult && scanResult.threatLevel !== 'normal') {
      setShowEcg(true);
      const points = generateEcgPoints();
      setEcgPoints(points);
      
      // Cancel any existing animation
      if (ecgAnimationRef.current) {
        clearInterval(ecgAnimationRef.current);
      }
      
      // Set up animation to update the ECG periodically
      ecgAnimationRef.current = setInterval(() => {
        setEcgPoints(generateEcgPoints(pulseIntensity));
      }, 3000);
      
      // Create a pulsing effect
      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current);
      }
      
      pulseIntervalRef.current = setInterval(() => {
        setPulseIntensity(prev => {
          // Oscillate between 0.8 and 1.2 for warning, 0.7 and 1.5 for danger
          const min = threatLevel === 'danger' ? 0.7 : 0.8;
          const max = threatLevel === 'danger' ? 1.5 : 1.2;
          const range = max - min;
          
          return min + (Math.sin(Date.now() / 500) + 1) / 2 * range;
        });
      }, 50);
      
    } else if (!isScanning && (!scanResult || scanResult.threatLevel === 'normal')) {
      // Clear the animation if there's no threat or during scanning
      if (ecgAnimationRef.current) {
        clearInterval(ecgAnimationRef.current);
        ecgAnimationRef.current = null;
      }
      
      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current);
        pulseIntervalRef.current = null;
      }
      
      // Fade out the ECG
      setTimeout(() => {
        setShowEcg(false);
      }, 500);
      
      setEcgPoints('');
      setPulseIntensity(1);
    }
    
    // Cleanup on unmount
    return () => {
      if (ecgAnimationRef.current) {
        clearInterval(ecgAnimationRef.current);
      }
      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current);
      }
    };
  }, [scanResult, threatLevel, isScanning]);

  // When a scan is completed, update the last scan time and add to activities
  useEffect(() => {
    if (scanResult) {
      setLastScanTime(new Date(scanResult.scan_date));
    }
  }, [scanResult]);

  // Convert scan history to activities
  useEffect(() => {
    if (scanHistory && scanHistory.length > 0) {
      const historyActivities = scanHistory.map(scan => ({
        icon: scan.threatLevel === 'normal' ? 'fa-shield-alt' : 
             scan.threatLevel === 'warning' ? 'fa-exclamation-triangle' : 'fa-skull-crossbones',
        title: 'File Scan Completed',
        desc: scan.threatLevel === 'normal' ? 
              `No threats detected in ${scan.file_name}` : 
              `${scan.detections} threats found in ${scan.file_name}`,
        time: new Date(scan.scan_date),
        type: scan.threatLevel
      }));
      
      // Combine scan history activities with other system activities
      const systemActivities = activities.filter(act => 
        act.title === 'System Scan Completed' || act.title === 'USB Device Connected'
      );
      
      // Sort all activities by time, most recent first
      const allActivities = [...historyActivities, ...systemActivities]
        .sort((a, b) => b.time.getTime() - a.time.getTime());
      
      setActivities(allActivities);
      
      // Set last scan time if not already set
      if (!lastScanTime && historyActivities.length > 0) {
        setLastScanTime(historyActivities[0].time);
      }
    }
  }, [scanHistory]);

  const handleScanComplete = (result: ScanResult) => {
    onScanComplete(result);
  };

  const handleScanError = (message: string) => {
    onError(message);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'usb':
        return 'fa-usb';
      case 'hdd':
        return 'fa-hdd';
      default:
        return 'fa-question-circle';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'connected':
        return 'active';
      case 'warning':
        return 'warning';
      case 'danger':
        return 'danger';
      default:
        return '';
    }
  };

  // Simulate refreshing devices
  const refreshDevices = () => {
    // This would typically call an API to get connected devices
    // For now, we'll just use mock data
    setDevices([
      {
        id: 1,
        name: 'Kingston DataTraveler',
        type: 'usb',
        status: 'connected',
        path: 'E:/',
        size: '16 GB',
        lastConnected: new Date()
      }
    ]);
  };

  return (
    <main className="main-content">
      {/* Add sound alert component */}
      <SoundAlert 
        threatLevel={threatLevel} 
        isActive={!isScanning && showEcg} 
      />
    
      {/* File Scanner Panel */}
      <div className="panel mb-2">
        <div className="panel-header">
          <div className="panel-title">File Scanner</div>
        </div>
        <div className="panel-content">
          <FileScanner 
            onScanComplete={handleScanComplete} 
          />
          
          {scanResult && (
            <ScanResults result={scanResult} />
          )}
        </div>
      </div>

      {/* Witcher-style scanner visualization */}
      <div className={`panel mb-2 ${showEcg && threatLevel !== 'normal' ? `pulse-${threatLevel}` : ''}`}>
        <div className="panel-header">
          <div className="panel-title">System Scanner</div>
          <div className="flex-row gap-1">
            <div className={`status-indicator ${isScanning ? 'active' : threatLevel}`}></div>
            <span>{isScanning ? 'Scanning...' : threatLevel === 'normal' ? 'Secure' : 
                  threatLevel === 'warning' ? 'Threat Detected' : 'DANGER'}</span>
          </div>
        </div>
        
        <div className="panel-content">
          <div className={`scanner-visual ${showEcg && threatLevel !== 'normal' ? `scanner-${threatLevel}` : ''}`}>
            <div className="scanner-grid"></div>
            
            {/* ECG Visualization - shown when threat detected */}
            {showEcg && ecgPoints && (
              <div className="ecg-container">
                <svg width="100%" height="100%" viewBox="0 0 1000 150" preserveAspectRatio="none">
                  {/* Background line */}
                  <polyline 
                    className="ecg-line-bg" 
                    points={`0,75 1000,75`} 
                  />
                  
                  {/* First ECG line (duplicate for animation effect) */}
                  <polyline 
                    className={`ecg-line ecg-animate ecg-glow ${threatLevel}`} 
                    points={ecgPoints}
                    style={{
                      animationDuration: `${threatLevel === 'danger' ? '2s' : '3s'}`
                    }}
                  />
                  
                  {/* Second ECG line (offset for continuous animation) */}
                  <polyline 
                    className={`ecg-line ecg-animate ecg-glow ${threatLevel}`}
                    points={ecgPoints} 
                    style={{
                      transform: 'translateX(100%)',
                      animationDuration: `${threatLevel === 'danger' ? '2s' : '3s'}`
                    }}
                  />
                </svg>
              </div>
            )}
            
            {/* Regular scanning animation - shown during scan */}
            {isScanning && <div className="scanner-line"></div>}
          </div>
          
          <div className="flex-row gap-2">
            <div>
              <div className="mb-1">Threat Level:</div>
              <div className="flex-row">
                <span className={`status-indicator ${threatLevel}`}></span>
                <span className="text-uppercase">
                  {threatLevel === 'normal' && 'Normal'}
                  {threatLevel === 'warning' && 'Warning'}
                  {threatLevel === 'danger' && 'Danger'}
                </span>
              </div>
            </div>
            
            <div>
              <div className="mb-1">Connected USB Devices:</div>
              <div>{devices.length}</div>
            </div>
            
            <div>
              <div className="mb-1">Last Scan:</div>
              <div>{lastScanTime ? formatDate(lastScanTime) : 'No scan yet'}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Connected Devices */}
      <div className="panel mb-2">
        <div className="panel-header">
          <div className="panel-title">Connected Devices</div>
          <div className="flex-row gap-1">
            <button className="control-button" onClick={refreshDevices}>
              <i className="fa fa-sync-alt"></i>
              Refresh
            </button>
          </div>
        </div>
        
        <div className="panel-content">
          {devices.length === 0 ? (
            <div className="text-center">No devices connected</div>
          ) : (
            <div className="flex-col">
              {devices.map(device => (
                <div key={device.id} className={`device-card ${device.status === 'warning' ? 'pulse-animation' : ''}`}>
                  <div className="device-card-header">
                    <div className="flex-row">
                      <i className={`device-icon fa ${getDeviceIcon(device.type)}`}></i>
                      <div className="device-name">{device.name}</div>
                    </div>
                    <div className="flex-row">
                      <span className={`status-indicator ${getStatusClass(device.status)}`}></span>
                      <span>{device.status === 'connected' ? 'Trusted' : 'Unknown'}</span>
                    </div>
                  </div>
                  
                  <div className="device-details flex-row gap-2 flex-wrap">
                    <div>Path: {device.path}</div>
                    <div>Size: {device.size}</div>
                    <div>Connected: {formatDate(device.lastConnected)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Recent Activity</div>
        </div>
        
        <div className="panel-content">
          {activities.length === 0 ? (
            <div className="text-center">No recent activity</div>
          ) : (
            activities.map((activity, index) => (
              <div key={index} className={`detection-item ${activity.type || ''}`}>
                <i className={`detection-icon fa ${activity.icon}`}></i>
                <div className="detection-info">
                  <div className="detection-title">{activity.title}</div>
                  <div className="detection-desc">{activity.desc}</div>
                </div>
                <div className="detection-time">{formatDate(activity.time)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;