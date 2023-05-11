import { WelcomeEmailDelivered } from '../events/welcome-email-delivered'
import { Booster, EventHandler } from '@boostercloud/framework-core'
import { Register } from '@boostercloud/framework-types'
import { WelcomeEmailDeliveryFailed } from '../events/welcome-email-delivery-failed'
import { KYCCompleted } from '../events/kyc-completed'
import { isValidTransition } from '../common/state-validation'
import { Profile } from '../entities/profile'

@EventHandler(WelcomeEmailDelivered)
@EventHandler(WelcomeEmailDeliveryFailed)
export class CompleteKYC {
  public static async handle(event: WelcomeEmailDelivered, register: Register): Promise<void> {
    const profile = await Booster.entity(Profile, event.profileId)

    if (!profile) {
      throw new Error(`Profile ${event.profileId} not found`)
    }

    if (isValidTransition(profile, 'KYCCompleted')) {
      register.events(new KYCCompleted(event.profileId))
    } else {
      throw new Error(`Invalid state transition for profile ${event.profileId} while completing KYC. Current state: ${profile.kycStatus}`)
    }
  }
}
