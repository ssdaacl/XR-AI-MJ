
import React from 'react';

interface NavbarProps {
  onHome: () => void;
  onUploadClick: () => void;
  visible?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onHome, onUploadClick, visible = true }) => {
  return (
    <nav className={`fixed top-0 left-0 w-full z-50 px-10 py-10 flex justify-between items-center transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
      <div 
        className="text-xl font-bold tracking-[-0.05em] cursor-pointer hover:opacity-50 transition-opacity"
        onClick={onHome}
      >
        XR AI <span className="serif italic font-normal ml-1 text-neutral-400">Archive</span>
      </div>
      
      <div className="flex gap-12 items-center">
        <div className="hidden md:flex gap-12 text-[10px] uppercase tracking-[0.4em] font-light text-neutral-500">
          <button onClick={onHome} className="hover:text-white transition-colors">Index</button>
          <a href="#" className="hover:text-white transition-colors">About</a>
        </div>
        
        <button 
          onClick={onUploadClick} 
          className="px-6 py-2.5 bg-white text-black text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-neutral-200 transition-all rounded-sm shadow-xl"
        >
          Add Case
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
