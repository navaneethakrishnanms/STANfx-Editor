import React, { useState } from 'react';
import { generateImageFromText as generateStability } from '../services/stableDiffusionService';

interface TextToImageProps {
  onUseInEditor: (dataUrl: string) => void;
  onBack: () => void;
}

const GenerateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 10.59l3.3 3.3-1.41 1.41L11 13.41V7h2v5.59z"/></svg>
);

export const TextToImage: React.FC<TextToImageProps> = ({ onUseInEditor, onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  // Text-to-Image now uses Stability (cloud) with provided key

  const handleGenerate = async () => {
    if (!prompt.trim()) { setError('Please enter a prompt.'); return; }
    setError(null);
    setIsLoading(true);
    try {
      const url = await generateStability(prompt, { negativePrompt });
      setResultUrl(url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error generating image.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Text to Image</h2>
        <button onClick={onBack} className="px-3 py-2 rounded-md bg-[rgb(var(--bg-interactive-rgb))] hover:bg-[rgb(var(--bg-interactive-hover-rgb))]">Back</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[rgba(var(--bg-secondary-rgb),0.6)] border border-[rgba(var(--border-rgb),0.1)] rounded-2xl p-4 space-y-3">
          {/* No base URL required for OpenAI T2I */}
          <label className="text-sm font-medium text-secondary">Prompt</label>
          <textarea value={prompt} onChange={(e)=>setPrompt(e.target.value)} className="w-full h-28 p-3 bg-[rgba(var(--bg-tertiary-rgb),0.8)] border border-[rgb(var(--bg-interactive-rgb))] rounded-lg" placeholder="A photorealistic astronaut riding a horse on Mars at sunset"/>
          <label className="text-sm font-medium text-secondary">Negative Prompt (optional)</label>
          <input value={negativePrompt} onChange={(e)=>setNegativePrompt(e.target.value)} className="w-full p-2 bg-[rgba(var(--bg-tertiary-rgb),0.8)] border border-[rgb(var(--bg-interactive-rgb))] rounded-lg" placeholder="blurry, low quality"/>
          <button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 disabled:opacity-50"><GenerateIcon/>Generate</button>
          {error && <div className="p-3 bg-[rgba(var(--danger-bg-rgb),0.5)] border border-[rgba(var(--danger-border-rgb),0.3)] rounded-md text-[rgb(var(--danger-text-rgb))] text-sm">{error}</div>}
        </div>

        <div className="bg-[rgba(var(--bg-secondary-rgb),0.5)] rounded-2xl border border-[rgba(var(--border-rgb),0.1)] min-h-[360px] flex items-center justify-center overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-secondary">Generating...</div>
          ) : resultUrl ? (
            <img src={resultUrl} alt="Generated" className="max-w-full max-h-[512px] object-contain"/>
          ) : (
            <div className="text-muted">Your generated image will appear here</div>
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button onClick={()=>resultUrl && onUseInEditor(resultUrl)} disabled={!resultUrl} className="px-4 py-2 bg-emerald-600 text-white rounded-md disabled:opacity-50">Use in Editor</button>
        <a href={resultUrl ?? '#'} download={`t2i-${Date.now()}.png`} className={`px-4 py-2 rounded-md ${resultUrl ? 'bg-[rgb(99,102,241)] text-white hover:bg-[rgb(79,70,229)]' : 'bg-[rgb(var(--bg-interactive-rgb))] text-muted pointer-events-none'}`}>Download</a>
      </div>
    </div>
  );
};


