require('./appMenu.js')
require('./nutrientTable.js')
require('./keyStatus.js')

const IndexedDB = require('./indexedDB.js')
let database = new IndexedDB('foodChain')

// database.update()
// .then((db) => {
//   let objectStore = db.createObjectStore('food', {keyPath: 'name'})
//   objectStore.createIndex('name', 'name', {unique: true})
//   objectStore.createIndex('status', 'status', {unique: false})
//   objectStore.createIndex('timeStamp', 'timeStamp', {unique: false})
// })

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
      data.status = 'CREATED'
      let now = new Date()
      data.timeStamp = now.valueOf()
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

    database.matchOnly('food', 'status', 'CREATED')
    .then((data) => {
      console.log(data)
    })

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

