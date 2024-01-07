/**
 * Calculates the Mired value based on the given temperature in Kelvin.
 * The temperature must be between 2000K and 6500K.
 * The calculated Mired value should be within the range of 153 to 500.
 *
 * @param tempInKelvin The temperature in Kelvin.
 * @returns The calculated Mired value.
 * @throws {Error} If the temperature is outside the valid range or the calculated Mired value is out of range.
 */
export const calculateMiredValue = (tempInKelvin: number): number => {
  // Ensure the temperature is within the valid range
  if (tempInKelvin < 2000 || tempInKelvin > 6500) {
    throw new Error('Temperature must be between 2000K and 6500K');
  }

  // Calculate the Mired value
  const miredValue = 1000000 / tempInKelvin;

  // Ensure the Mired value is within the valid range
  if (miredValue < 153 || miredValue > 500) {
    throw new Error('Calculated Mired value is out of range (153 - 500)');
  }

  return miredValue;
};
