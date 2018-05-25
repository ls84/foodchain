const JSS = jss.create()
JSS.setup({createGenerateClassName: () => (rule, sheet) => rule.key})
JSS.use(jssNested.default())

const styles = {
  'container': {
    'clear': 'both',
    'padding': '10px', 
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

class foodItem extends HTMLElement {
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
    this.data = data

    if (data.name) this.name.textContent = data.name

    Object.entries(this.data)
    .filter(v => v[0] !== 'name')
    .forEach((v) => { this.nutrientTable.addConstituent(v[0], v[1]) })
  }
}

customElements.define('food-item', foodItem)
