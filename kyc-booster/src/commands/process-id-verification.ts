import { Booster, Command } from '@boostercloud/framework-core'
import { Register, UUID } from '@boostercloud/framework-types'
import { IDVerificationSuccess } from '../events/id-verification-success'
import { IDVerificationRejected } from '../events/id-verification-rejected'
import { isValidTransition } from '../common/state-validation';
import { Profile } from '../entities/profile';

@Command({
  authorize: 'all'
})
export class ProcessIDVerification {
  public constructor(
    readonly userId: UUID,
    readonly verificationId: UUID,
    readonly result: 'success' | 'rejected',
    readonly timestamp: string,
  ) {}

  public static async handle(command: ProcessIDVerification , register: Register): Promise<void> {
    const profile = await Booster.entity(Profile, command.userId)

    // TODO: Ideally, the command payload should include some kind of signature to ensure that it comes
    // from the ID verification service. This is not implemented in this example, but it's a good
    // practice to avoid malicious users to send fake verification results.

    // Reject verification confirmations for unknown profiles
    if (!profile) {
      throw new Error(`Profile with ID ${command.userId} not found`)
    }

    // Ensure that the verification result is valid
    if (command.result !== 'success' && command.result !== 'rejected') {
      throw new Error(`Invalid ID verification result: ${command.result}`)
    }

    // Emit the corresponding event depending on the result, making sure that the transition is valid
    if (command.result === 'success' && isValidTransition(profile, 'KYCIDVerified')) {
      register.events(new IDVerificationSuccess(command.userId, command.verificationId, command.timestamp))
    } else if (command.result === 'rejected' && isValidTransition(profile, 'KYCIDRejected')) {
      register.events(new IDVerificationRejected(command.userId, command.verificationId, command.timestamp))
    } else {
      // Handle invalid state transitions
      throw new Error(`Invalid transition from ${profile.kycStatus} to ${command.result === 'success' ? 'KYCIDVerified' : 'KYCIDRejected'}`)
    }
  }
}
