import { MyLightsState } from '../dto/SetLightsStatePayload';

export const defaultLightNames = ['living', 'keuken', 'bureau'];

export const discoModeColors: MyLightsState[] = [
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
  //   {
  //     rgb: {
  //       red: 0,
  //       green: 122,
  //       blue: 123,
  //     },
  //     brightness: 100,
  //     colorTemperatureInKelvin: 0,
  //   },
  //   {
  //     rgb: {
  //       red: 122,
  //       green: 123,
  //       blue: 0,
  //     },
  //     brightness: 100,
  //     colorTemperatureInKelvin: 0,
  //   },
];
