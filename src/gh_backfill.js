const { pullRequest, merge } = require('./gh')
const promiseRetry = require('promise-retry')
const log = (label, target) => {
  console.log(label);
  return target
}

module.exports = async config => {
  const [owner, repo] = config.deploys.repo.split('/')
  const base = config.deploys.gitflow.develop
  const head = config.deploys.gitflow.master
  const title = `Backfill ${head} -> ${base}`

  const pr = await pullRequest({
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
    .catch(err => console.error(`Backfill pull request failed: ${err}`))

  const mergeConfig = {
    owner,
    repo,
    number: pr.data.number,
    commit_title: `[ci skip] ${title}`,
    commit_message: 'Backfill version from stable',
  }

  const backfill = promiseRetry(
    (retry, attempt) => merge(config).catch(retry),
    { retries: 3 }
  )

  pr &&
    (await backfill)
      .then(() => console.log('Backfill merged'))
      .catch(err => console.error(`Backfill merge failed: ${err}`))
    )
}
