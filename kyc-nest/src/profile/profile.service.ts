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
      relations: ['relatives'],
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
    return this.allowedTransitions(currentState).includes(newState);
  }

  private allowedTransitions(currentState: KYCStatus): KYCStatus[] {
    switch (currentState) {
      // Initial state
      case 'KYCPending':
        return ['KYCIDVerified', 'KYCIDRejected'];
      // Step 1: ID Verified, waiting for address verification
      case 'KYCIDVerified':
        return ['KYCAddressVerified', 'KYCAddressRejected'];
      // Step 2: Address verified, waiting for background check
      case 'KYCAddressVerified':
        return [
          'KYCBackgroundCheckPassed',
          'KYCBackgroundCheckRequiresManualReview',
        ];
      // Step 3: Background check suspicious, waiting for manual review
      case 'KYCBackgroundCheckRequiresManualReview':
        return ['KYCBackgroundCheckPassed', 'KYCBackgroundCheckRejected'];
      // Step 4: Background check passed, waiting for risk assessment
      case 'KYCBackgroundCheckPassed':
        return [];
      // Final states
      case 'KYCIDRejected':
      case 'KYCAddressRejected':
      case 'KYCBackgroundCheckRejected':
        return [];
    }
  }
}
