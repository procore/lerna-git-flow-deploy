const { getCdVersion } = require('../get_cd_version')

const STABLE = '3.1.1'
const PREPATCH = '3.1.2-rc.1'
const PREMINOR = '3.2.0-rc.2'
const PREMAJOR = '4.0.0-rc.3'

const CONFIG = {
  major: [':boom: Breaking Change'],
  minor: [':nail_care: Enhancement', ':rocket: New Feature'],
  patch: [':bug: Bug Fix', ':house: Internal', ':books: Dependencies'],
}

const CHANGELOG_BREAKING = ':boom: Breaking Change'
const CHANGELOG_FEATURE = ':rocket: New Feature'
const CHANGELOG_ENHANCEMENT = ':nail_care: Enhancement'
const CHANGELOG_PATCH = ':bug: Bug Fix'

test('diffs versions and returns cd version based on changelog', () => {
  expect(getCdVersion(STABLE, STABLE, CONFIG, CHANGELOG_PATCH)).toEqual('prepatch')
  expect(getCdVersion(STABLE, STABLE, CONFIG, CHANGELOG_ENHANCEMENT)).toEqual('preminor')
  expect(getCdVersion(STABLE, STABLE, CONFIG, CHANGELOG_FEATURE)).toEqual('preminor')
  expect(getCdVersion(STABLE, STABLE, CONFIG, CHANGELOG_BREAKING)).toEqual('premajor')

  expect(getCdVersion(STABLE, PREPATCH, CONFIG, CHANGELOG_PATCH)).toEqual('prerelease')
  expect(getCdVersion(STABLE, PREPATCH, CONFIG, CHANGELOG_ENHANCEMENT)).toEqual('preminor')
  expect(getCdVersion(STABLE, PREPATCH, CONFIG, CHANGELOG_FEATURE)).toEqual('preminor')
  expect(getCdVersion(STABLE, PREPATCH, CONFIG, CHANGELOG_BREAKING)).toEqual('premajor')

  expect(getCdVersion(STABLE, PREMINOR, CONFIG, CHANGELOG_PATCH)).toEqual('prerelease')
  expect(getCdVersion(STABLE, PREMINOR, CONFIG, CHANGELOG_ENHANCEMENT)).toEqual('prerelease')
  expect(getCdVersion(STABLE, PREMINOR, CONFIG, CHANGELOG_FEATURE)).toEqual('prerelease')
  expect(getCdVersion(STABLE, PREMINOR, CONFIG, CHANGELOG_BREAKING)).toEqual('premajor')

  expect(getCdVersion(STABLE, PREMAJOR, CONFIG, CHANGELOG_PATCH)).toEqual('prerelease')
  expect(getCdVersion(STABLE, PREMAJOR, CONFIG, CHANGELOG_ENHANCEMENT)).toEqual('prerelease')
  expect(getCdVersion(STABLE, PREMAJOR, CONFIG, CHANGELOG_FEATURE)).toEqual('prerelease')
  expect(getCdVersion(STABLE, PREMAJOR, CONFIG, CHANGELOG_BREAKING)).toEqual('prerelease')
})
