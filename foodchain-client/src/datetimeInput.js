const JSS = jss.create()
JSS.setup({createGenerateClassName: () => (rule, sheet) => rule.key})
JSS.use(jssNested.default())

const styles = {
  'container': {
    'width': '100%',
    'background-color': 'white'
  },
  'datetimeInput': {
    '-webkit-appearance': 'none',
    'background-color': 'white',
    'border': 'none',
    'display': 'block',
    'width': 'calc(100vw - 36px)',
    'font-size': '24px',
    'font-weight': '100',
    'text-align': 'left',
    'padding-top': '10px',
    'padding-bottom': '10px',
    'padding-left': '0px',
    'padding-right': '0px',
    'margin-left': '10px',
    'margin-right': '10px',
    'border-bottom': 'dotted lightgrey'
  },
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

function formatLocalDatetime (datetime) {
  let year = datetime.getFullYear()
  let month = (datetime.getMonth() + 1).toString().padStart(2, '0')
  let date = datetime.getDate().toString().padStart(2, '0')
  let hours = datetime.getHours().toString().padStart(2, '0')
  let minutes = datetime.getMinutes().toString().padStart(2, '0')

  return `${year}-${month}-${date}T${hours}:${minutes}:00.000`
}

export default class datetimeInput extends HTMLElement {
  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    let style = document.createElement('style')
    style.textContent = styleSheet.toString()
    this.shadow.appendChild(style)

    let container = document.createElement('div')
    container.classList.add('container')

    this.datetimeInput = document.createElement('input')
    this.datetimeInput.classList.add('datetimeInput')
    this.datetimeInput.setAttribute('type', 'datetime-local')
    this.datetimeInput.value = formatLocalDatetime(new Date())
    this.value = this.datetimeInput.value

    this.foodSelector = document.createElement('div')
    this.foodSelector.classList.add('foodSelector')
    let plusSign = document.createElement('div')
    plusSign.classList.add('plusSign')
    plusSign.textContent = '+'
    this.foodSelector.append(plusSign)


    container.appendChild(this.datetimeInput)
    container.appendChild(this.foodSelector)

    this.shadow.appendChild(container)
    // this.shadow.appendChild(this.foodSelector)
  }
}
