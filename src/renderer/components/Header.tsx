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
        <img src="./witcher-logo.png" alt="Logo" className="app-logo" />
        The Watcher
      </div>
      
      <div className="flex-row gap-1">
        <div className="flex-row gap-1">
          <span>Status:</span>
          <div className="flex-row">
            <span className={`status-indicator ${threatLevel === 'normal' ? 'active' : threatLevel}`}></span>
            <span>
              {threatLevel === 'normal' && 'Secure'}
              {threatLevel === 'warning' && 'Warning'}
              {threatLevel === 'danger' && 'Danger'}
            </span>
          </div>
        </div>
      </div>
      
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
    </div>
  );
};

export default Header; 