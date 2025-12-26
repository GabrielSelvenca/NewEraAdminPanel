import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState = React.memo(({ message = 'Carregando...', size = 'md' }: LoadingStateProps) => {
  const sizeClasses = {
    sm: 'h-32',
    md: 'h-64',
    lg: 'min-h-screen',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${sizeClasses[size]}`}>
      <Loader2 className={`${iconSizes[size]} animate-spin text-emerald-500 mb-2`} />
      {message && <p className="text-zinc-400 text-sm">{message}</p>}
    </div>
  );
});

LoadingState.displayName = 'LoadingState';
