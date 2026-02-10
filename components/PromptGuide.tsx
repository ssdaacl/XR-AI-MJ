
import React, { useState } from 'react';
import { PromptSet } from '../types';
import { refinePrompt } from '../services/geminiService';

interface PromptGuideProps {
  prompts: PromptSet;
}

const PromptGuide: React.FC<PromptGuideProps> = ({ prompts }) => {
  const [isRefining, setIsRefining] = useState(false);
  const [userIntent, setUserIntent] = useState("");
  const [refinedOutput, setRefinedOutput] = useState<string | null>(null);

  const handleRefine = async () => {
    if (!userIntent) return;
    setIsRefining(true);
    try {
      const result = await refinePrompt(prompts.lighting + " " + prompts.composition, userIntent);
      setRefinedOutput(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-neutral-500 mb-6">Prompt Architecture</h3>
          <div className="space-y-6">
            <PromptItem label="Atmosphere & Lighting" text={prompts.lighting} />
            <PromptItem label="Spatial Composition" text={prompts.composition} />
            <PromptItem label="Material Realism" text={prompts.materials} />
          </div>
        </div>
        
        <div className="bg-neutral-900/50 p-8 rounded-lg border border-neutral-800">
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-neutral-500 mb-6 italic">Refine with Gemini</h3>
          <div className="space-y-4">
            <p className="text-xs text-neutral-400">Apply a specific mood or variation to this scene (e.g., "Make it golden hour", "Add rainy day mood").</p>
            <input 
              type="text" 
              value={userIntent}
              onChange={(e) => setUserIntent(e.target.value)}
              placeholder="Describe your intent..."
              className="w-full bg-black border-b border-neutral-700 py-3 text-sm focus:outline-none focus:border-white transition-colors"
            />
            <button 
              onClick={handleRefine}
              disabled={isRefining}
              className="px-6 py-2 bg-white text-black text-[10px] uppercase tracking-widest font-bold hover:bg-neutral-200 disabled:opacity-50 transition-all"
            >
              {isRefining ? 'Thinking...' : 'Generate New Prompt'}
            </button>

            {refinedOutput && (
              <div className="mt-6 p-4 bg-black/80 rounded border border-neutral-700 animate-in fade-in slide-in-from-top-2 duration-500">
                <p className="text-[11px] font-mono leading-relaxed text-neutral-300 italic whitespace-pre-wrap">
                  {refinedOutput}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PromptItem: React.FC<{ label: string, text: string }> = ({ label, text }) => (
  <div>
    <span className="block text-[10px] uppercase tracking-widest text-neutral-600 mb-1">{label}</span>
    <p className="text-sm leading-relaxed text-neutral-300 font-light">{text}</p>
  </div>
);

export default PromptGuide;
