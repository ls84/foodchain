import { Selector } from 'testcafe'
import { ClientFunction } from 'testcafe'
import { RequestMock } from 'testcafe'

fixture
('Choosing Name')
.page(`http://localhost:8002/test/fixture/foodPage.html`)

const foodEditor = Selector(() => foodEditor.shadow)
const nutrientTable = Selector(() => foodEditor.nutrientTable.shadow)
const nameInput = foodEditor.find('.nameInput')
const selector = nutrientTable.find('.constituentSelector select')
const valueInput = nutrientTable.find('.constituent input')

const blurInput = ClientFunction(() => {
  foodEditor.nameInput.blur()
})

const addressState = Selector(() => foodEditor.shadow.addressState)

const nonExistsAddressStateRequest = RequestMock()
.onRequestTo(new RegExp('/state'))
.respond(null, 404)

test.before(async t => {
  await t.typeText(nameInput, 'apple', {speed: 0.1})
})
('Type "apple"', async t => {
  await t.expect(await nutrientTable.find('.constituentSelector').hasAttribute('hidden')).notOk('constituentSelector should reveal itself')
})

test
.requestHooks(nonExistsAddressStateRequest)
.before(async t => {
  await t.typeText(nameInput, 'apple', {speed: 0.1})
})
('Type a non-exists name', async t => {
  await t.expect(addressState.withText(/new food/)).ok('address state should indicate it\'s a new food')
})

// test.before(async t => {
//   await t.typeText(nameInput, 'apple')
//   await blurInput()
//   await t.typeText(nameInput, 'banana', { replace: true })
// })
// ('Change name from "apple" to "banana"', async t => {
//   await t.expect(await nutrientTable.find('.constituentSelector').hasAttribute('hidden')).notOk('constituentSelector should reveal itself')
// })

// testcafe pressKey shadow Element bug
test.skip.before(async t => {
  await t.typeText(nameInput, 'apple')
  .pressKey('backspace backspace backspace backspace backspace' )
})
('Clear name', async t => {
  await t.expect(await constituentSelector.exists).notOk('constituentSelector appeared on empty input')
})

test
.before(async t => {
  await t.typeText(nameInput, 'apple', { speed: 0.1 })
  .typeText(nameInput, ' ', { replace: true })
})
('Enter empty characters', async t => {
  await t.expect(await nutrientTable.find('.constituentSelector').hasAttribute('hidden')).ok('constituentSelector should hide itself')
})

test
.before(async t => {
  await t.typeText(nameInput, 'apple', { speed: 0.1 })
  .click(selector)
  .click(selector.find('option').withText('Protein'))
  .typeText(valueInput, '50')
  .typeText(nameInput, ' ', { replace: true })
})
('Clear name when already has constituent value', async t => {
  await t.expect(await nutrientTable.find('.constituentSelector').hasAttribute('hidden')).notOk('constituentSelector should not hide itself anymore')
})
