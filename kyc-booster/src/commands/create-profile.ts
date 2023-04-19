import { Command } from '@boostercloud/framework-core'
import { Register, UUID } from '@boostercloud/framework-types'
import { ProfileCreated } from '../events/profile-created'

@Command({
  authorize: 'all', // Or specify authorized roles
})
export class CreateProfile {
  public constructor(
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
    readonly ssn?: string,
    readonly tin?: string,
  ) {}

  public static async handle(command: CreateProfile, register: Register): Promise<{id: UUID}> {
    const profileId = UUID.generate()
    const kycStatus = 'KYCPending'
    register.events(new ProfileCreated(
      profileId, command.firstName,
      command.lastName,
      command.address,
      command.city,
      command.state,
      command.zipCode,
      command.country,
      command.dateOfBirth,
      command.phoneNumber,
      command.nationality,
      command.email,
      kycStatus,
      command.ssn,
      command.tin
    ))
    return {
      id: profileId,
    }
  }
}
