import { Selector, RequestMock, ClientFunction } from 'testcafe'
const cbor = require('cbor')

fixture
('Search Committed Food')
.page(`http://localhost:8002/test/fixture/foodPage.html`)

const searchInput = Selector('.searchInput')

const injectCommittedApple = ClientFunction(() => {
  let data = {
    name: 'apple',
    food: {
      name: 'apple',
      Protein: 0.5,
      Energy: 95
    },
    status: 'COMMITTED',
    transaction: {headerSignature: '16e6a9f751a3'},
    timeStamp: Date.now()
  }

  return new Promise((resolve, reject) => {
    let worker = new Worker('../../src/DBWorker.js')
    worker.postMessage(['InsertNewFood', [data]])
    worker.onmessage = (e) => {
      if (e.data[0] === 'NewFoodInserted') resolve(e.data[1])
      worker.terminate()
    }
    worker.onerror = (e) => {
      reject(e)
      worker.terminate()
    }
  })
})

const injectCommittedBanana = ClientFunction(() => {
  let data = {
    name: 'banana',
    food: {
      name: 'banana',
      Protein: 1.3,
      Energy: 105
    },
    status: 'COMMITTED',
    transaction: {headerSignature: '26e6a9f751a3'},
    timeStamp: Date.now()
  }

  return new Promise((resolve, reject) => {
    let worker = new Worker('../../src/DBWorker.js')
    worker.postMessage(['InsertNewFood', [data]])
    worker.onmessage = (e) => {
      if (e.data[0] === 'NewFoodInserted') resolve(e.data[1])
      worker.terminate()
    }
    worker.onerror = (e) => {
      reject(e)
      worker.terminate()
    }
  })
})

const clearFoodStore = ClientFunction(() => {
  return new Promise((resolve, reject) => {
    let worker = new Worker('../../src/DBWorker.js')
    worker.postMessage(['ClearStore', 'food'])
    worker.onmessage = (event) => {
      if (event.data[0] !== 'StoreCleared') reject(new Error('Food cant be cleared'))
      resolve()
      worker.terminate()
    }
    worker.onerror = (error) => {
      reject(error)
      worker.terminate()
    }
  })
})

const myEmptyAddressStateData = {
  consumption: [],
  favourites: []
}

const myEmptyAddressState = RequestMock()
.onRequestTo(new RegExp('/state'))
.respond({ data: cbor.encode(myEmptyAddressStateData).toString('base64') }, 200)

const myAddressStateData = {
  consumption: [],
  favourites: [
    {
      name: 'apple',
      timeStamp: Date.now(),
      food: {
        name: 'apple',
        Energy: 95
      }
    },
    {
      name: 'orange',
      timeStamp: Date.now(),
      food: {
        name: 'orange',
        Energy: 47
      }
    }
  ]
}

const myAddressState = RequestMock()
.onRequestTo(new RegExp('/state'))
.respond({ data: cbor.encode(myAddressStateData).toString('base64') }, 200)

test
.before(async t => {
  await injectCommittedApple()
  await injectCommittedBanana()
  await t.wait(500)
  await t.eval(() => { window.location.reload() })
  let committedFood = Selector('food-item[data-status="COMMITTED"]')
  let committedApple = committedFood.filter(n => n.name.textContent === 'apple')
  let committedBanana = committedFood.filter(n => n.name.textContent === 'banana')
  await t.expect(committedApple.exists).ok('should have an apple')
  await t.expect(committedBanana.exists).ok('should have an Banana')
  await t.typeText(searchInput, 'apple')
})
('search "apple"', async t => {
  let committedFood = Selector('food-item[data-status="COMMITTED"]')
  let committedApple = committedFood.filter(n => n.name.textContent === 'apple')
  let committedBanana = committedFood.filter(n => n.name.textContent === 'banana')

  await t.expect(committedApple.exists).ok('should have an apple')
  await t.expect(committedBanana.hasAttribute('hidden')).ok('should have a hidden banana')
})
.after(async t => {
  await clearFoodStore()
})

test
.before(async t => {
  await t.addRequestHooks(myEmptyAddressState)
  await injectCommittedApple()
  await injectCommittedBanana()
  await t.removeRequestHooks(myEmptyAddressState)
  await t.addRequestHooks(myAddressState)
  await t.eval(() => { window.location.reload() })
})
('sync with block', async t => {
  let committedFood = Selector('food-item[data-status="COMMITTED"]')
  let committedOrange = committedFood.filter(n => n.name.textContent === 'orange')
  let committedBanana = committedFood.filter(n => n.name.textContent === 'banana')

  await t.expect(committedOrange.exists).ok('should have an orange')
  await t.expect(committedBanana.exists).notOk('should not have a banana')
})
.after(async t => {
  await clearFoodStore()
})
