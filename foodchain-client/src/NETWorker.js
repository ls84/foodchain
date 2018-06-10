const serverAddress = ''

onmessage = function (e) {
  switch(e.data[0]) {
    case 'SubmitBatches':
      fetch(`${serverAddress}/batches`, {
        body: e.data[1],
        headers: {'Content-Type': 'application/octet-stream'},
        method: 'POST',
        mode: 'cors'
      })
      .then((response) => {
        if (!response.ok) return Promise.reject(new Error('response is not ok'))
        return response.json()
      })
      .then((json) => {
        let params = (new URL(json.link)).searchParams
        let batchID = params.get('id')

        postMessage(['BatchesSubmitted', batchID])
      })
      .catch((error) => {
        postMessage('BatchesSubmissionError')
      })
  }
}
