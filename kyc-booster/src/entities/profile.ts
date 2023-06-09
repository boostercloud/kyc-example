import { UUID } from '@boostercloud/framework-types'
import { Entity, Reduces } from '@boostercloud/framework-core'
import { ProfileCreated } from '../events/profile-created'
import { KYCStatus, IncomeSource } from '../common/types'
import { IDVerificationSuccess } from '../events/id-verification-success'
import { IDVerificationRejected } from '../events/id-verification-rejected'
import { AddressVerificationSuccess } from '../events/address-verification-success'
import { AddressVerificationRejected } from '../events/address-verification-rejected'
import { BackgroundCheckPassed } from '../events/background-check-passed';
import { BackgroundCheckRejected } from '../events/background-check-rejected'
import { BackgroundCheckManualReviewRequired } from '../events/background-check-manual-review-required';
import { ProfileOcupationDataAdded } from '../events/profile-ocupation-data-added'
import { WelcomeEmailDeliveryFailed } from '../events/welcome-email-delivery-failed'
import { WelcomeEmailDelivered } from '../events/welcome-email-delivered'
import { KYCCompleted } from '../events/kyc-completed';

const countriesWithNoAddressVerifications = ['Wakanda'];

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
    readonly country: string,
    readonly dateOfBirth: string,
    readonly phoneNumber: string,
    readonly nationality: string,
    readonly email: string,
    readonly kycStatus: KYCStatus,
    readonly ssn?: string,
    readonly tin?: string,
    readonly idVerificationId?: UUID,
    readonly idVerifiedAt?: string,
    readonly idRejectedAt?: string,
    readonly addressVerificationId?: UUID,
    readonly addressVerifiedAt?: string,
    readonly addressRejectedAt?: string,
    readonly backgroundCheckPassedAt?: string,
    readonly backgroundCheckTriedAt?: string,
    readonly backgroundCheckValidatorId?: UUID | 'auto',
    readonly backgroundCheckRejectedAt?: string,
    readonly occupation?: string,
    readonly employer?: string,
    readonly sourceOfIncome?: IncomeSource,
    readonly welcomeEmailDeliveredAt?: string,
    readonly welcomeEmailDeliveryFailedAt?: string,
  ) {}

  @Reduces(ProfileCreated)
  public static reduceProfileCreated(event: ProfileCreated, currentProfile?: Profile): Profile {
    return new Profile(
      event.profileId,
      event.firstName,
      event.lastName,
      event.address,
      event.city,
      event.state,
      event.zipCode,
      event.country,
      event.dateOfBirth,
      event.phoneNumber,
      event.nationality,
      event.email,
      event.kycStatus,
      event.ssn,
      event.tin,
    )
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

  @Reduces(BackgroundCheckPassed)
  public static onBackgroundCheckPassed(event: BackgroundCheckPassed, currentProfile?: Profile): Profile {
    return Profile.nextProfile({ 
      kycStatus: 'KYCBackgroundCheckPassed',
      backgroundCheckPassedAt: event.timestamp,
      backgroundCheckValidatorId: event.validatorId
    }, currentProfile)
  }

  @Reduces(BackgroundCheckRejected)
  public static onBackgroundCheckRejected(event: BackgroundCheckRejected, currentProfile?: Profile): Profile {
    return Profile.nextProfile({
      kycStatus: 'KYCBackgroundCheckRejected',
      backgroundCheckRejectedAt: event.timestamp,
      backgroundCheckValidatorId: event.validatorId
    }, currentProfile)
  }

  @Reduces(BackgroundCheckManualReviewRequired)
  public static onBackgroundCheckManualReviewRequired(event: BackgroundCheckManualReviewRequired, currentProfile?: Profile): Profile {
    return Profile.nextProfile({
      kycStatus: 'KYCBackgroundCheckRequiresManualReview',
      backgroundCheckTriedAt: event.timestamp,
    }, currentProfile)
  }

  @Reduces(ProfileOcupationDataAdded)
  public static onProfileOcupationDataAdded(event: ProfileOcupationDataAdded, currentProfile?: Profile): Profile {
    return Profile.nextProfile({
      occupation: event.occupation,
      employer: event.employer,
      sourceOfIncome: event.sourceOfIncome,
    }, currentProfile)
  }

  @Reduces(WelcomeEmailDelivered)
  public static onWelcomeEmailDelivered(event: WelcomeEmailDelivered, currentProfile?: Profile): Profile {
    return Profile.nextProfile({
      welcomeEmailDeliveredAt: event.timestamp,
    }, currentProfile)
  }

  @Reduces(WelcomeEmailDeliveryFailed)
  public static onWelcomeEmailDeliveryFailed(event: WelcomeEmailDeliveryFailed, currentProfile?: Profile): Profile {
    return Profile.nextProfile({
      welcomeEmailDeliveryFailedAt: event.timestamp,
    }, currentProfile)
  }

  @Reduces(KYCCompleted)
  public static onKYCCompleted(event: KYCCompleted, currentProfile?: Profile): Profile {
    return Profile.nextProfile({
      kycStatus: 'KYCCompleted',
    }, currentProfile)
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
      fields.country || currentProfile.country,
      fields.dateOfBirth || currentProfile.dateOfBirth,
      fields.phoneNumber || currentProfile.phoneNumber,
      fields.nationality || currentProfile.nationality,
      fields.email || currentProfile.email,
      fields.kycStatus || currentProfile.kycStatus,
      fields.ssn || currentProfile.ssn,
      fields.tin || currentProfile.tin,
      fields.idVerificationId || currentProfile.idVerificationId,
      fields.idVerifiedAt || currentProfile.idVerifiedAt,
      fields.idRejectedAt || currentProfile.idRejectedAt,
      fields.addressVerificationId || currentProfile.addressVerificationId,
      fields.addressVerifiedAt || currentProfile.addressVerifiedAt,
      fields.addressRejectedAt || currentProfile.addressRejectedAt,
      fields.backgroundCheckPassedAt || currentProfile.backgroundCheckPassedAt,
      fields.backgroundCheckTriedAt || currentProfile.backgroundCheckTriedAt,
      fields.backgroundCheckValidatorId || currentProfile.backgroundCheckValidatorId,
      fields.backgroundCheckRejectedAt || currentProfile.backgroundCheckRejectedAt,
      fields.occupation || currentProfile.occupation,
      fields.employer || currentProfile.employer,
      fields.sourceOfIncome || currentProfile.sourceOfIncome,
      fields.welcomeEmailDeliveredAt || currentProfile.welcomeEmailDeliveredAt,
      fields.welcomeEmailDeliveryFailedAt || currentProfile.welcomeEmailDeliveryFailedAt,
    )
  }

  public skipsAddressVerification(): boolean {
    return countriesWithNoAddressVerifications.includes(this.country);
  }
}
