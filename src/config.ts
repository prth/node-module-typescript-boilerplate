import Debug from 'debug';
import readPkg from 'read-pkg';
import { cosmiconfigSync } from 'cosmiconfig';
import * as constants from './constants';
import { ConfigStore } from './config.types';

const debug = Debug(`${constants.MODULE_NAME}:config`);

export default class Config {
  private static instance: Config;
  private configStore: ConfigStore;

  private constructor(configStore) {
    this.configStore = configStore;
  }

  private static getInstance(): Config {
    if (!this.instance) {
      throw new Error('Config not initialized');
    }

    return this.instance;
  }

  private static isConfigStoreValid(configStore: ConfigStore): boolean {
    debug('Validating the config content of rc file');
    if (!configStore || !configStore.someMandatoryConfig) {
      return false;
    }

    return true;
  }

  private static getConfigFromRcFile(): ConfigStore {
    debug('Searching for config rc file');
    const explorerSync = cosmiconfigSync(constants.MODULE_NAME);
    const searchResult = explorerSync.search();

    if (!searchResult) {
      throw new Error('Config not found');
    }

    debug(`Config rc file located at - ${searchResult.filepath}`);
    return searchResult.config as ConfigStore;
  }

  public static init(): void {
    debug('Config initialization started');
    if (this.instance) {
      console.log('Config is already initialized');
      return;
    }

    const configStore = this.getConfigFromRcFile();

    if (!this.isConfigStoreValid(configStore)) {
      throw new Error('Invalid config');
    }

    if (!configStore.project) {
      debug('Config `project` not set in the rc file');
      try {
        debug(
          'Reading package.json of parent project, to get the `name` property as default `project`'
        );
        const packageJSONDetails = readPkg.sync();

        if (packageJSONDetails && packageJSONDetails.name) {
          configStore.project = packageJSONDetails.name;
        } else {
          debug("Did not find `name` property in project's package.json");
        }
      } catch (err) {
        debug("Failed to read project's package.json for `name` property", err);
      }
    }

    this.instance = new Config(configStore);
  }

  public static getConfig(): ConfigStore {
    return this.getInstance().configStore;
  }
}
