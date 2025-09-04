const core = require('@actions/core');
const { execSync } = require('child_process');

function getFlag(name, value, type = 'boolean') {
  if (type === 'boolean') {
    if (value === undefined || value === null) {
      return '';
    }
    if (value === 'true') {
      return `--${name}`;
    }
    if (value === 'false') {
      return '';
    }
    core.warning(`Unexpected value for boolean flag '${name}': ${value}`);
    return '';
  }
  if (type === 'string' && value) {
    return `--${name}=${value}`;
  }
  return '';
}

function getRepeatableFlag(name, value) {
  if (!value) return [];
  return value.split(',').map(v => `--${name}=${v.trim()}`);
}

function buildTofuInitCommand(inputs) {
  let cmdParts = ['tofu', 'init'];

  // Global option
  if (inputs.chdir) {
    cmdParts = ['tofu', `-chdir=${inputs.chdir}`, 'init'];
  }

  // Flags - only add if different from defaults
  if (inputs.input && inputs.input !== 'true') cmdParts.push(getFlag('input', inputs.input, 'string'));
  if (inputs.lock && inputs.lock !== 'true') cmdParts.push(getFlag('lock', inputs.lock, 'string'));
  if (inputs.lockTimeout && inputs.lockTimeout !== '0s') cmdParts.push(getFlag('lock-timeout', inputs.lockTimeout, 'string'));
  if (inputs.noColor === 'true') cmdParts.push('--no-color');
  if (inputs.upgrade === 'true') cmdParts.push('--upgrade');
  if (inputs.json === 'true') cmdParts.push('--json');
  cmdParts = cmdParts.concat(getRepeatableFlag('var', inputs.var));
  cmdParts = cmdParts.concat(getRepeatableFlag('var-file', inputs.varFile));
  cmdParts.push(getFlag('from-module', inputs.fromModule, 'string'));
  if (inputs.backend && inputs.backend !== 'true') cmdParts.push(getFlag('backend', inputs.backend, 'string'));
  cmdParts = cmdParts.concat(getRepeatableFlag('backend-config', inputs.backendConfig));
  if (inputs.reconfigure === 'true') cmdParts.push('--reconfigure');
  if (inputs.migrateState === 'true') cmdParts.push('--migrate-state');
  if (inputs.forceCopy === 'true') cmdParts.push('--force-copy');
  if (inputs.get && inputs.get !== 'true') cmdParts.push(getFlag('get', inputs.get, 'string'));
  cmdParts.push(getFlag('plugin-dir', inputs.pluginDir, 'string'));
  cmdParts.push(getFlag('lockfile', inputs.lockfile, 'string'));

  // Remove empty strings
  cmdParts = cmdParts.filter(Boolean);

  return cmdParts.join(' ');
}

async function run() {
  try {
    const workingDir = core.getInput('working-directory') || process.cwd();
    
    const inputs = {
      chdir: core.getInput('chdir'),
      input: core.getInput('input'),
      lock: core.getInput('lock'),
      lockTimeout: core.getInput('lock-timeout'),
      noColor: core.getInput('no-color'),
      upgrade: core.getInput('upgrade'),
      json: core.getInput('json'),
      var: core.getInput('var'),
      varFile: core.getInput('var-file'),
      fromModule: core.getInput('from-module'),
      backend: core.getInput('backend'),
      backendConfig: core.getInput('backend-config'),
      reconfigure: core.getInput('reconfigure'),
      migrateState: core.getInput('migrate-state'),
      forceCopy: core.getInput('force-copy'),
      get: core.getInput('get'),
      pluginDir: core.getInput('plugin-dir'),
      lockfile: core.getInput('lockfile')
    };

    const cmd = buildTofuInitCommand(inputs);
    core.info(`Running: ${cmd}`);
    const output = execSync(cmd, { cwd: workingDir, encoding: 'utf-8' });
    core.setOutput('init-output', output);
    core.info('tofu init completed successfully.');
  } catch (error) {
    core.setFailed(error.message);
  }
}

// Export functions for testing
module.exports = {
  getFlag,
  getRepeatableFlag,
  buildTofuInitCommand,
  run
};

// Only run if this file is executed directly
if (require.main === module) {
  run();
}
