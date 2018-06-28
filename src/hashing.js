if (!window.crypto) throw new Error('web crypto not supported')
if (!TextEncoder) throw new Error()
const crypto = window.crypto

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

export { sha256Hex }
