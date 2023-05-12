import { Module } from '@nestjs/common';
import { KYCService } from './kyc.service';
import { KYCController } from './kyc.controller';
import { ConfigModule } from '@nestjs/config';
import { ProfileModule } from '../profile/profile.module';
import { PromoCodeModule } from '../promo-code/promo-code-module';

@Module({
  imports: [ProfileModule, PromoCodeModule, ConfigModule.forRoot()],
  providers: [KYCService],
  controllers: [KYCController],
})
export class KycModule {}
