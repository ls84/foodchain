import { sha256Hex } from './hashing.js'
const JSS = jss.create()
JSS.setup({createGenerateClassName: () => (rule, sheet) => rule.key})
JSS.use(jssNested.default())

const styles = {
  'container': {
    'width': `calc(100% - 20px)`,
    'background-color': 'white',
    'padding': '10px 10px 10px 10px',
    'position': 'relative',
    'z-index': '1'
  },
  'nameInput': {
    'font-family': 'sans-serif',
    'font-size': '24px',
    'width': '100%',
    'background-color': 'white',
    'margin': '0px',
    'padding': '10px',
    'padding-bottom': '0px',
    'outline': 'none',
    'border': 'none',
    'border-bottom': 'dotted lightgrey'
  },
  'nameAddressState': {
    'font-family': 'sans-serif',
    'font-size': '14px',
    'font-weight': '100',
    'text-align': 'right',
    'color': 'darkgrey',
    'width': '100%',
    'height': '16px'
  },
  'nutrientTable': {
    'list-style-type': 'none',
    'padding': '0',
    'margin-top': '0',
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
  },
  'signButton': {
    'height': '30px',
    'width': '60px',
    'line-height':'30px',
    'text-align': 'center',
    'background-color': 'white',
    'margin-top': '10px',
    'margin-bottom': '10px',
    'float': 'right',
    'font-family': 'sans-serif',
    'color': 'lightgrey',
    '&.active' : {
      'color': 'black'
    }
  }
}

const styleSheet = JSS.createStyleSheet(styles)

const verifyNameExistence = function () {
  let url = 'https://api.com'
  let name = this.nameInput.value
  return sha256Hex(name)
  .then((hash) => {
   return fetch(url, {
      method: 'GET',
      headers: {'Content-Type': 'application/octet-stream'},
      mode: 'cors'
    })
  })
  .then((response) => {
    return response.text()
  })
  .then((text) => {
    if (text === 'good') return Promise.resolve('good')
    return Promise.reject('unkown error')
  })
  .catch((e) => {
    return Promise.reject(error)
  })
}

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
  valueInput.innerHTML = `<input type='number' />g`
  constituent.appendChild(valueInput)

  return constituent
}

const addConstituentToEditor = function (name) {
  let constituentExists = this.querySelector(`#${name}`)
  if (!constituentExists) {
    let constituent = makeConstituent(name)
    if (name === 'Energy') {
      constituent.querySelector('.remove').addEventListener('click', () => {
        constituent.remove()
      })
      this.appendChild(constituent)
    } 
    if (name !== 'Energy') {
      let labelExists = this.querySelector('.groupLabel')
      if (!labelExists) {
        let proximate = document.createElement('li')
        proximate.classList.add('groupLabel')
        proximate.innerHTML = 'Proximate:'
        this.prepend(proximate)
      }

      constituent.querySelector('.remove').addEventListener('click', () => {
        constituent.remove()
        let remainConstituent = this.querySelectorAll('.constituent:not(#Energy)')
        if (remainConstituent.length === 0) {
          this.querySelector('.groupLabel').remove()
        }
      })
      this.insertBefore(constituent, this.querySelector('#selector'))
    }
  }
}

const NutrientTable = () => {
  let nutrientTable = document.createElement('ul')
  nutrientTable.classList.add(styleSheet.classes.nutrientTable)

  let selector = document.createElement('li')
  selector.id = 'selector'
  selector.hidden = true

  selector.appendChild(ConstituentSelector.call(nutrientTable))
  nutrientTable.appendChild(selector)

  return nutrientTable

}

const ConstituentSelector = function () {

  let container = document.createElement('div')
  container.classList.add(styleSheet.classes.constituentSelector)

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
    addConstituentToEditor.call(this, event.target.value)
    event.target.selectedIndex = 0
  })

  container.appendChild(selector)

  let blackTriangleDown = document.createElement('div')
  blackTriangleDown.textContent = '▾'
  container.appendChild(blackTriangleDown)

  return container
}

function SignButton () {
  let signButton = document.createElement('div')
  signButton.classList.add('signButton')
  signButton.textContent = 'Sign'
  signButton.addEventListener('click', (event) => {
    if (signButton.classList.contains('active') && this.sign !== undefined) this.sign()
  })

  return signButton
}

const resolveNameAddress = function (name) {
  return sha256Hex(name)
  .then((hash) => {
    return window.fetch(`${serverAddress}/state?address=${'100000' + hash}`, {
      headers: {'Content-Type': 'application/json'},
      method: 'GET',
      mode: 'cors'
    })
  })
  .then((response) => {
    if (!response.ok) return Promise.reject(new Error('response is not okay'))
    return response.json()
  })
  .then((json) => {
    if (json.data.length === 0) return Promise.resolve('NON-EXISTS') 
  })
  .catch((error) => {
    return Promise.reject(error) 
  })
} 

function updateAddressState (name) {
  switch (name) {
    case 'NON-EXISTS':
      this.nameAddressState.innerHTML = 'new food'
      this.signButton.classList.add('active')
      break
  }
}

const NameInput = function () {
  let nameInput = document.createElement('input')
  nameInput.setAttribute('type', 'text')
  nameInput.classList.add(styleSheet.classes.nameInput)

  nameInput.addEventListener('keyup', (event) => {
    let selector = this.nutrientTable.querySelector('#selector')
    let name = nameInput.value.trim().split(/\s/).filter(v => v!== "").join(' ')
    let constituentExists = this.nutrientTable.querySelector('.constituent')

    if (name !== '' && selector.hidden) {
      selector.hidden = false
      this.signButton.hidden = false
    }

    if (name === '' && !selector.hidden && !constituentExists) {
      selector.hidden = true
      this.signButton.hidden = true
    }

    this.signButton.classList.remove('active')
  })

  nameInput.addEventListener('change', (event) => {
    let name = nameInput.value.trim().split(/\s/).filter(v => v!== "").join(' ')
    resolveNameAddress(name)
    .then((state) => {
      updateAddressState.call(this, state)
    })
    .catch((error) => {
      updateAddressState('NETWORK-ERROR') 
    })
  })

  return nameInput
}

class foodEditor extends HTMLElement {

  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    let style = document.createElement('style')
    style.textContent = styleSheet.toString()
    this.shadow.appendChild(style)

    this.container = document.createElement('div')
    this.container.classList.add(styleSheet.classes.container)
    this.shadow.appendChild(this.container)

    this.nameInput = NameInput.call(this)
    this.container.appendChild(this.nameInput)

    this.nameAddressState = document.createElement('div')
    this.nameAddressState.classList.add(styleSheet.classes.nameAddressState)
    this.container.appendChild(this.nameAddressState)

    this.nutrientTable = NutrientTable()
    this.container.appendChild(this.nutrientTable)

    this.signButton = SignButton.call(this)
    this.signButton.hidden = true
    this.shadow.appendChild(this.signButton)
  }

  compileData () {
    return {
      name: this.nameInput.value
    }
  }
}

customElements.define('food-editor', foodEditor)
