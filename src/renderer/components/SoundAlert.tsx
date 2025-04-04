import React, { useEffect, useRef } from 'react';

interface SoundAlertProps {
  threatLevel: 'normal' | 'warning' | 'danger';
  isActive: boolean;
}

const SoundAlert: React.FC<SoundAlertProps> = ({ threatLevel, isActive }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastThreatLevelRef = useRef<string>(threatLevel);

  useEffect(() => {
    // Only play sound when threat level changes to warning or danger
    if (isActive && 
        (threatLevel === 'warning' || threatLevel === 'danger') && 
        lastThreatLevelRef.current !== threatLevel) {
      
      if (!audioRef.current) {
        audioRef.current = new Audio('./assets/sounds/alert.mp3');
        audioRef.current.volume = threatLevel === 'danger' ? 0.7 : 0.4;
      }
      
      // Play the alert sound
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.error('Failed to play alert sound:', err);
      });
    }

    // Update the last played threat level
    lastThreatLevelRef.current = threatLevel;
    
    // Clean up audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [threatLevel, isActive]);

  // This component doesn't render anything visible
  return null;
};

export default SoundAlert;