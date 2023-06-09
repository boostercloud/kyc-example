import { Controller, Get, Param, Post, Body, Put } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Profile } from './profile.entity';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  async create(@Body() profileData: Profile): Promise<Profile> {
    return this.profileService.create(profileData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() profileData: Partial<Profile>,
  ): Promise<void> {
    return this.profileService.update(id, profileData);
  }

  @Get()
  async findAll(): Promise<Profile[]> {
    return this.profileService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Profile> {
    return this.profileService.findById(id);
  }
}
