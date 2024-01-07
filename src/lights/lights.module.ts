import { Module } from '@nestjs/common';
import { LightsController } from './lights.controller';
import { LightsService } from './lights.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [LightsController],
  providers: [LightsService],
})
export class LightsModule {}
