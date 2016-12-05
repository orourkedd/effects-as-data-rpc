const { run } = require('effects-as-data')
const { curry } = require('ramda')
const express = require('express')
const { json } = require('body-parser')

const routeRpc = (functions, handlers, {fn, payload}) => {
  const f = functions[fn]
  if (!f) {
    return Promise.resolve({
      success: false,
      error: {
        message: `${fn} is not a registered function.`
      }
    })
  }

  return run(handlers, f, payload)
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
  const { path, functions, port, handlers } = config
  const app = express()

  app.use(json())

  app.post(path, (req, res) => {
    const h1 = curry(handleRpcResponse)(res)
    routeRpc(functions, handlers, req.body)
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
