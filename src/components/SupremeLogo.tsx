import React from 'react';

interface SupremeLogoProps {
  size?: number;
  className?: string;
  animate?: 'pulse' | 'float' | 'shimmer' | 'none';
  showText?: boolean;
}

const SupremeLogo: React.FC<SupremeLogoProps> = ({ 
  size = 40, 
  className = '', 
  animate = 'pulse',
  showText = false
}) => {
  const animationClass = animate === 'none' ? '' : `animate-supreme-${animate}`;
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div 
        className={`relative flex-shrink-0 ${animationClass}`}
        style={{ width: size, height: size }}
      >
        <img 
          src="/logo-supreme.png" 
          alt="Plug & Sales Logo" 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={(e) => {
            // Fallback if image is missing
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).parentElement!.innerHTML = `
                <div style="width: 100%; height: 100%; background: var(--primary-gradient); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: black; font-weight: 900; font-size: ${size/3}px">
                  PS
                </div>
            `;
          }}
        />
        
        {/* Glow effect layer */}
        <div className="absolute inset-0 rounded-full bg-primary-color/20 blur-xl -z-10 animate-pulse"></div>
      </div>
      
      {showText && (
        <span className="text-white font-black tracking-tighter" style={{ fontSize: size * 0.45 }}>
          PLUG & <span className="text-primary-color">SALES</span>
        </span>
      )}
    </div>
  );
};

export default SupremeLogo;
