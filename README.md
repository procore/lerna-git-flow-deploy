# lerna-git-flow-deploy

Configure your `lerna publish` deploys with ease. Works well with a `git-flow` development cycle.

## Requirements

`lerna` configuration
`lerna-changelog` configuration

## Features
- SemVer based on `lerna-changelog` labels
- GH Release creation
- GH Prerelease pull request creation
- Auto backfill

## Run `lerna-deploy`:

```sh
lerna-deploy --help

Options:
  --version  Show version number                       [boolean]
  --help     Show help                                 [boolean]
  --type                                       [default: "next"]

Examples:
  lerna-deploy                    publish next candidate release
  lerna-deploy --type=stable              publish stable release
```

## Example `lerna.json` config:

```json
{
  "version": "1.0.0",
  "lerna": "2.8.0",
  "packages": ["packages/*"],
  "npmClient": "yarn",
  "useWorkspaces": true,
  "parallel": true,
  "message": "[ci skip] publish %s",
  "changelog": {
    "repo": "farism/lerna-git-flow-deploy-example",
    "labels": {
      "Tag: Breaking Change": ":boom: Breaking Change",
      "Tag: Bug Fix": ":bug: Bug Fix",
      "Tag: New Feature": ":rocket: New Feature"
    },
    "cacheDir": ".changelog"
  },
  "deploys": {
    "repo": "farism/lerna-git-flow-deploy-example",
    "semver": {
      "major": [":boom: Breaking Change"],
      "minor": [":rocket: New Feature"],
      "patch": [":bug: Bug Fix"]
    },
    "gitflow": {
      "master": "master",
      "develop": "develop"
    },
    "types": {
      "stable": {
        "tag": "latest",
        "publish": {
          "stable": true,
          "npm": true,
          "git": true
        }
      },
      "next": {
        "preid": "rc",
        "tag": "next",
        "publish": {
          "npm": true,
          "git": false
        }
      }
    }
  }
}
```
