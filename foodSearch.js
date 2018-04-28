import jss from 'jss'
import preset from 'jss-preset-default'
jss.setup(preset())
jss.setup({createGenerateClassName: () => (rule, sheet) => rule.key})

const styles = {
  'container': {
    'width': 'calc( 100vw - 16px )',
    'height': '35px',
    'display': 'grid',
    'grid-template-columns': 'auto 35px',
  },
  'input': {
    'height': '35px',
    'background-color': 'rgb(245,245,245)',
    'outline': 'none',
    'border': 'none',
    'font-family': 'sans-serif',
    'font-size': '18px'
  },
  'add': {
    'line-height': '35px',
    'text-align': 'center'
  },
  'preview': {
    'position': 'absolute',
    'width': 'calc( 100vw - 16px )',
    'padding-left': '0px',
    'margin': '0',
    'list-style-type': 'none',
    'visibility': 'hidden',
    'font-family': 'sans-serif',
    'font-size': '16px',
    'background-color': 'white',
    '&.display': {
      'visibility': 'visible'
    }
  },
  'close': {
    'height': '30px',
    'text-align': 'right',
    'margin-right': '10px'
  }
}

const styleSheet = jss.createStyleSheet(styles)

class foodSearch extends HTMLElement {
  constructor () {
    super()
    this.shadow = this.attachShadow({mode: 'open'})
    
    let style = document.createElement('style')
    style.textContent = styleSheet.toString()
    this.shadow.appendChild(style)

    this.container = document.createElement('div')
    this.container.classList.add(styleSheet.classes.container)
    this.shadow.appendChild(this.container)

    this.input = document.createElement('input')
    this.input.setAttribute('type', 'text')
    this.input.addEventListener('keyup', (e) => {
      if (!this.search) throw new Error('search function is not ready')
      this.search(this.input.value)
    })
    this.input.classList.add(styleSheet.classes.input)
    this.container.appendChild(this.input)

    this.add = document.createElement('div')
    this.add.innerHTML = '<span>a</span>'
    this.add.addEventListener('click', (e) => {
      if (!this.add) throw new Error('add function is not ready')
      this.add(this.input.value)
    })
    this.add.classList.add(styleSheet.classes.add)
    this.container.appendChild(this.add)

    this.preview = document.createElement('ul')
    this.preview.classList.add(styleSheet.classes.preview)

    this.input.addEventListener('focus', (e) => {
      this.preview.classList.add('display')
    })

    this.shadow.appendChild(this.preview)
  }

  previewResults (data) {
    while (this.preview.hasChildNodes()) {
      this.preview.removeChild(this.preview.lastChild)
    }

    if (data.length > 0) {
      data.forEach((v) => {
        let item = document.createElement('li')
        item.textContent = v.name
        item.addEventListener('click', () => {
          this.input.value = v.name 
          this.preview.classList.remove('display')
        })
        this.preview.appendChild(item)
      })
      let close = document.createElement('li')
      close.innerHTML = '<span>X</span>'
      close.classList.add(styleSheet.classes.close)
      close.querySelector('span').addEventListener('click', () => {
        this.preview.classList.remove('display')
      })
      this.preview.appendChild(close)
    }
  }
}

customElements.define('food-search', foodSearch)
