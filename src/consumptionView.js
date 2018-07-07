const JSS = jss.create()
JSS.setup({createGenerateClassName: () => (rule, sheet) => rule.key})
JSS.use(jssNested.default())

const styles = {
  'signButton': {
    'height': '30px',
    'width': '60px',
    'position': 'relative',
    'left': 'calc(100% - 60px)',
    'line-height': '30px',
    'text-align': 'center',
    'background-color': 'white',
    'margin-top': '10px',
    'margin-bottom': '20px',
    'font-family': 'sans-serif',
    'color': 'lightgrey',
    '&.active': {
      'color': 'black'
    }
  }
}

const styleSheet = JSS.createStyleSheet(styles)

async function signConsumption() {
  let data = await this.consumptionEditor.compileData()
  DB.postMessage(['InsertConsumption', data])
}

function SignButton() {
  let sign = document.createElement('div')
  sign.className = 'signButton'
 
  sign.textContent = 'Sign'
  
  sign.addEventListener('click', signConsumption.bind(this))

  return sign
}

export default class consumptionView extends HTMLElement {
  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    let style = document.createElement('style')
    style.textContent = styleSheet.toString()
    this.shadow.appendChild(style)

    this.consumptionEditor = document.createElement('consumption-editor')
    this.shadow.appendChild(this.consumptionEditor)

    this.signButton = SignButton()
    this.shadow.appendChild(this.signButton)

  }
}
