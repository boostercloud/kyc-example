import { KYCStatus } from "./types"

export function isValidTransition(
  currentState: KYCStatus,
  newState: KYCStatus,
): boolean {
  const allowedTransitions: Record<KYCStatus, Array<KYCStatus>> = {
    KYCPending: ['KYCIDVerified', 'KYCIDRejected'],
    KYCIDVerified: [],
    KYCIDRejected: [],
  };

  return allowedTransitions[currentState]?.includes(newState)
}
