import React from 'react';

interface Device {
  id: number;
  name: string;
  type: string;
  status: string;
  path: string;
  size: string;
  lastConnected: Date;
}

interface DashboardProps {
  isScanning: boolean;
  devices: Device[];
  threatLevel: 'normal' | 'warning' | 'danger';
}

const Dashboard: React.FC<DashboardProps> = ({ 
  isScanning, 
  devices, 
  threatLevel 
}) => {

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

  return (
    <main className="main-content">
      {/* Witcher-style scanner visualization */}
      <div className="panel mb-2">
        <div className="panel-header">
          <div className="panel-title">System Scanner</div>
          <div className="flex-row gap-1">
            <div className="status-indicator active"></div>
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
              <div>{formatDate(new Date())}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Connected Devices */}
      <div className="panel mb-2">
        <div className="panel-header">
          <div className="panel-title">Connected Devices</div>
          <div className="flex-row gap-1">
            <button className="control-button">
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
          <div className="detection-item">
            <i className="detection-icon fa fa-shield-alt"></i>
            <div className="detection-info">
              <div className="detection-title">System Scan Completed</div>
              <div className="detection-desc">No threats detected</div>
            </div>
            <div className="detection-time">{formatDate(new Date(Date.now() - 1800000))}</div>
          </div>
          
          <div className="detection-item">
            <i className="detection-icon fa fa-plug"></i>
            <div className="detection-info">
              <div className="detection-title">USB Device Connected</div>
              <div className="detection-desc">Kingston DataTraveler (E:)</div>
            </div>
            <div className="detection-time">{formatDate(new Date(Date.now() - 3600000))}</div>
          </div>
          
          {threatLevel !== 'normal' && (
            <div className="detection-item">
              <i className="detection-icon fa fa-exclamation-triangle"></i>
              <div className="detection-info">
                <div className="detection-title">Unknown USB Device Detected</div>
                <div className="detection-desc">Potentially unsafe device connected</div>
              </div>
              <div className="detection-time">{formatDate(new Date())}</div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Dashboard; 