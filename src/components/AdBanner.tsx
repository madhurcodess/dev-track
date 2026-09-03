import React from 'react';

interface AdBannerProps {
  slotId: string;
  format?: 'horizontal' | 'rectangle' | 'sidebar';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  slotId, 
  format = 'horizontal', 
  className = '' 
}) => {
  return (
    <div className={`w-full flex flex-col items-center my-3 ${className}`}>
      {/* Editorial Ad Container */}
      <div className={`w-full relative rounded-2xl border border-dashed border-[#121417]/20 bg-white/60 p-3 flex flex-col items-center justify-center overflow-hidden transition-all ${
        format === 'horizontal' 
          ? 'min-h-[90px] max-h-[110px]' 
          : format === 'sidebar'
          ? 'min-h-[140px]'
          : 'min-h-[250px]'
      }`}>
        {/* Micro Badge */}
        <span className="absolute top-1.5 right-2 text-[9px] uppercase tracking-wider font-extrabold text-[#121417]/40">
          Advertisement
        </span>

        {/* Ad Content Area - Plug in Google AdSense <ins class="adsbygoogle"> here */}
        <div id={`ad-${slotId}`} className="w-full flex items-center justify-center text-center">
          <div className="flex flex-col items-center gap-1 text-[#121417]/40 py-2">
            <span className="text-[11px] font-bold text-[#121417]/60">Google AdSense Space</span>
            <span className="text-[9px] font-medium max-w-xs">
              Responsive advertising banner slot ({slotId})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
