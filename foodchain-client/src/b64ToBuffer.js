function b64ToBuffer (base64) {
  let binaryString = window.atob(base64)
  return (new Uint8Array(binaryString.length))
  .map((v, i) => binaryString.charCodeAt(i))
  .buffer
}

export default b64ToBuffer
