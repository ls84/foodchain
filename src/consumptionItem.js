const JSS = jss.create()
JSS.setup({createGenerateClassName: () => (rule, sheet) => rule.key})
JSS.use(jssNested.default())

let styles = {
  'container': {
    'margin-bottom': '10px'
  },
  'datetimeValue': {
   'background-color': 'white',
   'font-size': '24px',
   'font-family': 'sans-serif',
   'font-weight': '100',
   'height': '60px',
   'line-height': '60px',
   'padding-left': '10px'
  }
}

const styleSheet = JSS.createStyleSheet(styles)

function toggleConsumptionDetail() {
  this.foodTable.hidden = (this.foodTable.hidden)? false : true
}

class consumptionItem extends HTMLElement {

  static get observedAttributes() { return ['data-status'] }

  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    let style = document.createElement('style')
    style.textContent = styleSheet.toString()
    this.shadow.appendChild(style)

    this.data = {}

    this.container = document.createElement('div')
    this.container.className = 'container'

    this.datetimeValue = document.createElement('div')
    this.datetimeValue.className = 'datetimeValue'
    this.datetimeValue.addEventListener('click', toggleConsumptionDetail.bind(this))
    this.container.appendChild(this.datetimeValue)

    this.foodTable = document.createElement('div')
    this.foodTable.hidden = true
    this.container.append(this.foodTable)

    this.shadow.appendChild(this.container)
  }

  init(data) {
    this.data = data
    this.datetimeValue.textContent = data.datetimeValue
    .replace(/-/g, '/')
    .replace('T',', ' )
    .replace(/:00.000$/, '')

    data.foodItemsData.forEach((d) => {
      let foodItem = document.createElement('food-item')
      foodItem.init(d)
      foodItem.setAttribute('data-status', 'ASFOOD')
      this.foodTable.appendChild(foodItem)
    })
  }
}

customElements.define('consumption-item', consumptionItem)
