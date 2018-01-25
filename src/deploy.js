const R = require('ramda')
const fs = require('fs-extra')
const semver = require('semver')
const { exec } = require('execa-pro')
const {
  fullChangelog,
  unreleasedChangelog,
} = require('lerna-changelog-helpers')

const getCdVersion = require('./get_cd_version')
const ghBackfill = require('./gh_backfill')
const ghRelease = require('./gh_release')
const ghPr = require('./gh_pr')

const lernaPublish = options =>
  exec(`npx lerna publish --yes --force-publish=* ${options}`)

const parseParam = ([flag, value]) => (value ? `${flag}=${value}` : '')

const parseReleaseParams = ({ cdVersion, tag, preid, publish = {} }) =>
  [
    ['--npm-tag', tag],
    ['--preid', preid],
    ['--cd-version', publish.stable ? 'patch' : cdVersion],
    ['--skip-git', !publish.git],
    ['--skip-npm', !publish.npm],
  ]
    .map(parseParam)
    .filter(R.identity)
    .join(' ')

const getBranchVersion = branch =>
  exec(`git show ${branch}:lerna.json`, { reject: false })
    .then(([{ stdout }]) => JSON.parse(stdout).version)
    .catch(() => '')

const setCurrentVersion = ({ lernaPath, latest }) =>
  fs
    .readJson(lernaPath)
    .then(R.set(R.lensProp('version'), latest))
    .then(updated => fs.writeJson(lernaPath, updated, { spaces: 2 }))

const getParams = ({ lernaPath, type }) =>
  fs.readJson(lernaPath).then(lernaConfig => {
    const deployConfig = lernaConfig.deploys
    const semverConfig = deployConfig.semver

    return Promise.all([
      getBranchVersion(deployConfig.gitflow.master),
      getBranchVersion(type),
      unreleasedChangelog(),
    ]).then(([stable, latest, changelog]) => ({
      stable,
      latest: latest || stable,
      deployConfig,
      cdVersion: getCdVersion(
        stable,
        latest || stable,
        semverConfig,
        changelog
      ),
    }))
  })

const release = R.pipeP(
  () => fullChangelog(),
  changelog => fs.outputFile('CHANGELOG.md', changelog),
  () =>
    exec(
      [
        'git add --all',
        'git commit -m stable',
        'git push -u origin master',
        'git push --tags',
      ],
      { reject: false, stdio: 'inherit' }
    ),
  ghRelease,
  ghBackfill
)

const prerelease = ({ develop, type }) =>
  R.pipeP(
    () =>
      exec(
        [
          `git push -d origin ${type}`,
          `git branch -D ${type}`,
          `git checkout -b ${type}`,
          `git add --all`,
          `git commit -m prerelease`,
          `git push -u origin ${type}`,
          'git push --tags',
        ],
        { reject: false, stdio: 'inherit' }
      ),
    () => ghPr(type)
  )()

module.exports = ({ type, lernaPath }) =>
  getParams({ lernaPath, type }).then(
    ({ stable, latest, deployConfig, cdVersion }) => {
      const develop = deployConfig.gitflow.develop
      const config = deployConfig.types[type]

      return R.pipeP(
        () => setCurrentVersion({ lernaPath, latest }),
        () => parseReleaseParams(Object.assign({}, config, { cdVersion })),
        lernaPublish,
        () => (config.publish.stable ? release() : null),
        () => (!config.publish.stable ? prerelease({ develop, type }) : null)
      )()
    }
  )
