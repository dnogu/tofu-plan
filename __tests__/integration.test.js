const { buildTofuInitCommand } = require('../index');

describe('OpenTofu Init Integration Tests', () => {
  describe('Basic scenarios', () => {
    test('should generate command for basic local development', () => {
      const inputs = {
        var: 'environment=dev'
      };
      expect(buildTofuInitCommand(inputs)).toBe('tofu init --var=environment=dev');
    });

    test('should generate command for production with backend config', () => {
      const inputs = {
        varFile: 'prod.tfvars',
        backendConfig: 'bucket=prod-terraform-state,key=prod/terraform.tfstate,region=us-east-1',
        upgrade: 'true'
      };
      expect(buildTofuInitCommand(inputs)).toBe('tofu init --upgrade --var-file=prod.tfvars --backend-config=bucket=prod-terraform-state --backend-config=key=prod/terraform.tfstate --backend-config=region=us-east-1');
    });
  });

  describe('Backend migration scenarios', () => {
    test('should generate command for migrating from local to remote backend', () => {
      const inputs = {
        backendConfig: 'bucket=new-state-bucket,key=migrated.tfstate',
        migrateState: 'true',
        forceCopy: 'true'
      };
      expect(buildTofuInitCommand(inputs)).toBe('tofu init --backend-config=bucket=new-state-bucket --backend-config=key=migrated.tfstate --migrate-state --force-copy');
    });

    test('should generate command for backend reconfiguration', () => {
      const inputs = {
        backendConfig: 'bucket=updated-bucket,region=us-west-2',
        reconfigure: 'true'
      };
      expect(buildTofuInitCommand(inputs)).toBe('tofu init --backend-config=bucket=updated-bucket --backend-config=region=us-west-2 --reconfigure');
    });
  });

  describe('OpenTofu random resource scenarios', () => {
    test('should generate command for random resource with local backend', () => {
      const inputs = {
        var: 'random_length=16,random_prefix=test',
        backendConfig: 'path=./random.tfstate'
      };
      expect(buildTofuInitCommand(inputs)).toBe('tofu init --var=random_length=16 --var=random_prefix=test --backend-config=path=./random.tfstate');
    });

    test('should generate command for random resource with multiple var files', () => {
      const inputs = {
        varFile: 'common.tfvars,random.tfvars,secrets.tfvars',
        upgrade: 'true',
        var: 'seed_value=12345'
      };
      expect(buildTofuInitCommand(inputs)).toBe('tofu init --upgrade --var=seed_value=12345 --var-file=common.tfvars --var-file=random.tfvars --var-file=secrets.tfvars');
    });

    test('should generate command for random resource in subdirectory with JSON output', () => {
      const inputs = {
        chdir: './modules/random',
        json: 'true',
        noColor: 'true',
        var: 'length=32'
      };
      expect(buildTofuInitCommand(inputs)).toBe('tofu -chdir=./modules/random init --no-color --json --var=length=32');
    });
  });

  describe('Module and plugin scenarios', () => {
    test('should generate command for copying module source', () => {
      const inputs = {
        fromModule: 'github.com/opentofu/example-random-module',
        var: 'module_version=v1.0.0'
      };
      expect(buildTofuInitCommand(inputs)).toBe('tofu init --var=module_version=v1.0.0 --from-module=github.com/opentofu/example-random-module');
    });

    test('should generate command with custom plugin directory', () => {
      const inputs = {
        pluginDir: '/opt/tofu/plugins',
        lockfile: 'readonly'
      };
      expect(buildTofuInitCommand(inputs)).toBe('tofu init --plugin-dir=/opt/tofu/plugins --lockfile=readonly');
    });
  });

  describe('CI/CD scenarios', () => {
    test('should generate command for automated CI pipeline', () => {
      const inputs = {
        input: 'false',
        noColor: 'true',
        upgrade: 'true',
        backendConfig: 'bucket=ci-terraform-state,key=ci/${process.env.BRANCH_NAME || "main"}.tfstate',
        varFile: 'ci.tfvars'
      };
      expect(buildTofuInitCommand(inputs)).toBe('tofu init --input=false --no-color --upgrade --var-file=ci.tfvars --backend-config=bucket=ci-terraform-state --backend-config=key=ci/${process.env.BRANCH_NAME || "main"}.tfstate');
    });

    test('should generate command for automated deployment with force copy', () => {
      const inputs = {
        input: 'false',
        lock: 'false',
        noColor: 'true',
        json: 'true',
        forceCopy: 'true',
        var: 'deployment_id=${Date.now()}'
      };
      expect(buildTofuInitCommand(inputs)).toBe('tofu init --input=false --lock=false --no-color --json --var=deployment_id=${Date.now()} --force-copy');
    });
  });

  describe('Error and edge case scenarios', () => {
    test('should handle empty and undefined inputs gracefully', () => {
      const inputs = {
        var: '',
        varFile: undefined,
        backendConfig: null,
        chdir: ''
      };
      expect(buildTofuInitCommand(inputs)).toBe('tofu init');
    });

    test('should handle mixed valid and invalid inputs', () => {
      const inputs = {
        upgrade: 'true',
        var: 'valid=true',
        varFile: '',
        backendConfig: 'bucket=test',
        invalidOption: 'should-be-ignored'
      };
      expect(buildTofuInitCommand(inputs)).toBe('tofu init --upgrade --var=valid=true --backend-config=bucket=test');
    });
  });

  describe('Complex real-world scenarios', () => {
    test('should generate command for multi-environment setup', () => {
      const inputs = {
        chdir: './environments/staging',
        varFile: 'common.tfvars,staging.tfvars',
        var: 'environment=staging,region=us-east-1,instance_count=2',
        backendConfig: 'bucket=multi-env-state,key=staging/terraform.tfstate,region=us-east-1,dynamodb_table=terraform-locks',
        upgrade: 'true',
        lockTimeout: '300s'
      };
      
      const expected = 'tofu -chdir=./environments/staging init --lock-timeout=300s --upgrade --var=environment=staging --var=region=us-east-1 --var=instance_count=2 --var-file=common.tfvars --var-file=staging.tfvars --backend-config=bucket=multi-env-state --backend-config=key=staging/terraform.tfstate --backend-config=region=us-east-1 --backend-config=dynamodb_table=terraform-locks';
      expect(buildTofuInitCommand(inputs)).toBe(expected);
    });

    test('should generate command for disaster recovery scenario', () => {
      const inputs = {
        backendConfig: 'bucket=disaster-recovery-state,key=dr/terraform.tfstate',
        migrateState: 'true',
        forceCopy: 'true',
        var: 'disaster_recovery=true,backup_region=us-west-2',
        reconfigure: 'true',
        input: 'false'
      };
      
      const expected = 'tofu init --input=false --var=disaster_recovery=true --var=backup_region=us-west-2 --backend-config=bucket=disaster-recovery-state --backend-config=key=dr/terraform.tfstate --reconfigure --migrate-state --force-copy';
      expect(buildTofuInitCommand(inputs)).toBe(expected);
    });
  });
});
