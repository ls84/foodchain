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
        case 'COMITTED':
          let currentState = this.nutrientTable.container.hidden
          this.nutrientTable.container.hidden = (currentState) ? false : true
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
    //TODO: use className to hide functionality of it's status
    if (name === 'data-status' && newValue === 'SIGNED') this.container.classList.add('signed')
    if (name === 'data-status' && newValue === 'SUBMITTED') this.container.classList.add('submitted')
    if (name === 'data-status' && newValue === 'COMMITTED') this.container.classList.remove('submitted')
  }

  update (data) {
    this.data = Object.assign(this.data, data)
    if (this.data.name) this.name.textContent = this.data.name
    for (let property in this.data) {
      if (!/name|status|transaction|timeStamp/.test(property)) this.nutrientTable.addConstituent(property, this.data[property])
    }
  }

  build () {
    if (!this.data.name) throw new Error('data should have a name')
    return sha256Hex(this.data.name)
    .then((hex) => {
      let address = '100000' + hex
      let header = {'familyName': 'foodchain', 'familyVersion': '1.0'}
      header.inputs = [address]
      header.outputs = [address] 

      let payload = { action: 'create', food: this.data }
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
