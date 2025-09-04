const { getFlag, getRepeatableFlag, buildTofuInitCommand } = require('../index');

// Mock @actions/core to avoid warnings during tests
jest.mock('@actions/core', () => ({
  warning: jest.fn(),
  info: jest.fn(),
  setOutput: jest.fn(),
  setFailed: jest.fn(),
  getInput: jest.fn()
}));

describe('getFlag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return flag for boolean type when value is true', () => {
    expect(getFlag('upgrade', 'true', 'boolean')).toBe('--upgrade');
  });

  test('should return empty string for boolean type when value is false', () => {
    expect(getFlag('upgrade', 'false', 'boolean')).toBe('');
  });

  test('should return empty string for boolean type when value is undefined', () => {
    expect(getFlag('upgrade', undefined, 'boolean')).toBe('');
  });

  test('should return empty string for boolean type when value is null', () => {
    expect(getFlag('upgrade', null, 'boolean')).toBe('');
  });

  test('should return flag with value for string type', () => {
    expect(getFlag('lock-timeout', '30s', 'string')).toBe('--lock-timeout=30s');
  });

  test('should return empty string for string type when value is empty', () => {
    expect(getFlag('lock-timeout', '', 'string')).toBe('');
  });

  test('should return empty string for string type when value is undefined', () => {
    expect(getFlag('lock-timeout', undefined, 'string')).toBe('');
  });
});

describe('getRepeatableFlag', () => {
  test('should return empty array when value is empty', () => {
    expect(getRepeatableFlag('var', '')).toEqual([]);
  });

  test('should return empty array when value is undefined', () => {
    expect(getRepeatableFlag('var', undefined)).toEqual([]);
  });

  test('should return single flag for single value', () => {
    expect(getRepeatableFlag('var', 'foo=bar')).toEqual(['--var=foo=bar']);
  });

  test('should return multiple flags for comma-separated values', () => {
    expect(getRepeatableFlag('var', 'foo=bar,baz=qux')).toEqual([
      '--var=foo=bar',
      '--var=baz=qux'
    ]);
  });

  test('should trim whitespace around comma-separated values', () => {
    expect(getRepeatableFlag('var', 'foo=bar, baz=qux , hello=world')).toEqual([
      '--var=foo=bar',
      '--var=baz=qux',
      '--var=hello=world'
    ]);
  });
});

describe('buildTofuInitCommand', () => {
  test('should generate basic tofu init command with defaults', () => {
    const inputs = {};
    expect(buildTofuInitCommand(inputs)).toBe('tofu init');
  });

  test('should generate command with chdir option', () => {
    const inputs = {
      chdir: './infrastructure'
    };
    expect(buildTofuInitCommand(inputs)).toBe('tofu -chdir=./infrastructure init');
  });

  test('should not add default boolean flags', () => {
    const inputs = {
      input: 'true',
      lock: 'true',
      backend: 'true',
      get: 'true'
    };
    expect(buildTofuInitCommand(inputs)).toBe('tofu init');
  });

  test('should add non-default boolean flags', () => {
    const inputs = {
      input: 'false',
      lock: 'false',
      backend: 'false',
      get: 'false'
    };
    expect(buildTofuInitCommand(inputs)).toBe('tofu init --input=false --lock=false --backend=false --get=false');
  });

  test('should add single boolean flags when true', () => {
    const inputs = {
      noColor: 'true',
      upgrade: 'true',
      json: 'true',
      reconfigure: 'true',
      migrateState: 'true',
      forceCopy: 'true'
    };
    expect(buildTofuInitCommand(inputs)).toBe('tofu init --no-color --upgrade --json --reconfigure --migrate-state --force-copy');
  });

  test('should not add default lock-timeout', () => {
    const inputs = {
      lockTimeout: '0s'
    };
    expect(buildTofuInitCommand(inputs)).toBe('tofu init');
  });

  test('should add non-default lock-timeout', () => {
    const inputs = {
      lockTimeout: '30s'
    };
    expect(buildTofuInitCommand(inputs)).toBe('tofu init --lock-timeout=30s');
  });

  test('should add string flags when provided', () => {
    const inputs = {
      fromModule: 'github.com/opentofu/modules/example',
      pluginDir: '/custom/plugins',
      lockfile: 'readonly'
    };
    expect(buildTofuInitCommand(inputs)).toBe('tofu init --from-module=github.com/opentofu/modules/example --plugin-dir=/custom/plugins --lockfile=readonly');
  });

  test('should add variable flags', () => {
    const inputs = {
      var: 'region=us-east-1,instance_type=t2.micro'
    };
    expect(buildTofuInitCommand(inputs)).toBe('tofu init --var=region=us-east-1 --var=instance_type=t2.micro');
  });

  test('should add variable file flags', () => {
    const inputs = {
      varFile: 'prod.tfvars,secrets.tfvars'
    };
    expect(buildTofuInitCommand(inputs)).toBe('tofu init --var-file=prod.tfvars --var-file=secrets.tfvars');
  });

  test('should add backend config flags', () => {
    const inputs = {
      backendConfig: 'bucket=my-terraform-state,key=prod/terraform.tfstate,region=us-east-1'
    };
    expect(buildTofuInitCommand(inputs)).toBe('tofu init --backend-config=bucket=my-terraform-state --backend-config=key=prod/terraform.tfstate --backend-config=region=us-east-1');
  });

  test('should generate complex command with multiple options', () => {
    const inputs = {
      chdir: './infra',
      upgrade: 'true',
      var: 'env=prod,region=us-west-2',
      varFile: 'common.tfvars,prod.tfvars',
      backendConfig: 'bucket=my-state-bucket,key=prod.tfstate',
      reconfigure: 'true',
      noColor: 'true'
    };
    
    const expected = 'tofu -chdir=./infra init --no-color --upgrade --var=env=prod --var=region=us-west-2 --var-file=common.tfvars --var-file=prod.tfvars --backend-config=bucket=my-state-bucket --backend-config=key=prod.tfstate --reconfigure';
    expect(buildTofuInitCommand(inputs)).toBe(expected);
  });

  test('should handle local backend configuration', () => {
    const inputs = {
      backendConfig: 'path=./terraform.tfstate'
    };
    expect(buildTofuInitCommand(inputs)).toBe('tofu init --backend-config=path=./terraform.tfstate');
  });

  test('should handle migration scenarios', () => {
    const inputs = {
      migrateState: 'true',
      forceCopy: 'true'
    };
    expect(buildTofuInitCommand(inputs)).toBe('tofu init --migrate-state --force-copy');
  });

  test('should handle plugin directory configuration', () => {
    const inputs = {
      pluginDir: '/opt/tofu/plugins'
    };
    expect(buildTofuInitCommand(inputs)).toBe('tofu init --plugin-dir=/opt/tofu/plugins');
  });

  test('should handle lockfile modes', () => {
    const inputs = {
      lockfile: 'readonly'
    };
    expect(buildTofuInitCommand(inputs)).toBe('tofu init --lockfile=readonly');
  });

  test('should handle module copying', () => {
    const inputs = {
      fromModule: 'git::https://github.com/opentofu/example-module.git'
    };
    expect(buildTofuInitCommand(inputs)).toBe('tofu init --from-module=git::https://github.com/opentofu/example-module.git');
  });

  test('should handle JSON output format', () => {
    const inputs = {
      json: 'true',
      noColor: 'true'
    };
    expect(buildTofuInitCommand(inputs)).toBe('tofu init --no-color --json');
  });

  test('should handle all configuration options for OpenTofu random resource scenario', () => {
    const inputs = {
      chdir: './random-resource-example',
      upgrade: 'true',
      var: 'random_length=16,random_prefix=test',
      varFile: 'random.tfvars',
      backendConfig: 'path=./random.tfstate',
      json: 'true',
      noColor: 'true'
    };
    
    const expected = 'tofu -chdir=./random-resource-example init --no-color --upgrade --json --var=random_length=16 --var=random_prefix=test --var-file=random.tfvars --backend-config=path=./random.tfstate';
    expect(buildTofuInitCommand(inputs)).toBe(expected);
  });
});
