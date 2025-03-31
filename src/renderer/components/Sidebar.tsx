import React from 'react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
    { id: 'filescanner', icon: 'fa-file-medical-alt', label: 'File Scanner' },
    { id: 'devices', icon: 'fa-usb', label: 'USB Devices' },
    { id: 'threats', icon: 'fa-shield-alt', label: 'Threats' },
    { id: 'logs', icon: 'fa-list', label: 'Activity Logs' },
    { id: 'settings', icon: 'fa-cog', label: 'Settings' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-title">Navigation</div>
        {navItems.map(item => (
          <div 
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <i className={`nav-item-icon fa ${item.icon}`}></i>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      
      <div className="sidebar-section">
        <div className="sidebar-title">Security Status</div>
        <div className="panel-content">
          <div className="flex-row mb-1">
            <span className="status-indicator active"></span>
            <span>Firewall: Active</span>
          </div>
          <div className="flex-row mb-1">
            <span className="status-indicator active"></span>
            <span>Real-time Scanning: On</span>
          </div>
          <div className="flex-row mb-1">
            <span className="status-indicator active"></span>
            <span>USB Protection: Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;