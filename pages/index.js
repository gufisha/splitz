import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const VideoList = dynamic(() => import('../components/VideoList'), { ssr: false });
const VideoPreview = dynamic(() => import('../components/VideoPreview'), { ssr: false });
const ExportPanel = dynamic(() => import('../components/ExportPanel'), { ssr: false });
const Timeline = dynamic(() => import('../components/Timeline'), { ssr: false });
const VideoControls = dynamic(() => import('../components/VideoControls'), { ssr: false });

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [cutPoints, setCutPoints] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [thumbnails, setThumbnails] = useState([]);
  const videoRef = useRef(null);

  const resetVideoState = () => {
    setDuration(0);
    setCurrentTime(0);
    setCutPoints([]);
    setIsPlaying(false);
    setThumbnails([]); // Clear thumbnails
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const handleVideoSelect = (selectedVideo) => {
    setVideos(prevVideos => {
      if (!prevVideos.some(video => video.name === selectedVideo.name)) {
        return [...prevVideos, selectedVideo];
      }
      return prevVideos;
    });
    setCurrentVideo(selectedVideo);
    resetVideoState();
  };

  const handleVideoRemove = (index) => {
    setVideos(prevVideos => {
      const newVideos = prevVideos.filter((_, i) => i !== index);
      if (currentVideo === prevVideos[index]) {
        setCurrentVideo(null);
        resetVideoState();
      }
      return newVideos;
    });
  };

  const handleSeek = (time) => {
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleAddCutPoint = (time) => {
    setCutPoints(prevPoints => [...prevPoints, time].sort((a, b) => a - b));
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentVideo(null);
    resetVideoState();
    setCutPoints([]); 
    setThumbnails([]);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleVideoLoaded = (videoElement) => {
    videoRef.current = videoElement;
  };

  const handleThumbnailsGenerated = (newThumbnails) => {
    setThumbnails(newThumbnails);
  };

  return (
    <div>
      <div className="logo-container">
        <img src="/splitz.svg" alt="Splitz Logo" className="app-logo" />
      </div>
      <div className="main-content">
        <VideoList 
          videos={videos}
          onVideoSelect={handleVideoSelect}
          onVideoRemove={handleVideoRemove}
          currentVideo={currentVideo}
        />
        <div className="video-container">
          <VideoPreview 
            video={currentVideo}
            onDurationChange={setDuration}
            onTimeUpdate={setCurrentTime}
            isPlaying={isPlaying}
            isMuted={isMuted}
            volume={volume}
            onVideoLoaded={handleVideoLoaded}
            ref={videoRef}
          />
          <VideoControls 
            isPlaying={isPlaying}
            onTogglePlay={handlePlayPause}
            onStop={handleStop}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            volume={volume}
            onVolumeChange={handleVolumeChange}
            onAddCutPoint={() => handleAddCutPoint(currentTime)}
            currentTime={currentTime}
            duration={duration}
          />
        </div>
        <Timeline 
          video={currentVideo}
          duration={duration}
          currentTime={currentTime}
          onSeek={handleSeek}
          onAddCutPoint={handleAddCutPoint}
          cutPoints={cutPoints}
          onPlayPause={handlePlayPause}
          isPlaying={isPlaying}
          thumbnails={thumbnails}
          onThumbnailsGenerated={handleThumbnailsGenerated}
        />
        <ExportPanel 
          video={currentVideo}
          cutPoints={cutPoints}
          duration={duration}
          onCutPointsChange={setCutPoints}
        />
      </div>
    </div>
  );
}