const { pullRequest, merge } = require('./gh')

module.exports = async config => {
  const [owner, repo] = config.deploys.repo.split('/')
  const base = config.deploys.gitflow.develop
  const head = config.deploys.gitflow.master
  const title = `Backfill ${head} -> ${base}`

  const result = await pullRequest({
    owner,
    repo,
    base,
    head,
    title,
    body: title,
  })
    .then(res => {
      console.log('Backfill pull request created')
      return res
    })
    .catch(() => console.error('Backfill pull request failed'))

  result &&
    (await merge({
      owner,
      repo,
      number: result.data.number,
      commit_title: `[ci skip] ${title}`,
      commit_message: 'Backfill version from stable',
    })
      .then(() => console.log('Backfill merged'))
      .catch(() => console.error('Backfill merge failed')))
}
