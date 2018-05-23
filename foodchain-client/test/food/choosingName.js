import { Selector } from 'testcafe'
import { ClientFunction } from 'testcafe'
import { RequestMock } from 'testcafe'

fixture('Choosing Name')
.page(`http://localhost:8002/test/fixture/foodPage.html`)

const shadow = Selector(() => foodEditor.shadow)

const blurInput = ClientFunction(() => {
  foodEditor.nameInput.blur()
})

// const clearInput = ClientFunction(() => {
//   foodEditor.nameInput.value = ''
// })

const nonExistsAddressStateRequest = RequestMock()
.onRequestTo(new RegExp('/state'))
.respond({data: []}, 200)

test.before(async t => {
  await t.typeText(shadow.find('.nameInput'), 'apple')
})
('Type "apple"', async t => {
  await t.expect(await shadow.find('.constituentSelector').exists).ok('constituentSelector did not exists')
  .expect(await shadow.find('#selector').hasAttribute('hidden')).notOk('#selector did not unhidden itself')
})

test
.requestHooks(nonExistsAddressStateRequest)
.before(async t => {
  await t.typeText(shadow.find('.nameInput'), 'notafoodyet')
  await blurInput()
})
('Type a non-exists name', async t => {
  let nameAddressState = ClientFunction(() => foodEditor.shadow.querySelector('.nameAddressState').textContent)
  await t.expect(await nameAddressState()).match(/new food/, 'address state should indicate it\'s a new food')
})

test.before(async t => {
  let nameInput = await shadow.find('.nameInput')
  await t.typeText(nameInput, 'apple')
  await blurInput()
  await t.typeText(nameInput, 'banana', { replace: true })
})
('Change name from "apple" to "banana"', async t => {
  await t.expect(await shadow.find('.constituentSelector').exists).ok('constituentSelector did not exists')
  .expect(await shadow.find('#selector').hasAttribute('hidden')).notOk('#selector did not unhidden itself')
})

// testcafe pressKey shadow Element bug
test.skip.before(async t => {
  await t.typeText(nameInput, 'apple')
  .pressKey('backspace backspace backspace backspace backspace' )
})
('Clear name', async t => {
  await t.expect(await constituentSelector.exists).notOk('constituentSelector appeared on empty input')
})

test.before(async t => {
  let nameInput = await shadow.find('.nameInput')
  await t.typeText(nameInput, 'apple')
  .typeText(nameInput, ' ', { replace: true })
})
('Enter empty characters', async t => {
  await t.expect(await shadow.find('.constituentSelector').exists).ok('constituentSelector did not exists')
  .expect(await shadow.find('#selector').hasAttribute('hidden')).ok('#selector did not hide itself')
})

test.before(async t => {
  let nameInput = shadow.find('.nameInput')
  let valueInput = shadow.find('.constituent input')
  let selector = shadow.find('.constituentSelector select')
  await t.typeText(nameInput, 'apple')
  .click(selector)
  .click(selector.find('option').withText('Protein'))
  .typeText(valueInput, '50')
  .typeText(nameInput, ' ', { replace: true })
})
('Clear name when already has constituent value', async t => {
  await t.expect(await shadow.find('#selector').hasAttribute('hidden')).notOk('#selector should not hide itself')
})
