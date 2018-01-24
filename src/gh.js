const GitHubApi = require('github')

const { GITHUB_AUTH } = process.env

const github = new GitHubApi({
  timeout: 5000,
  host: 'api.github.com',
  protocol: 'https',
})

github.authenticate({
  type: 'oauth',
  token: GITHUB_AUTH,
})

module.exports = {
  pullRequest: github.pullRequests.create,
  release: github.repos.createRelease,
  merge: github.pullRequests.merge
}
