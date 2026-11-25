import React from 'react';
import FullscreenVideoPlayer from './FullscreenVideoPlayer';

interface VideoModalProps {
  videoUrl: string;
  onClose: () => void;
  label?: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ videoUrl, onClose, label }) => {
  return <FullscreenVideoPlayer videoUrl={videoUrl} onClose={onClose} label={label} />;
};

export default VideoModal;
