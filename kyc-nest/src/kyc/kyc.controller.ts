import { Controller, Post, Body } from '@nestjs/common';
import { KYCService } from './kyc.service';
import {
  IDVerificationWebhookMessage,
  AddressVerificationWebhookMessage,
} from './webhook-message.interface';

@Controller('kyc')
export class KYCController {
  constructor(private readonly kycService: KYCService) {}

  @Post('id-verification')
  async handleIDVerificationWebhook(
    @Body() message: IDVerificationWebhookMessage,
  ): Promise<void> {
    await this.kycService.handleIDVerificationWebhook(message);
  }

  @Post('address-verification')
  async handleAddressVerificationWebhook(
    @Body() message: AddressVerificationWebhookMessage,
  ): Promise<void> {
    await this.kycService.handleAddressVerificationWebhook(message);
  }
}
