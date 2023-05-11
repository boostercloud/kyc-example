import { BackgroundCheckPassed } from '../events/background-check-passed'
import { Booster, EventHandler } from '@boostercloud/framework-core'
import { Register, UUID } from '@boostercloud/framework-types'
import { Profile } from '../entities/profile'
import { PromoCodeCreated } from '../events/promo-code-created'
import { WelcomeEmailDelivered } from '../events/welcome-email-delivered'
import { WelcomeEmailDeliveryFailed } from '../events/welcome-email-delivery-failed'

@EventHandler(BackgroundCheckPassed)
export class SendWelcomeEmail {
  public static async handle(event: BackgroundCheckPassed, register: Register): Promise<void> {
    const mailServiceURLStr = process.env.MAIL_SERVICE_URL
    const mailServiceAPIKey = process.env.MAIL_SERVICE_API_KEY

    const profile = await Booster.entity(Profile, event.profileId);

    if (!profile) {
      throw new Error(`Profile ${event.profileId} not found`);
    }

    const { id, firstName, lastName, email } = profile;
    const profileData = {
      id,
      firstName,
      lastName,
      email,
    };

    let templateId: string
    if (profile.country === 'Wakanda') {
      register.events(new PromoCodeCreated(UUID.generate(), profile.id))
      templateId = 'WakandianSpecialKYCWelcomeEmailTemplate'
    } else {
      templateId = 'KYCWelcomeEmailTemplate'
    }

    if (!mailServiceURLStr) {
      throw new Error(`MAIL_SERVICE_URL not set: ${mailServiceURLStr}`);
    }
    const mailServiceURL = new URL(mailServiceURLStr)

    const mailServiceResponse = await fetch(mailServiceURL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${mailServiceAPIKey}` },
      body: JSON.stringify({
        origin: 'kycService',
        templateId,
        ...profileData,
      }),
    });

    const response = await mailServiceResponse.json();
    if (response.result === 'delivered') {
      register.events(new WelcomeEmailDelivered(profile.id, new Date().toISOString()))
    } else {
      register.events(new WelcomeEmailDeliveryFailed(profile.id, new Date().toISOString()))
    }
  }
}
