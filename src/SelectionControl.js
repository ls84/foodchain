const JSS = jss.create()
JSS.setup({createGenerateClassName: () => (rule, sheet) => rule.key})
JSS.use(jssNested.default())

const styles = {
  'container': {
    'position': 'fixed',
    'background-color': 'white',
    'width': '200px',
    'height': '40px',
    'bottom': '8px',
    'right': '8px',
    'box-shadow': '4px 4px 8px grey',
    'font-size': '24px',
    'text-align': 'center',
    'line-height': '32px'
  },
  'ok': {
    'width': '94px',
    'height': '32px',
    'float': 'left',
    'margin': '4px 0px 4px 4px',
    'background-color': 'lightblue'
  },
  'cancel': {
    'width': '94px',
    'height': '32px',
    'float': 'right',
    'margin': '4px 4px 4px 0px',
    'background-color': 'whitesmoke'
  }
}

const styleSheet = JSS.createStyleSheet(styles)

class selectionControl extends HTMLElement {
  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    let style = document.createElement('style')
    style.textContent = styleSheet.toString()
    this.shadow.appendChild(style)

    this.container = document.createElement('div')
    this.container.className = 'container'

    this.cancel = document.createElement('div')
    this.cancel.className = ('cancel')
    this.cancel.textContent = 'cancel'
    this.cancel.addEventListener('click', (e) => {
      this.dispatchEvent(new CustomEvent('FoodSelectionCancel', { composed: true }))
    })

    this.ok = document.createElement('div')
    this.ok.className = 'ok'
    this.ok.textContent = 'ok'
    this.ok.addEventListener('click', (e) => {
      this.dispatchEvent(new CustomEvent('FoodSelectionOk', { composed: true }))
    })

    this.container.appendChild(this.cancel)
    this.container.appendChild(this.ok)

    this.shadow.append(this.container)
  }
}

customElements.define('selection-control', selectionControl)
