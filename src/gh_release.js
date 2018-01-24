const R = require('ramda')
const fs = require('fs-extra')
const findUp = require('find-up')
const { recentChangelog } = require('lerna-changelog-helpers')

const { release } = require('./gh')

module.exports = R.pipeP(
  () =>
    Promise.all([
      R.pipeP(findUp, fs.readJson)('lerna.json'),
      recentChangelog(),
    ]),
  ([lernaConfig, body]) => {
    const [owner, repo] = lernaConfig.deploys.repo.split('/')
    const tag_name = `v${lernaConfig.version}`

    return release({ owner, repo, tag_name, body }).then(result => {
      console.log(`Github release '${tag_name} created`)

      return result
    })
  }
)
