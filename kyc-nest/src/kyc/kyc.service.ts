import { Injectable } from '@nestjs/common';
import { WebhookMessage } from './webhook-message.interface';
import { ProfileService } from '../profile/profile.service';

@Injectable()
export class KYCService {
  constructor(private readonly profileService: ProfileService) {}

  async handleWebhook(message: WebhookMessage): Promise<void> {
    // In a real application, you should verify a signature of the message here
    const userId = message.userId;

    console.log('Received webhook message:', message);

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
}
