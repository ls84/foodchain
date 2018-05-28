const JSS = jss.create()
JSS.setup({createGenerateClassName: () => (rule, sheet) => rule.key})
JSS.use(jssNested.default())

const styles = {
  'container': {
    'clear': 'both',
    'padding': '10px',
    'margin-bottom': '10px',
    'background-color': 'white',
    'font-family': 'sans-serif'
  },
  'name': {
    'height': '35px',
    'line-height': '35px',
    'font-size': '24px'
  }
}

const styleSheet = JSS.createStyleSheet(styles)

export default class foodItem extends HTMLElement {
  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    let style = document.createElement('style')
    style.textContent = styleSheet.toString()
    this.shadow.appendChild(style)

    this.container = document.createElement('div')
    this.container.classList.add('container')

    this.name = document.createElement('div')
    this.name.classList.add('name')
    this.container.append(this.name)

    this.nutrientTable = document.createElement('nutrient-table')
    this.nutrientTable.container.hidden = true
    this.container.append(this.nutrientTable)

    this.container.addEventListener('click', () => {
      let currentState = this.nutrientTable.container.hidden
      this.nutrientTable.container.hidden = (currentState) ? false : true
    })

    this.shadow.appendChild(this.container)
  }

  update (data) {
    this.data = Object.assign({}, data)
    if (this.data.name) this.name.textContent = this.data.name
    for (let property in this.data) {
      if (property !== 'name') this.nutrientTable.addConstituent(property, this.data[property])
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
  }
}
