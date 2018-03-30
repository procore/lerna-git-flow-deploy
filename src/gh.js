const promiseRetry = require('promise-retry')
const octokit = require('@octokit/rest')({
  timeout: 5000,
  host: 'api.github.com',
  protocol: 'https',
})

const { GITHUB_AUTH } = process.env

octokit.authenticate({
  type: 'oauth',
  token: GITHUB_AUTH,
})

const attempt = (cb, otions = { retries: 3 }) =>
  promiseRetry((retry, attempt) => cb().catch(retry), options)

module.exports = {
  attempt,
  pullRequest: octokit.pullRequests.create,
  release: octokit.repos.createRelease,
  merge: octokit.pullRequests.merge,
}
