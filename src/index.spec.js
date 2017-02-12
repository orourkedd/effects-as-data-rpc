const util = require('./util')
const functions = require('./test/functions')
const handlers = require('./test/handlers')
const { init } = require('./index')
const config = {
  path: '/rpc',
  functions,
  handlers,
  port: 9123,
  test: true
}
const { start, stop } = init(config)
const rpc = util.rpc('http://localhost:9123/rpc')
const { deepEqual } = require('assert')

describe('index', () => {
  beforeEach(start)
  afterEach(stop)

  it('should do an rpc', () => {
    return rpc('test').then((r) => {
      deepEqual(r.success, true)
      deepEqual(r.payload, { foo: 'bar' })
    })
  })

  it('should return rpc failures', () => {
    return rpc('testFailure').then((r) => {
      deepEqual(r.success, false)
      deepEqual(r.error, { message: 'oops!' })
    })
  })
})
