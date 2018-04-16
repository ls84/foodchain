require('./appMenu.js')
require('./nutrientTable.js')
require('./keyStatus.js')
require('./transactionReview.js')
const {sha256Hex} = require('./hashing.js')

const IndexedDB = require('./indexedDB.js')
let database = new IndexedDB('foodChain')

database.update()
.then((db) => {
  let objectStore = db.createObjectStore('food', {keyPath: 'name'})
  objectStore.createIndex('name', 'name', {unique: true})
  objectStore.createIndex('status', 'status', {unique: false})
  objectStore.createIndex('timeStamp', 'timeStamp', {unique: false})
})
.catch((error) => {
  if (error.name === 'ConstraintError') console.log('objectStore already created')
  if (error.name !== 'ConstraintError') throw new Error(error)
})

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

    Promise.all([database.matchOnly('food', 'status', 'SUBMITTED'), database.matchOnly('food', 'status', 'CREATED')])
    .then((data) => {
      console.log(data)
      let transactionReview = document.createElement('transaction-review')
      transactionReview.sign = (data) => {
        // TODO: submit to blockchain
        data.forEach((v, i, a) => { a[i].status = 'SUBMITTED' })
        database.updateAll('food', data)
        .then((result) => {
          console.log(result)
        })
        .catch((e) => {
          console.log(e)
        })
      }
      transactionReview.update(data[0], data[1])
      content.appendChild(transactionReview)
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
content.classList.add('content')
document.body.appendChild(content)

let m = document.createElement('app-menu')
m.foodPage = foodPage
m.signPage = signPage
m.minePage = minePage
document.body.appendChild(m)
