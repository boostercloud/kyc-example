import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoCode } from './promo-code.entity';
import { Profile } from '../profile/profile.entity';
import * as crypto from 'crypto';

@Injectable()
export class PromoCodeService {
  constructor(
    @InjectRepository(PromoCode)
    private relativeRepository: Repository<PromoCode>,
  ) {}

  async create(profile: Profile): Promise<PromoCode> {
    const code = crypto.randomBytes(20).toString('hex');
    const promoCode = this.relativeRepository.create({ code });
    promoCode.profile = profile;

    return this.relativeRepository.save(promoCode);
  }
}
