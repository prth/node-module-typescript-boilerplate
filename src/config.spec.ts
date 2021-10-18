import mkdirp from 'mkdirp';
//import readPkg from 'read-pkg';

/**
 * Mock `fs` to handle config file reads
 */
jest.mock('fs', () => new (require('metro-memory-fs'))());
jest.mock('console');

const MOCK_RC_FILE_LOCATION = `${process.cwd()}/.node-module-typescript-boilerplaterc`;

describe('config', () => {
  let fs;

  beforeEach(() => {
    fs = require('fs');

    const configSample = {
      project: 'mystery',
      someMandatoryConfig: 'just-a-value',
    };
    mkdirp.sync(process.cwd(), { fs });
    fs.writeFileSync(MOCK_RC_FILE_LOCATION, JSON.stringify(configSample));

    jest.spyOn(fs, 'readFileSync');
    jest.spyOn(global.console, 'log');
  });

  afterEach(() => {
    fs.reset();
    jest.resetAllMocks();
    jest.resetModules();
  });

  test('getConfig() returns the entire config response for the APP', () => {
    const Config = require('./config').default;
    Config.init();
    const res = Config.getConfig();

    expect(res).toEqual({
      project: 'mystery',
      someMandatoryConfig: 'just-a-value',
    });
    expect(fs.readFileSync).toBeCalledTimes(2);
  });

  test('getConfig() should throw error if config if not initalized', () => {
    const Config = require('./config').default;
    expect(() => {
      Config.getConfig();
    }).toThrowError(new Error('Config not initialized'));
  });

  test('init() should initialize only once, and should not repeat file repeats for config files', () => {
    const Config = require('./config').default;
    Config.init();

    /**
     * 2 file read operations are done by the `cosmiconfig` library,
     * to find the ".alertpandarc" file, thats declared in the tests mock
     */
    expect(fs.readFileSync).toBeCalledTimes(2);

    Config.init();
    Config.init();

    // even after calling init() multiple times, it should not increase file read operations;
    expect(fs.readFileSync).toBeCalledTimes(2);
    expect(console.log).toBeCalledTimes(2);
  });

  test('init() should not initialize with invalid config', () => {
    fs.writeFileSync(
      MOCK_RC_FILE_LOCATION,
      JSON.stringify({ invalid: 'config' })
    );
    const Config = require('./config').default;

    expect(() => {
      Config.init();
    }).toThrowError(new Error('Invalid config'));
  });

  test('init() should throw not found error with missing file', () => {
    fs.unlinkSync(MOCK_RC_FILE_LOCATION);
    const Config = require('./config').default;

    expect(() => {
      Config.init();
    }).toThrowError(new Error('Config not found'));
  });

  describe(`Using parent project's package.json properties for config`, () => {
    let mockDebugInstance;

    beforeEach(() => {
      // set up the config rc file, without `project` property
      const configWithoutProjectSample = JSON.stringify({
        someMandatoryConfig: 'just-a-value',
      });
      fs.writeFileSync(MOCK_RC_FILE_LOCATION, configWithoutProjectSample);

      // set up the package.json, with name property
      fs.writeFileSync(
        `${process.cwd()}/package.json`,
        JSON.stringify({
          name: 'some-awesome-project',
        })
      );

      mockDebugInstance = jest.fn();
      jest.mock('debug', () => () => mockDebugInstance);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    test('init() should set `name` from package.json as default, if `project` is missing in rc config', () => {
      const Config = require('./config').default;
      Config.init();

      expect(Config.getConfig().project).toEqual('some-awesome-project');
    });

    test('init() should not fail if reading package.json throws error', () => {
      // delete the `package.json`, so that readPkg throws an error
      fs.unlinkSync(`${process.cwd()}/package.json`);

      const Config = require('./config').default;
      Config.init();

      expect(Config.getConfig().project).toBeUndefined();
      expect(mockDebugInstance.mock.calls.length).toBeGreaterThan(1);

      const lastDebugArgs =
        mockDebugInstance.mock.calls[mockDebugInstance.mock.calls.length - 1];

      expect(lastDebugArgs[0]).toEqual(
        "Failed to read project's package.json for `name` property"
      );
    });

    test('init() should not fail if package.json does not have name', () => {
      // set up the package.json, without name property
      fs.writeFileSync(`${process.cwd()}/package.json`, JSON.stringify({}));

      const Config = require('./config').default;
      Config.init();

      expect(Config.getConfig().project).toBeUndefined();
      expect(mockDebugInstance.mock.calls.length).toBeGreaterThan(1);

      const lastDebugArgs =
        mockDebugInstance.mock.calls[mockDebugInstance.mock.calls.length - 1];

      expect(lastDebugArgs[0]).toEqual(
        "Did not find `name` property in project's package.json"
      );
    });
  });
});
