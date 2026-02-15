
import React from 'react';

interface ApiKeySelectionProps {
  onSuccess: () => void;
}

const ApiKeySelection: React.FC<ApiKeySelectionProps> = ({ onSuccess }) => {
  const handleSelectKey = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      // Assume success as per guidelines to avoid race conditions
      onSuccess();
    } catch (err) {
      console.error("Failed to open key selection", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6">
      <div className="max-w-md w-full bg-[#111] border border-zinc-800 rounded-3xl p-10 text-center shadow-2xl">
        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-indigo-600/20 rounded-full">
          <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4 tracking-tight">Connect to Veo</h1>
        <p className="text-zinc-400 mb-8 leading-relaxed">
          To generate cinematic AI videos, you need to select a billing-enabled API key from Google AI Studio.
        </p>
        <div className="space-y-4">
          <button
            onClick={handleSelectKey}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Select API Key
          </button>
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-zinc-500 hover:text-zinc-300 text-sm underline transition-colors"
          >
            Learn about API billing
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySelection;
