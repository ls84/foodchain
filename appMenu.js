import jss from 'jss'
import preset from 'jss-preset-default'
jss.setup(preset())
jss.setup({createGenerateClassName: () => (rule, sheet) => rule.key})

const styleRules = {
  'container': {
    'display': 'grid',
    'grid-template-columns': 'auto auto auto',
    'width': 'calc(100vw - 16px)',
    'height': '45px',
    '& div': {
      'background-color': 'lightgrey',
      'text-align': 'center',
      '& span': {
        'font-size': '24px',
        'font-family': 'monospace',
        'line-height': '45px'
      }
    },
    '& div:nth-child(2)': {
      'margin-left': '1px',
      'margin-right': '1px'
    }
  }
}

const styleSheet = jss.createStyleSheet(styleRules)

class appMenu extends HTMLElement {
  constructor () {
    super()
    let shadow = this.attachShadow({mode: 'open'})
    let style = document.createElement('style')
    style.textContent = styleSheet.toString()
    shadow.appendChild(style)

    let container = document.createElement('div')
    container.classList.add(styleSheet.classes.container)
    shadow.appendChild(container)

    let mine = document.createElement('div')
    mine.innerHTML = '<span>m<span/>'
    mine.addEventListener('click', (e) => {
      if (!this.minePage) throw new Error('minePage is not ready')
      this.minePage()
    })
    container.appendChild(mine)

    let food = document.createElement('div')
    food.innerHTML = '<span>f<span/>'
    food.addEventListener('click', (e) => {
      if (!this.foodPage) throw new Error('foodPage is not ready')
      this.foodPage()
    })
    container.appendChild(food)

    let sign = document.createElement('div')
    sign.innerHTML = '<span>s<span/>'
    sign.addEventListener('click', (e) => {
      if (!this.signPage) throw new Error('signPage is not ready')
      this.signPage()
    })
    container.appendChild(sign)
  }
}

customElements.define('app-menu', appMenu)
