
import React from 'react';
import { UserProfile } from '../types';

interface PremiumCardProps {
  user: UserProfile;
}

const PremiumCard: React.FC<PremiumCardProps> = ({ user }) => {
  return (
    <div className="relative group perspective-1000">
      <div className="card-shimmer w-full max-w-md aspect-[1.586/1] rounded-2xl p-8 border border-[#2A3352] shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-[#4DA6FF]/5 amex-pattern flex flex-col justify-between">
        {/* Top Section */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-xs tracking-[0.4em] font-medium text-white/50">BHAROSA</h2>
            <p className="text-[10px] tracking-widest text-[#4DA6FF]/60 font-bold uppercase">Centurion Elite</p>
          </div>
          <div className="w-12 h-10 bg-gradient-to-br from-[#4DA6FF]/20 to-[#1C2438] rounded border border-[#2A3352] overflow-hidden relative shadow-inner">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          </div>
        </div>

        {/* Center Section: Centurion Style Figure */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none text-white">
           <svg className="w-40 h-40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,13C14.67,13 20,14.33 20,17V18H4V17C4,14.33 9.33,13 12,13Z" />
           </svg>
        </div>

        {/* Card Number */}
        <div className="text-xl md:text-2xl font-mono tracking-[0.25em] text-white/90 drop-shadow-md">
          {user.id}
        </div>

        {/* Bottom Section */}
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-[8px] tracking-widest text-[#AAB0C5] uppercase">Member Since</p>
            <p className="text-xs font-medium tracking-widest">24</p>
            <p className="text-sm font-serif tracking-[0.1em] uppercase mt-2 text-white">{user.name}</p>
          </div>
          <div className="text-right">
             <p className="text-[8px] tracking-widest text-[#3DDC97] uppercase font-bold">Trust Rating</p>
             <p className="text-lg font-bold text-white tracking-tighter italic">{user.trustScore}</p>
          </div>
        </div>
        
        {/* Holographic accent */}
        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#4DA6FF]/10 blur-sm group-hover:bg-[#4DA6FF]/30 transition-all duration-700"></div>
      </div>
    </div>
  );
};

export default PremiumCard;
