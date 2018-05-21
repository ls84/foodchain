import { sha256Hex } from './hashing.js'
const JSS = jss.create()
JSS.setup({createGenerateClassName: () => (rule, sheet) => rule.key})
JSS.use(jssNested.default())

const styles = {
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
  'nutrientTable': {
    'list-style-type': 'none',
    'padding': '0'
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

const dataBinder = function () {
  const set = (t, p, v, r) => {
    console.log('set')
    return Reflect.set(t, p, v, r)
  }

  const get = (t, p, r) => {
    console.log('get')
    return Reflect.get(t, p, r)
  }

  return { set, get }
}

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

const addConstituentToEditor = (name) => {

}

const NutrientTable = () => {
  
  let nutrientTable = document.createElement('ul')
  nutrientTable.classList.add(styleSheet.classes.nutrientTable)

  let selector = document.createElement('li')
  selector.id = 'selector'
  selector.hidden = true
  selector.appendChild(ConstituentSelector())
  nutrientTable.appendChild(selector)

  return nutrientTable

}

const ConstituentSelector = () => {

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
  let constituents = ['moisture', 'protein', 'fat', 'carbohydrate', 'minerals']
  constituents.forEach((v) => {
    let c = document.createElement('option')
    c.setAttribute('value', v)
    c.innerText = v[0].toUpperCase() + v.substring(1)
    proximateGroup.appendChild(c)
  })
  selector.appendChild(proximateGroup)

  let energy = document.createElement('option')
  energy.setAttribute('value', 'energy')
  energy.innerText = 'Energy'
  selector.appendChild(energy)

  selector.addEventListener('change', (event) => {
    event.target.selectedIndex = 0
    addConstituentToEditor(event.target.value)
  })

  container.appendChild(selector)

  let blackTriangleDown = document.createElement('div')
  blackTriangleDown.textContent = '▾'
  container.appendChild(blackTriangleDown)

  return container
}

const SignButton = () => {
  let signButton = document.createElement('div')
  signButton.classList.add('signButton')

  return signButton
}

const NameInput = function () {
  let nameInput = document.createElement('input')
  nameInput.setAttribute('type', 'text')
  nameInput.classList.add(styleSheet.classes.nameInput)

  nameInput.addEventListener('keyup', (event) => {
    let selector = this.nutrientTable.querySelector('#selector')
    let name = nameInput.value.trim().split(/\s/).filter(v => v!== "").join(' ')

    if (name !== '' && selector.hidden) selector.hidden = false
    if (name === '' && !selector.hidden) selector.hidden = true
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

    this.nutrition = new Proxy({}, dataBinder.apply(this))

    this.nameInput = NameInput.call(this)
    this.shadow.appendChild(this.nameInput)

    this.nutrientTable = NutrientTable()
    this.shadow.appendChild(this.nutrientTable)

  }
}

customElements.define('food-editor', foodEditor)
