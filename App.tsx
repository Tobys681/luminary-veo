
import React, { useState, useEffect } from 'react';
import { GeneratedVideo, GenerationSettings, GenerationMode } from './types';
import { generateVideo } from './services/geminiService';
import ApiKeySelection from './components/ApiKeySelection';
import LoadingOverlay from './components/LoadingOverlay';
import VideoGrid from './components/VideoGrid';

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [mode, setMode] = useState<GenerationMode>('text-to-video');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  
  const [startImage, setStartImage] = useState<string | null>(null);
  const [endImage, setEndImage] = useState<string | null>(null);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
  }, []);

  // Clear error when user changes something
  useEffect(() => {
    setErrorMessage(null);
  }, [prompt, mode, startImage, endImage, referenceImages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddReference = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && referenceImages.length < 3) {
      const reader = new FileReader();
      reader.onloadend = () => setReferenceImages([...referenceImages, reader.result as string]);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && mode !== 'image-to-video') return;
    
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const settings: GenerationSettings = {
        mode,
        prompt,
        aspectRatio,
        resolution,
        startImage: startImage || undefined,
        endImage: endImage || undefined,
        referenceImages
      };

      const videoUrl = await generateVideo(settings);
      
      const newVideo: GeneratedVideo = {
        id: Math.random().toString(36).substring(7),
        url: videoUrl,
        prompt: prompt || "Visual generation",
        timestamp: Date.now(),
        aspectRatio,
        resolution
      };
      
      setVideos([newVideo, ...videos]);
      setPrompt('');
      setStartImage(null);
      setEndImage(null);
      setReferenceImages([]);
    } catch (err: any) {
      console.error("Generation Error:", err);
      if (err.message?.includes("Requested entity was not found")) {
        setHasKey(false);
      } else {
        setErrorMessage("failed to generate video");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (hasKey === null) return <div className="min-h-screen bg-black" />;
  if (hasKey === false) return <ApiKeySelection onSuccess={() => setHasKey(true)} />;

  return (
    <div className="min-h-screen pb-20">
      {isGenerating && <LoadingOverlay />}
      
      {/* Header */}
      <nav className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white italic">L</div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Luminary Veo
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <button className="hover:text-white transition-colors">Documentation</button>
            <div className="w-px h-4 bg-zinc-800" />
            <button 
              onClick={async () => {
                // @ts-ignore
                await window.aistudio.openSelectKey();
                setHasKey(true);
              }}
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Change Key
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Controls Panel */}
          <aside className="lg:w-96 flex-shrink-0">
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Generation Settings
              </h2>

              {/* Mode Selection */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Model Mode</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'text-to-video', label: 'Text to Video' },
                    { id: 'image-to-video', label: 'Image to Video' },
                    { id: 'multi-reference', label: 'Multi-Asset (Veo 3.1 Pro)' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id as GenerationMode)}
                      className={`text-left px-4 py-3 rounded-xl border transition-all ${
                        mode === m.id 
                          ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 font-medium' 
                          : 'bg-zinc-800/20 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Configs */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Aspect Ratio</label>
                  <select 
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as any)}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    disabled={mode === 'multi-reference'}
                  >
                    <option value="16:9">Landscape (16:9)</option>
                    <option value="9:16">Portrait (9:16)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Quality</label>
                  <select 
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value as any)}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    disabled={mode === 'multi-reference'}
                  >
                    <option value="1080p">Ultra (1080p)</option>
                    <option value="720p">High (720p)</option>
                  </select>
                </div>
              </div>

              {/* Image Inputs */}
              <div className="space-y-4 mb-6">
                {(mode === 'image-to-video' || mode === 'multi-reference') && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                        {mode === 'multi-reference' ? 'Reference Image' : 'Start Frame'}
                    </label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => mode === 'multi-reference' ? handleAddReference(e) : handleFileChange(e, setStartImage)}
                        className="hidden" 
                        id="start-image-input"
                      />
                      <label 
                        htmlFor="start-image-input"
                        className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl h-24 cursor-pointer hover:border-indigo-500/50 transition-colors bg-zinc-800/20"
                      >
                        {startImage ? (
                          <img src={startImage} alt="Start" className="h-full w-full object-cover rounded-xl" />
                        ) : (
                          <span className="text-zinc-500 text-sm">Upload Image</span>
                        )}
                      </label>
                    </div>
                  </div>
                )}

                {mode === 'image-to-video' && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">End Frame (Optional)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, setEndImage)}
                      className="hidden" 
                      id="end-image-input"
                    />
                    <label 
                      htmlFor="end-image-input"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl h-24 cursor-pointer hover:border-indigo-500/50 transition-colors bg-zinc-800/20"
                    >
                      {endImage ? (
                        <img src={endImage} alt="End" className="h-full w-full object-cover rounded-xl" />
                      ) : (
                        <span className="text-zinc-500 text-sm">Upload Image</span>
                      )}
                    </label>
                  </div>
                )}

                {mode === 'multi-reference' && referenceImages.length > 0 && (
                   <div className="flex gap-2 flex-wrap">
                      {referenceImages.map((img, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-700">
                          <img src={img} className="w-full h-full object-cover" />
                          <button 
                            onClick={() => setReferenceImages(referenceImages.filter((_, idx) => idx !== i))}
                            className="absolute top-0 right-0 bg-black/50 p-1 hover:text-red-400"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                   </div>
                )}
              </div>

              {/* Prompt */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Creative Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A cinematic drone shot of a neon city in the clouds..."
                  className="w-full h-32 bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none placeholder:text-zinc-600"
                />
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 animate-pulse">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-500 text-sm font-medium">{errorMessage}</p>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isGenerating || (!prompt && mode !== 'image-to-video')}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                {isGenerating ? 'Rendering...' : 'Generate Video'}
              </button>
            </div>
          </aside>

          {/* Gallery Area */}
          <div className="flex-grow">
            <header className="mb-8 flex items-baseline justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Your Creations</h2>
              <span className="text-zinc-500 text-sm">{videos.length} masterpiece{videos.length !== 1 ? 's' : ''}</span>
            </header>
            
            <VideoGrid videos={videos} />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
