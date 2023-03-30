import { UUID } from '@boostercloud/framework-types'
import { Entity, Reduces } from '@boostercloud/framework-core'
import { ProfileCreated } from '../events/profile-created'
import { KYCStatus } from '../common/types'

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
  ) {}

  @Reduces(ProfileCreated)
  public static reduceProfileCreated(event: ProfileCreated, currentProfile?: Profile): Profile {
    return new Profile(event.profileId, event.firstName, event.lastName, event.address, event.city, event.state, event.zipCode, event.dateOfBirth, event.phoneNumber, event.email, event.kycStatus, event.ssn, event.tin)
  }
}
