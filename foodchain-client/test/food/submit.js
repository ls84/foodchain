import { Selector, RequestMock, ClientFunction } from 'testcafe'

fixture
('Submit Signed Food')
.page(`http://localhost:8002/test/fixture/foodPage.html`)

const submitButton = Selector(() => document.querySelector('.submitButton'))

const injectApple = ClientFunction(() => {
  let data = {
    name: 'apple',
    Protein: 0.5,
    Energy: 95,
    status: 'SIGNED',
    transaction: {headerSignature: '16e6a9f751a3'},
    timeStamp: Date.now()
  }

  database.insertAll('food', [data])
})

const injectBanana = ClientFunction(() => {
  let data = {
    name: 'banana',
    Protein: 1.3,
    Energy: 105,
    status: 'SIGNED',
    transaction: {headerSignature: '26e6a9f751a3'},
    timeStamp: Date.now()
  }

  database.insertAll('food', [data])
})

const goodSubmitRecipt = RequestMock()
.onRequestTo(/\/batches/)
.respond({link:'https://bismuth83.net//batch_statuses?id=35e805cddc'}, 200)

test
.before(async t => {
  await injectApple()
  await t.eval(() => { window.location.reload() })

})
('Pending food submition', async t => {
  await t.expect(submitButton.hasAttribute('hidden')).notOk('should reveal submit button')
})
.after(async t => {
  let removeSignedData = ClientFunction(() => database.deleteAll('food', ['apple']))
  await removeSignedData()
})

test
.requestHooks(goodSubmitRecipt)
.before(async t => {
  await injectApple()
  await t.eval(() => { window.location.reload() })
  await t.click(submitButton)

})
('successful submition', async t => {
  const submittedFoodItem = Selector(() => document.querySelector('food-item[data-status="SUBMITTED"]'))
  let getSubmittedData = ClientFunction(() => database.matchOnly('food', 'name', 'apple'))

  await t.expect(submittedFoodItem.exists).ok('food-item should have became SUBMITTED')
  let submittedData = await getSubmittedData()
  await t.expect(submittedData[0].status).eql('SUBMITTED', 'should update status to SUBMITTED')
  await t.expect(submittedData[0].batchID).eql('35e805cddc', 'should update data with batchID')
})
.after(async t => {
  let removeSignedData = ClientFunction(() => database.deleteAll('food', ['apple']))
  await removeSignedData()
})


test
.requestHooks(goodSubmitRecipt)
.before(async t => {
  await injectApple()
  await injectBanana()
  await t.eval(() => { window.location.reload() })
  await t.click(submitButton)

})
('submit multiple signed food', async t => {
  const submittedFoodItem = Selector(() => document.querySelector('food-item[data-status="SUBMITTED"]'))
  await t.expect(submittedFoodItem.exists).ok('should have one food-item')
  .expect(submittedFoodItem.nextSibling().exists).ok('should have two food-item')
})
.after(async t => {
  let removeSignedData = ClientFunction(() => database.deleteAll('food', ['apple', 'banana']))
  await removeSignedData()
})
