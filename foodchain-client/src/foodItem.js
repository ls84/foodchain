const JSS = jss.create()
JSS.setup({createGenerateClassName: () => (rule, sheet) => rule.key})
JSS.use(jssNested.default())

const styles = {
  'container': {
    'padding': '10px',
    'margin-bottom': '10px',
    'background-color': 'white',
    'font-family': 'sans-serif',
    '&.submitted': {
      'background-color': 'lightyellow'
    }
  },
  'name': {
    'height': '35px',
    'line-height': '35px',
    'font-size': '24px'
  }
}

const styleSheet = JSS.createStyleSheet(styles)

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

    this.name = document.createElement('div')
    this.name.classList.add('name')
    this.container.append(this.name)

    this.nutrientTable = document.createElement('nutrient-table')
    this.nutrientTable.container.hidden = true
    this.container.append(this.nutrientTable)

    this.container.addEventListener('click', (event) => {
      let status = this.getAttribute('data-status')
      switch (status) {
        case 'SIGNED':
        case 'COMMITTED':
          let currentState = this.nutrientTable.container.hidden
          this.nutrientTable.container.hidden = (currentState) ? false : true
          this.container.classList.value = 'container' 
          break
        case 'SUBMITTED':
          if (!this.confirmSubmission) throw new Error('confirm function is not defined')
          this.confirmSubmission()
          break
      }
    })

    this.shadow.appendChild(this.container)
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-status') {
      switch (newValue) {
        case 'SIGNED':
          this.container.classList.add('signed')
          this.nutrientTable.setAttribute('data-review', true)
          break

        case 'SUBMITTED':
          this.container.classList.add('submitted')
          this.nutrientTable.setAttribute('data-review', true)
          break

        case 'COMMITTED':
          this.container.classList.add('committed')
          this.nutrientTable.setAttribute('data-review', true)
          break
      }
    }
  }

  init (data, source) {
    switch (source) {
      case 'EDITOR':
        this.data.name = data.name
        this.data.food = data
        break
      case 'DATABASE':
        this.data.name = data.food.name
        this.data.food = data.food
        this.data.transaction = data.transaction
        this.data.batchID = data.batchID
        break
      case 'BLOCK':
        this.data.name = data.name
    }
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
