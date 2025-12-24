import { useMasterDataContext } from '@/contexts/MasterDataContext';

// Re-export types for backward compatibility
export type { Vehicle, Worker, Manager, MasterData } from '@/contexts/MasterDataContext';

// This hook now simply returns the context value
// Keeping the same API for backward compatibility
export function useMasterData() {
    return useMasterDataContext();
}
