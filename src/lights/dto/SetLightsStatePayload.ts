import { ApiProperty } from '@nestjs/swagger';
import { defaultLightNames } from '../types/constants';

export class MyLightsState {
  @ApiProperty({
    default: {
      red: 0,
      green: 0,
      blue: 0,
    },
  })
  rgb?: {
    red: number;
    green: number;
    blue: number;
  };

  @ApiProperty({ default: 80 })
  brightness: number = 80;

  @ApiProperty({ default: 2700, description: 'Color temperature in Kelvin' })
  colorTemperatureInKelvin?: number = 2700;
}

export class SetLightsStatePayload extends MyLightsState {
  @ApiProperty({ default: defaultLightNames })
  lightNameContains: string[] = defaultLightNames;

  @ApiProperty({ default: 0 })
  delayInSeconds: number = 0;
}
