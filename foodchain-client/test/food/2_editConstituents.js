import { Selector } from 'testcafe'

fixture
('Editing Constituents')
.page(`http://localhost:8002/test/fixture/foodPage.html`)

const foodEditor = Selector(() => foodEditor.shadow)
const nutrientTable = Selector(() => foodEditor.nutrientTable.shadow)
const nameInput = foodEditor.find('.nameInput')
const selector = nutrientTable.find('.constituentSelector select')

test
.before(async t => {
  await t.typeText(nameInput, 'apple')
  .click(selector)
  .click(selector.find('option').withText('Protein'))
})
('Selected "protein"', async t => {
  await t.expect(await nutrientTable.find('li').withText('Proximate:').exists).ok('"Proximate" label did not appear')
  await t.expect(await nutrientTable.find('li').withText('Protein').exists).ok('"Protein" did not appear')
})

test.before(async t => {
  await t.typeText(nameInput, 'apple')
  .click(selector)
  .click(selector.find('option').withText('Protein'))
  .click(selector)
  .click(selector.find('option').withText('Fat'))
})
('Select "protein" & "fat"', async t => {
  await t.expect(await nutrientTable.find('li').withText('Proximate:').count).eql(1, 'duplicate "Proximate" label')
})

test.before(async t => {
  await t.typeText(nameInput, 'apple')
  .click(selector)
  .click(selector.find('option').withText('Protein'))
  .click(selector)
  .click(selector.find('option').withText('Protein'))
})
('Select "protein" & "protein"', async t => {
  await t.expect(await nutrientTable.find('li').withText('Protein').count).eql(1, 'duplicate "Protein" item')
})

test.before(async t => {
  await t.typeText(nameInput, 'apple')
  .click(selector)
  .click(selector.find('option').withText('Energy'))
  .click(selector)
  .click(selector.find('option').withText('Energy'))
})
('Select "Energy" twice', async t => {
  await t.expect(await nutrientTable.find('li').withText('Energy').count).eql(1, 'duplicate "Protein" item')
})

test.before(async t => {
  await t.typeText(nameInput, 'apple')
  .click(selector)
  .click(selector.find('option').withText('Protein'))
  .click(selector)
  .click(selector.find('option').withText('Energy'))
  .click(nutrientTable.find('li').withText('Protein').find('.remove'))
  .click(nutrientTable.find('li').withText('Energy').find('.remove'))
})
('Remove "Protein" & "Energy"', async t => {
  await t.expect(await nutrientTable.find('li').withText('Protein').exists).notOk('constituent not removed')
  await t.expect(await nutrientTable.find('li').withText('Proximate:').exists).notOk('"Proximate" not removed')
  await t.expect(await nutrientTable.find('li').withText('Energy').exists).notOk('constituent not removed')
})
