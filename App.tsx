import React, { useState, useRef } from 'react';
import { Platform, Tone, ContentResult, AspectRatio } from './types';
import { generateTextContent, generateImageForPlatform, summarizeLongText } from './services/geminiService';
import PlatformCard from './components/PlatformCard';
import { Sparkles, Settings, ChevronDown, ChevronUp, FileText } from './components/Icon';

const DEFAULT_ASPECT_RATIOS: { [key in Platform]: AspectRatio } = {
  [Platform.LINKEDIN]: '16:9',
  [Platform.TWITTER]: '16:9',
  [Platform.INSTAGRAM]: '1:1',
};

const App: React.FC = () => {
  const [idea, setIdea] = useState('');
  const [tone, setTone] = useState<Tone>(Tone.PROFESSIONAL);
  const [customTone, setCustomTone] = useState('');
  const [aspectRatios, setAspectRatios] = useState(DEFAULT_ASPECT_RATIOS);
  
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [results, setResults] = useState<ContentResult | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Ref to track current generation session to avoid setting state on stale requests
  const generationIdRef = useRef(0);

  const handleGenerate = async () => {
    if (!idea.trim()) return;

    const currentGenId = ++generationIdRef.current;
    setIsGeneratingText(true);
    setResults(null);

    try {
      // 1. Generate Text & Prompts
      const textData = await generateTextContent(idea, tone, customTone);
      
      if (currentGenId !== generationIdRef.current) return;

      // Initialize results with text and loading state for images
      const initialResults: ContentResult = {
        [Platform.LINKEDIN]: { ...textData[Platform.LINKEDIN], isImageLoading: true },
        [Platform.TWITTER]: { ...textData[Platform.TWITTER], isImageLoading: true },
        [Platform.INSTAGRAM]: { ...textData[Platform.INSTAGRAM], isImageLoading: true },
      };
      
      setResults(initialResults);
      setIsGeneratingText(false);

      // 2. Trigger Image Generation in Parallel
      // We do not await these here; they update state individually as they finish
      Object.values(Platform).forEach(platform => {
        generateImageFor(platform as Platform, textData[platform as Platform].imagePrompt, currentGenId);
      });

    } catch (error) {
      console.error("Main generation error:", error);
      setIsGeneratingText(false);
      alert("Something went wrong generating the content. Please try again.");
    }
  };

  const generateImageFor = async (platform: Platform, prompt: string, genId: number) => {
    try {
      const imageUrl = await generateImageForPlatform(prompt, aspectRatios[platform]);
      
      if (genId !== generationIdRef.current) return;

      setResults(prev => {
        if (!prev) return null;
        return {
          ...prev,
          [platform]: {
            ...prev[platform],
            imageUrl,
            isImageLoading: false,
          }
        };
      });
    } catch (error) {
      if (genId !== generationIdRef.current) return;
      setResults(prev => {
        if (!prev) return null;
        return {
          ...prev,
          [platform]: {
            ...prev[platform],
            isImageLoading: false,
            imageError: 'Failed to generate'
          }
        };
      });
    }
  };

  const handleSummarize = async () => {
    if (!idea.trim()) return;
    setIsSummarizing(true);
    try {
      const summary = await summarizeLongText(idea);
      setIdea(summary);
    } catch (error) {
      console.error("Failed to summarize", error);
      alert("Failed to summarize text. Please try again.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const updateAspectRatio = (platform: Platform, ratio: AspectRatio) => {
    setAspectRatios(prev => ({ ...prev, [platform]: ratio }));
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-slate-100 pb-12">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              OmniPost
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Input Section */}
        <section className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold text-white">What do you want to post?</h2>
            <p className="text-slate-400">Turn one idea (or a long article) into optimized content for every platform.</p>
          </div>

          <div className="bg-slate-900 p-1 rounded-2xl shadow-2xl shadow-black/50 border border-slate-800">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g., We just launched a new feature... (Or paste a full article here to summarize)"
              className="w-full bg-slate-950 text-lg p-6 rounded-xl text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none h-32"
            />
            
            <div className="px-4 py-3 flex flex-col lg:flex-row items-center gap-4 justify-between bg-slate-900 rounded-b-xl">
              
              <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                {/* Tone Selector */}
                <div className="flex items-center gap-2">
                    <div className="relative group">
                    <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value as Tone)}
                        className="appearance-none bg-slate-800 text-slate-200 text-sm font-medium px-4 py-2.5 pr-10 rounded-lg border border-slate-700 hover:border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer outline-none"
                    >
                        {Object.values(Tone).map((t) => (
                        <option key={t} value={t}>{t === 'Custom' ? 'Custom Tone' : t + ' Tone'}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
                    </div>
                </div>

                {/* Custom Tone Input */}
                {tone === Tone.CUSTOM && (
                    <input
                    type="text"
                    value={customTone}
                    onChange={(e) => setCustomTone(e.target.value)}
                    placeholder="Describe tone (e.g. 'Pirate', 'Sarcastic')"
                    className="bg-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-lg border border-slate-700 focus:border-indigo-500 outline-none w-full sm:w-48 animate-in fade-in slide-in-from-left-4 duration-300"
                    />
                )}

                {/* Summarize Button */}
                <button 
                  onClick={handleSummarize}
                  disabled={isSummarizing || !idea.trim()}
                  className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${isSummarizing ? 'text-indigo-400 cursor-wait' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                  title="Summarize current text"
                >
                   {isSummarizing ? (
                     <div className="w-3 h-3 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                   ) : (
                     <FileText size={16} />
                   )}
                  <span>Summarize</span>
                </button>

                {/* Advanced Settings Toggle */}
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${showSettings ? 'text-indigo-400 bg-indigo-400/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                >
                  <Settings size={16} />
                  <span>Format</span>
                </button>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGeneratingText || !idea.trim()}
                className="w-full lg:w-auto px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-lg shadow-indigo-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isGeneratingText ? (
                   <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Drafting...</span>
                   </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>

            {/* Collapsible Settings Panel */}
            {showSettings && (
              <div className="border-t border-slate-800 px-6 py-4 bg-slate-950/50 rounded-b-xl animate-in slide-in-from-top-2 fade-in duration-200">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Image Aspect Ratios</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {Object.values(Platform).map((platform) => (
                    <div key={platform} className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 flex items-center gap-1.5">
                         <span className={`w-2 h-2 rounded-full ${
                            platform === Platform.LINKEDIN ? 'bg-blue-500' : 
                            platform === Platform.TWITTER ? 'bg-sky-500' : 'bg-pink-500'
                         }`}></span>
                         {platform.charAt(0) + platform.slice(1).toLowerCase()}
                      </label>
                      <select
                        value={aspectRatios[platform as Platform]}
                        onChange={(e) => updateAspectRatio(platform as Platform, e.target.value as AspectRatio)}
                        className="bg-slate-800 text-slate-300 text-xs p-2 rounded border border-slate-700 focus:border-indigo-500 outline-none"
                      >
                        {['1:1', '3:4', '4:3', '9:16', '16:9'].map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Results Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PlatformCard 
            platform={Platform.LINKEDIN}
            name="LinkedIn"
            content={results?.[Platform.LINKEDIN] || null}
            aspectRatio={aspectRatios[Platform.LINKEDIN]}
          />
          <PlatformCard 
            platform={Platform.TWITTER}
            name="X / Twitter"
            content={results?.[Platform.TWITTER] || null}
            aspectRatio={aspectRatios[Platform.TWITTER]}
          />
          <PlatformCard 
            platform={Platform.INSTAGRAM}
            name="Instagram"
            content={results?.[Platform.INSTAGRAM] || null}
            aspectRatio={aspectRatios[Platform.INSTAGRAM]}
          />
        </section>

      </main>
    </div>
  );
};

export default App;