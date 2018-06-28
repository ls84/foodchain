export default  { 
  "nested": {
    "TransactionHeader": {
      "fields": {
        "batcherPublicKey": {
          "type": "string",
          "id": 1
        },
        "dependencies": {
          "rule": "repeated",
          "type": "string",
          "id": 2
        },
        "familyName": {
          "type": "string",
          "id": 3
        },
        "familyVersion": {
          "type": "string",
          "id": 4
        },
        "inputs": {
          "rule": "repeated",
          "type": "string",
          "id": 5
        },
        "nonce": {
          "type": "string",
          "id": 6
        },
        "outputs": {
          "rule": "repeated",
          "type": "string",
          "id": 7
        },
        "payloadSha512": {
          "type": "string",
          "id": 9
        },
        "signerPublicKey": {
          "type": "string",
          "id": 10
        }
      }
    },
    "Transaction": {
      "fields": {
        "header": {
          "type": "bytes",
          "id": 1
        },
        "headerSignature": {
          "type": "string",
          "id": 2
        },
        "payload": {
          "type": "bytes",
          "id": 3
        }
      }
    },
    "TransactionList": {
      "fields": {
        "transactions": {
          "rule": "repeated",
          "type": "Transaction",
          "id": 1
        }
      }
    },
    "BatchHeader": {
      "fields": {
        "signerPublicKey": {
          "type": "string",
          "id": 1
        },
        "transactionIds": {
          "rule": "repeated",
          "type": "string",
          "id": 2
        }
      }
    },
    "Batch": {
      "fields": {
        "header": {
          "type": "bytes",
          "id": 1
        },
        "headerSignature": {
          "type": "string",
          "id": 2
        },
        "transactions": {
          "rule": "repeated",
          "type": "Transaction",
          "id": 3
        },
        "trace": {
          "type": "bool",
          "id": 4
        }
      }
    },
    "BatchList": {
      "fields": {
        "batches": {
          "rule": "repeated",
          "type": "Batch",
          "id": 1
        }
      }
    }
  }
}
