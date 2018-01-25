const R = require('ramda')
const fs = require('fs-extra')
const { recentChangelog } = require('lerna-changelog-helpers')

const { release } = require('./gh')

module.exports = ({ lernaPath }) =>
  R.pipeP(
    readConfig,
    lernaConfig =>
      recentChangelog().then(changelog => [lernaConfig, changelog]),
    ([lernaConfig, body]) => {
      const [owner, repo] = lernaConfig.deploys.repo.split('/')
      const tag_name = `v${lernaConfig.version}`

      release({ owner, repo, tag_name, body })
        .then(() => console.log(`Github release '${tag_name} created`))
        .catch(() => console.error('Github release tag failed'))
    }
  )(lernaPath)
