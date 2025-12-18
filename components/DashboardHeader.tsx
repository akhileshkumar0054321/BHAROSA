
import React from 'react';
import { Bell, User, ChevronDown } from 'lucide-react';

interface Props {
    title: string;
    onReset: () => void;
}

const DashboardHeader: React.FC<Props> = ({ title, onReset }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0B0F1A]/80 backdrop-blur-md border-b border-[#2A3352] px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={onReset}>
        <div className="relative">
          <div className="w-10 h-10 bg-[#4DA6FF] text-[#0B0F1A] flex items-center justify-center font-serif font-bold italic rounded-sm transition-all group-hover:scale-110 shadow-[0_0_15px_rgba(77,166,255,0.3)]">
            B
          </div>
        </div>
        <h1 className="text-xl font-serif tracking-[0.1em] font-bold text-white group-hover:text-[#4DA6FF] transition-colors">BHAROSA</h1>
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-[10px] tracking-[0.2em] uppercase text-[#AAB0C5]">
        <span className="hover:text-[#4DA6FF] cursor-pointer transition-colors font-semibold">Concierge</span>
        <span className="hover:text-[#4DA6FF] cursor-pointer transition-colors font-semibold">Network</span>
        <span className="hover:text-[#4DA6FF] cursor-pointer transition-colors font-semibold">Portfolio</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-[#4DA6FF]/10 text-[#AAB0C5] hover:text-[#4DA6FF] rounded-full transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#3DDC97] rounded-full"></span>
        </button>
        <button className="flex items-center gap-2 p-1 pl-3 bg-[#1C2438] border border-[#2A3352] rounded-full hover:border-[#4DA6FF]/30 transition-colors">
          <span className="text-[10px] font-bold tracking-widest hidden sm:inline text-[#AAB0C5]">C. CARL</span>
          <div className="w-7 h-7 bg-[#4DA6FF] rounded-full flex items-center justify-center text-[#0B0F1A]">
             <User size={14} />
          </div>
          <ChevronDown size={14} className="text-[#AAB0C5] mr-1" />
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
