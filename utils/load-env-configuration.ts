import { Configuration } from '../bin/configuration';
import * as fs from 'fs';

/**
 * It reads a JSON file from the file system and returns the parsed JSON object
 * @param {string} envName - The name of the environment to load.
 * @returns the parsed JSON object from the environment configuration file.
 */
export function loadEnvironmentConfiguration(envName: string): Configuration {
  const envConfigFile = `environments/${envName}.json`;

  try {
    return JSON.parse(fs.readFileSync(envConfigFile).toString());
  } catch (error) {
    throw new Error(`Could not read environment config file (${envConfigFile})`);
  }
}
