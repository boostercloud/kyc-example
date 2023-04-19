import { Event } from '@boostercloud/framework-core'
import { UUID } from '@boostercloud/framework-types'
import { KYCStatus } from '../common/types'

@Event
export class ProfileCreated {
  public constructor(
    readonly profileId: UUID,
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
  ) {}

  public entityID(): UUID {
    return this.profileId
  }
}
