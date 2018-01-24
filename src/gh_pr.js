const R = require('ramda')
const fs = require('fs-extra')
const findUp = require('find-up')
const { unreleasedChangelog } = require('lerna-changelog-helpers')

const { pullRequest } = require('./gh')

module.exports = type =>
  R.pipeP(
    () =>
      Promise.all([
        R.pipeP(findUp, fs.readJson)('lerna.json'),
        unreleasedChangelog(),
      ]),
    ([lernaConfig, body]) => {
      const [owner, repo] = lernaConfig.deploys.repo.split('/')

      return pullRequest({
        owner,
        repo,
        base: lernaConfig.deploys.gitflow.master,
        head: type,
        title: `Release v${lernaConfig.version}`,
        body,
      }).then(result => {
        console.log(`Github pull request 'v${lernaConfig.version} created`)

        return result
      })
    }
  )()
