
import React, { useState, useEffect, useRef } from 'react';
import { InteriorCase, Hotspot } from '../types';
import { generateHotspots } from '../services/geminiService';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (newCase: InteriorCase) => void;
  initialData?: InteriorCase;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload, initialData }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReframing, setIsReframing] = useState(false);
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    mainImage: '',
    gallery: [] as string[],
    spaceStructure: '',
    colorPalette: '',
    lightingShadows: '',
    atmosphere: '',
    keywords: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        subtitle: initialData.subtitle,
        description: initialData.description,
        mainImage: initialData.mainImage,
        gallery: initialData.gallery || [],
        spaceStructure: initialData.prompts.composition,
        colorPalette: initialData.prompts.materials.split('|')[0].trim(),
        lightingShadows: initialData.prompts.lighting.split('|')[0].trim(),
        atmosphere: initialData.prompts.lighting.includes('| Mood:') ? initialData.prompts.lighting.split('| Mood:')[1].trim() : '',
        keywords: initialData.prompts.materials.includes('| Keywords:') ? initialData.prompts.materials.split('| Keywords:')[1].trim() : ''
      });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        mainImage: '',
        gallery: [],
        spaceStructure: '',
        colorPalette: '',
        lightingShadows: '',
        atmosphere: '',
        keywords: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setFormData(prev => ({ ...prev, mainImage: base64 }));
      } catch (err) {
        console.error("Image processing failed", err);
      }
    }
  };

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      try {
        const base64s = await Promise.all(Array.from(files).map((file: File) => fileToBase64(file)));
        setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...base64s] }));
      } catch (err) {
        console.error("Gallery processing failed", err);
      }
    }
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleRemoveGalleryItem = (index: number) => {
    setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }));
  };

  const handleReframeDone = (newImageData: string) => {
    setFormData(prev => ({ ...prev, mainImage: newImageData }));
    setIsReframing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mainImage) {
      alert("Main image is required.");
      return;
    }

    setIsProcessing(true);

    try {
      const prompts = {
        lighting: `${formData.lightingShadows} ${formData.atmosphere ? `| Mood: ${formData.atmosphere}` : ''}`,
        composition: formData.spaceStructure || 'Architectural shot',
        materials: `${formData.colorPalette} ${formData.keywords ? `| Keywords: ${formData.keywords}` : ''}`,
        camera: initialData?.prompts.camera || 'Professional Setup, 8k resolution',
        negative: initialData?.prompts.negative || 'blur, noise, messy, distorted, low quality'
      };

      let generatedSpots: Hotspot[] = initialData?.hotspots || [];
      
      if (!initialData || (initialData.title !== formData.title)) {
        try {
          const spots = await generateHotspots(formData.title, formData.description, prompts);
          if (spots && spots.length > 0) {
            generatedSpots = spots;
          }
        } catch (aiError) {
          console.warn("AI hotspot generation failed, using empty hotspots.", aiError);
        }
      }

      const newCase: InteriorCase = {
        id: initialData?.id || `custom-${Date.now()}`,
        title: formData.title || 'Untitled Space',
        subtitle: formData.subtitle || 'Custom Entry',
        description: formData.description || 'No description provided.',
        mainImage: formData.mainImage,
        gallery: formData.gallery.length > 0 ? formData.gallery : [formData.mainImage],
        hotspots: generatedSpots,
        prompts: prompts
      };

      onUpload(newCase);
      onClose();
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to commit to archive.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
      {isReframing && (
        <ImageReframer 
          src={formData.mainImage} 
          onCancel={() => setIsReframing(false)} 
          onConfirm={handleReframeDone} 
        />
      )}

      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-3xl max-h-[95vh] overflow-y-auto p-6 md:p-12 rounded-sm shadow-2xl relative">
        <button 
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors disabled:opacity-30 text-xl"
        >
          ✕
        </button>
        
        <h2 className="serif text-3xl md:text-4xl font-light mb-2">{initialData ? 'Edit Entry' : 'New Entry'}</h2>
        <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-10">
          {initialData ? 'Refine this architectural study' : 'Archive a new architectural atmosphere'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputGroup label="PROJECT TITLE" value={formData.title} onChange={v => setFormData({...formData, title: v})} placeholder="e.g. Ivory Sanctuary" />
            <InputGroup label="SUBTITLE" value={formData.subtitle} onChange={v => setFormData({...formData, subtitle: v})} placeholder="e.g. Minimalist Bedroom" />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold">MAIN IMAGE ARCHITECTURE</label>
              {formData.mainImage && (
                <button 
                  type="button"
                  onClick={() => setIsReframing(true)}
                  className="text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-400 hover:text-white transition-colors border-b border-neutral-700 pb-0.5"
                >
                  Re-frame Composition
                </button>
              )}
            </div>
            <div 
              onClick={() => !isProcessing && mainImageInputRef.current?.click()}
              className="group relative aspect-video bg-black border-2 border-dashed border-neutral-800 hover:border-neutral-500 transition-all cursor-pointer overflow-hidden flex items-center justify-center rounded-sm"
            >
              {formData.mainImage ? (
                <>
                  <img src={formData.mainImage} alt="Main Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] uppercase tracking-widest font-bold bg-white text-black px-4 py-2">Change Image</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 group-hover:text-white transition-colors">Select Hero Frame (JPG, PNG)</p>
                </div>
              )}
            </div>
            <input type="file" ref={mainImageInputRef} onChange={handleMainImageChange} accept="image/*" className="hidden" />
          </div>
          
          <div className="pt-8 border-t border-neutral-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">RELATED FRAMES (GALLERY)</h3>
              <button 
                type="button"
                onClick={() => !isProcessing && galleryInputRef.current?.click()}
                className="text-[9px] uppercase tracking-widest px-4 py-2 border border-neutral-700 hover:border-white transition-colors text-neutral-400 hover:text-white font-bold"
              >
                + Upload Frames
              </button>
              <input type="file" ref={galleryInputRef} onChange={handleGalleryChange} accept="image/*" multiple className="hidden" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {formData.gallery.map((url, index) => (
                <div key={index} className="relative aspect-square bg-black group overflow-hidden rounded-sm">
                  <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <button type="button" onClick={() => handleRemoveGalleryItem(index)} className="absolute top-2 right-2 bg-black/60 text-white w-6 h-6 flex items-center justify-center text-[10px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold">DESCRIPTION</label>
            <textarea 
              className="w-full bg-black border border-neutral-800 p-4 text-sm focus:outline-none focus:border-neutral-500 transition-colors min-h-[100px] rounded-sm"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the architectural intent..."
            />
          </div>

          <div className="pt-8 border-t border-neutral-800">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 mb-8">AI PROMPT ARCHITECTURE</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <InputGroup label="SPACE / STRUCTURE" value={formData.spaceStructure} onChange={v => setFormData({...formData, spaceStructure: v})} placeholder="Composition..." />
              <InputGroup label="COLOR PALETTE" value={formData.colorPalette} onChange={v => setFormData({...formData, colorPalette: v})} placeholder="Materials..." />
              <InputGroup label="LIGHTING / SHADOWS" value={formData.lightingShadows} onChange={v => setFormData({...formData, lightingShadows: v})} placeholder="Light quality..." />
              <InputGroup label="ATMOSPHERE" value={formData.atmosphere} onChange={v => setFormData({...formData, atmosphere: v})} placeholder="Mood..." />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isProcessing}
            className={`w-full py-6 text-black text-[11px] uppercase tracking-[0.4em] font-bold transition-all rounded-sm ${isProcessing ? 'bg-neutral-600 cursor-wait' : 'bg-white hover:bg-neutral-200 shadow-xl'}`}
          >
            {isProcessing ? 'Processing Archive...' : (initialData ? 'Update Archive Entry' : 'Commit to Archive')}
          </button>
        </form>
      </div>
    </div>
  );
};

const ImageReframer: React.FC<{ src: string, onCancel: () => void, onConfirm: (data: string) => void }> = ({ src, onCancel, onConfirm }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 1920;
      canvas.height = 1080;

      // Calculate source and destination
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const ratio = img.width / rect.width;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const targetWidth = rect.width * zoom * (1920 / rect.width);
      const targetHeight = (rect.width * (img.height / img.width)) * zoom * (1920 / rect.width);
      
      const drawX = (offset.x * (1920 / rect.width)) + (canvas.width / 2) - (targetWidth / 2);
      const drawY = (offset.y * (1920 / rect.width)) + (canvas.height / 2) - (targetHeight / 2);

      ctx.drawImage(img, drawX, drawY, targetWidth, targetHeight);
      onConfirm(canvas.toDataURL('image/jpeg', 0.9));
    };
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
      <div className="max-w-4xl w-full text-center mb-8">
        <h3 className="serif text-2xl font-light mb-2">Re-frame Composition</h3>
        <p className="text-[10px] uppercase tracking-widest text-neutral-500">Drag to position, slider to scale. Manifest the perfect architectural perspective.</p>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full max-w-4xl aspect-video overflow-hidden border border-neutral-800 bg-neutral-900 cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <img 
          src={src} 
          alt="Reframing" 
          draggable={false}
          className="absolute max-w-none transition-transform duration-75 select-none"
          style={{
            transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
            top: '50%',
            left: '50%',
            width: '100%'
          }}
        />
        {/* Aspect Ratio Guides */}
        <div className="absolute inset-0 pointer-events-none border-[1px] border-white/10" />
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-1/3 h-full border-x border-white/5" />
          <div className="w-full h-1/3 absolute border-y border-white/5" />
        </div>
      </div>

      <div className="mt-12 w-full max-w-md space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
            <span>ZOOM LEVEL</span>
            <span>{Math.round(zoom * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="3" 
            step="0.01" 
            value={zoom} 
            onChange={(e) => setZoom(parseFloat(e.target.value))} 
            className="w-full accent-white bg-neutral-800 h-1 rounded-full appearance-none cursor-pointer"
          />
        </div>

        <div className="flex gap-4">
          <button 
            onClick={onCancel}
            className="flex-1 py-4 border border-neutral-800 text-[10px] uppercase tracking-widest font-bold hover:bg-neutral-900 transition-colors"
          >
            Discard
          </button>
          <button 
            onClick={handleConfirm}
            className="flex-1 py-4 bg-white text-black text-[10px] uppercase tracking-widest font-bold hover:bg-neutral-200 transition-colors"
          >
            Apply Frame
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

const InputGroup: React.FC<{ label: string, value: string, onChange: (v: string) => void, placeholder?: string }> = ({ label, value, onChange, placeholder }) => (
  <div className="space-y-3">
    <label className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold">{label}</label>
    <input 
      type="text" 
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-black border-b border-neutral-800 py-3 text-sm focus:outline-none focus:border-white transition-colors placeholder:text-neutral-700"
    />
  </div>
);

export default UploadModal;
