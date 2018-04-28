require('./appMenu.js')
require('./nutrientTable.js')
require('./keyStatus.js')
require('./transactionReview.js')
require('./foodSearch.js')
require('./foodReview.js')

const {sha256Hex} = require('./hashing.js')

const IndexedDB = require('./indexedDB.js')
let database = new IndexedDB('foodChain')

// TODO: do not increase version everytime page reloads
database.update()
.then((db) => {
  let foodStore = db.createObjectStore('food', {keyPath: 'name'})
  foodStore.createIndex('name', 'name', {unique: true})
  foodStore.createIndex('status', 'status', {unique: false})
  foodStore.createIndex('timeStamp', 'timeStamp', {unique: false})

  let consumptionStore = db.createObjectStore('consumption', {keyPath: 'datetime'})
  consumptionStore.createIndex('datetime', 'datetime', {unique: true})
  consumptionStore.createIndex('status', 'status', {unique: false})
  consumptionStore.createIndex('timeStamp', 'timeStamp', {unique: false})

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
      data.status = 'SIGNED'
      let now = new Date()
      data.timeStamp = now.valueOf()

      sha256Hex(data.name)
      .then((hex) => {
        data.address = '100000' + hex
        let header = {'familyName': 'foodchain', 'familyVersion': '1.0'}
        header.inputs = [data.address]
        header.outputs = [data.address] 
        
        let food = { 'name': data.name }
        constituents.forEach((v) => {
          if (data[v]) food[v] = data[v]
        })

        let payload = { action: 'create', food}

        console.log(header, payload)
        return sawtoothSign.buildTransaction(header, payload)
      })
      .then((transaction) => {
        data.transaction = transaction
        return database.insertAll('food', [data])
      })
      .then((result) => {
        console.log(result)
      })
      .catch((error) => {
        console.log(error) 
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

    Promise.all([database.matchOnly('food', 'status', 'SUBMITTED'), database.matchOnly('food', 'status', 'SIGNED')])
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
        console.log('confirming batch:', batchIDs)
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

const b64ToBuffer = (base64) => {
  let binaryString = window.atob(base64)
  return (new Uint8Array(binaryString.length))
  .map((v, i) => binaryString.charCodeAt(i))
  .buffer
}

const timeNow = () => {
  let datetime = new Date()
  let options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'long',
    hour12: false,
    timeZone: 'Asia/Shanghai'
  }
  return {
    'string': new Intl.DateTimeFormat('zh-Hans-CN', options).format(datetime),
    'value': datetime.valueOf()
  }
}

let myAddress = '100000' + key.getPublic().encodeCompressed('hex').substr(2,64)
window.fetch(`https://bismuth83.net/state/${myAddress}`, {
  headers: {'Content-Type': 'application/json'},
  method: 'GET',
  mode: 'cors'
})
.then((response) => {
  if (!response.ok) return Promise.reject(new Error('response is not okay'))
  return response.json()
})
.then((json) => {
  let data = cbor.decode(b64ToBuffer(json.data))
  console.log(data)
  updateData = data.map((v) => {
    return {
      datetime: v.datetime,
      food: v.food,
      timeStamp: v.datetime,
      status: 'COMMITTED'
    }
  })
  return database.updateAll('consumption', updateData)
})
.then((result) => {
  console.log('synced my address', result)
})
.catch((error) => {
  console.log(result)
})

const minePage = () => {
  if (state !== 'mine') {
    while (content.hasChildNodes()) {
      content.removeChild(content.lastChild)
    }

    let favouriteData = undefined
    database.matchOnly('food', 'status', 'COMMITTED')
    .then((data) => {
      favouriteData = data
      console.log('fabourite data is ready')
    })
    .catch((error) => {
      console.log(error)
    })

    let foodSearch = document.createElement('food-search')
    foodSearch.search = function (value) {
      let regexp = new RegExp(value)
      if (favouriteData) {
        let matched = favouriteData.filter((v) => {
          return regexp.test(v.name)
        })
    
        if (matched.length > 0) this.previewResults(matched)
      }
    }

    foodSearch.add = function (value) {
      let consumeData
      database.matchOnly('food', 'name', value)
      .then((data) => {
        consumeData = data[0]
        let foodAddress = data[0].address
        let signerAddress = '100000' + key.getPublic().encodeCompressed('hex').substr(2,64)
        let header = {'familyName': 'foodchain', 'familyVersion': '1.0'}
        header.inputs = [signerAddress]
        header.outputs = [signerAddress]

        let time = timeNow()
        let food = { name: consumeData.name, address: foodAddress }
        let payload = { action: 'consume', datetime: time.value, food: [food] }

        consumeData.timeStamp = time.value
        consumeData.timeString = time.string
        consumeData.datetime = time.value

        console.log(header, payload)

        return sawtoothSign.buildTransaction(header, payload)
      })
      .then((transaction) => {
        consumeData.transaction = transaction
        consumeData.status = 'SIGNED'
        return database.insertAll('consumption', [consumeData])
      })
      .then((result) => {
        state = null
        minePage()
      })
      .catch((error) => {
        console.log(error)
      })
    }

    content.appendChild(foodSearch)
    
    let foodReview = document.createElement('food-review')
    foodReview.submit = function (signed) {
      let transactions = signed.map(v => v.transaction) 
      sawtoothSign.buildBatch(transactions)
      .then((batch) => {
        return sawtoothSign.send([batch], 'https://bismuth83.net/batches')
      })
      .then((response) => {
        let params = (new URL(response.link)).searchParams
        let batchID = params.get('id')
        let submittedData = signed.map(v => {
          v.batchID = batchID
          v.status = 'SUBMITTED'
          return v
        })
        return database.updateAll('consumption', submittedData)
      })
      .then((result) => {
        console.log('submitted', result)
        state = null
        minePage()
      })
      .catch((error) => {
        console.log(error)
      })
    }

    foodReview.confirm = function (submitted) {
      let batchIDs = submitted.map(v => v.batchID)
      // TODO: should be a set, so there is no duplicates
      console.log('confirming batch:', batchIDs)
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
        let committedData = submitted.filter(v => commitedBatch.some(b => b.id === v.batchID))
        .map((v) => {
          v.status = 'COMMITTED'
          return v
        })
        return database.updateAll('consumption', committedData)
      })
      .then((result) => {
        console.log('committed', result)
        state = null
        minePage()
      })
      .catch((error) => {
        console.log(error)
      })
    }

    content.appendChild(foodReview)

    database.getAll('consumption')
    .then((data) => {
      let committed = data.filter(v => v.status === 'COMMITTED')
      let submitted = data.filter(v => v.status === 'SUBMITTED')
      let signed = data.filter(v => v.status === 'SIGNED')
      console.log(committed, submitted, signed)
      foodReview.update(committed, submitted, signed)
    })

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
