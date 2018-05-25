import { Selector, RequestMock, ClientFunction } from 'testcafe'

fixture('Signing Food Item')
.page(`http://localhost:8002/test/fixture/foodPage.html`)

const foodEditor = Selector(() => foodEditor.shadow)
const nutrientTable = Selector(() => foodEditor.nutrientTable.shadow)
const foodItem = Selector(() => document.querySelector('food-item').shadow)
const foodItemTable = Selector(() => document.querySelector('food-item').nutrientTable.shadow)

const nameInput = foodEditor.find('.nameInput')
const signButton = foodEditor.find('.signButton')
const selector = nutrientTable.find('.constituentSelector select')


const blurInput = ClientFunction(() => {
  foodEditor.nameInput.blur()
})

const nonExistsAddressStateRequest = RequestMock()
.onRequestTo(new RegExp('/state'))
.respond({data: []}, 200)

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
  await t.typeText(nameInput, 'apple')
  .click(selector)
  .click(selector.find('option').withText('Energy'))
  .typeText(nutrientTable.find('.constituent#Energy input'), '95')
  await blurInput()
  await t.click(signButton)
})
('Sign a "NON-EXISTS" food', async t => {
  await t.expect(foodItem.exists).ok('should create a food-item')
  .expect(foodItem.find('div').withText('apple').exists).ok('should has name "apple"')
  .expect(foodItemTable.find('.container').hasAttribute('hidden')).ok('nutrientTable should be hidden first')
})

test
.requestHooks(nonExistsAddressStateRequest)
.before(async t => {
  await t.typeText(nameInput, 'apple')
  .click(selector)
  .click(selector.find('option').withText('Energy'))
  .typeText(nutrientTable.find('.constituent#Energy input'), '95')
  .click(signButton)
  .click(foodItem.find('.container'))
})
('Review a singed food', async t => {
  let getValue = ClientFunction(() => document.querySelector('food-item').nutrientTable.shadow.querySelector('.constituent input').value)
  await t.expect(foodItemTable.find('.constituent div:nth-child(2)').withText('Energy').exists).ok('should show constituent name')
  .expect(getValue()).eql('95', 'should show constituent value')
})
