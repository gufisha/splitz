import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

const Timeline = ({ 
  video, 
  duration = 0, 
  currentTime = 0, 
  onSeek, 
  onAddCutPoint, 
  cutPoints = [], 
  onPlayPause, 
  isPlaying 
}) => {
  const [thumbnails, setThumbnails] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);
  const timelineRef = useRef(null);
  const thumbnailsGeneratedRef = useRef(false);

  const generateThumbnails = useCallback(async () => {
    if (typeof window === 'undefined' || !video || duration <= 0 || thumbnailsGeneratedRef.current) return;

    const thumbnailCount = Math.min(200, Math.floor(duration));
    const interval = duration / thumbnailCount;
    const tempThumbnails = [];

    const videoElement = document.createElement('video');
    videoElement.src = URL.createObjectURL(video);

    await new Promise((resolve) => {
      videoElement.onloadedmetadata = resolve;
    });

    for (let i = 0; i < thumbnailCount; i++) {
      const time = i * interval;
      const thumbnail = await extractThumbnail(videoElement, time);
      tempThumbnails.push(thumbnail);
    }

    setThumbnails(tempThumbnails);
    URL.revokeObjectURL(videoElement.src);
    thumbnailsGeneratedRef.current = true;
  }, [video, duration]);

  const extractThumbnail = useCallback((videoElement, time) => {
    return new Promise((resolve) => {
      videoElement.currentTime = time;
      videoElement.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 56;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL());
      };
    });
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && video && duration > 0) {
      generateThumbnails();
    }
  }, [video, duration, generateThumbnails]);

  const handleTimelineInteraction = useCallback((e) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = Math.max(0, Math.min((x / rect.width) * duration, duration));
    setHoverTime(time);
    
    onSeek(time);
  }, [duration, onSeek]);

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    handleTimelineInteraction(e);
  }, [handleTimelineInteraction]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      handleTimelineInteraction(e);
    } else {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const time = Math.max(0, Math.min((x / rect.width) * duration, duration));
      setHoverTime(time);
    }
  }, [isDragging, handleTimelineInteraction, duration]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverTime(null);
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, handleMouseUp, handleMouseMove]);

  return (
    <div className="timeline-container">
      <div className="timeline-controls">
        <button className="play-pause-button" onClick={onPlayPause} disabled={!video}>
          <Image 
            src={isPlaying ? "/pause-icon.svg" : "/play-icon.svg"} 
            alt={isPlaying ? "Pause" : "Play"} 
            width={24} 
            height={24} 
          />
        </button>
        <div className="timeline-bar-container">
          <div 
            className="timeline-bar" 
            ref={timelineRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleTimelineInteraction}
          >
            <div className="thumbnails-container">
              {thumbnails.map((thumbnail, index) => (
                <img 
                  key={index} 
                  src={thumbnail} 
                  alt={`Thumbnail ${index}`}
                  style={{width: `${100 / thumbnails.length}%`}}
                />
              ))}
            </div>
            <div 
              className="timeline-progress" 
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            {cutPoints.map((cutPoint, index) => (
              <div 
                key={index}
                className="cut-point"
                style={{ left: `${(cutPoint / duration) * 100}%` }}
              />
            ))}
            {hoverTime !== null && (
              <div 
                className="hover-indicator"
                style={{ left: `${(hoverTime / duration) * 100}%` }}
              />
            )}
          </div>
        </div>
        <button className="add-cut-point-button" onClick={() => onAddCutPoint(currentTime)} disabled={!video}>
          <Image src="/cut-icon.svg" alt="Add Cut Point" width={20} height={20} />
          <span style={{ marginLeft: '5px' }}>Add Cut Point</span>
        </button>
      </div>
    </div>
  );
};

export default Timeline;