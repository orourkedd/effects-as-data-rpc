const {
  normalizeToSuccess,
  normalizeToFailure
} = require('simple-protocol-helpers');
const { run, failure } = require('effects-as-data');
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const { forEach } = require('ramda');

const routeRpc = (functions, handlers, body, config = {}) => {
  const f = functions[body.fn];
  if (!f)
    return Promise.resolve(failure(`${body.fn} is not a registered function.`));
  return run(handlers, f, body, {
    onFailure: config.onFailure || console.error,
    onActionComplete: config.onActionComplete || console.log
  });
};

const init = config => {
  const { path, functions, port, handlers } = config;
  const app = new Koa();

  app.use(bodyParser({ jsonLimit: '50mb' }));

  if (config.middleware) forEach(app.use.bind(app), config.middleware);

  const router = new Router();

  router.post(path, ctx => {
    return routeRpc(functions, handlers, ctx.request.body, {
      onFailure: config.onFailure
    })
      .then(r => {
        ctx.body = normalizeToSuccess(r);
      })
      .catch(err => {
        ctx.body = normalizeToFailure(err);
      });
  });

  app.use(router.routes()).use(router.allowedMethods());

  let serverInstance;

  const start = () => {
    return new Promise((resolve, reject) => {
      serverInstance = app.listen(config.port, (err, data) => {
        if (err) return reject(err);
        if (!config.test) console.log(`RPC Server Listening on Port ${port}`);
        resolve();
      });
    });
  };

  let hasBeenStopped = false;
  const stop = () => {
    if (hasBeenStopped) return Promise.resolve();
    hasBeenStopped = true;
    return new Promise((resolve, reject) => {
      if (!serverInstance) return resolve();
      serverInstance.close(err => {
        if (err) reject(err);
        else resolve();
      });
    });
  };

  return {
    start,
    stop
  };
};

module.exports = {
  routeRpc,
  init
};
