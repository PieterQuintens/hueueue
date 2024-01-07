import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LightsModule } from './lights/lights.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      expandVariables: true,
    }),
    LightsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
