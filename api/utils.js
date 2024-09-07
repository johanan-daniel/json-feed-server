/* https://github.com/nashwaan/xml-js */
import { xml2js } from 'xml-js'
import fs from 'fs'
import jsonTemplate from './constants.js'

const updateJSONWithObject = (input) => {
  const {
    title,
    home_page_url,
    feed_url,
    description,
    items,
    icon,
    favicon,
    authors,
  } = input
  const jsonFromTemplate = structuredClone(jsonTemplate)

  jsonFromTemplate.title = title
  jsonFromTemplate.home_page_url = home_page_url
  jsonFromTemplate.feed_url = feed_url
  jsonFromTemplate.description = description
  if (icon) {
    jsonFromTemplate.icon = icon
  }
  if (favicon) {
    jsonFromTemplate.favicon = favicon
  }
  if (authors) {
    jsonFromTemplate.authors = authors
  }

  jsonFromTemplate.items = items

  return jsonFromTemplate
}

const getObjectFromXML = async (/** @type {string} */ url, type = 'url') => {
  let xml = 'empty'
  let status

  if (type === 'url') {
    await fetch(url)
      .then((res) => {
        status = res.status
        return res.text()
      })
      .then((str) => (xml = str))
  } else {
    try {
      xml = fs.readFileSync(url, 'utf8')
    } catch (err) {
      console.log('Error reading file', err)
      return {}
    }
  }

  if (status == 404) {
    return { data: xml, status }
  }

  return { data: xml2js(xml, { compact: true }), status }
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
    await getObjectFromXML(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelID}`
    )
  )['feed']

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
  logResponseDetails,
  getObjectFromXML,
  updateJSONWithObject,
  JSONParsingForYoutube,
}
