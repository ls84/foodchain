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

// const goodAddressStateRequest = RequestMock()
// .onRequestTo('https://api.com')
// .respond('good', 200)

test.before(async t => {
  await t.typeText(shadow.find('.nameInput'), 'apple')
})
('Typed "apple"', async t => {
  await t.expect(await shadow.find('.constituentSelector').exists).ok('constituentSelector did not exists')
  .expect(await shadow.find('#selector').hasAttribute('hidden')).notOk('#selector did not unhidden itself')
})

test.before(async t => {
  let nameInput = await shadow.find('.nameInput')
  await t.typeText(nameInput, 'apple')
  await blurInput()
  await t.typeText(nameInput, 'banana', { replace: true })
})
('Tries To Change Name to "banana"', async t => {
  await t.expect(await shadow.find('.constituentSelector').exists).ok('constituentSelector did not exists')
  .expect(await shadow.find('#selector').hasAttribute('hidden')).notOk('#selector did not unhidden itself')
})

// testcafe pressKey shadow Element bug
test.skip.before(async t => {
  await t.typeText(nameInput, 'apple')
  .pressKey('backspace backspace backspace backspace backspace' )
})
('Cleared Name', async t => {
  await t.expect(await constituentSelector.exists).notOk('constituentSelector appeared on empty input')
})

test.before(async t => {
  let nameInput = await shadow.find('.nameInput')
  await t.typeText(nameInput, 'apple')
  .typeText(nameInput, ' ', { replace: true })
})
('Entered Empty Characters', async t => {
  await t.expect(await shadow.find('.constituentSelector').exists).ok('constituentSelector did not exists')
  .expect(await shadow.find('#selector').hasAttribute('hidden')).ok('#selector did not hide itself')
})
