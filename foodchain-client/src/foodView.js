const JSS = jss.create()
JSS.setup({createGenerateClassName: () => (rule, sheet) => rule.key})
JSS.use(jssNested.default())

const styles = {
  "searchInput": {
    'width': '100%',
    'height': '42px',
    'padding-left': '10px',
    'font-size': '24px',
    'font-family': 'sans-serif',
    'margin-bottom': '10px',
    'border': 'none',
    'outline' :'none',
    '&::placeholder': {
      'padding-left': '10px',
      'font-size': '16px',
      'font-weight': '100',
      'color': 'lightgrey'
    }
  },
  'signButton': {
    'height': '30px',
    'width': '60px',
    'position': 'relative',
    'left': 'calc(100% - 60px)',
    'line-height': '30px',
    'text-align': 'center',
    'background-color': 'white',
    'margin-top': '10px',
    'margin-bottom': '20px',
    'font-family': 'sans-serif',
    'color': 'lightgrey',
    '&.active': {
      'color': 'black'
    }
  },
  'submitButton': {
    'height': '30px',
    'width': '60px',
    'position': 'relative',
    'left': 'calc(100% - 60px)',
    'line-height': '30px',
    'text-align': 'center',
    'background-color': 'white',
    'margin-top': '10px',
    'margin-bottom': '20px',
    'font-family': 'sans-serif',
    'color': 'black'
  }
}

const styleSheet = JSS.createStyleSheet(styles)

function foodSignedHandler (e) {
  let data = e.detail.data
  let foodItem = document.createElement('food-item')
  foodItem.init(data)
  foodItem.setAttribute('data-status', 'SIGNED')
  this.shadow.insertBefore(foodItem, this.submitButton)
  signedFoodData.push(data)
  // TODO: reset should be toggled
  this.foodEditor.reset()

  this.submitButton.hidden = false
}

function foodSubmittedHandler (e) {
  let data = e.detail.data
  let foodItem
  if (e.detail.insert) {
    foodItem = document.createElement('food-item')
    foodItem.init(data, 'DATABASE')
  }
  if (!e.detail.insert) {
    let nodeList = this.shadow.querySelectorAll('food-item[data-status="SIGNED"]')
    foodItem = Array.from(nodeList)
    .find((n) => n.name.textContent === data.name)
  }
  foodItem.confirmSubmission = confirmSubmission.bind(foodItem)
  foodItem.setAttribute('data-status', 'SUBMITTED')
  this.shadow.appendChild(foodItem)

  let remainingItems = this.shadow.querySelectorAll('food-item[data-status="SIGNED"]').length
  if (remainingItems === 0) this.submitButton.hidden = true

  submittedFoodData.push(data)
  signedFoodData = signedFoodData.filter((d) => d.name !== data.name)
}

function foodCommittedHandler (e) {
  let data = e.detail.data
  let foodItem
  if (e.detail.insert) {
    foodItem = document.createElement('food-item')
    foodItem.init(data, 'DATABASE')
  }
  if (!e.detail.insert) {
    let nodeList = this.shadow.querySelectorAll('food-item[data-status="SUBMITTED"]')
    foodItem = Array.from(nodeList)
    .find((n) => n.name.textContent === data.name)
  }
  foodItem.setAttribute('data-status', 'COMMITTED')
  this.shadow.appendChild(foodItem)

  committedFood.push(foodItem)
  submittedFoodData = submittedFoodData.filter((d) => d.name !== data.name)
}

function AddressStateHandler (e) {
  switch (e.data[0]) {
    case 'AddressStateFetched':
      if (e.data[2] === null) window.foodView.dispatchEvent(new CustomEvent('ResolvedNewFood'))
      break
  }
}

function nameChangeHandler (e) {
  this.signButton.hidden = (e.detail.isEmpty) ? true : false
  this.signButton.classList.remove('active')
  this.foodEditor.addressState.textContent = ''

  let name = e.detail.name
  NameResolver.postMessage([e.detail.name, true])
}

function resolvedNewFoodHandler (e) {
  this.foodEditor.addressState.textContent = 'new food'
  this.signButton.classList.add('active')
}

function SearchInput () {
  let searchInput = document.createElement('input')
  searchInput.classList.value = 'searchInput'
  searchInput.setAttribute('placeholder', 'Search Food Here...')
  searchInput.addEventListener('keyup', (event) => {
    let name = event.target.value
    switch (name) {
      case '' :
        committedFood.forEach((e) => { e.hidden = false })
        break
      default :
      committedFood.filter((e) => !new RegExp(name).test(e.name.textContent))
      .forEach((e) => { e.hidden = true})
    }
  })

  return searchInput
}

export default class foodView extends HTMLElement {
  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    let style = document.createElement('style')
    style.textContent = styleSheet.toString()
    this.shadow.appendChild(style)

    NameResolver.addEventListener('message', AddressStateHandler)

    this.addEventListener('NameChanged', nameChangeHandler.bind(this), true)
    this.addEventListener('ResolvedNewFood', resolvedNewFoodHandler.bind(this), true)
    this.addEventListener('FoodSigned', foodSignedHandler.bind(this), true)
    this.addEventListener('FoodSubmitted', foodSubmittedHandler.bind(this), true)
    this.addEventListener('FoodCommitted', foodCommittedHandler.bind(this), true)

    //TODO:
    // this.searchInput.addEventListener
    // this.signButton.addEventListener
    // this.submitButton.addEventListener

    this.searchInput = SearchInput()
    this.shadow.appendChild(this.searchInput)

    this.foodEditor = document.createElement('food-editor')
    this.shadow.appendChild(this.foodEditor)

    this.signButton = SignButton.call(this)
    this.shadow.appendChild(this.signButton)

    this.submitButton = SubmitButton.call(this)
    this.shadow.appendChild(this.submitButton)

    this.populateFoodView = populateFoodView.bind(this)
    this.syncFood = syncFood.bind(this)
  }
}
