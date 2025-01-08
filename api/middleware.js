// source_1: https://stackoverflow.com/questions/33732509/express-js-how-to-intercept-response-send-response-json

const request_logger = (req, _, next) => {
  console.log('')
  console.log(req.method, req.path, req.query)
  next()
}

const response_logger = (req, res, next) => {
  const originalSend = res.send

  res.send = function () {
    // console.log(`Response Status Code: ${res.statusCode}`)
    let output = `${res.statusCode}`
    switch (res.statusCode) {
      case 200:
        output += ' successfully sent'
        break
      case 400:
        output += ' no query parameter provided'
        break
      case 429:
        output += ' newsletter feed accessed too many times'
      default:
        output += ' an error has occurred'
        break
    }
    console.log(output)
    // source_1
    res.send = originalSend
    return originalSend.apply(this, arguments)
  }

  next()
}

const check_params = (req, res, next) => {
  if (Object.keys(req.query).length === 0) {
    res.status(400).send('a query parameter is required')
  } else {
    next()
  }
}

export { response_logger, request_logger, check_params }
