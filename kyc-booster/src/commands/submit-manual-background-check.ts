import { Booster, Command } from '@boostercloud/framework-core'
import { Register, UUID } from '@boostercloud/framework-types'
import { Profile } from '../entities/profile'
import { isValidTransition } from '../common/state-validation'
import { BackgroundCheckPassed } from '../events/background-check-passed'
import { BackgroundCheckRejected } from '../events/background-check-rejected'

@Command({
  authorize: 'all'
})
export class SubmitManualBackgroundCheck {
  public constructor(
    readonly userId: UUID,
    readonly validatorId: UUID,
    readonly resolution: 'passed' | 'rejected',
    readonly timestamp: string,
  ) {}

  public static async handle(command: SubmitManualBackgroundCheck , register: Register): Promise<void> {
    const profile = await Booster.entity(Profile, command.userId)

    // TODO: Ideally, the command payload should include some kind of signature to ensure that it comes
    // from the ID verification service. This is not implemented in this example, but it's a good
    // practice to avoid malicious users to send fake verification results.

    // Reject verification confirmations for unknown profiles
    if (!profile) {
      throw new Error(`Profile with ID ${command.userId} not found`)
    }

    // Ensure that the background check resolution is valid
    if (command.resolution !== 'passed' && command.resolution !== 'rejected') {
      throw new Error(`Invalid background check resolution: ${command.resolution}`)
    }

    // Emit the corresponding event depending on the resolution, making sure that the transition is valid
    if (command.resolution === 'passed' && isValidTransition(profile.kycStatus, 'KYCBackgroundCheckPassed')) {
      register.events(new BackgroundCheckPassed(command.userId, command.validatorId, command.timestamp))
    } else if (command.resolution === 'rejected' && isValidTransition(profile.kycStatus, 'KYCBackgroundCheckRejected')) {
      register.events(new BackgroundCheckRejected(command.userId, command.validatorId, command.timestamp))
    } else {
      // Handle invalid state transitions
      throw new Error(`Invalid transition from ${profile.kycStatus} to ${command.resolution === 'passed' ? 'KYCBackgroundCheckPassed' : 'KYCBackgroundCheckRejected'}`)
    }
  }
}
