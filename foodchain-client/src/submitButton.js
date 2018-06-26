function foodSubmittedHandler (e) {
  switch (e.data[0]) {
    case 'FoodItemsUpdated':
      e.data[1].forEach((d) => {
        let FoodSubmitted = new CustomEvent('FoodSubmitted', { detail: { data: d } })
        this.dispatchEvent(FoodSubmitted)
      })
  }
}

function submittedHandler (e) {
  BLOCK.removeEventListener(e.type, submittedHandler)
  switch (e.data[0]) {
      case 'BatchesSubmitted':
        let signedItemsUpdate = signedFoodData.map((d) => {
          d.status = 'SUBMITTED'
          d.batchID = e.data[1]
          return d
        })
        DB.addEventListener('message', foodSubmittedHandler.bind(this), { once: true })
        DB.postMessage(['UpdateFoodItems', signedItemsUpdate])
        break

      case 'BatchesSubmissionError':
        console.log(e.data[0], e.data[1])
    }
}

async function clickHandler () {
  console.log('submit clicked')
  let transactions = signedFoodData.map((d) => d.transaction )
  const batch = await sawtooth.buildBatch(transactions)
  let batchListBytes = sawtooth.encodeBatchList([batch])

  BLOCK.addEventListener('message', submittedHandler.bind(this))
  BLOCK.postMessage(['SubmitBatches', batchListBytes])
}

function SubmitButton () {
  let submitButton = document.createElement('div')
  submitButton.classList.add('submitButton')
  submitButton.hidden = true
  submitButton.textContent = 'Submit'

  submitButton.addEventListener('click', clickHandler.bind(this))

  return submitButton
}

export default SubmitButton
