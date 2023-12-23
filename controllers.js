import {
  jsonTemplate,
  logRequestDetails,
  logResponseDetails,
  getObjectFromRSS,
  updateJSONWithObject,
  JSONParsingForYoutube,
} from './utils.js'

const getExampleXML = (req, res) => {
  if (!logRequestDetails(req, res, { checkForAnyParams: true })) return

  logResponseDetails(req, res)
  return res.send(jsonTemplate)
}

const getHome = (req, res) => {
  logRequestDetails(req)

  return res.send('<p>hello there</p>')
}

const getBBC_JSON = async (req, res) => {
  if (!logRequestDetails(req, res, { checkForAnyParams: true })) return

  const xmlAsObject = (
    await getObjectFromRSS('https://www.bbc.com/travel/feed.rss')
  ).rss.channel

  //builds items array
  const items = xmlAsObject.item.map((item) => {
    const date = new Date(item.pubDate._text)
    const image =
      item.enclosure &&
      item.enclosure._attributes.url.replace('144x81', '1600x900')

    return {
      title: item.title._text,
      url: item.link._text,
      external_url: item.link._text,
      id: item.link._text,
      summary: item.description._text,
      date_published: date.toISOString(),
      content_text: item.description._text,
      content_html: `<p>${item.description._text}</p>`,
      image,
    }
  })

  //adds feed specific metadata along with items array at end
  const updatesObj = {
    title: xmlAsObject.title._text,
    home_page_url: xmlAsObject['atom:link']._attributes.href,
    feed_url: `https://rss-test.fly.dev${req.route.path}`,
    description: xmlAsObject.description._text,
    items,
  }

  //adds shared metadata
  const json = updateJSONWithObject(updatesObj)
  logResponseDetails(req, res)
  return res.send(json)
}

const getGoodWorkJSON = async (req, res) => {
  if (!logRequestDetails(req, res, { checkForAnyParams: true })) return

  const filterFunction = (items) => {
    let filteredItems = items.filter((item) => {
      //items which have less than 28 words are shorts
      let length = item.summary
        .trim()
        .split(/\s+/)
        .filter((word) => {
          return word.length > 0
        }).length

      return length >= 28
    })

    return filteredItems
  }

  const json = await JSONParsingForYoutube(
    req,
    'UC_-hYjoNe4PJNFa9iZ4lraA',
    filterFunction
  )

  logResponseDetails(req, res)
  return res.send(json)
}

const getMaxFoshJSON = async (req, res) => {
  if (!logRequestDetails(req, res, { checkForAnyParams: true })) return

  const filterFunction = (items) => {
    let filteredItems = items.filter((item) => {
      let titleBeginsLowercase = item.title[0].toLowerCase() === item.title[0]
      return !titleBeginsLowercase
    })

    return filteredItems
  }

  const json = await JSONParsingForYoutube(
    req,
    'UCb31gOY6OD8ES0zP8M0GhAw',
    filterFunction
  )

  logResponseDetails(req, res)
  return res.send(json)
}

const getLostInThePondJSON = async (req, res) => {
  if (!logRequestDetails(req, res, { checkForAnyParams: true })) return

  const filterFunction = (items) => {
    let filteredItems = items.filter((item) => {
      let hashtagInTitle = item.title.includes('#')
      let hasDescription = item.summary.length > 0

      return !hashtagInTitle && hasDescription
    })

    return filteredItems
  }

  const json = await JSONParsingForYoutube(
    req,
    'UCqabPJa-N6ORAlO5yMBtWXg',
    filterFunction
  )

  logResponseDetails(req, res)
  return res.send(json)
}

export {
  getExampleXML,
  getHome,
  getBBC_JSON,
  getGoodWorkJSON,
  getMaxFoshJSON,
  getLostInThePondJSON,
}
