const { recentChangelog } = require('lerna-changelog-helpers')

const { release } = require('./gh')

module.exports = async config => {
  const [owner, repo] = config.deploys.repo.split('/')
  const tag_name = `v${config.version}`
  const body = await recentChangelog()

  await release({ owner, repo, tag_name, body })
    .then(() => console.log(`Github release '${tag_name} created`))
    .catch(() => console.error('Github release tag failed'))
}
