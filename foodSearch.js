import jss from 'jss'
import preset from 'jss-preset-default'
jss.setup(preset())
jss.setup({createGenerateClassName: () => (rule, sheet) => rule.key})

const styles = {
  'input': {
    'width': 'calc( 100vw - 16px )',
    'height': '35px',
    'background-color': 'rgb(245,245,245)',
    'outline': 'none',
    'border': 'none'
  },
  'preview': {
    'width': 'calc( 100vw - 16px )',
    'padding-left': '0px',
    'margin': '0',
    'list-style-type': 'none',
    'visibility': 'hidden',
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

    this.input = document.createElement('input')
    this.input.setAttribute('type', 'text')
    this.input.addEventListener('keyup', (e) => {
      if (!this.search) throw new Error('search function is not ready')
      this.search(this.input.value)
    })



    this.input.classList.add(styleSheet.classes.input)
    this.shadow.appendChild(this.input)

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
