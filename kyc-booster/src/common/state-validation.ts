import { KYCStatus } from "./types"
import { Profile } from '../entities/profile';

export function isValidTransition(
  profile: Profile,
  newState: KYCStatus,
): boolean {
  return allowedTransitions(profile).includes(newState);
}

function allowedTransitions(profile: Profile): KYCStatus[] {
  const AddressVerificationTargetStates: KYCStatus[] = [
    'KYCAddressVerified',
    'KYCAddressRejected',
  ];
  const AutomatedBackgroundCheckTargetStates: KYCStatus[] = [
    'KYCBackgroundCheckPassed',
    'KYCBackgroundCheckRequiresManualReview',
  ];
  switch (profile.kycStatus) {
    // Initial state
    case 'KYCPending':
      return ['KYCIDVerified', 'KYCIDRejected'];
    // Step 1: ID Verified, waiting for address verification
    case 'KYCIDVerified':
      if (profile.skipsAddressVerification()) {
        return AutomatedBackgroundCheckTargetStates;
      } else {
        return AddressVerificationTargetStates;
      }
    // Step 2: Address verified, waiting for background check
    case 'KYCAddressVerified':
      return AutomatedBackgroundCheckTargetStates;
    // Step 3: Background check suspicious, waiting for manual review
    case 'KYCBackgroundCheckRequiresManualReview':
      return ['KYCBackgroundCheckPassed', 'KYCBackgroundCheckRejected'];
    // Step 4: Background check passed, waiting for risk assessment
    case 'KYCBackgroundCheckPassed':
      return ['KYCCompleted'];
    // Final states
    case 'KYCCompleted':
    case 'KYCIDRejected':
    case 'KYCAddressRejected':
    case 'KYCBackgroundCheckRejected':
      return [];
  }
}