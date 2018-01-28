const R = require('ramda')
const fs = require('fs-extra')
const execa = require('execa')
const {
  fullChangelog,
  unreleasedChangelog,
} = require('lerna-changelog-helpers')

const getCdVersion = require('./get_cd_version')
const ghBackfill = require('./gh_backfill')
const ghRelease = require('./gh_release')
const ghPr = require('./gh_pr')

const opts = { reject: false, stdio: 'inherit' }

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

const getBranchVersion = async branch => {
  await execa('git', ['remote', 'prune', 'origin'], opts)
  await execa('git', ['fetch', 'origin', branch], opts)
  await execa('git', ['branch', '--track', branch, `origin/${branch}`], opts)
  const { stdout } = await execa('git', ['show', `${branch}:lerna.json`], {
    reject: false,
  })

  try {
    return JSON.parse(stdout).version
  } catch (e) {
    return ''
  }
}

const setVersion = (path, config, version) =>
  fs.writeJson(path, Object.assign({}, config, { version }), { spaces: 2 })

const lernaPublish = flags =>
  execa('lerna', ['publish', '--yes', '--force-publish=*'].concat(flags), opts)

const release = async config => {
  const changelog = await fullChangelog()
  await fs.outputFile('CHANGELOG.md', changelog)
  await execa('git', ['add', '--all', ''], opts)
  await execa('git', ['commit', '-m', '"[ci skip] stable"'], opts)
  await execa('git', ['push', '-u', 'origin', 'master'], opts)
  await execa('git', ['push', '--tags', ''], opts)
  await ghRelease(config)
  await ghBackfill(config)
}

const prerelease = async (config, deployType) => {
  await execa('git', ['push', '-d', 'origin', deployType], opts)
  await execa('git', ['branch', '-D', deployType], opts)
  await execa('git', ['checkout', '-b', deployType], opts)
  await execa('git', ['add', '--all'], opts)
  await execa('git', ['commit', '-m', 'prerelease'], opts)
  await execa('git', ['push', '-u', 'origin', deployType], opts)
  await execa('git', ['push', '--tags', ''], opts)
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
