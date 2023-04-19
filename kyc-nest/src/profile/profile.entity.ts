import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type KYCStatus =
  | 'KYCPending'
  | 'KYCIDVerified'
  | 'KYCIDRejected'
  | 'KYCAddressVerified'
  | 'KYCAddressRejected'
  | 'KYCBackgroundCheckPassed'
  | 'KYCBackgroundCheckRequiresManualReview'
  | 'KYCBackgroundCheckRejected';

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
}
