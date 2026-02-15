
import React, { useState, useEffect } from 'react';

const messages = [
  "Initializing neural engines...",
  "Synthesizing visual frames...",
  "Applying cinematic lighting...",
  "Refining motion dynamics...",
  "Polishing pixels...",
  "Almost there, finalizing video file...",
  "Injecting creativity...",
  "Rendering final sequence..."
];

const LoadingOverlay: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
      <div className="relative mb-12">
        <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white/10 border-b-white/50 rounded-full animate-spin-slow"></div>
        </div>
      </div>
      
      <h2 className="text-2xl font-light text-white mb-2 tracking-widest uppercase">
        Generating Masterpiece
      </h2>
      <p className="text-indigo-400 font-medium h-6 animate-pulse">
        {messages[msgIndex]}
      </p>
      
      <div className="mt-12 max-w-xs w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 animate-loading-bar"></div>
      </div>
      
      <p className="mt-8 text-zinc-500 text-sm italic">
        Video generation typically takes 1-3 minutes.
      </p>

      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-loading-bar {
          animation: loading-bar 60s infinite ease-in-out;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;
