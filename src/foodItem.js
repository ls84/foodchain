const JSS = jss.create()
JSS.setup({createGenerateClassName: () => (rule, sheet) => rule.key})
JSS.use(jssNested.default())

const styles = {
  'container': {
    'padding': '10px',
    'margin-bottom': '10px',
    'background-color': 'white',
    'font-family': 'sans-serif',
    '&.asFood': {
      'margin-bottom': '0'
    },
    '&.submitted': {
      'background-color': 'lightyellow'
    },
    '& input': {
      'display': 'none',
      'float': 'left',
      'height': '21px',
      'margin': '0',
      'width': '21px',
      'margin-top': '8px',
      'margin-right': '8px',
      '&.select': {
        'display': 'inline'
      }
    },
    '& .removeButton': {
      'display': 'none',
      'float': 'left',
      'height': '35px',
      'width': '40px',
      'font-size': '21px',
      'line-height': '35px',
      'font-weight': '100',
      '&.selected': {
        'display': 'inline'
      }
    }
  },
  'name': {
    'height': '35px',
    'line-height': '35px',
    'font-size': '24px'
  }
}

const styleSheet = JSS.createStyleSheet(styles)

function CheckBox () {
  let previousState = false
  let checkBox = document.createElement('input')
  checkBox.setAttribute('type', 'checkbox')
  checkBox.addEventListener('click', (e) => {
    e.stopImmediatePropagation()
    if (!previousState) {
      this.dispatchEvent(new CustomEvent('FoodSelected', { composed: true, detail: this.data }))
    }
    if (previousState) {
      checkBox.checked = true
    }
    previousState = checkBox.checked
  })

  checkBox.uncheck = () => {
    checkBox.checked = false
    previousState = false
  }

  return checkBox
}

function RemoveButton () {
  let removeButton = document.createElement('div')
  removeButton.classList.add('removeButton')
  removeButton.textContent = 'x'
  removeButton.addEventListener('click', (e) => {
    e.stopImmediatePropagation()
    this.dispatchEvent(new CustomEvent('FoodRemovedFromConsumption', { composed: true, detail: this.name.textContent }))
    this.remove()
  })

  return removeButton
}

function toggleNutrientTable (e) {
  let currentState = this.nutrientTable.container.hidden
  this.nutrientTable.container.hidden = (currentState) ? false : true
}

export default class foodItem extends HTMLElement {

  static get observedAttributes() { return ['data-status'] }

  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    let style = document.createElement('style')
    style.textContent = styleSheet.toString()
    this.shadow.appendChild(style)

    this.data = {}

    this.container = document.createElement('div')
    this.container.classList.add('container')

    this.checkBox = CheckBox.call(this)
    this.container.append(this.checkBox)

    this.removeButton = RemoveButton.call(this)
    this.container.append(this.removeButton)

    this.name = document.createElement('div')
    this.name.classList.add('name')
    this.container.append(this.name)

    this.nutrientTable = document.createElement('nutrient-table')
    
    this.nutrientTable.container.hidden = true
    this.container.append(this.nutrientTable)

    this.shadow.appendChild(this.container)
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-status') {
      switch (newValue) {
        case 'SIGNED':
          this.container.className = 'container signed'
          this.nutrientTable.setAttribute('data-review', true)
          this.onclick = toggleNutrientTable.bind(this)
          break

        case 'SUBMITTED':
          this.container.className = 'container submitted'
          this.nutrientTable.setAttribute('data-review', true)
          this.onclick = this.confirmSubmission
          break

        case 'COMMITTED':
          this.container.className = 'container committed'
          this.nutrientTable.setAttribute('data-review', true)
          this.onclick = toggleNutrientTable.bind(this)
          break

        case 'ASFOOD':
          this.container.className = 'container asFood'
          this.nutrientTable.setAttribute('data-review', true)
          this.onclick = toggleNutrientTable.bind(this)
          break

        case 'SELECTED':
          this.container.className = 'container asFood'
          this.nutrientTable.setAttribute('data-review', true)
          this.removeButton.className = 'removeButton selected'
          this.onclick = toggleNutrientTable.bind(this)
      }
    }
  }

  init (data, source) {
    this.data.name = data.food.name
    this.data.food = data.food
    this.data.transaction = data.transaction
    this.data.batchID = data.batchID
    this.data.name = data.name
    if (!this.data.name) throw new Error('data does not have a name')
    this.name.textContent = this.data.name

    for (let property in this.data.food) {
      if (property !== 'name') this.nutrientTable.addConstituent(property, this.data.food[property])
    }
  }

  build () {
    let name = this.data.food.name
    if (!name) throw new Error('data should have a name')
    return sha256Hex(name)
    .then((hex) => {
      let address = '100000' + hex
      let header = {'familyName': 'foodchain', 'familyVersion': '1.0'}
      header.inputs = [address]
      header.outputs = [address] 

      let payload = { action: 'create', food: this.data.food }
      return sawtooth.buildTransaction(header, payload)
    })
    .then((transaction) => {
      this.data.timeStamp = Date.now()
      this.data.status = 'SIGNED'
      this.data.transaction = transaction

      return Promise.resolve(this.data)
    })
    .catch((error) => {
      console.log(error)
    })
  }
}
