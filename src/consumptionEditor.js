const JSS = jss.create()
JSS.setup({createGenerateClassName: () => (rule, sheet) => rule.key})
JSS.use(jssNested.default())

import { sha256Hex } from './hashing.js'

const styles = {
  'container': {
    'width': '100%',
    'background-color': 'white'
  },
  'datetimeInput': {
    '-webkit-appearance': 'none',
    'background-color': 'white',
    'border': 'none',
    'display': 'block',
    'width': 'calc(100vw - 36px)',
    'font-size': '24px',
    'font-weight': '100',
    'text-align': 'left',
    'padding-top': '10px',
    'padding-bottom': '10px',
    'padding-left': '0px',
    'padding-right': '0px',
    'margin-left': '10px',
    'margin-right': '10px',
    'margin-bottom': '0px',
    'border-bottom': 'dotted lightgrey'
  },
  'foodSelector': {
    'background-color': 'white',
    'height': '40px',
    'padding': '10px',
    '& .plusSign': {
      'font-size': '30px',
      'width': '40px',
      'height': '40px',
      'display': 'inline-block'
    },
    '& span': {
      'font-size': '24px',
      'font-family': 'sans-serif',
      'font-weight': '100',
      'color': 'grey'
    }
  }
}

const styleSheet = JSS.createStyleSheet(styles)

function formatLocalDatetime (datetime) {
  let year = datetime.getFullYear()
  let month = (datetime.getMonth() + 1).toString().padStart(2, '0')
  let date = datetime.getDate().toString().padStart(2, '0')
  let hours = datetime.getHours().toString().padStart(2, '0')
  let minutes = datetime.getMinutes().toString().padStart(2, '0')

  return `${year}-${month}-${date}T${hours}:${minutes}:00.000`
}

export default class consumptionEditor extends HTMLElement {
  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    let style = document.createElement('style')
    style.textContent = styleSheet.toString()
    this.shadow.appendChild(style)

    let container = document.createElement('div')
    container.classList.add('container')

    this.datetimeInput = document.createElement('input')
    this.datetimeInput.classList.add('datetimeInput')
    this.datetimeInput.setAttribute('type', 'datetime-local')
    this.datetimeInput.value = formatLocalDatetime(new Date())
    this.datetimeValue = this.datetimeInput.value

    this.foodSelector = document.createElement('div')
    this.foodSelector.classList.add('foodSelector')
    let plusSign = document.createElement('div')
    plusSign.classList.add('plusSign')
    plusSign.textContent = '+'
    this.foodSelector.append(plusSign)
    let label = document.createElement('span')
    label.textContent = 'Add food ...'
    this.foodSelector.append(label)
    this.foodSelector.addEventListener('click', (e) => {
      let selected = Array.from(this.shadow.querySelectorAll('food-item')).map(n => n.data)
      this.dispatchEvent(new CustomEvent('FoodSelect', { composed: true, detail: selected }))
    })

    container.appendChild(this.datetimeInput)
    container.appendChild(this.foodSelector)

    this.shadow.appendChild(container)
    this.shadow.appendChild(this.foodSelector)

    this.addEventListener('AddFood', (e) => {
      let data = e.detail
      let foodItem = document.createElement('food-item')
      foodItem.init(data, 'DATABASE')
      foodItem.setAttribute('data-status', 'SELECTED')
      this.shadow.insertBefore(foodItem, this.foodSelector)
    })
  }

  applyFoodSelection (data) {
    let exists = Array.from(this.shadow.querySelectorAll('food-item')).map(n => n.data)
    let selection = data

    let add = new Set(selection.map(n => n.name))
    exists.forEach((n) => {
      add.delete(n.name)
    })

    let remove = new Set(exists.map(n => n.name))
    selection.forEach(n => {
      remove.delete(n.name)
    })

    remove.forEach((name) => {
      Array.from(this.shadow.querySelectorAll('food-item')).find((n) => n.data.name === name)
      .remove()
    })

    add.forEach((name) => {
      let data = selection.find(d => d.name === name)
      let foodItem = document.createElement('food-item')
      foodItem.init(data, 'DATABASE')
      foodItem.setAttribute('data-status', 'SELECTED')
      this.shadow.insertBefore(foodItem, this.foodSelector)
    })
  }

  compileData () {
    let myPublicKey = sawtooth.key.getPublic().encodeCompressed('hex')
    let datetimeValue = this.datetimeValue
    let foodItemsData = Array.from(this.shadow.querySelectorAll('food-item'))
    .map((n) => {
      return {
        foodAddress: n.data.foodAddress,
        name: n.data.name,
        food: n.data.food
      }
    })

    let data = { datetimeValue, foodItemsData }

    return sha256Hex(`${datetimeValue},${myPublicKey}`)
    .then((hex) => {
      let signerAddress = '100000' + sawtooth.key.getPublic().encodeCompressed('hex').substr(2,64)
      let consumptionAddress = `100000${hex}`
      let header = {'familyName': 'foodchain', 'familyVersion': '1.0'}
      header.inputs = [consumptionAddress, signerAddress]
      header.outputs = [consumptionAddress, signerAddress]

      data.consumptionAddress = consumptionAddress

      let payload = { action: 'consume', data }
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
