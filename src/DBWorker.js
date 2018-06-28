class IndexedDB {
  constructor (name) {
    if (!indexedDB) throw new Error('browser doesn\'t support IndexedDB')
    this.indexedDB = indexedDB
    this.name = name
  }

  request () {
    return new Promise((resolve, reject) => {
      let request = this.indexedDB.open(this.name)
      request.onerror = (error) => {
        reject(error)
      }
      request.onsuccess = (e) => {
        let db = e.target.result
        resolve(db)
      }
    })
  }

  insertAll (storeName, data) {
    return this.request()
    .then((db) => {
      let transaction = db.transaction([storeName], 'readwrite')
      let objectStore = transaction.objectStore(storeName)
      let requests = data.map((v) => {
        return new Promise((resolve, reject) => {
          let request = objectStore.add(v)
          request.onerror = (e) => {
            reject(e)
          }
          request.onsuccess = (e) => {
            resolve(v)
          }
        })
      })

      return Promise.all(requests)
      .then((insertedData) => {
        return new Promise((resolve, reject) => {
          transaction.onerror = (e) => {
            reject(e)
          }
          transaction.oncomplete = (e) => {
            resolve(insertedData)
          }
        })
      })
      .catch((e) => {
        throw new Error(e.target.error)
      })
    })
  }

  matchOnly (storeName, indexName, key) {
    return this.request()
    .then((db) => {
      return new Promise((resolve, reject) => {
        let data = []
        let transaction = db.transaction([storeName], 'readonly')
        transaction.oncomplete = (e) => {
          resolve(data)
        }
        transaction.onerror = (e) => {
          reject(e)
        }
        let objectStore = transaction.objectStore(storeName)
        let index = objectStore.index(indexName)
        let singleKeyRange = IDBKeyRange.only(key)
        let cursor = index.openCursor(singleKeyRange)
        cursor.onsuccess = (e) => {
          let cursor = e.target.result
          if (cursor) {
            data.push(cursor.value)
            cursor.continue()
          }
        }
      })
    })
    .catch((error) => {
      throw new Error(error)
    })
  }

  updateAll (storeName, data) {
    return this.request()
    .then((db) => {
      let transaction = db.transaction([storeName], 'readwrite')
      let objectStore = transaction.objectStore(storeName)
      let promises = data.map((v) => {
        return new Promise((resolve, reject) => {
          let update = objectStore.put(v)
          update.onerror = (e) => {
            reject(e)
          }
          update.onsuccess = (e) => {
            resolve(v) 
          }
        })
      })
      return Promise.all(promises)
    })
  }

  deleteAll (storeName, key) {
    return this.request()
    .then((db) => {
      let transaction = db.transaction([storeName], 'readwrite')
      let objectStore = transaction.objectStore(storeName)
      let promises = key.map((v) => {
        return new Promise((resolve, reject) => {
          let update = objectStore.delete(v)
          update.onerror = (e) => {
            reject(e)
          }
          update.onsuccess = (e) => {
            resolve(v) 
          }
        })
      })
      return Promise.all(promises)
    })
  }

  getAll (storeName) {
    return this.request()
    .then((db) => {
      let transaction = db.transaction([storeName], 'readonly')
      let objectStore = transaction.objectStore(storeName)
      return new Promise((resolve, reject) => {
        let all = objectStore.getAll()
        all.onerror = (e) => {
          reject(e) 
        }
        all.onsuccess = (e) => {
          resolve(e.target.result) 
        }
      })
      .then((result) => {
        return new Promise((resolve, reject) => {
          transaction.onerror = (e) => {
            reject(e)
          }
          transaction.oncomplete = (e) => {
            resolve(result)
          }
        })
      })
      .catch((error) => {
        throw new Error(error)
      })
    })
    .catch((error) => {
      return Promise.reject(error)
    })
  }

  clearStore (storeName) {
    return this.request()
    .then((db) => {
      let transaction = db.transaction([storeName], 'readwrite')
      let objectStore = transaction.objectStore(storeName)
      return new Promise((resolve, reject) => {
        let request = objectStore.clear()
        request.onerror = (e) => {
          reject(e) 
        }
        request.onsuccess = (e) => {
          resolve(e.currentTarget.source.name) 
        }
      })
    })
  }
}

let database = new IndexedDB('foodChain')
let request = database.indexedDB.open('foodChain')
request.onupgradeneeded = function (event) {
  let db = event.target.result
  let version = db.version
  switch (version) {
    case 1:
      let foodStore = db.createObjectStore('food', {keyPath: 'name'})
      foodStore.createIndex('name', 'name', {unique: true})
      foodStore.createIndex('status', 'status', {unique: false})
      foodStore.createIndex('timeStamp', 'timeStamp', {unique: false})

      let consumptionStore = db.createObjectStore('consumption', {keyPath: 'datetime'})
      consumptionStore.createIndex('datetime', 'datetime', {unique: true})
      consumptionStore.createIndex('status', 'status', {unique: false})
      consumptionStore.createIndex('timeStamp', 'timeStamp', {unique: false})
  }
}

onmessage = function (e) {
  switch (e.data[0]) {
    case 'GetAllFoodItems':
      database.getAll('food')
      .then((data) => {
        postMessage(['FoodItemsGet', data])
      })
      break

    case 'InsertNewFood':
      database.insertAll('food', e.data[1])
      .then((data) => {
        postMessage(['NewFoodInserted', data])
      })
      .catch((e) => {
        postMessage(['FoodInsertionError', e.message])
      })
      break

    case 'ClearStore':
      database.clearStore(e.data[1])
      .then((data) => {
        postMessage(['StoreCleared', data])
      })
      break

    case 'UpdateFoodItems':
      database.updateAll('food',e.data[1])
      .then((data) => {
        postMessage(['FoodItemsUpdated', data])
      })
      .catch((e) => {
        postMessage(['FoodItemsUpdateError'])
      })
      break

    case 'MergeWithFavourites':
      let favourites = e.data[1]
      let addData = []
      let removeData = []

      database.getAll('food')
      .then((data) => {
        let block = new Set(favourites.map((f) => f.name))
        let local = new Set(data.map((d) => d.name))

        let add = new Set(block)
        for (let n of local) {
          add.delete(n)
        }
        add.forEach((n) => { addData.push(favourites.find((f) => f.name === n)) })
        addData.forEach((v,i,a) => { a[i].status = 'COMMITTED' })

        let remove = new Set(local)
        for (let n of block) {
          remove.delete(n)
        }
        removeData = Array.from(remove)

        return Promise.all([database.insertAll('food', addData), database.deleteAll('food', removeData)])
      })
      .then((data) => {
        postMessage(['FavouritesMerged', data])
      })
      break
  }
}
