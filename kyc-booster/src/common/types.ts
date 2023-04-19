export type KYCStatus =
  | 'KYCPending'
  | 'KYCIDVerified'
  | 'KYCIDRejected'
  | 'KYCAddressVerified'
  | 'KYCAddressRejected'
  | 'KYCBackgroundCheckPassed'
  | 'KYCBackgroundCheckRequiresManualReview'
  | 'KYCBackgroundCheckRejected';