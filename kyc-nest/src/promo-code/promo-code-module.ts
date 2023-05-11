import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileModule } from '../profile/profile.module';
import { PromoCode } from './promo-code.entity';
import { PromoCodeService } from './promo-code.service';

@Module({
  imports: [TypeOrmModule.forFeature([PromoCode]), ProfileModule],
  providers: [PromoCodeService],
  exports: [PromoCodeService],
})
export class PromoCodeModule {}
