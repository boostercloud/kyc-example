import { Controller, Post, Body } from '@nestjs/common';
import { KYCService } from './kyc.service';
import {
  IDVerificationWebhookMessage,
  AddressVerificationWebhookMessage,
  ManualBackgroundCheckMessage,
} from './api-messages.interface';

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

  @Post('submit-manual-background-check')
  async submitManualBackgroundCheck(
    @Body() payload: ManualBackgroundCheckMessage,
  ): Promise<void> {
    await this.kycService.submitManualBackgroundCheck(payload);
  }
}
