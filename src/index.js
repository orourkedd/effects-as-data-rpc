const { run, failure } = require('effects-as-data')
const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')

const routeRpc = (functions, handlers, {fn, payload}) => {
  const f = functions[fn]
  if (!f) return Promise.resolve(failure(`${fn} is not a registered function.`))
  return run(handlers, f, payload)
}

const init = (config) => {
  const { path, functions, port, handlers } = config
  const app = new Koa()

  app.use(bodyParser())

  const router = new Router()

  router.post(path, (ctx) => {
    return routeRpc(functions, handlers, ctx.request.body)
    .then((r) => {
      ctx.body = r
    })
    .catch(console.error)
  })

  app
    .use(router.routes())
    .use(router.allowedMethods())

  let serverInstance

  const start = () => {
    return new Promise((resolve, reject) => {
      serverInstance = app.listen(config.port, (err, data) => {
        if (err) return reject(err)
        if (!config.test) console.log(`RPC Server Listening on Port ${port}`)
        resolve()
      })
    })
  }

  let hasBeenStopped = false
  const stop = () => {
    if (hasBeenStopped) return Promise.resolve()
    hasBeenStopped = true
    return new Promise((resolve, reject) => {
      if (!serverInstance) return resolve()
      serverInstance.close((err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  return {
    start,
    stop
  }
}

module.exports = {
  routeRpc,
  init
}
