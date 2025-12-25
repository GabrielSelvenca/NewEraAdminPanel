export const FeatureFlags = {
  gamesEnabled: process.env.NEXT_PUBLIC_FEATURE_GAMES_ENABLED === 'true',
  marketplaceEnabled: process.env.NEXT_PUBLIC_FEATURE_MARKETPLACE_ENABLED === 'true',
} as const;

export function isFeatureEnabled(feature: keyof typeof FeatureFlags): boolean {
  return FeatureFlags[feature];
}

export function logFeatureStatus() {
  if (typeof window !== 'undefined') {
    console.log('=== FEATURE TOGGLES (CLIENT) ===');
    console.log('Games Module:', FeatureFlags.gamesEnabled ? 'ENABLED' : 'DISABLED');
    console.log('Marketplace Module:', FeatureFlags.marketplaceEnabled ? 'ENABLED' : 'DISABLED');
    console.log('================================');
  }
}
