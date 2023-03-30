import { Controller, Post, Body } from '@nestjs/common';
import { KYCService } from './kyc.service';
import { WebhookMessage } from './webhook-message.interface';

@Controller('kyc')
export class KYCController {
  constructor(private readonly kycService: KYCService) {}

  @Post('webhook')
  async handleWebhook(@Body() message: WebhookMessage): Promise<void> {
    await this.kycService.handleWebhook(message);
  }
}
