import React from 'react';
import FullscreenVideoPlayer from './FullscreenVideoPlayer';

interface VideoModalProps {
  videoUrl: string;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ videoUrl, onClose }) => {
  return <FullscreenVideoPlayer videoUrl={videoUrl} onClose={onClose} />;
};

export default VideoModal;
