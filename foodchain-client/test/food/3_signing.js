import { Selector, RequestMock, ClientFunction } from 'testcafe'

fixture
('Signing Food Item')
.page(`http://localhost:8002/test/fixture/foodPage.html`)

const foodEditor = Selector(() => foodEditor.shadow)
const nutrientTable = Selector(() => foodEditor.nutrientTable.shadow)
const foodItem = Selector(() => document.querySelector('food-item').shadow)
const foodItemTable = Selector(() => document.querySelector('food-item').nutrientTable.shadow)
const signButton = Selector('.signButton')

const nameInput = foodEditor.find('.nameInput')
const selector = nutrientTable.find('.constituentSelector select')

const blurInput = ClientFunction(() => {
  foodEditor.nameInput.blur()
})

const nonExistsAddressStateRequest = RequestMock()
.onRequestTo(new RegExp('/state'))
.respond({data: []}, 200)

const signApple = async (t) => {
  await t.typeText(nameInput, 'apple')
  .click(selector)
  .click(selector.find('option').withText('Protein'))
  .typeText(nutrientTable.find('.constituent#Protein input'), '0.5')
  .click(selector)
  .click(selector.find('option').withText('Energy'))
  .typeText(nutrientTable.find('.constituent#Energy input'), '95')
  await blurInput()
  await t.click(signButton)
}

const signBanana = async (t) => {
  await t.typeText(nameInput, 'banana')
  .click(selector)
  .click(selector.find('option').withText('Protein'))
  .typeText(nutrientTable.find('.constituent#Protein input'), '1.3')
  .click(selector)
  .click(selector.find('option').withText('Energy'))
  .typeText(nutrientTable.find('.constituent#Energy input'), '105')
  await blurInput()
  await t.click(signButton)
}

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

test
.requestHooks(nonExistsAddressStateRequest)
.before(async t => {
  await t.typeText(nameInput, 'apple')
  await blurInput()
})
('NON-EXISTS Name Address', async t => {
 await t.expect(signButton.hasClass('active')).ok('sign button should be activated')
})

test
.requestHooks(nonExistsAddressStateRequest)
.before(async t => {
  await signApple(t)
})
('Sign a "NON-EXISTS" food', async t => {
  let foodData = await getFoodData()
  await t.expect(foodData[0].name).eql('apple', '"name" data should be "apple"')
  .expect(foodData[0].food.Protein).eql('0.5', 'data "Energy" data should be 0.5')
  .expect(foodData[0].food.Energy).eql('95', 'data "Energy" data should be 95')
  .expect(foodData[0].status).eql('SIGNED', 'data "status" data should be "SIGNED"')
  .expect(foodItem.exists).ok('should create a food-item')
  .expect(foodItem.find('div').withText('apple').exists).ok('should has name "apple"')
  .expect(foodItemTable.find('.container').hasAttribute('hidden')).ok('nutrientTable should be hidden first')
})
.after(async t => {
  await clearFoodStore()
})

test
.requestHooks(nonExistsAddressStateRequest)
.before(async t  => {
  await signApple(t)
  await signBanana(t)
})
('Sign multiple food', async t => {
  let firstItem = Selector(() => document.querySelectorAll('food-item')[0].shadow)
  let secondItem = Selector(() => document.querySelectorAll('food-item')[1].shadow)

  await t.expect(firstItem.find('div').withText('apple').exists).ok('should have "apple" item')
  .expect(secondItem.find('div').withText('banana').exists).ok('should have "banana" item')
})
.after(async t => {
  await clearFoodStore()
})

test
.requestHooks(nonExistsAddressStateRequest)
.before(async t => {
  await signApple(t)
  await t.click(foodItem.find('.container'))
})
('Review a singed food', async t => {
  let getProtein = ClientFunction(() => document.querySelector('food-item').nutrientTable.shadow.querySelector('.constituent#Protein input').value)
  let getEnergy = ClientFunction(() => document.querySelector('food-item').nutrientTable.shadow.querySelector('.constituent#Energy input').value)
  await t.expect(foodItemTable.find('.constituent div:nth-child(2)').withText('Energy').exists).ok('should show constituent name')
  .expect(getProtein()).eql('0.5', 'should have correct "Protein" value')
  .expect(getEnergy()).eql('95', 'should have correct "Energy" value')
})
.after(async t => {
  await clearFoodStore()
})

test
.requestHooks(nonExistsAddressStateRequest)
.before(async t => {
  await signApple(t)
  await t.wait(100)
  await t.eval(() => { window.location.reload() })
})
('Display signed data', async t => {
  await t.expect(foodItem.find('div').withText('apple').exists).ok('should have a food Item displayed')
})
.after(async t => {
  await clearFoodStore()
})
