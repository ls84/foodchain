const JSS = jss.create()
JSS.setup({createGenerateClassName: () => (rule, sheet) => rule.key})
JSS.use(jssNested.default())

const styles = {
  'container': {
    'list-style-type': 'none',
    'padding': '0',
    'margin': '0',
    'font-family': 'sans-serif',
    'font-size': '16px',
    '& li': {
      'width': '100%',
      'height': '25px',
      'margin-bottom': '8px',
      '&.groupLabel': {
        'padding-left': '25px'
      }
    },
    '& .constituent': {
        'font-weight': '100',
      '& div:nth-child(1)': {
        'height': '25px',
        'width': '25px',
        'line-height': '25px',
        'text-align': 'center',
        'float': 'left'
      },
      '& div:nth-child(2)': {
        'height': '25px',
        'line-height': '25px',
        'text-align': 'left',
        'float': 'left',
        'padding-left': '25px'
      },
      '& div:nth-child(3)': {
        'height': '25px',
        'float': 'right',
        'line-height': '25px',
        'box-sizing': 'border-box',
        'border-bottom': '6px solid lemonchiffon',
        '& input' : {
          'width': '50px',
          'height': '24px',
          'position': 'relative',
          'bottom': '-1px',
          'background-color': 'rgba(255,255,255,0)',
          'text-align': 'right',
          'padding-right': '5px',
          'font-size': '16',
          'font-family': 'sans-serif',
          'font-weight': '100',
          'border': '0',
          '&:focus': {
            'outline': 'none'
          }
        }
      },
      '&#Energy': {
        'border-top': '1px solid grey',
        'padding-top': '10px'
      }
    }
  },
  'constituentSelector' : {
    '& div:first-child': {
      'height': '25px',
      'width': '25px',
      'line-height': '25px',
      'text-align': 'center',
      'float': 'left'
    },
    '& select': {
      'height': '25px',
      'outline': 'none',
      'border-radius': '0px',
      'background-color': 'rgba(255,255,255,0)',
      'float': 'left',
      'padding-right': '15px',
      'border': 'none',
    },
    '& div:nth-child(3)': {
      'height': '25px',
      'width': '120px',
      'padding-right': '5px',
      'background-color': 'rgb(245,245,245)',
      'line-height': '25px',
      'text-align': 'right',
      'float': 'left',
      'position': 'relative',
      'left': '-125px',
      'z-index': '-1',
      'border': 'none'
    }
  }
}

const styleSheet = JSS.createStyleSheet(styles)

const makeConstituent = (name) => {
  let constituent = document.createElement('li')
  constituent.classList.add('constituent')
  constituent.id = name

  let remove = document.createElement('div')
  remove.classList.add('remove')
  remove.textContent = 'x'
  constituent.appendChild(remove)

  let constituentName = document.createElement('div')
  constituentName.textContent = name
  constituent.appendChild(constituentName)

  let valueInput = document.createElement('div')
  valueInput.innerHTML = (name === 'Energy') ? `<input type='number' />Kcal` : `<input type='number' />g`
  constituent.appendChild(valueInput)

  return constituent
}

const Selector = function () {
  let container = document.createElement('li')
  container.classList.add('constituentSelector')

  let plusSign = document.createElement('div')
  plusSign.textContent = '+'
  container.appendChild(plusSign)

  let selector = document.createElement('select')

  let placeHolder = document.createElement('option')
  placeHolder.setAttribute('disabled', true)
  placeHolder.setAttribute('selected', true)
  placeHolder.innerText = 'Add Constituents'
  selector.appendChild(placeHolder)

  let proximateGroup = document.createElement('optgroup')
  proximateGroup.setAttribute('label', 'Proximate')
  // let constituents = ['moisture', 'protein', 'fat', 'carbohydrate', 'minerals']
  let constituents = ['Protein', 'Fat', 'Carbohydrate']
  constituents.forEach((v) => {
    let c = document.createElement('option')
    c.setAttribute('value', v)
    c.innerText = v[0].toUpperCase() + v.substring(1)
    proximateGroup.appendChild(c)
  })
  selector.appendChild(proximateGroup)

  let energy = document.createElement('option')
  energy.setAttribute('value', 'Energy')
  energy.innerText = 'Energy'
  selector.appendChild(energy)

  selector.addEventListener('change', (event) => {
    // addConstituentToEditor.call(this, event.target.value)
    this.addConstituent(event.target.value)
    event.target.selectedIndex = 0
  })

  container.appendChild(selector)

  let blackTriangleDown = document.createElement('div')
  blackTriangleDown.textContent = '▾'
  container.appendChild(blackTriangleDown)

  container.hidden = true

  this.container.append(container)

  return container
}

export default class nutrientTable extends HTMLElement {
  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    let style = document.createElement('style')
    style.textContent = styleSheet.toString()
    this.shadow.appendChild(style)

    this.container = document.createElement('ul')
    this.container.classList.add('container')
    this.shadow.appendChild(this.container)

    this.selector = Selector.call(this)
  }
  
  addConstituent (name, value) {
    let constituentExists = this.container.querySelector(`#${name}`)
    if (!constituentExists) {
      let constituent = makeConstituent(name)
      if (value) {
        let input = constituent.querySelector('input')
        input.value = value
        input.disabled = true
        
        let remove = constituent.querySelector('.remove')
        remove.hidden = true
      }
      if (name === 'Energy') {
        constituent.querySelector('.remove').addEventListener('click', () => {
          constituent.remove()
        })
        this.container.appendChild(constituent)
      } 
      if (name !== 'Energy') {
        let labelExists = this.container.querySelector('.groupLabel')
        if (!labelExists) {
          let proximate = document.createElement('li')
          proximate.classList.add('groupLabel')
          proximate.innerHTML = 'Proximate:'
          this.container.prepend(proximate)
        }

        constituent.querySelector('.remove').addEventListener('click', () => {
          constituent.remove()
          let remainConstituent = this.container.querySelectorAll('.constituent:not(#Energy)')
          if (remainConstituent.length === 0) {
            this.container.querySelector('.groupLabel').remove()
          }
        })
        this.container.insertBefore(constituent, this.selector)
      }
    }
  }

  update (data) {
    Object.entries(data).forEach((v) => {
      this.addConstituent(v[0], v[1])
    })
  }
}
