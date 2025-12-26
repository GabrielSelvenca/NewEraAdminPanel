import dynamic from 'next/dynamic';
import { LoadingState } from '@/components/shared';

/**
 * Helper para lazy loading de componentes com loading state
 */
export function lazyComponent<T extends React.ComponentType<Record<string, unknown>>>(
  importFn: () => Promise<{ default: T }>,
  loadingMessage?: string
) {
  return dynamic(importFn, {
    loading: () => LoadingState({ message: loadingMessage, size: 'md' as const }),
    ssr: false,
  });
}

/**
 * Presets para lazy loading de páginas específicas
 */
export const LazyPages = {
  games: () => lazyComponent(
    () => import('@/app/dashboard/games/page'),
    'Carregando jogos...'
  ),
  partners: () => lazyComponent(
    () => import('@/app/dashboard/partners/page'),
    'Carregando parceiros...'
  ),
  coupons: () => lazyComponent(
    () => import('@/app/dashboard/coupons/page'),
    'Carregando cupons...'
  ),
  config: () => lazyComponent(
    () => import('@/app/dashboard/config/page'),
    'Carregando configurações...'
  ),
};
