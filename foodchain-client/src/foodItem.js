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
    this.shadow.appendChild(this.container)
  }

  update (data) {
    let name = document.createElement('div')
    name.classList.add('name')
    name.textContent = data.name

    this.container.appendChild(name)
  }
}

customElements.define('food-item', foodItem)
