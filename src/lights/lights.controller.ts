import { Body, Controller, Get, Post } from '@nestjs/common';
import { LightsService } from './lights.service';
import { ApiTags } from '@nestjs/swagger';
import { DiscoModePayload } from './dto/DiscoModePayload';
import { SetLightsStatePayload } from './dto/SetLightsStatePayload';

@ApiTags('Lights')
@Controller('lights')
export class LightsController {
  constructor(private readonly lightsService: LightsService) {}

  @Get()
  getHost(): string {
    return this.lightsService.getHost();
  }

  @Get('lights')
  getLights(): Promise<string> {
    return this.lightsService.getLights();
  }

  @Post('connect')
  connectToBridge(): Promise<void> {
    return this.lightsService.connect();
  }

  @Post('create-user')
  createUser(): Promise<void> {
    return this.lightsService.createUser();
  }

  @Post('set-bureau-lights-state')
  setBureauLights(@Body() newState: SetLightsStatePayload): Promise<unknown> {
    return this.lightsService.setLightState(newState);
  }

  @Post('set-disco-mode')
  setDiscoMode(@Body() payload: DiscoModePayload): Promise<unknown> {
    return this.lightsService.setDiscoMode(payload);
  }
}
