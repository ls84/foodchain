import jss from 'jss'
import preset from 'jss-preset-default'
jss.setup(preset())
jss.setup({createGenerateClassName: () => (rule, sheet) => rule.key})

const styles = {
  'container': {
    'width': 'calc ( 100vw - 16px )',
    'height': '80px',
    'background-color': 'grey',
    'margin-top': '20px'
  },
  'button': {
    'display': 'block',
    'margin-left': 'auto',
    'margin-right': 'auto',
    'margin-top': '20px',
    'margin-bottom': '20px',
    'font-size': '20px'
  }
}

const timeNow = (value) => {
  let datetime = value ? new Date(value) : new Date()
  let options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'long',
    hour12: false,
    timeZone: 'Asia/Shanghai'
  }
  return {
    'string': new Intl.DateTimeFormat('zh-Hans-CN', options).format(datetime),
    'value': datetime.valueOf()
  }
}

const styleSheet = jss.createStyleSheet(styles)

class foodReview extends HTMLElement {
  constructor () {
    super()
    this.shadow = this.attachShadow({mode: 'open'})

    let style = document.createElement('style')
    style.textContent = styleSheet.toString()
    this.shadow.appendChild(style)
  }

  update (committed, submitted, signed) {
    if (signed.length > 0) {
      signed.forEach((v) => {
        let container = document.createElement('div')
        let dateTime = timeNow()
        container.innerHTML = `<span>${v.timeString}</span>`

        let name = document.createElement('div')
        name.textContent = v.name
        container.appendChild(name)

        container.classList.add(styleSheet.classes.container)
        this.shadow.appendChild(container)
      }) 
      
      let submitButton = document.createElement('button')
      submitButton.innerText = 'Submit'
      submitButton.addEventListener('click', (e) => {
        if (!this.submit) throw new Error('sign function is not ready')
        this.submit(signed)
      })
      submitButton.classList.add(styleSheet.classes.button)
      this.shadow.appendChild(submitButton)
    }

    if (submitted.length > 0) {
      submitted.forEach((v) => {
        let container = document.createElement('div')
        let dateTime = timeNow()
        container.innerHTML = `<span>${v.timeString}</span>`

        let name = document.createElement('div')
        name.textContent = v.name
        container.appendChild(name)

        container.classList.add(styleSheet.classes.container)
        this.shadow.appendChild(container)
      })

      let confirmButton = document.createElement('button')
      confirmButton.innerText = 'confirm'
      confirmButton.addEventListener('click', (e) => {
        if (!this.confirm) throw new Error('confirm function is not ready')
        this.confirm(submitted)
      })
      confirmButton.classList.add(styleSheet.classes.button)
      this.shadow.appendChild(confirmButton)
    }

    if (committed.length > 0) {
      committed.forEach((v) => {
        console.log(v)
        let container = document.createElement('div')
        let dateTime = timeNow()
        container.innerHTML = `<span>${v.timeString}</span>`

        let name = document.createElement('div')
        name.textContent = v.name ? v.name : v.food[0].name
        container.appendChild(name)

        container.classList.add(styleSheet.classes.container)
        this.shadow.appendChild(container)
      })
    }
  }
}

customElements.define('food-review', foodReview)


