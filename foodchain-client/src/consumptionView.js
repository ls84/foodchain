const JSS = jss.create()
JSS.setup({createGenerateClassName: () => (rule, sheet) => rule.key})
JSS.use(jssNested.default())

const styles = {}

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
  }
}
