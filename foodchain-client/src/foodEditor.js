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
  'addressState': {
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
    let name = nameInput.value.trim().split(/\s/).filter(v => v!== "").join(' ')

    let isEmpty = (name === '') ? true : false
    let NameChanged = new CustomEvent('NameChanged', {composed: true, detail: { name, isEmpty}})
    nameInput.dispatchEvent(NameChanged)
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

    this.addressState = document.createElement('div')
    this.addressState.classList.add(styleSheet.classes.addressState)
    this.container.appendChild(this.addressState)

    this.nutrientTable = document.createElement('nutrient-table')
    this.container.appendChild(this.nutrientTable)

    this.shadow.addEventListener('NameChanged', (e) => {
      let constituentExists = this.nutrientTable.shadow.querySelector('.constituent')
      this.nutrientTable.selector.hidden = (e.detail.isEmpty && !constituentExists) ? true : false
    }, true)
  }

  compileData () {
    let name = this.nameInput.value
    let data = {
      name,
      food: { name },
      timeStamp: Date.now()
    }
    this.nutrientTable.shadow.querySelectorAll('.constituent').forEach((v) => {
      let value = v.querySelector('input').value
      if (value) data.food[v.id] = value
    })

    return sha256Hex(name)
    .then((hex) => {
      let foodAddress = '100000' + hex
      let signerAddress = '100000' + sawtooth.key.getPublic().encodeCompressed('hex').substr(2,64)
      let header = {'familyName': 'foodchain', 'familyVersion': '1.0'}
      header.inputs = [foodAddress, signerAddress]
      header.outputs = [foodAddress, signerAddress] 

      let payload = { action: 'create', data: data }
      return sawtooth.buildTransaction(header, payload)
    })
    .then((transaction) => {
      data.status = 'SIGNED'
      data.transaction = transaction

      return Promise.resolve(data)
    })
    .catch((error) => {
      console.log(error)
    })
  }
}
