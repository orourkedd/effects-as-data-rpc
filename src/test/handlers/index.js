function test() {
  return { foo: "bar" };
}

function testFailure() {
  return Promise.reject("oops!");
}

module.exports = {
  test,
  testFailure
};
