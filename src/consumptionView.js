const JSS = jss.create()
JSS.setup({createGenerateClassName: () => (rule, sheet) => rule.key})
JSS.use(jssNested.default())

const styles = {
  'signButton': {
    'height': '30px',
    'width': '60px',
    'position': 'relative',
    'left': 'calc(100% - 60px)',
    'line-height': '30px',
    'text-align': 'center',
    'background-color': 'white',
    'margin-top': '10px',
    'margin-bottom': '20px',
    'font-family': 'sans-serif',
    'color': 'lightgrey',
    '&.active': {
      'color': 'black'
    }
  },
  'submitButton': {
    'height': '30px',
    'width': '60px',
    'position': 'relative',
    'left': 'calc(100% - 60px)',
    'line-height': '30px',
    'text-align': 'center',
    'background-color': 'white',
    'margin-top': '10px',
    'margin-bottom': '20px',
    'font-family': 'sans-serif',
    'color': 'black'
  }
}

const styleSheet = JSS.createStyleSheet(styles)

async function signConsumption() {
  let data = await this.consumptionEditor.compileData()
  DB.postMessage(['InsertConsumption', [data]])
}

function SignButton() {
  let signButton = document.createElement('div')
  signButton.className = 'signButton'
  signButton.textContent = 'Sign'
  
  signButton.addEventListener('click', signConsumption.bind(this))

  return signButton
}

function submittedHandler(e) {
  BLOCK.removeEventListener(e.type, submittedHandler)
  switch (e.data[0]) {
      case 'BatchesSubmitted':
        let batchID = e.data[1]
        let signedItemsUpdate = this.signedConsumptionData.map((d) => {
          d.status = 'SUBMITTED'
          d.batchID = e.data[1]
          return d
        })
        DB.postMessage(['UpdateConsumptionItems', signedItemsUpdate])
        break

      case 'BatchesSubmissionError':
        console.log(e.data[0], e.data[1])
        break
    }
}

async function submitConsumption() {
  this.signedConsumptionData =  Array.from(this.shadow.querySelectorAll('consumption-item[data-status="SIGNED"]'))
  .map((n) => n.data)

  let transactions = this.signedConsumptionData.map(n => n.transaction)
  const batch = await sawtooth.buildBatch(transactions)
  let batchListBytes = sawtooth.encodeBatchList([batch])

  BLOCK.addEventListener('message', submittedHandler.bind(this), { once: true })
  BLOCK.postMessage(['SubmitBatches', batchListBytes])
}

function SubmitButton() {
  let submitButton = document.createElement('div')
  submitButton.className = 'submitButton'
  submitButton.textContent = 'Submit'
  
  submitButton.addEventListener('click', submitConsumption.bind(this))

  return submitButton
}

export default class consumptionView extends HTMLElement {
  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    let style = document.createElement('style')
    style.textContent = styleSheet.toString()
    this.shadow.appendChild(style)

    this.consumptionEditor = document.createElement('consumption-editor')
    this.shadow.appendChild(this.consumptionEditor)

    this.signButton = SignButton.call(this)
    this.shadow.appendChild(this.signButton)

    this.submitButton = SubmitButton.call(this)
    this.submitButton.hidden = true
    this.shadow.appendChild(this.submitButton)
  }

  addConsumption(data) {
    data.forEach((d) => {
    let consumptionItem = document.createElement('consumption-item')
    consumptionItem.init(d)
      switch (d.status) {
        case 'SIGNED':
          consumptionItem.setAttribute('data-status', 'SIGNED')
          this.shadow.insertBefore(consumptionItem, this.submitButton)
          this.submitButton.hidden = false
          break
        case 'SUBMITTED':
          consumptionItem.setAttribute('data-status', 'SUBMITTED')
          this.shadow.appendChild(consumptionItem)
          break
      }
    })
  }

  updateConsumption(data) {
    let items = Array.from(this.shadow.querySelectorAll('consumption-item'))
    data.forEach((d) => {
      let item = items.filter(n => n.data.datetimeValue == d.datetimeValue)[0]
      item.setAttribute('data-status', d.status)
      this.shadow.appendChild(item)
    })
  }
}
