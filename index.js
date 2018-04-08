// require('./nutrientTable.js')
// require('./keyStatus.js')
// 
// let k = document.createElement('key-status')
// k.generateNewKey = window.generateNewKey
// k.importKey = window.importKey
// 
// let n = document.createElement('nutrient-table')
// document.body.appendChild(k)
// 
// document.body.appendChild(document.createElement('hr'))
// document.body.appendChild(n)

const IndexedDB = require('./indexedDB.js')

(async () => {
  let database = new IndexedDB('foodChain')
  
  await database.update()
  .then((db) => {
    let objectStore = db.createObjectStore('food', {keyPath: 'name'})
    objectStore.createIndex('name', 'name', {unique: true})
  })
  .catch((error) => {
    if (error.name !== 'ConstraintError') throw new Error(error)
    if (error.name === 'ConstraintError') console.log('food table has already been created')
  })

  let testData = {
    name: 'rice',
    moisture: 50,
    protein: 12,
    fat: 30,
    carbohydrate: 20,
    minerals: 15,
    energy: 120
  }

  await database.insert('food', [testData])
})()
