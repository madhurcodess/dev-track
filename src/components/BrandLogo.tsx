import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  size = 'md', 
  showText = true,
  className = '' 
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Modern SVG Brand Mark */}
      <div className={`relative ${iconSizes[size]} rounded-xl bg-[#121417] text-white flex items-center justify-center shadow-solid transition-transform hover:scale-105 overflow-hidden`}>
        <svg 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
        >
          {/* Stylized D/T Monogram with Play facet */}
          <path 
            d="M8 7C8 5.89543 8.89543 5 10 5H18C22.4183 5 26 8.58172 26 13C26 17.4183 22.4183 21 18 21H12V25C12 26.1046 11.1046 27 10 27C8.89543 27 8 26.1046 8 25V7Z" 
            fill="white" 
          />
          {/* Vibrant Lime Geometric Play Accent */}
          <polygon 
            points="14,10 21,13 14,16" 
            fill="#EBF755" 
          />
        </svg>
      </div>

      {/* Brand Wordmark */}
      {showText && (
        <div className="flex items-center">
          <span className={`font-black tracking-tight text-[#121417] font-sans ${textSizes[size]}`}>
            DevTrack
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#EBF755] ml-0.5 mt-2 ring-1 ring-[#121417]/20" />
        </div>
      )}
    </div>
  );
};
