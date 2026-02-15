
import React from 'react';
import { GeneratedVideo } from '../types';

interface VideoGridProps {
  videos: GeneratedVideo[];
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos }) => {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
        <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <p className="text-lg">No generations yet. Start by typing a prompt above.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <div key={video.id} className="group relative bg-zinc-900/50 rounded-2xl overflow-hidden border border-zinc-800 transition-all hover:border-indigo-500/50">
          <video
            src={video.url}
            className={`w-full ${video.aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-video'} object-cover`}
            controls
            playsInline
          />
          <div className="p-4">
            <p className="text-sm text-zinc-300 line-clamp-2 mb-3 leading-relaxed">
              {video.prompt}
            </p>
            <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                    {video.resolution} • {video.aspectRatio}
                </span>
                <a 
                    href={video.url} 
                    download={`veo-video-${video.id}.mp4`}
                    className="p-2 text-indigo-400 hover:text-white transition-colors"
                    title="Download Video"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
