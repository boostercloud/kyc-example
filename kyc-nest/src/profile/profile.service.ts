import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { KYCStatus, Profile } from './profile.entity';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async create(profileData: Profile): Promise<Profile> {
    const newProfile = this.profileRepository.create({
      ...profileData,
      kycStatus: 'KYCPending',
    });
    await this.profileRepository.save(newProfile);
    return newProfile;
  }

  async update(userId: string, profileData: Partial<Profile>): Promise<void> {
    const profile = await this.findById(userId);

    if (
      profileData.kycStatus &&
      !this.isValidTransition(profile.kycStatus, profileData.kycStatus)
    ) {
      throw new BadRequestException(
        `Invalid status transition from '${profile.kycStatus}' to '${profileData.kycStatus}'`,
      );
    }

    await this.profileRepository.update(userId, profileData);
  }

  async findAll(): Promise<Profile[]> {
    return this.profileRepository.find();
  }

  async findById(id: string): Promise<Profile> {
    const options: FindOneOptions<Profile> = {
      where: { id },
    };

    const profile = await this.profileRepository.findOne(options);
    if (!profile) {
      throw new NotFoundException(`Profile with ID "${id}" not found`);
    }
    return profile;
  }

  private isValidTransition(
    currentState: KYCStatus,
    newState: KYCStatus,
  ): boolean {
    const allowedTransitions: Record<KYCStatus, Array<KYCStatus>> = {
      KYCPending: ['KYCIDVerified', 'KYCIDRejected'],
      KYCIDVerified: [],
      KYCIDRejected: [],
    };

    return allowedTransitions[currentState]?.includes(newState);
  }
}
