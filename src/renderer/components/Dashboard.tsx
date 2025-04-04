import React, { useState, useEffect } from 'react';
import FileScanner from './FileScanner';
import ScanResults from './ScanResults';
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
      <div className="panel mb-2">
        <div className="panel-header">
          <div className="panel-title">System Scanner</div>
          <div className="flex-row gap-1">
            <div className={`status-indicator ${isScanning ? 'active' : 'inactive'}`}></div>
            <span>{isScanning ? 'Scanning...' : 'Idle'}</span>
          </div>
        </div>
        
        <div className="panel-content">
          <div className="scanner-visual">
            <div className="scanner-grid"></div>
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