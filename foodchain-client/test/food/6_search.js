import { Selector, RequestMock, ClientFunction } from 'testcafe'

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
      Energy: 95,
    },
    status: 'COMMITTED',
    transaction: {headerSignature: '16e6a9f751a3'},
    timeStamp: Date.now(),
    batchID: '35e805cddc'
  }

  database.insertAll('food', [data])
})

const injectCommittedBanana = ClientFunction(() => {
  let data = {
    name: 'banana',
    food: {
      name: 'banana',
      Protein: 1.3,
      Energy: 105,
    },
    status: 'COMMITTED',
    transaction: {headerSignature: '26e6a9f751a3'},
    timeStamp: Date.now(),
    batchID: '35e805cddc'
  }

  database.insertAll('food', [data])
})

const myEmptyAddressState = RequestMock()
.onRequestTo(new RegExp('/state'))
.respond({
  data: {
    favourites: {}
  }
}, 200)

const myAddressState = RequestMock()
.onRequestTo(new RegExp('/state'))
.respond({
  data: {
    favourites: {
      'apple': {
        timeStamp: Date.now(),
        name: 'apple'
      },
      'orange': {
        timeStamp: Date.now(),
        name: 'orange'
      }
    }
  }
}, 200)

test
.before(async t => {
  await injectCommittedApple()
  await injectCommittedBanana()
  await t.eval(() => { window.location.reload() })
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
  let removeSignedData = ClientFunction(() => database.deleteAll('food', ['apple','banana']))
  await removeSignedData()
})


test
.before(async t => {
  await t.addRequestHooks(myEmptyAddressState)
  await injectCommittedApple()
  await injectCommittedBanana()
  await t.removeRequestHooks(myEmptyAddressState)
  await t.eval(() => { window.location.reload() })
  await t.addRequestHooks(myAddressState)
})
('sync with block', async t => {
  let committedFood = Selector('food-item[data-status="COMMITTED"]')
  let committedOrange = committedFood.filter(n => n.name.textContent === 'orange')
  let committedBanana = committedFood.filter(n => n.name.textContent === 'banana')

  await t.expect(committedOrange.exists).ok('should have an orange')
  await t.expect(committedBanana.exists).notOk('should not have a banana')
})
.after(async t => {
  let removeSignedData = ClientFunction(() => database.deleteAll('food', ['apple','banana', 'orange']))
  await removeSignedData()
})
