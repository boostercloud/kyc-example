import { Injectable } from '@nestjs/common';
import {
  IDVerificationWebhookMessage,
  AddressVerificationWebhookMessage,
  ManualBackgroundCheckMessage,
} from './api-messages.interface';
import { ProfileService } from '../profile/profile.service';
import { Profile } from 'src/profile/profile.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KYCService {
  constructor(
    private readonly profileService: ProfileService,
    private configService: ConfigService,
  ) {}

  async handleIDVerificationWebhook(
    message: IDVerificationWebhookMessage,
  ): Promise<void> {
    // In a real application, you should verify a signature of the message here
    const userId = message.userId;

    console.log('Received ID verification webhook message:', message);

    if (message.result === 'success') {
      await this.profileService.update(userId, {
        kycStatus: 'KYCIDVerified',
        idVerificationId: message.verificationId,
        idVerifiedAt: message.timestamp,
      });
    } else if (message.result === 'rejected') {
      await this.profileService.update(userId, {
        kycStatus: 'KYCIDRejected',
        idVerificationId: message.verificationId,
        idRejectedAt: message.timestamp,
      });
    } else {
      console.error('Unknown ID verification result:', message.result);
    }
  }

  async handleAddressVerificationWebhook(
    message: AddressVerificationWebhookMessage,
  ): Promise<void> {
    // In a real application, you should verify a signature of the message here
    const userId = message.userId;

    console.log('Received address verification webhook message:', message);

    if (message.result === 'success') {
      await this.profileService.update(userId, {
        kycStatus: 'KYCAddressVerified',
        addressVerificationId: message.verificationId,
        addressVerifiedAt: message.timestamp,
      });

      await this.performBackgroundCheck(userId);
    } else if (message.result === 'rejected') {
      await this.profileService.update(userId, {
        kycStatus: 'KYCAddressRejected',
        addressVerificationId: message.verificationId,
        addressRejectedAt: message.timestamp,
      });
    } else {
      console.error('Unknown address verification result:', message.result);
    }
  }

  async submitManualBackgroundCheck(
    payload: ManualBackgroundCheckMessage,
  ): Promise<void> {
    const { userId, validatorId, resolution, timestamp } = payload;
    if (resolution === 'passed') {
      await this.profileService.update(userId, {
        kycStatus: 'KYCBackgroundCheckPassed',
        backgroundCheckManualValidatorId: validatorId,
        backgroundCheckPassedAt: timestamp,
      });
    } else {
      await this.profileService.update(userId, {
        kycStatus: 'KYCBackgroundCheckRejected',
        backgroundCheckManualValidatorId: validatorId,
        backgroundCheckRejectedAt: timestamp,
      });
    }
  }

  private async performBackgroundCheck(profileId: string): Promise<void> {
    const profile = await this.profileService.findById(profileId);

    const passedOFACTest = await this.checkOFACListInclusion(profile);
    const passedPEPTest = await this.checkPEPListInclusion(profile);

    if (passedOFACTest && passedPEPTest) {
      await this.profileService.update(profileId, {
        kycStatus: 'KYCBackgroundCheckPassed',
        backgroundCheckPassedAt: new Date().toISOString(),
      });
    } else {
      await this.profileService.update(profileId, {
        kycStatus: 'KYCBackgroundCheckRequiresManualReview',
        backgroundCheckTriedAt: new Date().toISOString(),
      });
    }
  }

  private async checkOFACListInclusion(profile: Profile): Promise<boolean> {
    const ofacProxyURL = this.configService.get<string>('OFAC_PROXY_URL');
    const ofacProxyAPIKey =
      this.configService.get<string>('OFAC_PROXY_API_KEY');

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

  private async checkPEPListInclusion(profile: Profile): Promise<boolean> {
    const pepProxyURL = this.configService.get<string>('PEP_PROXY_URL');
    const pepProxyAPIKey = this.configService.get<string>('PEP_PROXY_API_KEY');

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
