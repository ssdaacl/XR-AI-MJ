
import React, { useState } from 'react';
import { InteriorCase } from '../types';
import InteractiveImage from './InteractiveImage';
import PromptGuide from './PromptGuide';

interface ProjectDetailProps {
  project: InteriorCase;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack, onEdit, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  return (
    <div className="pt-32 pb-24 px-8 max-w-7xl mx-auto animate-in fade-in duration-700 relative">
      {/* Lightbox / Fullscreen Viewer */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[200] bg-black/98 flex items-center justify-center p-4 md:p-12 cursor-zoom-out animate-in fade-in duration-300"
          onClick={() => setFullscreenImage(null)}
        >
          <button className="absolute top-10 right-10 text-white/50 hover:text-white text-2xl">✕</button>
          <img 
            src={fullscreenImage} 
            alt="Fullscreen View" 
            className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-500"
          />
        </div>
      )}

      <div className="flex justify-between items-center mb-12">
        <button 
          onClick={onBack}
          className="text-xs uppercase tracking-widest opacity-40 hover:opacity-100 flex items-center transition-all"
        >
          <span className="mr-2">←</span> Back to Archive
        </button>

        <div className="flex gap-6 items-center">
          <button 
            onClick={onEdit}
            className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 hover:text-white transition-colors"
          >
            Edit Entry
          </button>
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="text-[10px] uppercase tracking-widest font-bold text-red-900/60 hover:text-red-500 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="text-center max-w-sm">
            <h3 className="serif text-3xl mb-4">Permanently remove this archive?</h3>
            <p className="text-neutral-500 text-xs uppercase tracking-widest mb-10 leading-relaxed">
              This action cannot be undone. All associated data will be lost.
            </p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={onDelete}
                className="w-full py-4 bg-red-600 text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-red-700 transition-colors"
              >
                Confirm Delete
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-4 bg-transparent border border-neutral-800 text-neutral-400 text-[10px] font-bold uppercase tracking-[0.3em] hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
        <div className="lg:col-span-4 flex flex-col justify-end">
          <h1 className="serif text-6xl font-light mb-6 leading-tight">{project.title}</h1>
          <p className="text-lg text-neutral-400 mb-8 font-light italic">{project.subtitle}</p>
          <div className="h-px w-12 bg-neutral-700 mb-8" />
          <p className="text-sm leading-relaxed text-neutral-500 max-w-sm">
            {project.description}
          </p>
        </div>
        
        <div className="lg:col-span-8">
          <div className="cursor-zoom-in" onClick={() => setFullscreenImage(project.mainImage)}>
            <InteractiveImage src={project.mainImage} hotspots={project.hotspots} />
          </div>
          <div className="mt-4 flex justify-between items-center text-[10px] uppercase tracking-[0.3em] text-neutral-600 font-bold">
            <span>Main Frame 01</span>
            <span>Interactive Elements: {project.hotspots.length}</span>
          </div>
        </div>
      </div>

      <div className="mb-32">
        <h2 className="serif text-3xl font-light mb-12 text-center opacity-50">Related Frames</h2>
        {/* 원본 비율 유지를 위해 columns 레이아웃 사용 (Masonry 스타일) */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {project.gallery.map((img, idx) => (
            <div 
              key={idx} 
              className="group overflow-hidden rounded-sm bg-neutral-900 break-inside-avoid cursor-zoom-in relative transition-all duration-700 hover:ring-1 hover:ring-white/20"
              onClick={() => setFullscreenImage(img)}
            >
              <img 
                src={img} 
                alt={`Frame ${idx}`} 
                className="w-full h-auto object-cover transition-all duration-1000 scale-100 group-hover:scale-105 brightness-90 group-hover:brightness-110"
              />
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-24 border-t border-neutral-900">
        <PromptGuide prompts={project.prompts} />
      </div>
    </div>
  );
};

export default ProjectDetail;
