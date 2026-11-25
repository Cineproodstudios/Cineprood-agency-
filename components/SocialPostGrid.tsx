import React from 'react';
import SocialPost from './SocialPost';
import { ClientSocialPost, ClientSocialProfile } from '../data/clientWork';
import { PreviewOriginRect } from './FloatingPreviewPortal';

export interface SocialPostGridProps {
  client: ClientSocialProfile;
  activePreviewId: string | null;
  onOpenPreview: (
    post: ClientSocialPost,
    index: number,
    originRect: PreviewOriginRect,
    thumbnail: string | null,
    source: 'mouse' | 'keyboard'
  ) => void;
  onCancelPreviewClose: () => void;
  onSchedulePreviewClose: (postId: string) => void;
  onImmediateClosePreview: (postId: string) => void;
  onOpenPost: (index: number) => void;
}

export const SocialPostGrid: React.FC<SocialPostGridProps> = ({
  client,
  activePreviewId,
  onOpenPreview,
  onCancelPreviewClose,
  onSchedulePreviewClose,
  onImmediateClosePreview,
  onOpenPost,
}) => {
  const count = client.posts.length;
  const allHorizontal =
    count > 0 && client.posts.every((p) => p.aspectRatio === '16:9');

  const gridClassName = allHorizontal
    ? count === 1
      ? 'grid grid-cols-1 max-w-3xl mx-auto gap-6'
      : 'grid grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto gap-6 md:gap-8'
    : count === 1
      ? 'grid grid-cols-1 max-w-[340px] mx-auto gap-6'
      : count === 2
        ? 'grid grid-cols-2 max-w-[740px] mx-auto gap-3 sm:gap-6 md:gap-10'
        : 'grid grid-cols-2 md:grid-cols-3 max-w-5xl mx-auto gap-3 sm:gap-6 md:gap-8';

  return (
    <div className={gridClassName}>
      {client.posts.map((post, index) => (
        <SocialPost
          key={post.id}
          client={client}
          post={post}
          index={index}
          isPreviewActive={activePreviewId === post.id}
          onOpenPreview={onOpenPreview}
          onCancelPreviewClose={onCancelPreviewClose}
          onSchedulePreviewClose={onSchedulePreviewClose}
          onImmediateClosePreview={onImmediateClosePreview}
          onOpen={() => onOpenPost(index)}
        />
      ))}
    </div>
  );
};

export default SocialPostGrid;
