import { Selector } from 'testcafe'

fixture('Editing Constituents')
.page(`http://localhost:8002/test/fixture/foodPage.html`)

const shadow = Selector(() => foodEditor.shadow)
const nameInput = shadow.find('.nameInput')
const selector = shadow.find('.constituentSelector select')
const nutrientTable = shadow.find('.nutrientTable')

test.only.before(async t => {
  await t.typeText(nameInput, 'apple')
  .click(selector)
  .click(selector.find('option').withText('Protein'))
})
('Selected "proteint"', async t => {
  await t.expect(await nutrientTable.find('.proximate').withText('Protein').exists).ok('"Protein" did not appear')
})
