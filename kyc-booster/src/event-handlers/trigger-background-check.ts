import { AddressVerificationSuccess } from '../events/address-verification-success'
import { Booster, EventHandler } from '@boostercloud/framework-core'
import { Register } from '@boostercloud/framework-types'
import { Profile } from '../entities/profile';
import { BackgroundCheckManualReviewRequired } from '../events/background-check-manual-review-required';
import { BackgroundCheckPassed } from '../events/background-check-passed';
import { IDVerificationSuccess } from '../events/id-verification-success';

@EventHandler(IDVerificationSuccess)
@EventHandler(AddressVerificationSuccess)
export class TriggerBackgroundCheck {
  public static async handle(event: IDVerificationSuccess | AddressVerificationSuccess, register: Register): Promise<void> {
    const profile = await Booster.entity(Profile, event.profileId);

    if (!profile) {
      throw new Error(`Profile ${event.profileId} not found`);
    }

    // If the profile is set to skip address verification, we should never receive an AddressVerificationSuccess event
    if (event instanceof AddressVerificationSuccess && profile.skipsAddressVerification()) {
      throw new Error(`AddressVerificationSuccess should have never happened for profile ${event.profileId}, because ${profile.country} is invisible.`);
    }

    // If the profile is not set to skip address verification, we should never receive an IDVerificationSuccess event
    if (event instanceof IDVerificationSuccess && !profile.skipsAddressVerification()) {
      throw new Error(`IDVerificationSuccess should have never happened for profile ${event.profileId}, because ${profile.country} is not an visible country.`);
    }

    const passedOFACTest = await this.checkOFACListInclusion(profile);
    const passedPEPTest = await this.checkPEPListInclusion(profile);

    if (passedOFACTest && passedPEPTest) {
      register.events(new BackgroundCheckPassed(event.profileId, 'auto', new Date().toTimeString()));
    } else {
      register.events(new BackgroundCheckManualReviewRequired(event.profileId, new Date().toTimeString()))
    }
  }

  private static async checkOFACListInclusion(profile: Profile): Promise<boolean> {
    const ofacProxyURLStr = process.env.OFAC_PROXY_URL
    if (!ofacProxyURLStr) {
      throw new Error(`OFAC_PROXY_URL not set: ${ofacProxyURLStr}`);
    }
    const ofacProxyURL = new URL(ofacProxyURLStr);
    const ofacProxyAPIKey = process.env.OFAC_PROXY_API_KEY;

    const ofacResponse = await fetch(ofacProxyURL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${ofacProxyAPIKey}` },
      body: JSON.stringify({
        origin: 'kycService',
        profile_id: profile.id,
        type: 'individual',
        program: 'all',
        first_name: profile.firstName,
        last_name: profile.lastName,
        date_of_birth: profile.dateOfBirth,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        zip_code: profile.zipCode,
        country: profile.country,
        nationality: profile.nationality,
      }),
    });
    const ofacRes = await ofacResponse.json();
    return ofacRes.result === 'clear';
  }

  private static async checkPEPListInclusion(profile: Profile): Promise<boolean> {
    const pepProxyURLStr = process.env.PEP_PROXY_URL;
    if (!pepProxyURLStr) {
      throw new Error(`PEP_PROXY_URL not set: ${pepProxyURLStr}`);
    }
    const pepProxyURL = new URL(pepProxyURLStr);
    const pepProxyAPIKey = process.env.PEP_PROXY_API_KEY;

    const pepResponse = await fetch(pepProxyURL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${pepProxyAPIKey}` },
      body: JSON.stringify({
        origin: 'kycService',
        profile_id: profile.id,
        first_name: profile.firstName,
        last_name: profile.lastName,
        date_of_birth: profile.dateOfBirth,
        nationality: profile.nationality,
      }),
    });
    const pepData = await pepResponse.json();
    return pepData.result === 'clear';
  }
}
