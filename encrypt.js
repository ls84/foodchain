let keyInBytes = (new Uint8Array(32)).map((v, i, a) => parseInt(key.getPrivate('hex').slice(i*2, (i*2) + 2), 16))
let iv = crypto.getRandomValues(new Uint8Array(16))
let privateData = new TextEncoder().encode(JSON.stringify({ test: true }))
let algo = {name: 'AES-CBC', length: 256}
let encrypt_Key
window.crypto.subtle.importKey('raw', keyInBytes, algo, false, ['encrypt', 'decrypt'])
.then((encryptKey) => {
  encrypt_Key = encryptKey
  return window.crypto.subtle.encrypt({name: 'AES-CBC', iv}, encryptKey, privateData)
})
.then((encBuffer) => {
  console.log(encBuffer)
  return window.crypto.subtle.decrypt({name: 'AES-CBC', iv}, encrypt_Key, encBuffer)
})
.then((dataBuffer) => {
  console.log(dataBuffer)
  let plainText = new TextDecoder().decode(dataBuffer)
  console.log(plainText)
})
