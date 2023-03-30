import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type KYCStatus = 'KYCPending' | 'KYCIDVerified' | 'KYCIDRejected';

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

  @Column()
  dateOfBirth: Date;

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
}
