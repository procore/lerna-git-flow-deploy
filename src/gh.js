const octokit = require('@octokit/rest')

const { GITHUB_AUTH } = process.env

octokit({
  timeout: 5000,
  host: 'api.github.com',
  protocol: 'https',
}).authenticate({
  type: 'oauth',
  token: GITHUB_AUTH,
})

module.exports = {
  pullRequest: octokit.pullRequests.create,
  release: octokit.repos.createRelease,
  merge: octokit.pullRequests.merge,
}
