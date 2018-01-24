const semver = require('semver')
const execa = require('execa')
const fs = require('fs-extra')
const { identity, lensProp, set, pipeP } = require('ramda')
const { unreleasedChangelog } = require('lerna-changelog-helpers')

const getCdVersion = require('./get_cd_version')

const lernaPublish = options =>
  execa(
    'npx',
    ['lerna', 'publish', '--yes', '--force-publish=*'].concat(options)
  )

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
    .filter(identity)

const getBranchVersion = branch =>
  execa('git', ['show', `${branch}:lerna.json`], { reject: false })
    .then(({ stdout }) => JSON.parse(stdout).version)
    .catch(() => '')

const setCurrentVersion = (lernaPath, version) =>
  fs
    .readJson(lernaPath)
    .then(set(lensProp('version'), version))
    .then(updated => fs.writeJson(lernaPath, updated))

const getParams = ({ type, lernaPath }) =>
  fs.readJson(lernaPath).then(lernaConfig => {
    const deployConfig = lernaConfig.deploys
    const semverConfig = deployConfig.semver

    const getCdParams = Promise.all([
      getBranchVersion(deployConfig.branch.stable),
      getBranchVersion(type),
      unreleasedChangelog(),
    ])

    return getCdParams.then(([stable, latest, changelog]) => ({
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

module.exports = ({ type, lernaPath }) =>
  getParams({ type, lernaPath }).then(
    ({ stable, latest, deployConfig, cdVersion }) =>
      pipeP(
        () => setCurrentVersion(lernaPath, latest),
        () =>
          parseReleaseParams(
            Object.assign({}, deployConfig.types[type], { cdVersion })
          ),
        lernaPublish
      )()
  )
