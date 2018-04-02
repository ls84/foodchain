require('./nutrientTable.js')
require('./keyStatus.js')

let k = document.createElement('key-status')
k.generateNewKey = window.generateNewKey

let n = document.createElement('nutrient-table')
document.body.appendChild(k)

document.body.appendChild(document.createElement('hr'))
document.body.appendChild(n)
