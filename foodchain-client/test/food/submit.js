import { Selector, RequestMock, ClientFunction } from 'testcafe'

fixture
('Submit Signed Food')
.page(`http://localhost:8002/test/fixture/foodPage.html`)

// const foodEditor = Selector(() => foodEditor.shadow)
// const nutrientTable = Selector(() => foodEditor.nutrientTable.shadow)
// const foodItem = Selector(() => document.querySelector('food-item').shadow)

// const nameInput = foodEditor.find('.nameInput')
// const signButton = foodEditor.find('.signButton')
// const selector = nutrientTable.find('.constituentSelector select')
const submitButton = Selector(() => document.querySelector('.submitButton'))

// const nonExistsAddressStateRequest = RequestMock()
// .onRequestTo(new RegExp('/state'))
// .respond({data: []}, 200)

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
.only
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

