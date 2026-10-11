import React from 'react';

interface SocratesLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const SocratesLogo: React.FC<SocratesLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 36, text: 'text-xl' },
    lg: { icon: 48, text: 'text-2xl' },
    xl: { icon: 64, text: 'text-4xl' },
  };

  const dim = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Emblema clásico arquitectónico Sócrates */}
      <div
        className="flex items-center justify-center rounded-lg bg-white border border-[#D6E4F7] shadow-xs text-[#0B2A66] shrink-0"
        style={{ width: dim.icon + 12, height: dim.icon + 12 }}
      >
        <svg
          width={dim.icon}
          height={dim.icon}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Frontispicio de templo y columna clásica griega */}
          <path
            d="M6 13L20 6L34 13"
            stroke="#0B2A66"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 15H32"
            stroke="#1D4ED8"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Fustes acanalados clásicos */}
          <path
            d="M12 17V30"
            stroke="#0B2A66"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M17.33 17V30"
            stroke="#7DD3FC"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M22.67 17V30"
            stroke="#7DD3FC"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M28 17V30"
            stroke="#0B2A66"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Estilóbato / Base */}
          <path
            d="M8 32H32"
            stroke="#1D4ED8"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M5 34H35"
            stroke="#0B2A66"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <span className={`font-serif font-semibold text-[#0B2A66] tracking-tight ${dim.text}`}>
          Sócrates
        </span>
      )}
    </div>
  );
};
