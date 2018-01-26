const R = require('ramda')
const fs = require('fs-extra')
const { exec } = require('execa-pro')
const {
  fullChangelog,
  unreleasedChangelog,
} = require('lerna-changelog-helpers')

const getCdVersion = require('./get_cd_version')
const ghBackfill = require('./gh_backfill')
const ghRelease = require('./gh_release')
const ghPr = require('./gh_pr')

const buildPublishFlags = ({ tag, preid, publish = {} }, cdVersion) =>
  [
    ['--npm-tag', tag],
    ['--preid', preid],
    ['--cd-version', publish.stable ? 'patch' : cdVersion],
    ['--skip-git', !publish.git],
    ['--skip-npm', !publish.npm],
  ]
    .filter(([_, value]) => value)
    .map(([flag, value]) => `${flag}=${value}`)
    .join(' ')

const getBranchVersion = branch =>
  exec(
    [
      `git fetch origin ${branch}`,
      `git branch --track ${branch} origin/${branch}`,
      `git show ${branch}:lerna.json`,
    ],
    {
      reject: false,
    }
  )
    .then(result => JSON.parse(R.last(result).stdout).version)
    .catch(() => '')

const setVersion = (path, config, version) =>
  fs.writeJson(path, Object.assign({}, config, { version }), { spaces: 2 })

const lernaPublish = flags =>
  exec(`lerna publish --yes --force-publish=* ${flags}`, {
    reject: false,
    stdio: 'inherit',
  })

const release = async config => {
  const changelog = await fullChangelog()
  await fs.outputFile('CHANGELOG.md', changelog)
  await exec(
    [
      'git add --all',
      'git commit -m stable',
      'git push -u origin master',
      'git push --tags',
    ],
    {
      reject: false,
      stdio: 'inherit',
    }
  )
  ghRelease(config)
  ghBackfill(config)
}

const prerelease = async (config, deployType) => {
  await exec(
    [
      `git push -d origin ${deployType}`,
      `git branch -D ${deployType}`,
      `git checkout -b ${deployType}`,
      `git add --all`,
      `git commit -m prerelease`,
      `git push -u origin ${deployType}`,
      'git push --tags',
    ],
    {
      reject: false,
      stdio: 'inherit',
    }
  )
  await ghPr(config, deployType)
}

module.exports = async (lernaPath, lernaConfig, deployType) => {
  const { gitflow, semver, types } = lernaConfig.deploys
  const deploy = types[deployType]

  try {
    const changelog = await unreleasedChangelog()
    const stable = await getBranchVersion(gitflow.master)
    const latest = await getBranchVersion(deployType)
    const version = latest || stable
    const cdVersion = getCdVersion(stable, version, semver, changelog)
    const flags = buildPublishFlags(deploy, cdVersion)
    await setVersion(lernaPath, lernaConfig, version)
    await lernaPublish(flags)
    const config = await fs.readJson(lernaPath)
    deploy.publish.stable
      ? release(config, deployType)
      : prerelease(config, deployType)
  } catch (e) {
    console.error(e)
  }
}
