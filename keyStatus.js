import jss from 'jss'
import preset from 'jss-preset-default'
jss.setup(preset())
jss.setup({createGenerateClassName: () => (rule, sheet) => rule.key})

const styleRules = {
  'address': {
    'display': 'block',
    'float': 'left',
    'height': '30px',
    'width': 'calc(100% - 30px)',
    'overflow': 'hidden',
    '& span': {
      'line-height': '30px'
    }
  },
  'newKey': {
    'width': '30px',
    'float': 'right',
    'text-align': 'center',
    'background-color': 'whitesmoke',
    '& span': {
      'line-height': '30px'
    }
  }
}

const style = jss.createStyleSheet(styleRules)

class keyStatus extends HTMLElement {
  constructor () {
    super()
    let shadow = this.attachShadow({mode: 'open'})
    let styleSheet = document.createElement('style')
    styleSheet.textContent = style.toString()
    shadow.appendChild(styleSheet)

    let publicKey = document.createElement('div')
    publicKey.innerHTML = '<span></span>'
    publicKey.classList.add(style.classes.address)
    shadow.appendChild(publicKey)

    let newKey = document.createElement('div')
    newKey.addEventListener('click', () => {
      if (!this.generateNewKey) throw new Error('key generation is not ready')
      this.key = this.generateNewKey()
      publicKey.querySelector('span').textContent = this.key.getPublic().encodeCompressed('hex')
    })

    newKey.innerHTML = '<span>k</span>'
    newKey.classList.add(style.classes.newKey)
    shadow.appendChild(newKey)
  }
}

customElements.define('key-status', keyStatus)
