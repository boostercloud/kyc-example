import { Injectable } from '@nestjs/common';
import {
  IDVerificationWebhookMessage,
  AddressVerificationWebhookMessage,
} from './webhook-message.interface';
import { ProfileService } from '../profile/profile.service';

@Injectable()
export class KYCService {
  constructor(private readonly profileService: ProfileService) {}

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
}
