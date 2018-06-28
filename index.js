const createTestCafe = require('testcafe')
let runner = null
let testcafe = null

createTestCafe('0.0.0.0', 8000)
.then(tc => {
  testcafe = tc
  runner = testcafe.createRunner()

  return testcafe.createBrowserConnection()
})
.then(remoteConnection => {
  // Outputs remoteConnection.url so that it can be visited from the remote browser.
  console.log(remoteConnection.url)

  remoteConnection.once('ready', () => {
    runner.src('test.js')
    .browsers(remoteConnection)
    .run()
    .then(failedCount => {
      console.log(failedCount)
      testcafe.close()
     })
  })
})
