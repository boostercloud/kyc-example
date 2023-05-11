import { Booster, Command } from '@boostercloud/framework-core'
import { Register, UUID } from '@boostercloud/framework-types'
import { AddressVerificationSuccess } from '../events/address-verification-success'
import { AddressVerificationRejected } from '../events/address-verification-rejected'
import { isValidTransition } from '../common/state-validation'
import { Profile } from '../entities/profile'

@Command({
  authorize: 'all',
})
export class ProcessAddressVerification {
  public constructor(
    readonly userId: UUID,
    readonly verificationId: UUID,
    readonly result: 'success' | 'rejected',
    readonly timestamp: string
  ) {}

  public static async handle(command: ProcessAddressVerification, register: Register): Promise<void> {
    const profile = await Booster.entity(Profile, command.userId)

    // TODO: Ideally, the command payload should include some kind of signature to ensure that it comes
    // from the address verification service. This is not implemented in this example, but it's a good
    // practice to avoid malicious users sending fake verification results.

    // Reject verification confirmations for unknown profiles
    if (!profile) {
      throw new Error(`Profile with ID ${command.userId} not found`)
    }

    // Reject verification confirmations for profiles that don't need address verification
    if (profile.skipsAddressVerification()) {
      throw new Error('Address verification not supported for people living in invisible countries.')
    }

    // Ensure that the verification result is valid
    if (command.result !== 'success' && command.result !== 'rejected') {
      throw new Error(`Invalid address verification result: ${command.result}`)
    }

    // Emit the corresponding event depending on the result, making sure that the transition is valid
    if (command.result === 'success' && isValidTransition(profile, 'KYCAddressVerified')) {
      register.events(new AddressVerificationSuccess(command.userId, command.verificationId, command.timestamp))
    } else if (command.result === 'rejected' && isValidTransition(profile, 'KYCAddressRejected')) {
      register.events(new AddressVerificationRejected(command.userId, command.verificationId, command.timestamp))
    } else {
      // Handle invalid state transitions
      throw new Error(
        `Invalid transition from ${profile.kycStatus} to ${
          command.result === 'success' ? 'KYCAddressVerified' : 'KYCAddressRejected'
        }`
      )
    }
  }
}
