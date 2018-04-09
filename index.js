require('./appMenu.js')
require('./nutrientTable.js')
require('./keyStatus.js')

const IndexedDB = require('./indexedDB.js')
let database = new IndexedDB('foodChain')

// let k = document.createElement('key-status')
// k.generateNewKey = window.generateNewKey
// k.importKey = window.importKey
// document.body.appendChild(k)

let state = undefined

const foodPage = () => {
  if (state !== 'food') {
    while (content.hasChildNodes()) {
      content.removeChild(content.lastChild)
    }

    let n = document.createElement('nutrient-table')
    n.create = () => {
      let data = {}
      let name = n.data.name
      if (!name) throw new Error('food must have a name')
      data.name = name
      let constituents = ['moisture', 'protein', 'fat', 'carbohydrate', 'minerals', 'energy']
      constituents.forEach((v) => {
        let value = n.data[v]
        if (value || value === 0) data[v] = value
      })
      database.insert('food', [data])
    }

    content.appendChild(n)

    state = 'food'
  }

}

const signPage = () => {
  if (state !== 'sign') {
    while (content.hasChildNodes()) {
      content.removeChild(content.lastChild)
    }

    let k = document.createElement('key-status')

    content.appendChild(k)

    state = 'sign'
  }
}

const minePage = () => {
  if (state !== 'mine') {
    while (content.hasChildNodes()) {
      content.removeChild(content.lastChild)
    }

    state = 'mine'
  }
}

let content = document.createElement('div')
document.body.appendChild(content)

let m = document.createElement('app-menu')
m.foodPage = foodPage
m.signPage = signPage
m.minePage = minePage
document.body.appendChild(m)

