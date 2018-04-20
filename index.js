require('./appMenu.js')
require('./nutrientTable.js')
require('./keyStatus.js')
require('./transactionReview.js')
const {sha256Hex} = require('./hashing.js')

const IndexedDB = require('./indexedDB.js')
let database = new IndexedDB('foodChain')

// TODO: do not increase version everytime page reloads
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

let key = window.importKey()
let sawtoothSign = new window.SawtoothSign(key)
sawtoothSign.init()

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

      sha256Hex(data.name)
      .then((hex) => {
        data.address = '100000' + hex
        let header = {'familyName': 'foodchain', 'familyVersion': '1.0'}
        header.inputs = [data.address]
        header.outputs = [data.address] 
        
        let payload = { 'name': data.name }
        constituents.forEach((v) => {
          if (data[v]) payload[v] = data[v]
        })

        console.log(header, payload)
        return sawtoothSign.buildTransaction(header, payload)
      })
      .then((transaction) => {
        data.transaction = transaction
        database.insert('food', [data])
      })
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
      let transactionReview = document.createElement('transaction-review')
      transactionReview.sign = (data) => {
        let transactions = data.map(v => v.transaction)
        sawtoothSign.buildBatch(transactions)
        .then((batch) => {
          return sawtoothSign.send([batch], 'https://bismuth83.net/batches')
        })
        .then((response) => {
          let submittedData = data.map((v) => {
            let params = (new URL(response.link)).searchParams
            let batchID = params.get('id')
            v.batchID = batchID
            v.status = 'SUBMITTED'
            return v
          })
          return database.updateAll('food', submittedData)
        })
        .then((updated) => {
          console.log('submitted', updated)
          state = null
          signPage()
        })
        .catch((error) => {
          console.log(error)
        })
      }

      transactionReview.check = (data) => {
        let batchIDs = data.map(v => v.batchID)
        // TODO: should be a set, so there is no duplicates
        console.log(batchIDs)
        window.fetch('https://bismuth83.net/batch_statuses', {
          body: JSON.stringify(batchIDs),
          headers: {'Content-Type': 'application/json'},
          method: 'POST',
          mode: 'cors'
        })
        .then((response) => {
          if (!response.ok) return Promise.reject(new Error('response is not okay'))
          return response.json()
        })
        .then((json) => {
          let commitedBatch = json.data.filter(v => v.status === 'COMMITTED')
          let committedData = data.filter(v => commitedBatch.some(b => b.id === v.batchID))
          .map((v) => {
            v.status = 'COMMITTED'
            return v
          })
          // TODO: should add to favourite sotre
          return database.updateAll('food', committedData)
        })
        .then((result) => {
          console.log('committed', result)
          state = null
          signPage()
        })
        .catch((error) => {
          console.log(error)
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
