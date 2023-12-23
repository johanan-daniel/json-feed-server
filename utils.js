/* https://github.com/nashwaan/xml-js */
import { xml2js } from 'xml-js'
import jsonTemplate from './constants.js'

const updateJSONWithObject = (input) => {
  const { title, home_page_url, feed_url, description, items } = input
  const jsonFromTemplate = structuredClone(jsonTemplate)

  jsonFromTemplate.title = title
  jsonFromTemplate.home_page_url = home_page_url
  jsonFromTemplate.feed_url = feed_url
  jsonFromTemplate.description = description
  jsonFromTemplate.items = items

  return jsonFromTemplate
}

const getObjectFromRSS = async (url) => {
  let xml = 'empty'

  await fetch(url)
    .then((res) => res.text())
    .then((str) => (xml = str))

  return xml2js(xml, { compact: true })
}

const logRequestDetails = (req, res, options = null) => {
  console.log('')
  console.log(req.method, req.route.path, req.query)
  let NOERROR = true
  let ERROR = false

  if (options == null) {
    return NOERROR
  } else {
    if (options.checkForAnyParams && Object.keys(req.query).length === 0) {
      console.log('400 no query parameter provided')
      res.status(400).send('a query parameter is required')
      return ERROR
    }
  }

  return NOERROR
}

const logResponseDetails = (
  req,
  res,
  details = 'response sent successfully'
) => {
  console.log('200', details)
}

const JSONParsingForYoutube = async (
  req,
  channelID,
  filterFunction = (items) => {
    return items
  }
) => {
  const xmlAsObject = (
    await getObjectFromRSS(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelID}`
    )
  ).feed

  //builds items array
  const items = xmlAsObject.entry.map((item) => {
    const date = new Date(item.published._text)
    const image = item['media:group']['media:thumbnail']._attributes.url

    return {
      title: item.title._text,
      url: item.link._attributes.href,
      external_url: item.link._attributes.href,
      id: item.link._attributes.href,
      summary: item['media:group']['media:description']._text || '',
      date_published: date.toISOString(),
      content_text: item['media:group']['media:description']._text,
      content_html: `<p>${item['media:group']['media:description']._text}</p>`,
      image,
    }
  })

  //filters items with description that is not large enough
  let filteredItems = filterFunction(items)

  //adds feed specific metadata along with items array at end
  const updatesObj = {
    title: xmlAsObject.title._text,
    home_page_url: xmlAsObject.link[1]._attributes.href,
    feed_url: `https://rss-test.fly.dev${req.route.path}`,
    description: `${xmlAsObject.title._text} channel`,
    items: filteredItems,
  }

  //adds shared metadata
  const json = updateJSONWithObject(updatesObj)
  return json
}

export {
  jsonTemplate,
  logRequestDetails,
  logResponseDetails,
  getObjectFromRSS,
  updateJSONWithObject,
  JSONParsingForYoutube,
}
