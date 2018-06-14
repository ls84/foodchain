function signedHandler (e) {
  switch (e.data[0]) {
    case 'NewFoodInserted':
      let FoodSigned = new CustomEvent('FoodSigned', { detail: { insert: true, data:e.data[1][0] } })
      signButton.dispatchEvent(FoodSigned)
  }
}

async function sign () {
  if (this.classList.contains('active')) {
    let data = await foodEditor.compileData()
    worker.addEventListener('message', signedHandler)

    worker.postMessage(['InsertNewFood', [data]])
  }
}

let signButton = document.createElement('div')
signButton.classList.add('signButton')
signButton.hidden = true
signButton.textContent = 'Sign'
signButton.addEventListener('click', sign)

export default signButton
