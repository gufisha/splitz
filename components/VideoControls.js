import React from 'react';
import Image from 'next/image';

const VideoControls = ({ 
  isPlaying, 
  onTogglePlay, 
  onStop, 
  isMuted, 
  onToggleMute, 
  volume, 
  onVolumeChange, 
  onAddCutPoint,
  currentTime,
  duration
}) => {
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-controls">
      <button className="control-button" onClick={onTogglePlay}>
        <Image 
          src={isPlaying ? "/pause-icon.svg" : "/play-icon.svg"} 
          alt={isPlaying ? "Pause" : "Play"} 
          width={24} 
          height={24} 
        />
      </button>
      <button className="control-button" onClick={onStop}>
        <Image 
          src="/stop-icon.svg" 
          alt="Stop" 
          width={24} 
          height={24} 
        />
      </button>
      <button className="control-button" onClick={onToggleMute}>
        <Image 
          src={isMuted ? "/volume-off-icon.svg" : "/volume-on-icon.svg"} 
          alt={isMuted ? "Unmute" : "Mute"} 
          width={24} 
          height={24} 
        />
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={isMuted ? 0 : volume}
        onChange={onVolumeChange}
        className="volume-slider"
      />
      <div className="time-display">
        {formatTime(currentTime)}/{formatTime(duration)}
      </div>
      <button className="control-button cut-button" onClick={onAddCutPoint}>
        <Image 
          src="/cut-icon.svg" 
          alt="Add Cut Point" 
          width={24} 
          height={24} 
        />
      </button>
    </div>
  );
};

export default VideoControls;