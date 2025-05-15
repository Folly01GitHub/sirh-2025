
import React, { lazy, Suspense } from 'react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import type { LucideProps } from 'lucide-react';

interface LucideIconProps extends Omit<LucideProps, "ref"> {
  name: string; // Allow any kebab-case icon name
  fallback?: React.ReactNode;
}

// Fallback node while loading
const fallback = <div style={{ width: 24, height: 24, display: 'inline-block' }} />;

export function LucideIcon({ name, fallback: customFallback, ...props }: LucideIconProps) {
  const importFn = (dynamicIconImports as Record<string, any>)[name];
  if (!importFn) {
    // Optional: You may want to fallback if the icon is not found
    return customFallback ?? fallback;
  }
  const ImportedIcon = lazy(importFn);
  return (
    <Suspense fallback={customFallback ?? fallback}>
      <ImportedIcon {...props} />
    </Suspense>
  );
}
