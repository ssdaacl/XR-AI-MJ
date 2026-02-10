
import React, { useState, useEffect, useRef } from 'react';
import { CASES } from './constants';
import { ViewMode, InteriorCase } from './types';
import Navbar from './components/Navbar';
import ProjectDetail from './components/ProjectDetail';
import UploadModal from './components/UploadModal';

const STORAGE_KEY = 'lumiere_archive_v1';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.ARCHIVE);
  const [selectedProject, setSelectedProject] = useState<InteriorCase | null>(null);
  const [isNavbarVisible, setIsNavbarVisible] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<InteriorCase | null>(null);
  const archiveRef = useRef<HTMLDivElement>(null);
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());
  
  const [allCases, setAllCases] = useState<InteriorCase[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load archive from storage", e);
        return CASES;
      }
    }
    return CASES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allCases));
  }, [allCases]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-reveal-id');
            if (id) {
              setVisibleElements((prev) => new Set([...prev, id]));
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[data-reveal-id]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [allCases, view]);

  useEffect(() => {
    const handleScroll = () => {
      if (view !== ViewMode.ARCHIVE) {
        setIsNavbarVisible(true);
        return;
      }
      
      const scrollThreshold = window.innerHeight * 0.5;
      setIsNavbarVisible(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [view]);

  const handleOpenProject = (project: InteriorCase) => {
    setSelectedProject(project);
    setView(ViewMode.DETAIL);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHome = () => {
    setView(ViewMode.ARCHIVE);
    setSelectedProject(null);
  };

  const handleUpload = (newCase: InteriorCase) => {
    setAllCases([newCase, ...allCases]);
  };

  const handleUpdate = (updatedCase: InteriorCase) => {
    setAllCases(allCases.map(c => c.id === updatedCase.id ? updatedCase : c));
    setSelectedProject(updatedCase);
    setEditingProject(null);
  };

  const handleDelete = (id: string) => {
    setAllCases(allCases.filter(c => c.id !== id));
    handleHome();
  };

  const openEditModal = (project: InteriorCase) => {
    setEditingProject(project);
    setIsUploadOpen(true);
  };

  const scrollToArchive = () => {
    archiveRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar 
        onHome={handleHome} 
        onUploadClick={() => {
          setEditingProject(null);
          setIsUploadOpen(true);
        }} 
        visible={isNavbarVisible || view === ViewMode.DETAIL}
      />

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => {
          setIsUploadOpen(false);
          setEditingProject(null);
        }} 
        onUpload={editingProject ? handleUpdate : handleUpload} 
        initialData={editingProject || undefined}
      />

      {view === ViewMode.ARCHIVE ? (
        <div className="w-full">
          {/* 시작 페이지 (Start Page) - 흑백 이미지 유지 */}
          <section className="relative h-screen w-full flex items-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=2000" 
                alt="Architecture Hero"
                className="w-full h-full object-cover opacity-40 grayscale transition-opacity duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]" />
            </div>

            <div className="relative z-10 w-full px-8 md:px-24 flex flex-col items-start text-left">
              <div className="overflow-hidden mb-6 py-1">
                <div className="text-[11px] uppercase tracking-[1.2em] text-neutral-500 opacity-0 animate-reveal delay-300 font-medium">
                  Architectural Intelligence
                </div>
              </div>
              
              <div className="overflow-hidden py-4 -ml-2">
                <h1 className="serif text-9xl md:text-[16rem] font-bold tracking-tighter leading-[0.85] opacity-0 animate-reveal">
                  XR AI
                </h1>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-6 mt-12 w-full">
                <div className="overflow-hidden py-1">
                  <div className="flex items-center gap-4 text-xs uppercase tracking-[0.5em] font-light text-neutral-400 opacity-0 animate-reveal delay-500">
                    <span className="font-bold">Vol. 01</span>
                    <span className="w-16 h-px bg-neutral-800" />
                    <span>Archive Edition 2026</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={scrollToArchive}
              className="absolute bottom-12 right-12 md:right-24 z-10 flex flex-col items-end gap-6 group opacity-0 animate-reveal delay-700 hover:opacity-100 transition-all duration-500"
            >
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-neutral-500">Discover</span>
              <div className="w-px h-16 bg-gradient-to-b from-neutral-500 to-transparent group-hover:h-24 transition-all duration-700 origin-top" />
            </button>
          </section>

          {/* 메인 페이지 (Main Archive Page) - 컬러 이미지 */}
          <main ref={archiveRef} className="pt-24 px-8 max-w-7xl mx-auto scroll-mt-20">
            <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="max-w-2xl">
                <h2 
                  data-reveal-id="header-title"
                  className={`serif text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-[0.9] reveal-hidden ${visibleElements.has('header-title') ? 'reveal-visible' : ''}`}
                >
                  Curated <br /> 
                  <span className="italic font-light opacity-60">Atmospheres.</span>
                </h2>
                <p 
                  data-reveal-id="header-desc"
                  className={`text-neutral-500 text-sm tracking-wide max-w-md leading-relaxed reveal-hidden delay-200 ${visibleElements.has('header-desc') ? 'reveal-visible' : ''}`}
                >
                  An archival study of high-end architectural interiors and the AI prompt engineering required to manifest them.
                </p>
              </div>
              <div 
                data-reveal-id="header-side"
                className={`flex flex-col items-end gap-4 reveal-hidden delay-400 ${visibleElements.has('header-side') ? 'reveal-visible' : ''}`}
              >
                 <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-neutral-600 border-l border-neutral-800 pl-8 h-fit pb-2">
                  Permanent Collection
                </div>
              </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-16 pb-32">
              {allCases.map((item, idx) => (
                <div 
                  key={item.id} 
                  data-reveal-id={`item-${item.id}`}
                  className={`group cursor-pointer reveal-hidden ${visibleElements.has(`item-${item.id}`) ? 'reveal-visible' : ''}`}
                  style={{ transitionDelay: `${(idx % 2) * 150}ms` }}
                  onClick={() => handleOpenProject(item)}
                >
                  <div className="relative aspect-[4/5] overflow-hidden mb-6 bg-neutral-900 rounded-sm">
                    <img 
                      src={item.mainImage} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-all duration-1000 scale-100 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                    <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                      <span className="px-4 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest">
                        Explore Case
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <div>
                      <h3 className="serif text-3xl font-light mb-1">{item.title}</h3>
                      <p className="text-xs uppercase tracking-widest text-neutral-500">{item.subtitle}</p>
                    </div>
                    <span className="text-[10px] text-neutral-600 italic">{(idx + 1).toString().padStart(2, '0')}</span>
                  </div>
                </div>
              ))}
            </section>

            <footer className="py-24 border-t border-neutral-900 flex justify-center items-center text-[10px] uppercase tracking-widest text-neutral-600">
              <p>&copy; 2026 XR AI Archive Studio</p>
            </footer>
          </main>
        </div>
      ) : (
        selectedProject && (
          <ProjectDetail 
            project={selectedProject} 
            onBack={handleHome} 
            onEdit={() => openEditModal(selectedProject)}
            onDelete={() => handleDelete(selectedProject.id)}
          />
        )
      )}
    </div>
  );
};

export default App;
