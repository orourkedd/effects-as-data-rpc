const util = require("./util");
const { get } = require("simple-protocol-http");
const functions = require("./test/functions");
const handlers = require("./test/handlers");
const { init } = require("./index");
const Router = require("koa-router");

const router = new Router();

router.get("/health-check", ctx => {
  ctx.body = "ok";
});

const config = {
  path: "/rpc",
  functions,
  handlers,
  middleware: [router.routes()],
  port: 9124,
  test: true
};
const { start, stop } = init(config);
const rpc = util.rpc("http://localhost:9124/rpc");
const { deepEqual } = require("assert");

describe("index", () => {
  beforeAll(start);
  afterAll(stop);

  it("should do an rpc", () => {
    return rpc("test").then(r => {
      deepEqual(r.success, true);
      deepEqual(r.payload, { foo: "bar" });
    });
  });

  it("should return rpc failures", () => {
    return rpc("testFailure").then(r => {
      deepEqual(r.success, false);
      deepEqual(r.error, { message: "oops!" });
    });
  });

  it("should use middleware", () => {
    return get("http://localhost:9124/health-check").then(r => {
      deepEqual(r.success, true);
      deepEqual(r.payload, "ok");
    });
  });
});
