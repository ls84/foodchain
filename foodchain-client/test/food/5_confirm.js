import { Selector, RequestMock, ClientFunction } from 'testcafe'

fixture
('Confirm Submitted Food')
.page(`http://localhost:8002/test/fixture/foodPage.html`)

const injectSubmittedApple = ClientFunction(() => {
  let data = {
    name: 'apple',
    food: {
      name: 'apple',
      Protein: 0.5,
      Energy: 95
    },
    status: 'SUBMITTED',
    transaction: {headerSignature: '16e6a9f751a3'},
    batchID: '35e805cddc',
    timeStamp: Date.now()
    
  }

  return new Promise((resolve, reject) => {
    let worker = new Worker('../../src/DBWorker.js')
    worker.postMessage(['InsertNewFood', [data]])
    worker.onmessage = (e) => {
      if (e.data[0] === 'NewFoodInserted') resolve(e.data[1])
    }
    worker.onerror = (e) => {
      reject(e)
    }
  })
})

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
    }
    worker.onerror = (e) => {
      reject(e)
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
    }
    worker.onerror = (error) => {
      reject(error)
    }
  })
})

const goodConfirmation = RequestMock()
.onRequestTo(/\/batch_status/)
.respond({ data: [ { status: 'COMMITTED' } ] }, 200)

test
.requestHooks(goodConfirmation)
.before(async t => {
  let submittedFoodItem = Selector(() => document.querySelector('food-item[data-status="SUBMITTED"]').shadow)

  await injectSubmittedApple()
  await t.eval(() => { window.location.reload() })
  await t.click(submittedFoodItem.find('.container'))
})
('confirm a submitted food-items', async t => {
  let committedFoodItem = Selector(() => document.querySelector('food-item[data-status="COMMITTED"]').shadow)
  await t.expect(committedFoodItem.exists).ok('confirmed food should become commited')
})
.after(async t => {
  await clearFoodStore()
})

test
.before(async t => {
  let committedFoodItem = Selector(() => document.querySelector('food-item[data-status="COMMITTED"]').shadow)

  await injectCommittedApple()
  await t.eval(() => { window.location.reload() })
  await t.click(committedFoodItem.find('.container'))
})
('review committed food', async t => {
  let foodItemTable = Selector(() => document.querySelector('food-item').nutrientTable.shadow)

  let getProtein = ClientFunction(() => document.querySelector('food-item').nutrientTable.shadow.querySelector('.constituent#Protein input').value)
  let getEnergy = ClientFunction(() => document.querySelector('food-item').nutrientTable.shadow.querySelector('.constituent#Energy input').value)
  await t.expect(foodItemTable.find('.constituent div:nth-child(2)').withText('Energy').exists).ok('should show constituent name')
  .expect(getProtein()).eql('0.5', 'should have correct "Protein" value')
  .expect(getEnergy()).eql('95', 'should have correct "Energy" value')
})
.after(async t => {
  await clearFoodStore()
})
