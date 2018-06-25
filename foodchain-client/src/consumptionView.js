const JSS = jss.create()
JSS.setup({createGenerateClassName: () => (rule, sheet) => rule.key})
JSS.use(jssNested.default())

const styles = {
  'foodSelector': {
    'background-color': 'white',
    'height': '60px',
    'padding': '10px',
    '& .plusSign': {
      'font-size': '30px'
    }
  }
}

const styleSheet = JSS.createStyleSheet(styles)

export default class consumptionView extends HTMLElement {
  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    let style = document.createElement('style')
    style.textContent = styleSheet.toString()
    this.shadow.appendChild(style)

    this.consumptionEditor = document.createElement('consumption-editor')
    this.shadow.appendChild(this.consumptionEditor)

    // this.datetimeInput = document.createElement('datetime-input')
    // this.shadow.appendChild(this.datetimeInput)

    // this.foodSelector = document.createElement('div')
    // this.foodSelector.classList.add('foodSelector')
    // let plusSign = document.createElement('div')
    // plusSign.classList.add('plusSign')
    // plusSign.textContent = '+'
    // this.foodSelector.append(plusSign)

    // this.shadow.appendChild(this.foodSelector)
  }
}
