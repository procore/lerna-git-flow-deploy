const promiseRetry = require('promise-retry')

const attempt = (cb, options = { retries: 3 }) =>
  promiseRetry((retry, attempt) => cb().catch(retry), options)

module.exports = attempt
