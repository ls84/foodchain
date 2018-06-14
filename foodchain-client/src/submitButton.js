function foodSubmittedHandler (e) {
  switch (e.data[0]) {
    case 'FoodItemsUpdated':
      e.data[1].forEach((d) => {
        let FoodSubmitted = new CustomEvent('FoodSubmitted', { detail: d })
        submitButton.dispatchEvent(FoodSubmitted)
      })
  }
}

function submittedHandler (e) {
switch (e.data[0]) {
    case 'BatchesSubmitted':
      let signedItemsUpdate = signedFoodData.map((d) => {
        d.status = 'SUBMITTED'
        d.batchID = e.data[1]
        return d
      })
      submittedFoodData = submittedFoodData.concat(signedItemsUpdate)
      worker.addEventListener('message', foodSubmittedHandler)
      worker.postMessage(['UpdateFoodItems', signedItemsUpdate])
      break

    case 'BatchesSubmissionError':
      console.log(e.data[0], e.data[1])
  }
}

async function clickHandler () {
  let transactions = signedFoodData.map((d) => d.transaction )
  const batch = await sawtooth.buildBatch(transactions)
  let batchListBytes = sawtooth.encodeBatchList([batch])

  NETWorker.addEventListener('message', submittedHandler)

  NETWorker.postMessage(['SubmitBatches', batchListBytes])
}

let submitButton = document.createElement('div')
submitButton.classList.add('submitButton')
submitButton.hidden = true
submitButton.textContent = 'Submit'

submitButton.addEventListener('click', clickHandler)

export default submitButton
