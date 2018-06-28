const serverAddress = ''

const sha256Hex = function (x) {
  let buffer = new TextEncoder().encode(x)

  return crypto.subtle.digest('SHA-256', buffer)
  .then((buffer) => {
    let hex = new Uint8Array(buffer)
    .reduce((p,c) => {
      return p + c.toString(16).padStart(2,'0')
    }, '')

    return Promise.resolve(hex)
  })
  .catch((e) => {
    return Promise.reject(error)
  })
}

const fetchState = async (name) => {
  let hash = await sha256Hex(name)
  fetch(`${serverAddress}/state/${'100000' + hash}`, {
    headers: {'Content-Type': 'application/json'},
    method: 'GET',
    mode: 'cors'
  })
  .then((response) => {
    switch (`${response.status}|${response.ok}`) {
      case '404|false':
        return Promise.resolve({ data: null })
        break
      case '200|true':
        return response.json()
        break
    }
  })
  .then((json) => {
    let data = json.data
    postMessage(['AddressStateFetched', name, data])
  })
  .catch((error) => {
    postMessage(['AddressFetchError', name]) 
  })
}

let waitForTime = 600
let requestTime

onmessage = async (e) => {
  requestTime = Date.now()
  setTimeout(() => {
    let waitedTime = Date.now() - requestTime
    if (waitedTime >= waitForTime) fetchState(e.data[0])
    if (waitedTime < waitForTime) postMessage(['Pooling', e.data[0]])
  }, waitForTime)
}
