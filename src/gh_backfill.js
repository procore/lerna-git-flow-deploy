const R = require('ramda')
const fs = require('fs-extra')
const findUp = require('find-up')

const { pullRequest, merge } = require('./gh')

module.exports = type =>
  R.pipeP(
    () => R.pipeP(findUp, fs.readJson)('lerna.json'),
    ([lernaConfig, body]) => {
      const [owner, repo] = lernaConfig.deploys.repo.split('/')

      return R.pipeP(
        () =>
          pullRequest({
            owner,
            repo,
            base: lernaConfig.deploys.gitflow.master,
            head: lernaConfig.deploys.gitflow.develop,
            title: `Backfill master`,
            body: 'Backfill master',
          }).then(({ number }) => {
            console.log('Created pull request for backfill')

            return number
          }),
        number =>
          merge({ owner, repo, number, commit_message: 'Backfill master' })
      )
    }
  )
