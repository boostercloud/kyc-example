import { KYCStatus } from "./types"

export function isValidTransition(
  currentState: KYCStatus,
  newState: KYCStatus,
): boolean {
  return allowedTransitions(currentState).includes(newState);
}

function allowedTransitions(currentState: KYCStatus): KYCStatus[] {
  switch (currentState) {
    case 'KYCPending':
      return ['KYCIDVerified', 'KYCIDRejected'];
    case 'KYCIDVerified':
      return ['KYCAddressVerified', 'KYCAddressRejected'];
    case 'KYCIDRejected':
      return [];
    case 'KYCAddressVerified':
      return [];
    case 'KYCAddressRejected':
      return [];
  }
}