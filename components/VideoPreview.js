import React, { useRef, useEffect, useState, forwardRef } from 'react';
import Image from 'next/image';

const VideoPreview = forwardRef(({ 
  video, 
  onTimeUpdate, 
  onDurationChange, 
  isPlaying,
  onVideoLoaded,
  isMuted,
  volume
}, ref) => {
  const internalVideoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ref) {
      ref.current = internalVideoRef.current;
    }
  }, [ref]);

  useEffect(() => {
    if (video) {
      setIsLoading(true);
      setError(null);
      const url = URL.createObjectURL(video);
      if (internalVideoRef.current) {
        internalVideoRef.current.src = url;
      }
      return () => URL.revokeObjectURL(url);
    }
  }, [video]);

  useEffect(() => {
    const videoElement = internalVideoRef.current;
    
    if (videoElement && video) {
      const handleCanPlay = () => {
        setIsLoading(false);
        if (onVideoLoaded) {
          onVideoLoaded(videoElement);
        }
      };

      const handleError = () => {
        setIsLoading(false);
        setError('Error loading video. Please try another file.');
      };

      videoElement.addEventListener('canplay', handleCanPlay);
      videoElement.addEventListener('error', handleError);

      return () => {
        videoElement.removeEventListener('canplay', handleCanPlay);
        videoElement.removeEventListener('error', handleError);
      };
    }
  }, [video, onVideoLoaded]);

  useEffect(() => {
    const videoElement = internalVideoRef.current;
    if (!isLoading && video && videoElement) {
      if (isPlaying) {
        videoElement.play().catch(error => console.error('Error playing video:', error));
      } else {
        videoElement.pause();
      }
    }
  }, [isPlaying, isLoading, video]);

  useEffect(() => {
    if (internalVideoRef.current) {
      internalVideoRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (internalVideoRef.current) {
      onTimeUpdate(internalVideoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (internalVideoRef.current) {
      onDurationChange(internalVideoRef.current.duration);
    }
  };

  if (!video) {
    return (
      <div className="video-preview empty-state">
        <Image 
          src="/empty-state-icon.svg" 
          alt="Empty state" 
          width={32} 
          height={32}
        />
        <h2 className="empty-state-title">Welcome to Splitz</h2>
        <p className="empty-state-text">Select videos to begin</p>
      </div>
    );
  }

  return (
    <div className="video-preview">
      {isLoading && <div className="loading-indicator">Loading...</div>}
      {error && <div className="error-message">{error}</div>}
      <video 
        ref={internalVideoRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        style={{ display: isLoading || error ? 'none' : 'block' }}
        muted={isMuted}
      />
    </div>
  );
});

export default VideoPreview;