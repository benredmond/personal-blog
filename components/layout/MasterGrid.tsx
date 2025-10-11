// ABOUTME: MasterGrid component implementing 12-column grid system with Ma (間) spacing
// ABOUTME: Neo-Bauhaus design system foundation for all spatial relationships

import React from 'react';

interface MasterGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * MasterGrid - The architectural foundation of the Neo-Bauhaus interface
 *
 * Implements a strict 12-column CSS Grid (6 on mobile) with Ma (間) spacing.
 * This grid provides the structural logic for all layout decisions.
 *
 * @param children - Grid items to be positioned
 * @param className - Additional CSS classes
 *
 * @example
 * <MasterGrid>
 *   <div className="col-span-8">Main content</div>
 *   <div className="col-span-4">Sidebar</div>
 * </MasterGrid>
 */
export default function MasterGrid({ children, className = '' }: MasterGridProps) {
  return (
    <div className={`master-grid ${className}`.trim()}>
      {children}
    </div>
  );
}

// Named export for compatibility with chinese-bot import pattern
export { MasterGrid };
