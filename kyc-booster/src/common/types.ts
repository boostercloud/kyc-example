export type KYCStatus =
  | 'KYCPending'
  | 'KYCIDVerified'
  | 'KYCIDRejected'
  | 'KYCAddressVerified'
  | 'KYCAddressRejected'
  | 'KYCBackgroundCheckPassed'
  | 'KYCBackgroundCheckRequiresManualReview'
  | 'KYCBackgroundCheckRejected';

export type IncomeSource =  
  | 'Salary' 
  | 'Dividends' 
  | 'BusinessIncome' 
  | 'Freelance' 
  | 'RentalIncome' 
  | 'Royalties' 
  | 'Investments' 
  | 'Pensions' 
  | 'SocialSecurity' 
