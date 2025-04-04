import React from 'react';

interface HeaderProps {
  isScanning: boolean;
  onStartScan: () => void;
  onStopScan: () => void;
  threatLevel: 'normal' | 'warning' | 'danger';
}

const Header: React.FC<HeaderProps> = ({
  isScanning,
  onStartScan,
  onStopScan,
  threatLevel
}) => {
  return (
    <div className="app-header">
      <div className="app-title">
        <i className="fa fa-shield-alt text-2xl mr-2"></i>
        THE WATCHER
      </div>
      
      <div className="flex-row gap-1">
        <div className="flex-row gap-1">
          <span>Status:</span>
          <div className="flex-row">
            <span className={`status-indicator ${threatLevel}`}></span>
            <span>{threatLevel === 'normal' ? 'Secure' : threatLevel === 'warning' ? 'Warning' : 'Danger'}</span>
          </div>
        </div>
      </div>
      
      <div className="flex-row">
        <div className="app-controls">
          <button 
            className={`control-button ${isScanning ? 'active' : ''}`}
            onClick={isScanning ? onStopScan : onStartScan}
          >
            <i className={`fa ${isScanning ? 'fa-pause' : 'fa-play'}`}></i>
            {isScanning ? 'Stop Scanning' : 'Start Scanning'}
          </button>
          
          <button className="control-button">
            <i className="fa fa-cog"></i>
            Settings
          </button>
        </div>
        
        <div className="window-controls">
          <button 
            className="window-control-button minimize" 
            onClick={() => window.api.minimizeWindow()}
          >
            <i className="fa fa-minus"></i>
          </button>
          <button 
            className="window-control-button close" 
            onClick={() => window.api.closeWindow()}
          >
            <i className="fa fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;