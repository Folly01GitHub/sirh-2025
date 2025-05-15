
import React, { lazy, Suspense } from 'react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import type { LucideProps } from 'lucide-react';

interface LucideIconProps extends Omit<LucideProps, "ref"> {
  name: keyof typeof dynamicIconImports;
  fallback?: React.ReactNode;
}

const fallback = <div style={{ width: 24, height: 24, display: 'inline-block' }} />;

export function LucideIcon({ name, fallback: customFallback, ...props }: LucideIconProps) {
  const ImportedIcon = lazy(dynamicIconImports[name]);
  return (
    <Suspense fallback={customFallback ?? fallback}>
      <ImportedIcon {...props} />
    </Suspense>
  );
}
