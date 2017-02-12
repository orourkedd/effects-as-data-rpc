function * test () {
  const s1 = yield { type: 'test' }
  return s1
}

function * testFailure () {
  const s1 = yield { type: 'testFailure' }
  return s1
}

module.exports = {
  test,
  testFailure
}
