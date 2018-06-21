import { Selector, ClientFunction } from 'testcafe'

fixture
.only
('Select Datetime')
.page(`http://localhost:8002/test/fixture/consumption.html`)

const datetimeInput = Selector(() => consumptionView.shadow.querySelector('datetime-input'))
const getDatetimeValue = ClientFunction(() => consumptionView.datetimeInput.value)

test
.before(async t => {
  await t.expect(datetimeInput.exists).ok('should be initiated')
})
('default datetimeInput value', async t => {
  await t.expect(getDatetimeValue()).ok('should have a value')
})
