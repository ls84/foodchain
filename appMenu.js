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
    container.appendChild(mine)

    let food = document.createElement('div')
    food.innerHTML = '<span>f<span/>'
    container.appendChild(food)

    let sign = document.createElement('div')
    sign.innerHTML = '<span>s<span/>'
    container.appendChild(sign)
  }
}

customElements.define('app-menu', appMenu)
