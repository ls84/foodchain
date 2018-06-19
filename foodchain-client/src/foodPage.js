// food-item appending
document.addEventListener('FoodSigned', (e) => {
    let data = e.detail.data
    let foodItem = document.createElement('food-item')
    foodItem.init(data)
    foodItem.setAttribute('data-status', 'SIGNED')
    document.body.insertBefore(foodItem, submitButton)
    signedFoodData.push(data)
    // TODO: reset should be toggled
    foodEditor.reset()

    submitButton.hidden = false
}, true)

document.addEventListener('FoodSubmitted', (e) => {
  let data = e.detail.data
  let foodItem
  if (e.detail.insert) {
    foodItem = document.createElement('food-item')
    foodItem.init(data, 'DATABASE')
  }
  if (!e.detail.insert) {
    let nodeList = document.querySelectorAll('food-item[data-status="SIGNED"]')
    foodItem = Array.from(nodeList)
    .find((n) => n.name.textContent === data.name)
  }
  foodItem.confirmSubmission = confirmSubmission.bind(foodItem)
  foodItem.setAttribute('data-status', 'SUBMITTED')
  document.body.appendChild(foodItem)

  let remainingItems = document.querySelectorAll('food-item[data-status="SIGNED"]').length
  if (remainingItems === 0) submitButton.hidden = true

  submittedFoodData.push(data)
  signedFoodData = signedFoodData.filter((d) => d.name !== data.name)
}, true)

document.addEventListener('FoodCommitted', (e) => {
  let data = e.detail.data
  let foodItem
  if (e.detail.insert) {
    foodItem = document.createElement('food-item')
    foodItem.init(data, 'DATABASE')
  }
  if (!e.detail.insert) {
    let nodeList = document.querySelectorAll('food-item[data-status="SUBMITTED"]')
    foodItem = Array.from(nodeList)
    .find((n) => n.name.textContent === data.name)
  }
  foodItem.setAttribute('data-status', 'COMMITTED')
  document.body.appendChild(foodItem)

  committedFood.push(foodItem)
  submittedFoodData = submittedFoodData.filter((d) => d.name !== data.name)
}, true)

// food-item appending

// Name Change
function AddressStateHandler (e) {
  switch (e.data[0]) {
    case 'AddressStateFetched':
      if (e.data[2] === null) {
        foodEditor.addressState.textContent = 'new food'
        signButton.classList.add('active')
      }
      break
  }
}

document.addEventListener('NameChanged', (e) => {
  signButton.hidden = (e.detail.isEmpty) ? true : false
  signButton.classList.remove('active')
  foodEditor.addressState.textContent = ''

  let name = e.detail.name

  if (!e.detail.isEmpty) {
    NameResolver.addEventListener('message', AddressStateHandler)
    NameResolver.postMessage([e.detail.name, true])
  }
}, true)
// Name Change

// populateFoodPage
function updateFavouriteDOM(data) {
  let add = data[0]
  let remove = data[1]
  add.forEach((d) => {
    document.dispatchEvent(new CustomEvent('FoodCommitted', { detail: { insert: true, data: d }}))
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

function syncWithAddress () {
  let myAddress = '100000' + sawtooth.key.getPublic().encodeCompressed('hex').substr(2,64)
  BLOCK.addEventListener('message', MyAddressStateHandler)
  BLOCK.postMessage(['FetchMyAddressState', myAddress])
}

function localFoodItemsHandler (e) {
  switch (e.data[0]) {
    case 'FoodItemsGet':
      e.data[1].forEach((d) => {
        let status = d.status.toLowerCase()
        let EventName = 'Food' + status.charAt(0).toUpperCase() + status.substr(1)
        document.dispatchEvent(new CustomEvent(EventName, { detail: { insert: true, data: d } }))
      })
      syncWithAddress()
  }
}

function populateFoodPage () {
  DB.addEventListener('message', localFoodItemsHandler)
  DB.postMessage(['GetAllFoodItems'])
}

let searchInput = document.createElement('input')
searchInput.classList.value = 'searchInput'
searchInput.setAttribute('placeholder', 'Search Food Here...')
searchInput.addEventListener('keyup', (event) => {
  let name = event.target.value
  switch (name) {
    case '' :
      committedFood.forEach((e) => { e.hidden = false })
      break
    default :
    committedFood.filter((e) => !new RegExp(name).test(e.name.textContent))
    .forEach((e) => { e.hidden = true})
  }
})

const foodPage = function (sync) {
  document.body.append(searchInput)
  window.foodEditor = document.createElement('food-editor')

  document.body.appendChild(foodEditor)
  document.body.appendChild(signButton)
  document.body.appendChild(submitButton)

  populateFoodPage(sync)
}

export default foodPage
