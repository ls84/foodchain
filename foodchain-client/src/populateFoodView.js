function updateFavouriteDOM(data) {
  let add = data[0]
  let remove = data[1]
  add.forEach((d) => {
    this.dispatchEvent(new CustomEvent('FoodCommitted', { detail: { insert: true, data: d }}))
  })

  remove.forEach((n) => {
    committedFood = committedFood.filter((f) => f.name.textContent !== n )
    document.querySelectorAll('food-item[data-status="COMMITTED"]').forEach((e) => {
      if (e.name.textContent === n) e.remove()
    })
  })
}

function FavouritesMergedHandler (e) {
  switch (e.data[0]) {
    case 'FavouritesMerged':
      updateFavouriteDOM(e.data[1])
      break
  }
}

function MyAddressStateHandler (e) {
  switch (e.data[0]) {
    case 'MyAddressStateFetched':
      let myState = CBOR.decode(b64ToBuffer(e.data[1]))
      let favourites = myState.favourites
      if (favourites) {
        DB.addEventListener('message', FavouritesMergedHandler)
        DB.postMessage(['MergeWithFavourites', favourites])
      }
      break
  }
}

function localFoodItemsHandler (e) {
  switch (e.data[0]) {
    case 'FoodItemsGet':
      e.data[1].forEach((d) => {
        let status = d.status.toLowerCase()
        let EventName = 'Food' + status.charAt(0).toUpperCase() + status.substr(1)
        this.dispatchEvent(new CustomEvent(EventName, { detail: { insert: true, data: d } }))
      })
      syncFood()
  }
}

function populateFoodView () {
  DB.addEventListener('message', localFoodItemsHandler.bind(this))
  DB.postMessage(['GetAllFoodItems'])
}

function syncFood () {
  let myAddress = '100000' + sawtooth.key.getPublic().encodeCompressed('hex').substr(2,64)
  BLOCK.addEventListener('message', MyAddressStateHandler)
  BLOCK.postMessage(['FetchMyAddressState', myAddress])
}

export { populateFoodView, syncFood }
