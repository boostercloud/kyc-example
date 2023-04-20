import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelativeController } from './relative.controller';
import { RelativeService } from './relative.service';
import { Relative } from './relative.entity';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [TypeOrmModule.forFeature([Relative]), ProfileModule],
  controllers: [RelativeController],
  providers: [RelativeService],
})
export class RelativeModule {}
