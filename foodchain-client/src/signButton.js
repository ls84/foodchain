function signedHandler (e) {
  switch (e.data[0]) {
    case 'NewFoodInserted':
      let FoodSigned = new CustomEvent('FoodSigned', { detail: { insert: true, data:e.data[1][0] } })
      this.dispatchEvent(FoodSigned)
  }
}

async function sign () {
  if (this.signButton.classList.contains('active')) {
    let data = await this.foodEditor.compileData()
    DB.addEventListener('message', signedHandler.bind(this), { once: true })
    DB.postMessage(['InsertNewFood', [data]])
  }
}

function SignButton () {
  let signButton = document.createElement('div')
  signButton.classList.add('signButton')
  signButton.hidden = true
  signButton.textContent = 'Sign'
  signButton.addEventListener('click', sign.bind(this))

  return signButton
}

export default SignButton
