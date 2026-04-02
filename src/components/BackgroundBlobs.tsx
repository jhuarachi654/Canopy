import React from 'react';

export type BackgroundBlob = {
  color: string;
  width: number;
  height: number;
  blur: number;
  opacity: number;
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  transform?: string;
};

interface BackgroundBlobsProps {
  blobs?: BackgroundBlob[];
  className?: string;
  topRightColor?: string;
  bottomLeftColor?: string;
  bottomSecondaryColor?: string;
}

export default function BackgroundBlobs({
  blobs = [],
  className = '',
  topRightColor,
  bottomLeftColor,
  bottomSecondaryColor,
}: BackgroundBlobsProps) {
  const resolvedBlobs =
    blobs.length > 0
      ? blobs
      : [
          topRightColor
            ? {
                color: topRightColor,
                width: 180,
                height: 180,
                opacity: 0.35,
                blur: 80,
                top: -42,
                right: -26,
              }
            : null,
          bottomLeftColor
            ? {
                color: bottomLeftColor,
                width: 200,
                height: 200,
                opacity: 0.4,
                blur: 100,
                bottom: -60,
                left: -56,
              }
            : null,
          bottomSecondaryColor
            ? {
                color: bottomSecondaryColor,
                width: 180,
                height: 180,
                opacity: 0.32,
                blur: 96,
                bottom: -74,
                right: -30,
              }
            : null,
        ].filter(Boolean) as BackgroundBlob[];

  if (resolvedBlobs.length === 0) {
    return null;
  }

  return (
    <div className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`} aria-hidden>
      {resolvedBlobs.map((blob, index) => (
        <div
          key={`${blob.color}-${index}`}
          className="absolute rounded-full"
          style={{
            width: blob.width,
            height: blob.height,
            backgroundColor: blob.color,
            opacity: blob.opacity,
            filter: `blur(${blob.blur}px)`,
            top: blob.top,
            right: blob.right,
            bottom: blob.bottom,
            left: blob.left,
            transform: blob.transform,
          }}
        />
      ))}
    </div>
  );
}
