import React from 'react';
import SupremeLogo from './SupremeLogo';

interface SupremeLoadingProps {
  fullScreen?: boolean;
}

const SupremeLoading: React.FC<SupremeLoadingProps> = ({ fullScreen = true }) => {
  return (
    <div className={`
      flex flex-col items-center justify-center 
      ${fullScreen ? 'fixed inset-0 z-[9999] bg-[#05070a] h-[100dvh] w-full' : 'w-full h-full p-12'}
    `}>
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-color/5 blur-[120px] rounded-full -z-10"></div>
      
      <div className="flex flex-col items-center gap-8">
        <SupremeLogo size={120} animate="pulse" />
        
        <div className="flex flex-col items-center gap-1">
            <div className="h-1 w-32 bg-white/5 rounded-full overflow-hidden relative">
                <div className="h-full bg-primary-gradient w-1/3 absolute left-0 animate-[loading-bar_1.5s_infinite_ease-in-out]"></div>
            </div>
            <span className="text-[10px] text-primary-color font-black uppercase tracking-[0.3em] animate-pulse mt-4">
                Loading...
            </span>
        </div>
      </div>

      <style>{`
        @keyframes loading-bar {
            0% { left: -40%; width: 30%; }
            50% { left: 40%; width: 60%; }
            100% { left: 110%; width: 30%; }
        }
      `}</style>
    </div>
  );
};

export default SupremeLoading;
