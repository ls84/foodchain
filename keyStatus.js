import jss from 'jss'
import preset from 'jss-preset-default'
jss.setup(preset())
jss.setup({createGenerateClassName: () => (rule, sheet) => rule.key})

const styleRules = {
  'address': {
    'display': 'block',
    'float': 'left',
    'height': '30px',
    'width': 'calc(100% - 94px)',
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
    'margin-right': '2px',
    '& span': {
      'line-height': '30px'
    }
  },
  'importKey': {
    'width': '30px',
    'float': 'right',
    'text-align': 'center',
    'background-color': 'whitesmoke',
    'margin-right': '2px',
    '& span': {
      'line-height': '30px'
    }
  },
  'privateKey': {
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

    let privateKey = document.createElement('div')
    privateKey.innerHTML = '<span>p</span>'
    privateKey.classList.add(style.classes.privateKey)
    shadow.appendChild(privateKey)

    let importKey = document.createElement('div')
    importKey.addEventListener('click', () => {
      if (!this.importKey) throw new Error('key import is not ready')
      this.key = this.importKey()
      publicKey.querySelector('span').textContent = this.key.getPublic().encodeCompressed('hex')
    })
    importKey.innerHTML = '<span>i</span>'
    importKey.classList.add(style.classes.importKey)
    shadow.appendChild(importKey)

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
