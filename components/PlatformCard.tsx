import React, { useState } from 'react';
import { PlatformIcon, Copy, Check, Download, Sparkles, ImageIcon, Calendar, Clock } from './Icon';
import { Platform, GeneratedContent, AspectRatio } from '../types';

interface PlatformCardProps {
  platform: Platform;
  name: string;
  content: GeneratedContent | null;
  aspectRatio: AspectRatio;
  onRegenerateImage?: () => void;
}

const PlatformCard: React.FC<PlatformCardProps> = ({ 
  platform, 
  name, 
  content, 
  aspectRatio,
  onRegenerateImage 
}) => {
  const [copied, setCopied] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);

  const handleCopy = async () => {
    if (content?.text) {
      await navigator.clipboard.writeText(content.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (content?.imageUrl) {
      const link = document.createElement('a');
      link.href = content.imageUrl;
      link.download = `omnipost-${platform.toLowerCase()}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const handleSchedule = () => {
    if (scheduledDate) {
      setIsScheduled(true);
      setShowScheduler(false);
    }
  };

  // Helper to determine container class based on aspect ratio for preview consistency
  const getAspectRatioClass = (ratio: AspectRatio) => {
    switch (ratio) {
      case '1:1': return 'aspect-square';
      case '16:9': return 'aspect-video';
      case '9:16': return 'aspect-[9/16]';
      case '3:4': return 'aspect-[3/4]';
      case '4:3': return 'aspect-[4/3]';
      default: return 'aspect-square';
    }
  };

  return (
    <div className="flex flex-col bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg hover:shadow-indigo-500/10 transition-shadow duration-300 h-full relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2 text-slate-200">
          <div className={`p-1.5 rounded-md ${
            platform === Platform.LINKEDIN ? 'bg-blue-700' : 
            platform === Platform.TWITTER ? 'bg-sky-500' : 
            'bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-600'
          }`}>
            <PlatformIcon platform={platform} className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-sm tracking-wide">{name}</h3>
        </div>
        {content && (
          <div className="flex items-center gap-2">
             <button 
              onClick={() => setShowScheduler(!showScheduler)}
              className={`transition-colors ${isScheduled ? 'text-green-400' : 'text-slate-400 hover:text-indigo-400'}`}
              title="Schedule Post"
            >
              <Calendar size={16} />
            </button>
            <button 
              onClick={handleCopy}
              className="text-slate-400 hover:text-indigo-400 transition-colors"
              title="Copy Text"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        )}
      </div>

      {/* Scheduler Dropdown */}
      {showScheduler && content && (
        <div className="bg-slate-900/95 p-3 border-b border-slate-700 absolute top-[52px] w-full z-10 backdrop-blur-md animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Clock size={12} /> Pick date & time
            </label>
            <div className="flex gap-2">
              <input 
                type="datetime-local" 
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-600 text-slate-200 text-xs rounded p-1.5 focus:border-indigo-500 outline-none"
              />
              <button 
                onClick={handleSchedule}
                disabled={!scheduledDate}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs px-3 py-1.5 rounded font-medium transition-colors"
              >
                Set
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Body */}
      <div className="flex-1 p-4 flex flex-col gap-4">
        {/* Scheduled Badge */}
        {isScheduled && content && (
          <div className="bg-green-500/10 border border-green-500/20 rounded px-2 py-1 flex items-center gap-2 w-fit">
            <Check size={12} className="text-green-400" />
            <span className="text-[10px] font-medium text-green-400">
              Scheduled for {new Date(scheduledDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
            </span>
          </div>
        )}

        {/* Text Area */}
        <div className="flex-1 min-h-[120px]">
          {content ? (
            <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
              {content.text}
            </p>
          ) : (
            <div className="animate-pulse space-y-2">
              <div className="h-3 bg-slate-700 rounded w-3/4"></div>
              <div className="h-3 bg-slate-700 rounded w-full"></div>
              <div className="h-3 bg-slate-700 rounded w-5/6"></div>
              <div className="h-3 bg-slate-700 rounded w-1/2"></div>
            </div>
          )}
        </div>

        {/* Image Area */}
        <div className={`relative w-full bg-slate-900 rounded-lg border border-slate-700 overflow-hidden group ${getAspectRatioClass(aspectRatio)}`}>
          {content?.imageUrl ? (
            <>
              <img 
                src={content.imageUrl} 
                alt={`Generated for ${name}`} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                <button 
                  onClick={handleDownload}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-transform hover:scale-105"
                  title="Download Image"
                >
                  <Download size={20} />
                </button>
              </div>
            </>
          ) : content?.isImageLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-400 gap-3">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-b-2 border-purple-500 rounded-full animate-spin-reverse"></div>
              </div>
              <span className="text-xs font-medium animate-pulse">Generating Visual...</span>
            </div>
          ) : content?.imageError ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 gap-2 p-4 text-center">
                <span className="text-xs">Failed to load image</span>
             </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 gap-2">
              <ImageIcon size={32} />
              <span className="text-xs font-medium">AI Image Placeholder</span>
            </div>
          )}
          
          {/* Aspect Ratio Label */}
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 text-[10px] text-slate-300 rounded backdrop-blur-sm">
            {aspectRatio}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformCard;