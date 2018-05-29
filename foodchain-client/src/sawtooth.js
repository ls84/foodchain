import proto from './sawtooth.proto.js'
const ec = new elliptic.ec('secp256k1')

const generateNewKey = function () {
  let key = ec.genKeyPair()
  window.localStorage.setItem('privateKey', key.getPrivate('hex'))
  console.log('generated a new key')
  return key
}

const importKey = function (hex) {
  let exists = window.localStorage.getItem("privateKey")
  if (!exists && !hex) throw new Error('there is no key')
  let string = hex ? hex : exists
  let key = ec.keyFromPrivate(string, 'hex')
  window.localStorage.setItem('privateKey', key.getPrivate('hex'))
  return key
}

class Sawtooth {
  constructor  (key) {
    this.key = key
    this.proto = protobuf.Root.fromJSON(proto)
  }

  buildTransaction (header, payload, batcherKey) {
    if (!this.proto) throw new Error('protobuf is not initiated')
    if (!header.familyName) throw new Error('header should include a familyName')
    if (!header.familyVersion) throw new Error('header should include a familyVersion')

    batcherKey = batcherKey ? batcherKey : this.key
    
    let baseHeader = {
      signerPublicKey: this.key.getPublic().encodeCompressed('hex'),
      batcherPublicKey: batcherKey.getPublic().encodeCompressed('hex'),
    }

    let payloadBytes = CBOR.encode(payload)
    let headerBytes
    return window.crypto.subtle.digest('SHA-512', payloadBytes)
    .then((hash) => {
      header = Object.assign(baseHeader, header)
      let hex = new Uint8Array(hash)
      .reduce((p, c) => {
        return p + c.toString(16).padStart(2, '0')
      }, '')
      header.payloadSha512 = hex
      headerBytes = this.proto.TransactionHeader.encode(header).finish()
      return window.crypto.subtle.digest('SHA-256', headerBytes)
    })
    .then((hash) => {
      let signature = this.key.sign(new Uint8Array(hash), {canonical:true})
      let signatureHex = signature.r.toJSON().padStart(64, '0') + signature.s.toJSON().padStart(64, '0')
      let transaction = this.proto.Transaction.create({
        header: headerBytes,
        headerSignature: signatureHex,
        payload: payloadBytes
      })

      return Promise.resolve(transaction)
    })
    .catch((error) => {
      return Promise.reject(error)
    })
  }

  buildBatch (transactions, batcherKey) {
    if (!this.proto) throw new Error('protobuf is not initiated')
    batcherKey = batcherKey ? batcherKey : this.key

    let header = {
      signerPublicKey: batcherKey.getPublic().encodeCompressed('hex'),
      transactionIds: transactions.map((txn) => txn.headerSignature)
    }
    
    let headerBytes = this.proto.BatchHeader.encode(header).finish()
    return window.crypto.subtle.digest('SHA-256', headerBytes)
    .then((hash) => {
      let signature = this.key.sign(new Uint8Array(hash), {canonical:true})
      let signatureHex = signature.r.toJSON().padStart(64, '0') + signature.s.toJSON().padStart(64, '0')
      let batch = this.proto.Batch.create({
        header: headerBytes,
        headerSignature: signatureHex,
        transactions: transactions
      })

      return Promise.resolve(batch)
    })
    .catch((error) => {
      return Promise.reject(error)
    })
  }

  send (batches, url) {
    let batchListBytes = this.proto.BatchList.encode({batches}).finish()
    return window.fetch(url, {
      body: batchListBytes,
      headers: {'Content-Type': 'application/octet-stream'},
      method: 'POST',
      mode: 'cors'
    })
    .then((response) => {
      if (!response.ok) return Promise.reject(new Error('response is not ok'))
      return response.json()
    })
    .catch((error) => {
      return Promise.reject(error)
    })
  }
}

export { generateNewKey, importKey, Sawtooth }
