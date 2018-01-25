const { unreleasedChangelog } = require('lerna-changelog-helpers')

const { pullRequest } = require('./gh')

module.exports = async (config, deployType) => {
  const [owner, repo] = config.deploys.repo.split('/')
  const body = await unreleasedChangelog()
  const title = `Prerelease (${deployType}) ${config.version}`

  await pullRequest({
    owner,
    repo,
    base: config.deploys.gitflow.master,
    head: deployType,
    title,
    body,
  })
    .then(() => console.log(`Pull request '${title}' created`))
    .catch(`Pull request '${title} failed`)
}
