import jss from 'jss'
import preset from 'jss-preset-default'
jss.setup(preset())
jss.setup({createGenerateClassName: () => (rule, sheet) => rule.key})

const styleRules = {
  'container': {
    'height': '80px',
    'width': 'calc( 100vw - 32px )',
    'background-color': 'grey',
    'margin-top': '8px',
    'padding': '8px'
  },
  'type': {
    'with': '100vw',
    '& span': {
      'line-height': '80px'
    }
  },
  'button': {
    'display': 'block',
    'margin-left': 'auto',
    'margin-right': 'auto',
    'margin-top': '20px',
    'font-size': '20px'
  }
}

const styleSheet = jss.createStyleSheet(styleRules)

class transaction extends HTMLElement {
  constructor () {
    super()
    this.shadow = this.attachShadow({mode: 'open'})
    let style = document.createElement('style')
    style.textContent = styleSheet.toString()
    this.shadow.appendChild(style)
  }

  updateData (data) {
    data.forEach((v) => {
      let container = document.createElement('div')
      container.classList.add(styleSheet.classes.container)

      let type = document.createElement('div')
      type.innerHTML = `<span>${v.type}: ${v.name}</span>`
      type.classList.add(styleSheet.classes.type)
      container.appendChild(type)

      this.shadow.appendChild(container)
    })

    // build batch

    let button = document.createElement('button')
    button.innerText = 'Sign'
    button.addEventListener('click', (e) => {
      if (!this.sign) throw new Error('sign function is not ready')
      this.sign(data)
    })
    button.classList.add(styleSheet.classes.button)
    this.shadow.appendChild(button)
  }
}

customElements.define('transaction-review', transaction)
