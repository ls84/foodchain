import { Selector, RequestMock, ClientFunction } from 'testcafe'

fixture
('Confirm Submitted Food')
.page(`http://localhost:8002/test/fixture/foodPage.html`)

const injectSubmittedApple = ClientFunction(() => {
  let data = {
    name: 'apple',
    Protein: 0.5,
    Energy: 95,
    status: 'SUBMITTED',
    transaction: {headerSignature: '16e6a9f751a3'},
    timeStamp: Date.now(),
    batchID: '35e805cddc'
  }

  database.insertAll('food', [data])
})

const injectComittedApple = ClientFunction(() => {
  let data = {
    name: 'apple',
    Protein: 0.5,
    Energy: 95,
    status: 'COMITTED',
    transaction: {headerSignature: '16e6a9f751a3'},
    timeStamp: Date.now(),
    batchID: '35e805cddc'
  }

  database.insertAll('food', [data])
})

const removeComittedData = ClientFunction(() => {
  database.deleteAll('food', ['apple'])
})

const goodConfirmation = RequestMock()
.onRequestTo(/\/batch_status/)
.respond({status: 'COMMITTED'}, 200)

test
.requestHooks(goodConfirmation)
.before(async t => {
  let submittedFoodItem = Selector(() => document.querySelector('food-item[data-status="SUBMITTED"]').shadow)

  await injectSubmittedApple()
  await t.eval(() => { window.location.reload() })
  await t.click(submittedFoodItem.find('.container'))
})
('confirm a submitted food-items', async t => {
  let comittedFoodItem = Selector(() => document.querySelector('food-item[data-status="COMITTED"]').shadow)
  await t.expect(comittedFoodItem.exists).ok('confirmed food should become commited')
})
.after(async t => {
  await removeComittedData()
})


test
.before(async t => {
  let comittedFoodItem = Selector(() => document.querySelector('food-item[data-status="COMITTED"]').shadow)

  await injectComittedApple()
  await t.eval(() => { window.location.reload() })
  await t.click(comittedFoodItem.find('.container'))
})
('review comitted food', async t => {
  let foodItemTable = Selector(() => document.querySelector('food-item').nutrientTable.shadow)

  let getProtein = ClientFunction(() => document.querySelector('food-item').nutrientTable.shadow.querySelector('.constituent#Protein input').value)
  let getEnergy = ClientFunction(() => document.querySelector('food-item').nutrientTable.shadow.querySelector('.constituent#Energy input').value)
  await t.expect(foodItemTable.find('.constituent div:nth-child(2)').withText('Energy').exists).ok('should show constituent name')
  .expect(getProtein()).eql('0.5', 'should have correct "Protein" value')
  .expect(getEnergy()).eql('95', 'should have correct "Energy" value')
})
.after(async t => {
  await removeComittedData()
})
