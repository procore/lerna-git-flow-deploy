const attempt = require('../attempt')

const countDown = n => {
  let count = n
  return () => count--
}

const simulateFailures = num => {
  const failures = countDown(num)
  return () =>
    new Promise((resolve, reject) => {
      failures() ? reject('failure') : resolve('success')
    })
}

test('attempt returns  retriable promise ', done => {
  const ThreeIsACharm = jest.fn(simulateFailures(2))

  attempt(ThreeIsACharm, { minTimeout: 0, maxTimeout: 10 })
    .then(msg => {
      expect(msg).toEqual('success')
      expect(ThreeIsACharm.mock.calls.length).toBe(3)
    })
    .then(done)
    .catch(done)
})

test('attempt fails after 3 failed retry', done => {
  const UnstableFunction = jest.fn(simulateFailures(4))

  attempt(UnstableFunction, { minTimeout: 0, maxTimeout: 10, retries: 3 })
    .catch(err => {
      expect(err).toEqual('failure')
      expect(UnstableFunction.mock.calls.length).toBe(4)
      done()
    })
    .then(done)
})
