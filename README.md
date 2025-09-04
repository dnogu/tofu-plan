# GitHub Tofu Init Action

This GitHub Action runs `tofu init` with all supported options, automating OpenTofu initialization in your CI/CD workflows.

## Quick Start

The most basic usage - initialize OpenTofu in your current directory:

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: dnogu/tofu-init@v1
```

## Usage

```yaml
name: Initialize OpenTofu
on:
  push:
    branches: [ main ]
jobs:
  tofu-init:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Run tofu init
        uses: dnogu/tofu-init@v1
        with:
          working-directory: ./infra
          upgrade: true
          backend-config: "key1=value1,key2=value2"
          var: "foo=bar,bar=baz"
          var-file: "variables.tfvars"
          reconfigure: false
          force-copy: false
          input: true
          lock: true
          lock-timeout: "30s"
          no-color: false
          json: false
          from-module: "github.com/opentofu/modules/example"
          backend: true
          migrate-state: false
          get: true
          plugin-dir: ""
          lockfile: ""

```

## Inputs

| Name              | Description                                                                 | Default      |
|-------------------|-----------------------------------------------------------------------------|-------------|
| working-directory | The directory in which to run tofu init.                                    | `.`         |
| chdir             | Switch working directory before executing tofu init (--chdir).               | `''`        |
| input             | Ask for input if necessary (--input=true|false).                            | `true`      |
| lock              | Enable or disable state locking (--lock=true|false).                        | `true`      |
| lock-timeout      | Override the time to wait for a state lock (--lock-timeout=<duration>).      | `0s`        |
| no-color          | Disable color codes in output (--no-color).                                 | `false`     |
| upgrade           | Upgrade modules and plugins (--upgrade).                                    | `false`     |
| json              | Produce output in JSON format (--json).                                     | `false`     |
| var               | Set input variable(s) (--var NAME=VALUE, comma separated or repeatable).     | `''`        |
| var-file          | Set input variables from file(s) (--var-file=FILENAME, comma separated).     | `''`        |
| from-module       | Copy a source module before initialization (--from-module=MODULE-SOURCE).    | `''`        |
| backend           | Enable or disable backend initialization (--backend=true|false).             | `true`      |
| backend-config    | Backend config file or key=value pairs (--backend-config=..., repeatable).   | `''`        |
| reconfigure       | Reconfigure the backend (--reconfigure).                                    | `false`     |
| migrate-state     | Migrate state to new backend (--migrate-state).                             | `false`     |
| force-copy        | Force copy state from previous backend (--force-copy).                      | `false`     |
| get               | Enable or disable child module installation (--get=true|false).             | `true`      |
| plugin-dir        | Force plugin installation from a specific directory (--plugin-dir=PATH).     | `''`        |
| lockfile          | Set dependency lockfile mode (--lockfile=readonly|... ).                    | `''`        |

## Outputs

| Name         | Description                      |
|--------------|----------------------------------|
| init-output  | The output from tofu init.       |


## Examples

### Basic Tofu Init
```yaml
steps:
  - name: Checkout code
    uses: actions/checkout@v4
  
  - name: Setup OpenTofu
    uses: opentofu/setup-opentofu@v1
    with:
      tofu_version: '1.8.0'
  
  - name: Run Basic Tofu Init
    uses: dnogu/tofu-init@v1
    with:
      working-directory: ./infra
```

### Tofu Init With Backend Config
```yaml
steps:
  - name: Checkout code
    uses: actions/checkout@v4
  
  - name: Setup OpenTofu
    uses: opentofu/setup-opentofu@v1
    with:
      tofu_version: '1.8.0'
  
  - name: Run tofu init with backend config
    uses: dnogu/tofu-init@v1
    with:
      working-directory: ./infra
      backend-config: "bucket=my-bucket,region=us-east-1"
```

## Author

- dnogu 
# tofu-plan
