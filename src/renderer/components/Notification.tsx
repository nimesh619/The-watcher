import React, { useEffect, useState } from 'react';

interface NotificationProps {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'danger';
  onDismiss: (id: number) => void;
}

const Notification: React.FC<NotificationProps> = ({ 
  id, 
  title, 
  message, 
  type, 
  onDismiss 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Show the notification with a slight delay for animation
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    // Auto-dismiss after 8 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 8000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss(id);
    }, 500); // Time for exit animation
  };
  

  const getIcon = () => {
    switch (type) {
      case 'info':
        return 'fa-info-circle';
      case 'warning':
        return 'fa-exclamation-circle';
      case 'danger':
        return 'fa-skull';
      default:
        return 'fa-bell';
    }
  };
  
  return (
    <div className={`medallion-alert ${isVisible ? 'show' : ''}`}>
      <div className="medallion-alert-header">
        <img src="./witcher-logo.png" alt="Medallion" className="medallion-icon" />
        <div className="medallion-title">{title}</div>
      </div>
      <div className="medallion-message">{message}</div>
      <div className="flex-row" style={{ justifyContent: 'flex-end', marginTop: '10px' }}>
        <button className="control-button" onClick={handleDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default Notification;
