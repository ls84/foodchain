function confirmUpdateHandler(e) {
  DB.removeEventListener(e.type, confirmUpdateHandler)
  switch(e.data[0]) {
    case 'FoodItemsUpdated':
      e.data[1].forEach((d) => {
        document.dispatchEvent(new CustomEvent('FoodCommitted', { detail: { data: d } }))
      })
  }
}

function confirmHandler (e) {
  BLOCK.removeEventListener(e.type, confirmHandler)
  switch (e.data[0]) {
    case 'SubmissionConfirmed':
      let submittedItemsUpdate = submittedFoodData.filter((d) => {
        return d.batchID === e.data[1] 
      })
      .map((d) => {
        d.status = 'COMMITTED'
        return d
      })
      DB.addEventListener('message', confirmUpdateHandler)
      DB.postMessage(['UpdateFoodItems', submittedItemsUpdate])
      break
  }
}

function confirmSubmission () {
  BLOCK.addEventListener('message', confirmHandler)
  let batchID = submittedFoodData.find((d) => d.name === this.data.name).batchID
  BLOCK.postMessage(['ConfirmSubmission', batchID])
}

export default confirmSubmission
