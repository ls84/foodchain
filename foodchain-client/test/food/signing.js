import { Selector, RequestMock, ClientFunction } from 'testcafe'

fixture('Signing Food Item')
.page(`http://localhost:8002/test/fixture/foodPage.html`)

const foodEditor = Selector(() => foodEditor.shadow)
const selector = foodEditor.find('.constituentSelector select')

const blurInput = ClientFunction(() => {
  foodEditor.nameInput.blur()
})

const nonExistsAddressStateRequest = RequestMock()
.onRequestTo(new RegExp('/state'))
.respond({data: []}, 200)

test
.requestHooks(nonExistsAddressStateRequest)
.before(async t => {
  let nameInput = await foodEditor.find('.nameInput')
  await t.typeText(nameInput, 'apple')
  await blurInput()
})
('NON-EXISTS Name Address', async t => {
 let signButton = foodEditor.find('.signButton')
 await t.expect(signButton.hasClass('active')).ok('sign button should be activated')
})

test
.requestHooks(nonExistsAddressStateRequest)
.before(async t => {
  let nameInput = await foodEditor.find('.nameInput')
  let signButton = foodEditor.find('.signButton')
  await t.typeText(nameInput, 'apple')
  .click(selector)
  await blurInput()
  await t.click(signButton)
})
('Sign a "NON-EXISTS" food', async t => {
  let foodItem = Selector(() => document.querySelector('food-item').shadow)
  await t.expect(foodItem.exists).ok('should create a food-item')
  .expect(foodItem.find('div').withText('apple').exists).ok('should has name "apple"')
})

test
.requestHooks(nonExistsAddressStateRequest)
.before(async t => {
  let nameInput = await foodEditor.find('.nameInput')
  let signButton = foodEditor.find('.signButton')
  let foodItem = Selector(() => document.querySelector('food-item').shadow)
  await t.typeText(nameInput, 'apple')
  .click(selector)
  .click(selector.find('option').withText('Energy'))
  .typeText(foodEditor.find('.constituent#Energy input'), '95')
  .click(signButton)
  .click(foodItem.find('.name'))
  .debug()
})
('Review a singed food', async t => {
  let foodItem = Selector(() => document.querySelector('food-item').shadow)
  await t.expect(foodItem.find('li').withText('Energy').exits).ok('should show constituent name')
  .expect(foodItem.find('li').withText('95kcal').exits).ok('should show constituent value')
})
