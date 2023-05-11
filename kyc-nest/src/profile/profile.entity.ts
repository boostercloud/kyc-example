import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { Relative } from '../relative/relative.entity';
import { PromoCode } from '../promo-code/promo-code.entity';

export type KYCStatus =
  | 'KYCPending'
  | 'KYCIDVerified'
  | 'KYCIDRejected'
  | 'KYCAddressVerified'
  | 'KYCAddressRejected'
  | 'KYCBackgroundCheckPassed'
  | 'KYCBackgroundCheckRequiresManualReview'
  | 'KYCBackgroundCheckRejected'
  | 'KYCCompleted';

export enum IncomeSource {
  Salary = 'Salary',
  Dividends = 'Dividends',
  BusinessIncome = 'Business Income',
  Freelance = 'Freelance',
  RentalIncome = 'Rental Income',
  Royalties = 'Royalties',
  Investments = 'Investments',
  Pensions = 'Pensions',
  SocialSecurity = 'Social Security',
}

const countriesWithNoAddressVerifications = ['Wakanda'];

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  zipCode: string;

  @Column({ default: 'unknown' })
  country: string;

  @Column()
  dateOfBirth: Date;

  @Column({ default: 'unknown' })
  nationality: string;

  @Column()
  phoneNumber: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  ssn?: string;

  @Column({ nullable: true })
  tin?: string;

  @Column({ nullable: true })
  occupation?: string;

  @Column({ nullable: true })
  employer?: string;

  @Column({ nullable: true, type: 'varchar' })
  sourceOfIncome?: IncomeSource;

  @Column({ default: 'KYCPending' })
  kycStatus: KYCStatus;

  @Column({ nullable: true })
  idVerificationId?: string;

  @Column({ nullable: true })
  idVerifiedAt?: string;

  @Column({ nullable: true })
  idRejectedAt?: string;

  @Column({ nullable: true })
  addressVerificationId?: string;

  @Column({ nullable: true })
  addressVerifiedAt?: string;

  @Column({ nullable: true })
  addressRejectedAt?: string;

  @Column({ nullable: true })
  backgroundCheckPassedAt?: string;

  @Column({ nullable: true })
  backgroundCheckTriedAt?: string;

  @Column({ nullable: true })
  backgroundCheckManualValidatorId?: string;

  @Column({ nullable: true })
  backgroundCheckRejectedAt?: string;

  @Column({ nullable: true })
  welcomeEmailDeliveredAt?: string;

  @Column({ nullable: true })
  welcomeEmailDeliveryFailedAt?: string;

  @OneToMany(() => Relative, (relative) => relative.profile, { cascade: true })
  relatives: Relative[];

  @OneToOne(() => PromoCode, (promoCode) => promoCode.profile, {
    cascade: true,
  })
  promoCode: PromoCode;

  public skipsAddressVerification(): boolean {
    return countriesWithNoAddressVerifications.includes(this.country);
  }
}
