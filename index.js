require('./appMenu.js')
require('./nutrientTable.js')
require('./keyStatus.js')

const IndexedDB = require('./indexedDB.js')
let database = new IndexedDB('foodChain')

// let k = document.createElement('key-status')
// k.generateNewKey = window.generateNewKey
// k.importKey = window.importKey
// document.body.appendChild(k)

let content = document.createElement('div')
document.body.appendChild(content)

let m = document.createElement('app-menu')
document.body.appendChild(m)


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
