import React from 'react';

export const RautsLogo = ({ className = "w-8 h-8", color = "#CFFE26" }: { className?: string, color?: string }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Top Long Line */}
      <path 
        d="M20 30H80" 
        stroke={color} 
        strokeWidth="8" 
        strokeLinecap="square"
      />
      {/* Right Vertical Connector */}
      <path 
        d="M80 30V65" 
        stroke={color} 
        strokeWidth="8" 
        strokeLinecap="square"
      />
      {/* Middle Offset Line */}
      <path 
        d="M40 65H80" 
        stroke={color} 
        strokeWidth="8" 
        strokeLinecap="square"
      />
      {/* Tail Slash (forming the Q/R hybrid) */}
      <path 
        d="M60 55L85 85" 
        stroke={color} 
        strokeWidth="8" 
        strokeLinecap="square"
      />
    </svg>
  );
};
