// ABOUTME: Temporary MasterGrid stub until T00_S03 implements full Neo-Bauhaus design system
// ABOUTME: This is a simple wrapper to unblock T00_S02 component extraction

import React from 'react';

interface MasterGridProps {
  children: React.ReactNode;
  className?: string;
}

export default function MasterGrid({ children, className = '' }: MasterGridProps) {
  return (
    <div className={`container mx-auto px-4 ${className}`}>
      {children}
    </div>
  );
}

// Named export for compatibility with chinese-bot import pattern
export { MasterGrid };
