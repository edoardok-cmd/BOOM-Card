import React from 'react';

interface VideoBackgroundProps {
  videoUrl?: string;
  posterUrl?: string;
  overlay?: boolean;
  overlayOpacity?: number;
}

export default function VideoBackground({ 
  videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-busy-restaurant-interior-3719-large.mp4',
  posterUrl = '/images/restaurant-poster.jpg',
  overlay = true,
  overlayOpacity = 0.3
}: VideoBackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster={posterUrl}
        ref={(el) => {
          if (el) {
            el.playbackRate = 0.25; // Slow down video by 75% (quarter speed)
          }
        }}
      >
        <source src={videoUrl} type="video/mp4" />
        {/* Fallback for browsers that don't support video */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700"></div>
      </video>
      
      {overlay && (
        <div 
          className="absolute inset-0 bg-black" 
          style={{ opacity: overlayOpacity }}
        ></div>
      )}
      
      {/* Additional gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
    </div>
  );
}