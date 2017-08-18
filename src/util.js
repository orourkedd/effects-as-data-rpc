const { post } = require('simple-protocol-http')
const { curry } = require('ramda')

function rpc(url, fn, payload = {}) {
  return post(url, { fn, payload })
}

module.exports = {
  rpc: curry(rpc)
}
