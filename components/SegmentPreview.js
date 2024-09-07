import React, { useRef, useEffect } from 'react';

function SegmentPreview({ video, start, end, onClose }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (video && videoElement) {
      const url = URL.createObjectURL(video);
      videoElement.src = url;
      videoElement.currentTime = start;

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [video, start]);

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.currentTime >= end) {
      videoRef.current.pause();
      videoRef.current.currentTime = start;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="segment-preview">
      <div className="segment-preview-content">
        <h3>Segment Preview</h3>
        <video
          ref={videoRef}
          onTimeUpdate={handleTimeUpdate}
          controls
        />
        <p>
          {formatTime(start)} - {formatTime(end)}
        </p>
        <button onClick={onClose}>Close Preview</button>
      </div>
    </div>
  );
}

export default SegmentPreview;
