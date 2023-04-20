import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileService } from '../profile/profile.service';
import { Relative } from './relative.entity';

@Injectable()
export class RelativeService {
  constructor(
    private readonly profileService: ProfileService,
    @InjectRepository(Relative)
    private relativeRepository: Repository<Relative>,
  ) {}

  async create(
    profileId: string,
    relativeData: Partial<Relative>,
  ): Promise<Relative> {
    const profile = await this.profileService.findById(profileId);

    const relative = this.relativeRepository.create(relativeData);
    relative.profile = profile;

    return this.relativeRepository.save(relative);
  }
}
