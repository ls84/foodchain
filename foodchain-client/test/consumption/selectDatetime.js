import { Selector, ClientFunction } from 'testcafe'

fixture
('Select Datetime')
.page(`http://localhost:8002/test/fixture/consumption.html`)

const datetimeInput = Selector(() => consumptionView.consumptionEditor.shadow.querySelector('.datetimeInput'))
const getDatetimeValue = ClientFunction(() => consumptionView.consumptionEditor.value)

test
.before(async t => {
  await t.expect(datetimeInput.exists).ok('should be initiated')
})
('default datetimeInput value', async t => {
  await t.expect(getDatetimeValue()).ok('should have a value')
})
