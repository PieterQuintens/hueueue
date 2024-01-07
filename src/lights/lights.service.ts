import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Hue from 'node-hue-api';
import { Api as HueApi } from 'node-hue-api/dist/esm/api/Api';
import { BridgeDiscoveryResponse } from 'node-hue-api/dist/esm/api/discovery/discoveryTypes';
import * as fs from 'fs';
import { DiscoModePayload } from './dto/DiscoModePayload';
import {
  SetLightsStatePayload,
  MyLightsState,
} from './dto/SetLightsStatePayload';
import { defaultLightNames } from './types/constants';
import { RoomColorAssignment } from './types/room-color-assignment.type';
import { LightIds } from './types/light-id.type';
import { LightsType } from './types/light.type';
import { calculateMiredValue } from './utils/helpers';
import { LightsState } from './types/light-state.type';

@Injectable()
export class LightsService {
  private unauthenticatedApi: HueApi;
  private authenticatedApi: HueApi;

  private host: string;
  private username: string;
  private appName: string;
  private deviceName: string;
  private clientKey: string;

  private lights: LightsType[] = [];

  private lightIds: LightIds[] = [];

  constructor(private configService: ConfigService) {
    this.username = this.configService.get<string>('HUE_USERNAME', {
      infer: true,
    });
    this.clientKey = this.configService.get<string>('HUE_PASSWORD', {
      infer: true,
    });
    this.host = this.configService.get<string>('HUE_HOST', {
      infer: true,
    });
    this.appName = this.configService.get<string>('HUE_APP_NAME', {
      infer: true,
    });
    this.deviceName = this.configService.get<string>('HUE_DEVICE_NAME', {
      infer: true,
    });

    const lightsData = fs.readFileSync('src/lights/lights.json', 'utf-8');
    const lightsFromFile = JSON.parse(lightsData);

    this.lights = lightsFromFile.lights;
    this.lightIds = this.getLightIds();
  }

  async getLights(): Promise<string> {
    if (this.lights.length > 0) {
      console.log('lights already loaded');

      return JSON.stringify(this.lights);
    }

    if (!this.authenticatedApi) {
      console.log('not authenticated yet');

      await this.connect();
    }

    console.log('loading lights');

    this.lights = await this.authenticatedApi.lights.getAll();

    return JSON.stringify(this.lights);
  }

  getLightIds(): LightIds[] {
    const lightIds = this.lights.map((light: any) => ({
      name: light.data.name,
      id: light.data.id,
    }));

    return lightIds;
  }

  async setLightState(state: SetLightsStatePayload): Promise<unknown> {
    const delayInSeconds = state.delayInSeconds || 0;

    const lightNameContains = state.lightNameContains;

    const red = state.rgb?.red || 0;
    const green = state.rgb?.green || 0;
    const blue = state.rgb?.blue || 0;

    let newState: Hue.model.LightState;

    if (state.colorTemperatureInKelvin) {
      const miredValue = calculateMiredValue(state.colorTemperatureInKelvin);

      newState = new LightsState()
        .on()
        .ct(miredValue)
        .brightness(state.brightness);
    } else {
      newState = new LightsState()
        .on()
        .rgb(red, green, blue)
        .brightness(state.brightness);
    }

    await this.connect();

    return new Promise((resolve, reject) => {
      try {
        setTimeout(async () => {
          console.log('setting Light State', state);

          if (!lightNameContains.length) {
            return;
          }

          for (const name of lightNameContains) {
            const roomId = this.lightIds.find((light) =>
              light.name.toUpperCase().includes(name.toUpperCase()),
            );

            const result = await this.authenticatedApi.lights.setLightState(
              roomId.id,
              newState,
            );

            resolve(result);
          }
        }, delayInSeconds * 1000);
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  }

  private discoModeColors: MyLightsState[] = [
    {
      rgb: {
        red: 255,
        green: 0,
        blue: 0,
      },
      brightness: 100,
      colorTemperatureInKelvin: 0,
    },
    {
      rgb: {
        red: 0,
        green: 255,
        blue: 0,
      },
      brightness: 100,
      colorTemperatureInKelvin: 0,
    },
    {
      rgb: {
        red: 0,
        green: 0,
        blue: 255,
      },
      brightness: 100,
      colorTemperatureInKelvin: 0,
    },
    {
      rgb: {
        red: 0,
        green: 122,
        blue: 123,
      },
      brightness: 100,
      colorTemperatureInKelvin: 0,
    },
    {
      rgb: {
        red: 122,
        green: 123,
        blue: 0,
      },
      brightness: 100,
      colorTemperatureInKelvin: 0,
    },
  ];

  colorIndex = 0;

  assignColorsToRooms(
    colors: MyLightsState[],
    rooms: string[],
  ): RoomColorAssignment[] {
    const assignedColors: RoomColorAssignment[] = [];

    rooms.forEach((room, index) => {
      // Calculate the current color index based on the rotation
      const currentColorIndex = (this.colorIndex + index) % colors.length;

      // Assign the color to the room
      assignedColors.push({ room, colorIndex: currentColorIndex });
    });

    this.colorIndex = (this.colorIndex + 1) % colors.length;

    return assignedColors;
  }

  async setAllLightColors(): Promise<void> {
    const roomColors = this.assignColorsToRooms(
      this.discoModeColors,
      defaultLightNames,
    );

    for (const roomColor of roomColors) {
      const lightIds = this.lightIds.find((light) =>
        light.name.toUpperCase().includes(roomColor.room.toUpperCase()),
      );

      const lightState = new LightsState()
        .on()
        .rgb(
          this.discoModeColors[roomColor.colorIndex].rgb.red,
          this.discoModeColors[roomColor.colorIndex].rgb.green,
          this.discoModeColors[roomColor.colorIndex].rgb.blue,
        )
        .brightness(this.discoModeColors[roomColor.colorIndex].brightness);

      await this.authenticatedApi.lights.setLightState(lightIds.id, lightState);
    }

    console.log('Current room colors', roomColors);
  }

  async setDiscoMode(payload: DiscoModePayload): Promise<void> {
    const { interval, duration } = payload;
    const interValMs = interval * 1000;
    const durationMs = duration * 1000;

    await this.connect();

    const intervalId = setInterval(() => this.setAllLightColors(), interValMs);

    setTimeout(() => {
      clearInterval(intervalId);
      console.log('Interval stopped after 10 seconds.');

      this.setLightState(new SetLightsStatePayload());
    }, durationMs);
  }

  async connect(): Promise<void> {
    if (this.authenticatedApi) {
      return;
    }

    try {
      if (!this.host) {
        const result = await Hue.discovery.nupnpSearch();

        this.host = result[0].ipaddress;
      }

      if (this.username && this.clientKey) {
        await this.connectAuthenticated();
      } else {
        await this.connectUnauthenticated();
      }
    } catch (error) {
      console.error(error);
    }
  }

  private async connectAuthenticated(): Promise<void> {
    try {
      this.authenticatedApi = await Hue.api
        .createLocal(this.host)
        .connect(this.username, this.clientKey);
    } catch (error) {
      console.error(error);

      this.connectUnauthenticated();
    }
  }

  private async connectUnauthenticated(): Promise<void> {
    this.unauthenticatedApi = await Hue.api.createLocal(this.host).connect();
  }

  getHost(): string {
    return this.host;
  }

  async createUser() {
    try {
      const createdUser = await this.unauthenticatedApi.users.createUser(
        this.appName,
        this.deviceName,
      );

      console.log(
        '*******************************************************************************\n',
      );
      console.log(
        'User has been created on the Hue Bridge. The following username can be used to\n' +
          'authenticate with the Bridge and provide full local access to the Hue Bridge.\n' +
          'YOU SHOULD TREAT THIS LIKE A PASSWORD\n',
      );
      console.log(`Hue Bridge User: ${createdUser.username}`);
      console.log(`Hue Bridge User Client Key: ${createdUser.clientkey}`);
      console.log(
        '*******************************************************************************\n',
      );

      this.authenticatedApi = await Hue.api
        .createLocal(this.host)
        .connect(createdUser.username);
    } catch (error) {
      if (error.getHueErrorType() === 101) {
        console.error(
          'The Link button on the bridge was not pressed. Please press the Link button and try again.',
        );
      } else {
        console.error(`Unexpected Error: ${error.message}`);
      }
    }
  }

  async getBridge(): Promise<BridgeDiscoveryResponse[]> {
    const result = await Hue.discovery.nupnpSearch();

    return result;
  }
}
