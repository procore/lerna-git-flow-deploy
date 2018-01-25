const R = require('ramda')
const fs = require('fs-extra')
const { unreleasedChangelog } = require('lerna-changelog-helpers')

const { pullRequest } = require('./gh')

module.exports = ({ lernaPath, type }) =>
  R.pipeP(
    readConfig,
    lernaConfig =>
      unreleasedChangelog().then(changelog => [lernaConfig, changelog]),
    ([lernaConfig, body]) => {
      const [owner, repo] = lernaConfig.deploys.repo.split('/')

      return pullRequest({
        owner,
        repo,
        base: lernaConfig.deploys.gitflow.master,
        head: type,
        title: `Release v${lernaConfig.version}`,
        body,
      })
        .then(() =>
          console.log(`Github pull request 'v${lernaConfig.version} created`)
        )
        .catch('Github pull request failed')
    }
  )(lernaPath)
