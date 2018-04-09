class IndexedDB {
  constructor (name) {
    if (!window.indexedDB) throw new Error('browser doesn\'t support IndexedDB')
    this.indexedDB = window.indexedDB
    this.name = name
  }

  update () {
    return new Promise ((resolve, reject) => {
      let request = this.indexedDB.open(this.name)
      request.onerror = (error) => {
        reject(error)
      }
      request.onsuccess = (e) => {
        let version = e.target.result.version
        resolve(version)
      }
    })
    .then((version) => {
      return new Promise((resolve, reject) => {
        let request = this.indexedDB.open(this.name, ++ version )
        request.onerror = (error) => {
          reject(error)
        }
        request.onupgradeneeded = (e) => {
          let db = e.target.result
          resolve(db)
        }
      })
    })
    .catch((error) => {
      throw new Error(error)
    })
  }

  insert (storeName, data) {
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
    .then((db) => {
      let transaction = db.transaction([storeName], 'readwrite')
      transaction.oncomplete = (e) => {
        console.log('insert done')
      }
      transaction.onerror = (e) => {
        console.log('error', e)
      }
      
      let objectStore = transaction.objectStore(storeName)
      data.forEach((d) => {
        let request = objectStore.add(d)
        request.onsuccess = (e) => {
          console.log('insert data:', d) 
        }
      })
    })
    .catch((error) => {
      throw new Error(error)
    })
  }

  matchOnly (storeName, indexName, key) {
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
}

module.exports = IndexedDB
