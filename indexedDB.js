class IndexedDB {
  constructor (name) {
    if (!window.indexedDB) throw new Error('browser doesn\'t support IndexedDB')
    this.indexedDB = window.indexedDB
    this.name = name
    this.open = this.open.bind(this)
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
}
