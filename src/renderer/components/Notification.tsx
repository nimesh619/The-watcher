import React, { useState, useEffect } from 'react';

interface NotificationProps {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ 
  message, 
  type, 
  onClose,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Reset visibility when a new notification comes in
    setIsVisible(true);
    
    // Auto-hide the notification after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out animation to complete
    }, duration);
    
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'info':
        return 'fa-info-circle';
      case 'success':
        return 'fa-check-circle';
      case 'warning':
        return 'fa-exclamation-triangle';
      case 'error':
        return 'fa-exclamation-circle';
      default:
        return 'fa-info-circle';
    }
  };

  return (
    <div className={`notification ${type} ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="notification-icon">
        <i className={`fa ${getIcon()}`}></i>
      </div>
      <div className="notification-content">
        {message}
      </div>
      <button className="notification-close" onClick={() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }}>
        <i className="fa fa-times"></i>
      </button>
    </div>
  );
};

export default Notification;
