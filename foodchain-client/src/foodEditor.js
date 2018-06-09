import { sha256Hex } from './hashing.js'
const JSS = jss.create()
JSS.setup({createGenerateClassName: () => (rule, sheet) => rule.key})
JSS.use(jssNested.default())


const styles = {
  'container': {
    'width': `calc(100% - 20px)`,
    'margin-bottom': '10px',
    'background-color': 'white',
    'padding': '10px 10px 10px 10px',
    'position': 'relative',
    'z-index': '1'
  },
  'nameInput': {
    'font-family': 'sans-serif',
    'font-size': '24px',
    'width': '100%',
    'background-color': 'white',
    'margin': '0px',
    'padding': '10px',
    'padding-bottom': '0px',
    'outline': 'none',
    'border': 'none',
    'border-bottom': 'dotted lightgrey'
  },
  'nameAddressState': {
    'font-family': 'sans-serif',
    'font-size': '14px',
    'font-weight': '100',
    'text-align': 'right',
    'color': 'darkgrey',
    'width': '100%',
    'height': '16px'
  },
  'signButton': {
    'height': '30px',
    'width': '60px',
    'line-height':'30px',
    'text-align': 'center',
    'background-color': 'white',
    'margin-top': '10px',
    'margin-bottom': '20px',
    'float': 'right',
    'font-family': 'sans-serif',
    'color': 'lightgrey',
    '&.active' : {
      'color': 'black'
    }
  }
}

const styleSheet = JSS.createStyleSheet(styles)

const resolveNameAddress = function (name) {
  return sha256Hex(name)
  .then((hash) => {
    return window.fetch(`${serverAddress}/state?address=${'100000' + hash}`, {
      headers: {'Content-Type': 'application/json'},
      method: 'GET',
      mode: 'cors'
    })
  })
  .then((response) => {
    if (!response.ok) return Promise.reject(new Error('response is not okay'))
    return response.json()
  })
  .then((json) => {
    if (json.data.length === 0) return Promise.resolve('NON-EXISTS') 
  })
  .catch((error) => {
    return Promise.reject(error) 
  })
} 

function updateAddressState (name) {
  switch (name) {
    case 'NON-EXISTS':
      this.nameAddressState.innerHTML = 'new food'
      this.NameAddressStateChange('NON-EXISTS')
      break
  }
}

const NameInput = function () {
  let nameInput = document.createElement('input')
  nameInput.setAttribute('type', 'text')
  nameInput.classList.add(styleSheet.classes.nameInput)

  nameInput.addEventListener('keyup', (event) => {
    let selector = this.nutrientTable.selector
    let name = nameInput.value.trim().split(/\s/).filter(v => v!== "").join(' ')
    let constituentExists = this.nutrientTable.shadow.querySelector('.constituent')

    if (name !== '' && selector.hidden) {
      selector.hidden = false
      this.inputStateChange('NON-EMPTY')
    }

    if (name === '' && !selector.hidden && !constituentExists) {
      selector.hidden = true
      this.inputStateChange('EMPTY')
    }
  })

  nameInput.addEventListener('change', (event) => {
    let name = nameInput.value.trim().split(/\s/).filter(v => v!== "").join(' ')
    resolveNameAddress(name)
    .then((state) => {
      updateAddressState.call(this, state)
    })
    .catch((error) => {
      updateAddressState('NETWORK-ERROR') 
    })
  })

  return nameInput
}

export default class foodEditor extends HTMLElement {

  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    let style = document.createElement('style')
    style.textContent = styleSheet.toString()
    this.shadow.appendChild(style)

    this.container = document.createElement('div')
    this.container.classList.add(styleSheet.classes.container)
    this.shadow.appendChild(this.container)

    this.nameInput = NameInput.call(this)
    this.container.appendChild(this.nameInput)

    this.nameAddressState = document.createElement('div')
    this.nameAddressState.classList.add(styleSheet.classes.nameAddressState)
    this.container.appendChild(this.nameAddressState)

    this.nutrientTable = document.createElement('nutrient-table')
    this.container.appendChild(this.nutrientTable)
  }

  compileData () {
    let name = this.nameInput.value
    let data = {
      name,
      food: { name }
    }
    this.nutrientTable.shadow.querySelectorAll('.constituent').forEach((v) => {
      let value = v.querySelector('input').value
      if (value) data.food[v.id] = value
    })

    return sha256Hex(name)
    .then((hex) => {
      let address = '100000' + hex
      let header = {'familyName': 'foodchain', 'familyVersion': '1.0'}
      header.inputs = [address]
      header.outputs = [address] 

      let payload = { action: 'create', food: data.food }
      return sawtooth.buildTransaction(header, payload)
    })
    .then((transaction) => {
      data.timeStamp = Date.now()
      data.status = 'SIGNED'
      data.transaction = transaction

      return Promise.resolve(data)
    })
    .catch((error) => {
      console.log(error)
    })
  }
}
