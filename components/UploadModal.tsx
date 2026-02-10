
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
      const base64 = await fileToBase64(file);
      setFormData(prev => ({ ...prev, mainImage: base64 }));
    }
  };

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Fixed: Explicitly typed 'file' as File to resolve 'unknown' type error on line 83.
      const base64s = await Promise.all(Array.from(files).map((file: File) => fileToBase64(file)));
      setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...base64s] }));
    }
    // Reset input so the same file can be selected again if removed
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleRemoveGalleryItem = (index: number) => {
    setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mainImage) {
      alert("Main image is required.");
      return;
    }
    setIsProcessing(true);

    const prompts = {
      lighting: `${formData.lightingShadows} ${formData.atmosphere ? `| Mood: ${formData.atmosphere}` : ''}`,
      composition: formData.spaceStructure || 'Architectural shot',
      materials: `${formData.colorPalette} ${formData.keywords ? `| Keywords: ${formData.keywords}` : ''}`,
      camera: initialData?.prompts.camera || 'Professional Setup, 8k resolution',
      negative: initialData?.prompts.negative || 'blur, noise, messy, distorted, low quality'
    };

    let generatedSpots: Hotspot[] = initialData?.hotspots || [];
    
    if (!initialData || (initialData.title !== formData.title)) {
      generatedSpots = await generateHotspots(formData.title, formData.description, prompts);
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
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
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
            <label className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold">MAIN IMAGE UPLOAD</label>
            <div 
              onClick={() => mainImageInputRef.current?.click()}
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
            <input 
              type="file" 
              ref={mainImageInputRef} 
              onChange={handleMainImageChange} 
              accept="image/jpeg,image/png,image/jpg" 
              className="hidden" 
            />
          </div>
          
          <div className="pt-8 border-t border-neutral-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">RELATED FRAMES (GALLERY)</h3>
              <button 
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="text-[9px] uppercase tracking-widest px-4 py-2 border border-neutral-700 hover:border-white transition-colors text-neutral-400 hover:text-white font-bold"
              >
                + Upload Frames
              </button>
              <input 
                type="file" 
                ref={galleryInputRef} 
                onChange={handleGalleryChange} 
                accept="image/jpeg,image/png,image/jpg" 
                multiple 
                className="hidden" 
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {formData.gallery.map((url, index) => (
                <div key={index} className="relative aspect-square bg-black group overflow-hidden rounded-sm">
                  <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <button 
                    type="button"
                    onClick={() => handleRemoveGalleryItem(index)}
                    className="absolute top-2 right-2 bg-black/60 text-white w-6 h-6 flex items-center justify-center text-[10px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {formData.gallery.length === 0 && (
                <div className="col-span-full py-8 border border-neutral-800 border-dashed text-center">
                  <p className="text-[10px] text-neutral-600 italic uppercase tracking-widest">No additional frames uploaded</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold">DESCRIPTION</label>
            <textarea 
              className="w-full bg-black border border-neutral-800 p-4 text-sm focus:outline-none focus:border-neutral-500 transition-colors min-h-[100px] rounded-sm"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the architectural intent and spatial atmosphere..."
            />
          </div>

          <div className="pt-8 border-t border-neutral-800">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 mb-8">AI PROMPT ARCHITECTURE</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <InputGroup label="SPACE / STRUCTURE" value={formData.spaceStructure} onChange={v => setFormData({...formData, spaceStructure: v})} placeholder="Compositional structure..." />
              <InputGroup label="COLOR PALETTE" value={formData.colorPalette} onChange={v => setFormData({...formData, colorPalette: v})} placeholder="Materials and tones..." />
              <InputGroup label="LIGHTING / SHADOWS" value={formData.lightingShadows} onChange={v => setFormData({...formData, lightingShadows: v})} placeholder="Light quality..." />
              <InputGroup label="ATMOSPHERE" value={formData.atmosphere} onChange={v => setFormData({...formData, atmosphere: v})} placeholder="Emotional mood..." />
              <div className="md:col-span-2">
                <InputGroup label="ADDITIONAL KEYWORDS" value={formData.keywords} onChange={v => setFormData({...formData, keywords: v})} placeholder="Specific detail descriptors..." />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isProcessing}
            className={`w-full py-6 text-black text-[11px] uppercase tracking-[0.4em] font-bold transition-all rounded-sm ${isProcessing ? 'bg-neutral-600 cursor-wait' : 'bg-white hover:bg-neutral-200 shadow-xl'}`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-4">
                <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                Synthesizing Interactive Elements...
              </span>
            ) : (
              initialData ? 'Update Archive Entry' : 'Commit to Archive'
            )}
          </button>
        </form>
      </div>
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
