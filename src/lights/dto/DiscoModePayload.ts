import { ApiProperty } from '@nestjs/swagger';

export class DiscoModePayload {
  @ApiProperty({ default: 1 })
  interval: number = 1;

  @ApiProperty({ default: 30 })
  duration: number = 30;
}
