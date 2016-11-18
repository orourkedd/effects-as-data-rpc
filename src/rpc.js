const { run } = require('effects-as-data')
const { curry } = require('ramda')
const express = require('express')
const { json } = require('body-parser')

const routeRpc = (pipes, plugins, {fn, payload}) => {
  const pipe = pipes[fn]
  if (!pipe) {
    return Promise.resolve({
      success: false,
      error: {
        message: `${fn} is not a registered function.`
      }
    })
  }

  const state = {
    payload,
    context: {},
    errors: {}
  }

  return run(plugins, pipe, state)
}

const handleRpcResponse = (res, result) => {
  if (result.success === false) {
    res.send(result)
  } else {
    sendRpcResponse(res, result)
  }
}

const sendRpcResponse = (res, result) => {
  res.send(result.payload)
}

const start = (config) => {
  const { pipes, port, plugins } = config
  const app = express()

  app.use(json())

  app.post('/rpc', (req, res) => {
    const h1 = curry(handleRpcResponse)(res)
    routeRpc(pipes, plugins, req.body)
    .then(h1)
    .catch(console.error)
  })

  app.listen(port, () => {
    console.log(`RPC Server Listening on Port ${port}`)
  })
}

module.exports = {
  routeRpc,
  sendRpcResponse,
  handleRpcResponse,
  start
}
