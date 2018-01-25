const R = require('ramda')
const fs = require('fs-extra')

const { pullRequest, merge } = require('./gh')

module.exports = ({ lernaPath }) =>
  R.pipeP(
    fs.readJson,
    lernaConfig => lernaConfig.deploys.repo.split('/'),
    ([owner, repo]) =>
      pullRequest({
        owner,
        repo,
        base: lernaConfig.deploys.gitflow.develop,
        head: lernaConfig.deploys.gitflow.master,
        title: `Backfill ${lernaConfig.deploys.gitflow.master}`,
      })
        .then(({ data: { number } }) => {
          console.log('Created backfill pull request')

          return [owner, repo, number]
        })
        .catch(console.error('Backfill pull request failed', e)),
    ([owner, repo, number]) =>
      merge({ owner, repo, number, commit_message: 'backfill master' })
        .then(() => console.log('Backfill merged'))
        .catch(e => console.error('Backfill merge failed', e))
  )(lernaPath)
