import React, { useRef, useState } from 'react';
import Image from 'next/image';

function VideoList({ videos = [], onVideoSelect, onVideoRemove, currentVideo }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    addVideoFiles(files);
  };

  const addVideoFiles = (files) => {
    const videoFiles = files.filter(file => 
      file.type.startsWith('video/') || 
      file.name.toLowerCase().endsWith('.mov') ||
      file.name.toLowerCase().endsWith('.mp4')
    );
    videoFiles.forEach(file => onVideoSelect(file));
  };

  const handleChooseFiles = () => {
    fileInputRef.current.click();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    addVideoFiles(files);
  };

  return (
    <div 
      className={`video-list ${isDragging ? 'dragging' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <h2>Videos</h2>
      {videos.length > 0 ? (
        <ul>
          {videos.map((video, index) => (
            <li 
              key={index} 
              onClick={() => onVideoSelect(video)}
              className={currentVideo === video ? 'selected' : ''}
            >
              <span className="clip-name">{video.name}</span>
              <button 
                className="icon-button delete-button" 
                onClick={(e) => {
                  e.stopPropagation();
                  onVideoRemove(index);
                }}
              >
                <Image src="/delete-icon.svg" alt="Delete" width={24} height={24} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Choose files or drag and drop to begin.</p>
      )}
      <input
        type="file"
        accept="video/*,.mp4,.mov"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
      <button className="button-with-icon choose-files-button" onClick={handleChooseFiles}>
        <Image src="/upload-icon.svg" alt="" width={24} height={24} className="icon" />
        Select
      </button>
      {isDragging && (
        <div className="drag-overlay">
          <p>Drop video files here</p>
        </div>
      )}
    </div>
  );
}

export default VideoList;