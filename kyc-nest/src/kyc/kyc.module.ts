import { Module } from '@nestjs/common';
import { KYCService } from './kyc.service';
import { KYCController } from './kyc.controller';
import { ProfileModule } from 'src/profile/profile.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ProfileModule, ConfigModule.forRoot()],
  providers: [KYCService],
  controllers: [KYCController],
})
export class KycModule {}
