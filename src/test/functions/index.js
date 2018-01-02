function* test() {
  return yield { type: "test" };
  return s1;
}

function* testFailure() {
  return yield { type: "testFailure" };
}

module.exports = {
  test,
  testFailure
};
