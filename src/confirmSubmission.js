function confirmUpdateHandler(e) {
  switch(e.data[0]) {
    case 'FoodItemsUpdated':
      e.data[1].forEach((d) => {
        this.dispatchEvent(new CustomEvent('FoodCommitted', { composed: true, detail: { data: d } }))
        debugger
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
      DB.addEventListener('message', confirmUpdateHandler.bind(this), { once: true })
      DB.postMessage(['UpdateFoodItems', submittedItemsUpdate])
      break
  }
}

function confirmSubmission () {
  BLOCK.addEventListener('message', confirmHandler.bind(this))
  let batchID = submittedFoodData.find((d) => d.name === this.data.name).batchID
  BLOCK.postMessage(['ConfirmSubmission', batchID])
}

export default confirmSubmission
