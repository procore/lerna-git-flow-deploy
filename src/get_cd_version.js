const semver = require('semver')

const STABLE = 'stable'
const PREMINOR = 'preminor'

const versions = {
  [STABLE]: {
    major: 'premajor',
    minor: 'preminor',
    patch: 'prepatch',
  },
  premajor: {
    major: 'prerelease',
    minor: 'prerelease',
    patch: 'prerelease',
  },
  preminor: {
    major: 'premajor',
    minor: 'prerelease',
    patch: 'prerelease',
  },
  prepatch: {
    major: 'premajor',
    minor: 'preminor',
    patch: 'prerelease',
  },
}

const matches = (patterns, changelog) =>
  patterns.some(pattern => changelog.match(pattern))

const getNextCdVersion = (config, changelog) => {
  if (matches(config.major, changelog)) {
    return 'major'
  } else if (matches(config.minor, changelog)) {
    return 'minor'
  } else if (matches(config.patch, changelog)) {
    return 'patch'
  }
}

module.exports = (stable, latest, config, changelog) => {
  const currentCdVersion = semver.diff(stable, latest) || STABLE
  const nextCdVersion = getNextCdVersion(config, changelog)

  return (versions[currentCdVersion] || {})[nextCdVersion] || PREMINOR
}
