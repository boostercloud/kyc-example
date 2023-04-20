import { Controller, Post, Body, Param } from '@nestjs/common';
import { RelativeService } from './relative.service';
import { Relative } from './relative.entity';

@Controller('profiles/:profileId/relatives')
export class RelativeController {
  constructor(private readonly relativeService: RelativeService) {}

  @Post()
  async create(
    @Param('profileId') profileId: string,
    @Body() relativeData: Relative,
  ): Promise<Relative> {
    return this.relativeService.create(profileId, relativeData);
  }
}
