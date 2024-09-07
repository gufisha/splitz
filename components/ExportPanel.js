import React, { useState, useEffect, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import JSZip from 'jszip';
import Image from 'next/image';
import exportIcon from '../public/export-icon.svg';
import deleteIcon from '../public/delete-icon.svg';

function ExportPanel({ video, cutPoints, duration, onCutPointsChange }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [ffmpeg, setFFmpeg] = useState(null);
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);

  const load = useCallback(async () => {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd';
    const ffmpegInstance = new FFmpeg();
    try {
      await ffmpegInstance.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setFFmpeg(ffmpegInstance);
      setIsFFmpegLoaded(true);
    } catch (error) {
      console.error('Error loading FFmpeg:', error);
      alert('Failed to load FFmpeg. Please refresh the page and try again.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getClipSegments = () => {
    if (cutPoints.length === 0) {
      return [];
    }

    const segments = [];
    let startTime = 0;

    cutPoints.forEach((cutPoint, index) => {
      segments.push({ start: startTime, end: cutPoint, id: index });
      startTime = cutPoint;
    });

    if (startTime < duration) {
      segments.push({ start: startTime, end: duration, id: cutPoints.length });
    }

    return segments;
  };

  const handleExport = async (segment) => {
    if (!isFFmpegLoaded || !video) {
      alert('FFmpeg is not loaded or no video is selected. Please wait and try again.');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    const segments = segment ? [segment] : getClipSegments();
    const zip = new JSZip();
    
    try {
      await ffmpeg.writeFile('input.mp4', await fetchFile(video));

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const outputFileName = `output_${i}.mp4`;
        
        await ffmpeg.exec([
          '-ss', segment.start.toFixed(3),
          '-i', 'input.mp4',
          '-t', (segment.end - segment.start).toFixed(3),
          '-c', 'copy',
          outputFileName
        ]);

        const data = await ffmpeg.readFile(outputFileName);
        
        if (segments.length === 1) {
          const blob = new Blob([data.buffer], { type: 'video/mp4' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `clip_${i + 1}.mp4`;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          zip.file(`clip_${i + 1}.mp4`, data);
        }

        setExportProgress((i + 1) / segments.length * 100);
      }

      if (segments.length > 1) {
        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = "clips.zip";
        a.click();
        URL.revokeObjectURL(url);
      }

    } catch (error) {
      console.error('Error during export:', error);
      alert('An error occurred during export. Please check the console for details.');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleDeleteCutPoint = (index) => {
    const newCutPoints = [...cutPoints];
    newCutPoints.splice(index, 1);
    onCutPointsChange(newCutPoints);
  };

  const segments = getClipSegments();

  return (
    <div className="export-panel">
      <h2>Export</h2>
      {segments.length === 0 ? (
        <p>Add cut points to create exportable clips.</p>
      ) : (
        <div className="segments-list">
          {segments.map((segment, index) => (
            <div key={segment.id} className="segment">
              <span className="time-range">
                {formatTime(segment.start)} - {formatTime(segment.end)}
              </span>
              <div className="segment-actions">
                <button 
                  className="icon-button delete-button" 
                  onClick={() => handleDeleteCutPoint(index)}
                  disabled={isExporting}
                >
                  <Image src="/delete-icon.svg" alt="Delete" width={24} height={24} />
                </button>
                <button 
                  className="icon-button export-button" 
                  onClick={() => handleExport(segment)} 
                  disabled={isExporting || !isFFmpegLoaded}
                >
                  <Image src="/export-icon.svg" alt="Export" width={24} height={24} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {segments.length > 0 && (
        <button 
          className="button-with-icon export-all-button" 
          onClick={() => handleExport()} 
          disabled={isExporting || !isFFmpegLoaded}
        >
          <Image src="/export-icon.svg" alt="" width={24} height={24} className="icon" />
          Export All
        </button>
      )}
      {isExporting && (
        <div className="export-progress">
          <progress value={exportProgress} max="100"></progress>
          <p>Exporting: {Math.round(exportProgress)}%</p>
        </div>
      )}
    </div>
  );
}

export default ExportPanel;