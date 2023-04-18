import { UUID } from '@boostercloud/framework-types'
import { Entity, Reduces } from '@boostercloud/framework-core'
import { ProfileCreated } from '../events/profile-created'
import { KYCStatus } from '../common/types'
import { IDVerificationSuccess } from '../events/id-verification-success'
import { IDVerificationRejected } from '../events/id-verification-rejected'
import { AddressVerificationSuccess } from '../events/address-verification-success'
import { AddressVerificationRejected } from '../events/address-verification-rejected'

@Entity
export class Profile {
  public constructor(
    public id: UUID,
    readonly firstName: string,
    readonly lastName: string,
    readonly address: string,
    readonly city: string,
    readonly state: string,
    readonly zipCode: string,
    readonly dateOfBirth: string,
    readonly phoneNumber: string,
    readonly email: string,
    readonly kycStatus: KYCStatus,
    readonly ssn?: string,
    readonly tin?: string,
    readonly idVerificationId?: UUID,
    readonly idVerifiedAt?: string,
    readonly idRejectedAt?: string,
    readonly addressVerificationId?: UUID,
    readonly addressVerifiedAt?: string,
    readonly addressRejectedAt?: string
  ) {}

  @Reduces(ProfileCreated)
  public static reduceProfileCreated(event: ProfileCreated, currentProfile?: Profile): Profile {
    return new Profile(event.profileId, event.firstName, event.lastName, event.address, event.city, event.state, event.zipCode, event.dateOfBirth, event.phoneNumber, event.email, event.kycStatus, event.ssn, event.tin)
  }

  @Reduces(IDVerificationSuccess)
  public static onIDVerificationSuccess(event: IDVerificationSuccess, currentProfile?: Profile): Profile {
    return Profile.nextProfile({ kycStatus: 'KYCIDVerified', idVerificationId: event.verificationId, idVerifiedAt: event.timestamp }, currentProfile)
  }

  @Reduces(IDVerificationRejected)
  public static onIDVerificationRejected(event: IDVerificationRejected, currentProfile?: Profile): Profile {
    return Profile.nextProfile({ kycStatus: 'KYCIDRejected', idRejectedAt: event.timestamp }, currentProfile)
  }

  @Reduces(AddressVerificationSuccess)
  public static onAddressVerificationSuccess(event: AddressVerificationSuccess, currentProfile?: Profile): Profile {
    return Profile.nextProfile({ kycStatus: 'KYCAddressVerified', addressVerificationId: event.verificationId, addressVerifiedAt: event.timestamp }, currentProfile)
  }

  @Reduces(AddressVerificationRejected)
  public static onAddressVerificationRejected(event: AddressVerificationRejected, currentProfile?: Profile): Profile {
    return Profile.nextProfile({ kycStatus: 'KYCAddressRejected', addressRejectedAt: event.timestamp }, currentProfile)
  }

  private static nextProfile(fields: Partial<Profile>, currentProfile?: Profile): Profile {
    if (!currentProfile) {
      throw new Error('Cannot reduce an event over a non-existing profile')
    }
    return new Profile(
      currentProfile.id,
      fields.firstName || currentProfile.firstName,
      fields.lastName || currentProfile.lastName,
      fields.address || currentProfile.address,
      fields.city || currentProfile.city,
      fields.state || currentProfile.state,
      fields.zipCode || currentProfile.zipCode,
      fields.dateOfBirth || currentProfile.dateOfBirth,
      fields.phoneNumber || currentProfile.phoneNumber,
      fields.email || currentProfile.email,
      fields.kycStatus || currentProfile.kycStatus,
      fields.ssn || currentProfile.ssn,
      fields.tin || currentProfile.tin,
      fields.idVerificationId || currentProfile.idVerificationId,
      fields.idVerifiedAt || currentProfile.idVerifiedAt,
      fields.idRejectedAt || currentProfile.idRejectedAt,
      fields.addressVerificationId || currentProfile.addressVerificationId,
      fields.addressVerifiedAt || currentProfile.addressVerifiedAt,
      fields.addressRejectedAt || currentProfile.addressRejectedAt
    )
  }
}
