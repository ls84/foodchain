import jss from 'jss'
import preset from 'jss-preset-default'
jss.setup(preset())
jss.setup({createGenerateClassName: () => (rule, sheet) => rule.key})

const styles = {
  'name': {
    'font-family': 'sans-serif',
    'width': '100%',
    'font-size': '26px',
    'background-color': 'rgb(245, 245, 245)',
    'margin': '0px',
    'padding': '10px',
    'outline': 'none',
    'border': 'none'
  },
  'constituents': { 
    'list-style-type': 'none',
    'padding-left': '10px',
    'padding-right': '30px',
    'font-family': 'sans-serif',
    'font-size': '16px'
  },
  'items': {
    'display': 'grid',
    'grid-template-columns': 'auto 60px 17px',
    '& span:first-child': {
      'height': '30px',
      'line-height': '45px'
    },
    '& span:nth-child(3)': {
      'text-align': 'right',
      'line-height': '30px',
      'padding-left': '15px'
    }
  },
  'value': {
    'width': '100%',
    'text-align': 'right',
    'border-style': 'none',
    'border-bottom': '0.1px solid grey',
    'border-radius': '0',
    'font-size': '16px',
    '&:focus': {
      'outline': 'none'
    }
  },
  'energy': {
    'display': 'grid',
    'grid-template-columns': 'auto 60px 17px',
    'font-family': 'sans-serif',
    'font-size': '16px',
    'padding-left': '10px',
    'padding-right': '30px',
    '& span:first-child': {
      'height': '30px',
      'line-height': '45px'
    },
    '& span:nth-child(3)': {
      'padding-left': '15px',
      'line-height': '30px'
    }
  }
}

const styleSheet = jss.createStyleSheet(styles)

const dataBinder = function () {
  const set = (t, p, v, r) => {
    console.log(this.dataset)
    return Reflect.set(t, p, v, r)
  }

  return { set }
}

class nutrientTable extends HTMLElement {

  static get observedAttributes() { return ['data-info'] }

  constructor () {
    super()
    this.data = new Proxy({}, dataBinder.apply(this))
    let shadow = this.attachShadow({mode: 'open'})

    let style = document.createElement('style')
    style.textContent = styleSheet.toString()
    shadow.appendChild(style)

    let name = document.createElement('input')
    name.setAttribute('type', 'text')
    name.classList.add(styleSheet.classes.name)
    shadow.appendChild(name)

    // https://en.wikipedia.org/wiki/Proximate
    let constituents = ['moisture', 'protein', 'fat', 'carbohydrate', 'minerals']
    let items = constituents.map((v) => {
      let li = document.createElement('li')

      let name = document.createElement('span')
      name.textContent = v[0].toUpperCase() + v.slice(1)
      li.appendChild(name)

      let input = document.createElement('input')
      input.setAttribute('type', 'text')
      input.classList.add(styleSheet.classes.value)
      li.appendChild(input)

      let unit = document.createElement('span')
      unit.textContent = 'g'
      if (v === 'minerals') unit.textContent = 'mg'
      li.appendChild(unit)

      li.classList.add(styleSheet.classes.items)

      return li
    })
    let list = document.createElement('ul')
    items.forEach((i) => { list.appendChild(i) })
    list.classList.add(styleSheet.classes.constituents)
    shadow.appendChild(list)

    let energy = document.createElement('div')
    energy.classList.add(styleSheet.classes.energy)
    let label = document.createElement('span')
    label.textContent = 'Energy'
    energy.appendChild(label)

    let value = document.createElement('input')
    value.setAttribute('type', 'text')
    value.classList.add(styleSheet.classes.value)
    energy.appendChild(value)

    let unit = document.createElement('span')
    unit.textContent = 'kcal'
    energy.appendChild(unit)
    shadow.appendChild(energy)
  }

  connectedCallback() {
    console.log('nutrientTable added to page')
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`nutrientTable attribute '${name}' changed`)

    if (name === 'data-info') Object.assign(this.data, JSON.parse(newValue))
  }

  adoptedCallback() {
    console.log('nutrientTable moved to new page')
  }

  disconnectedCallback() {
    console.log('Custom square element removed from page');
  }
}

customElements.define('nutrient-table', nutrientTable)
