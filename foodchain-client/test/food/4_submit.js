import { Selector, RequestMock, ClientFunction } from 'testcafe'

fixture
('Submit Signed Food')
.page(`http://localhost:8002/test/fixture/foodPage.html`)

const submitButton = Selector('.submitButton')
const submittedFoodItem = Selector('food-item[data-status="SUBMITTED"]')

const injectApple = ClientFunction(() => {
  let data = {
    name: 'apple',
    food: {
      name: 'apple',
      Protein: 0.5,
      Energy: 95
    },
    status: 'SIGNED',
    transaction: {headerSignature: '16e6a9f751a3'},
    timeStamp: Date.now()
  }

  return new Promise((resolve, reject) => {
    let worker = new Worker('../../src/indexedDBWorker.js')
    worker.postMessage(['InsertNewFood', [data]])
    worker.onmessage = (e) => {
      if (e.data[0] === 'NewFoodInserted') resolve(e.data[1])
    }
    worker.onerror = (e) => {
      worker.terminate()
      reject(e)
    }
  })
})

const injectBanana = ClientFunction(() => {
  let data = {
    name: 'banana',
    food: {
      name: 'banana',
      Protein: 1.3,
      Energy: 105
    },
    status: 'SIGNED',
    transaction: {headerSignature: '26e6a9f751a3'},
    timeStamp: Date.now()
  }

  return new Promise((resolve, reject) => {
    let worker = new Worker('../../src/indexedDBWorker.js')
    worker.postMessage(['InsertNewFood', [data]])
    worker.onmessage = (e) => {
      if (e.data[0] === 'NewFoodInserted') resolve(e.data[1])
    }
    worker.onerror = (e) => {
      worker.terminate()
      reject(e)
    }
  })
})

const getFoodData = ClientFunction(() => {
  return new Promise((resolve, reject) => {
    worker.postMessage(['GetAllFoodItems'])
    worker.onmessage = function (event) {
      resolve(event.data[1])
    }
  })
})

const clearFoodStore = ClientFunction(() => {
  return new Promise((resolve, reject) => {
    worker.postMessage(['ClearStore', 'food'])
    worker.onmessage = (event) => {
      if (event.data[0] !== 'StoreCleared') reject(new Error('Food cant be cleared'))
      if (event.data[1] !== 'food') reject(new Error('Food cant be cleared'))
      resolve()
    }
    worker.onerror = (error) => {
      reject(error)
    }
  })
})

const goodSubmission = RequestMock()
.onRequestTo(/\/batches/)
.respond({link:'https://bismuth83.net//batch_statuses?id=35e805cddc'}, 200)

test
.before(async t => {
  await injectApple()
  await t.eval(() => { window.location.reload() })

})
('Pending food submition', async t => {
  await t.expect(submitButton.hasAttribute('hidden')).notOk('should reveal submit button')
})
.after(async t => {
  await clearFoodStore()
})

test
.requestHooks(goodSubmission)
.before(async t => {
  await injectApple()
  await t.eval(() => { window.location.reload() })
  await t.click(submitButton)
})
('successful submition', async t => {
  let foodData = await getFoodData()
  await t.expect(submittedFoodItem.exists).ok('food-item should have became SUBMITTED')
  await t.expect(foodData[0].status).eql('SUBMITTED', 'should update status to SUBMITTED')
  await t.expect(foodData[0].batchID).eql('35e805cddc', 'should update data with batchID')
})
.after(async t => {
  await clearFoodStore()
})

test
.requestHooks(goodSubmission)
.before(async t => {
  await injectApple()
  await injectBanana()
  await t.eval(() => { window.location.reload() })
  await t.click(submitButton)
})
('submit multiple signed food', async t => {
  await t.expect(submittedFoodItem.exists).ok('should have one food-item')
  .expect(submittedFoodItem.nextSibling().exists).ok('should have two food-item')
})
.after(async t => {
  await clearFoodStore()
})
