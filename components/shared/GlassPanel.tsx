// components/shared/GlassPanel.tsx

import React from 'react';
import { cn } from '@/lib/utils';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassPanel({ children, className }: GlassPanelProps) {
  return (
    <div
      className={cn(
        'glass-panel rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl border border-white/10',
        className
      )}
    >
      {children}
    </div>
  );
}
