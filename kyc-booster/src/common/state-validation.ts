import { KYCStatus } from "./types"

export function isValidTransition(
  currentState: KYCStatus,
  newState: KYCStatus,
): boolean {
  return allowedTransitions(currentState).includes(newState);
}

function allowedTransitions(currentState: KYCStatus): KYCStatus[] {
  switch (currentState) {
    // Initial state
    case 'KYCPending':
      return ['KYCIDVerified', 'KYCIDRejected'];
    // Step 1: ID Verified, waiting for address verification
    case 'KYCIDVerified':
      return ['KYCAddressVerified', 'KYCAddressRejected'];
    // Step 2: Address verified, waiting for background check
    case 'KYCAddressVerified':
      return [
        'KYCBackgroundCheckPassed',
        'KYCBackgroundCheckRequiresManualReview',
      ];
    // Step 3: Background check suspicious, waiting for manual review
    case 'KYCBackgroundCheckRequiresManualReview':
      return ['KYCBackgroundCheckPassed', 'KYCBackgroundCheckRejected'];
    // Step 4: Background check passed, waiting for risk assessment
    case 'KYCBackgroundCheckPassed':
      return [];
    // Final states
    case 'KYCIDRejected':
    case 'KYCAddressRejected':
    case 'KYCBackgroundCheckRejected':
      return [];
  }
}