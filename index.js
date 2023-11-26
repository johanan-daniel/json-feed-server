import express from 'express'
import {
  jsonTemplate,
  logRequestDetails,
  getObjectFromRSS,
  updateJSONWithObject,
} from './utils.js'

const app = express()
const port = 8080

app.get('/feeds/bbc_travel/json', async (req, res) => {
  logRequestDetails(req)

  const xmlAsObject = (
    await getObjectFromRSS('https://www.bbc.com/travel/feed.rss')
  ).rss.channel

  console.log(xmlAsObject)

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
  res.send(json)
})

app.get('/feeds/youtube/good_work/json', async (req, res) => {
  logRequestDetails(req)

  const xmlAsObject = (
    await getObjectFromRSS(
      'https://www.youtube.com/feeds/videos.xml?channel_id=UC_-hYjoNe4PJNFa9iZ4lraA'
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
  let filteredItems = items.filter((item) => {
    let length = item.summary
      .trim()
      .split(/\s+/)
      .filter((word) => {
        return word.length > 0
      }).length

    return length >= 40
  })

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
  res.send(json)
})

app.get('/feeds/youtube/max_fosh/json', async (req, res) => {
  logRequestDetails(req)

  const xmlAsObject = (
    await getObjectFromRSS(
      'https://www.youtube.com/feeds/videos.xml?channel_id=UCb31gOY6OD8ES0zP8M0GhAw'
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

  //filters items that are shorts where title starts lowercase
  let filteredItems = items.filter((item) => {
    return !(item.title[0].toLowerCase() === item.title[0])
  })

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
  res.send(json)
})

app.get('/example', (req, res) => {
  logRequestDetails(req)

  res.send(jsonTemplate)
})

app.get('/', (req, res) => {
  logRequestDetails(req)

  res.send('<p>hello there</p>')
})

app.listen(port, () => {
  console.log(`json-feed-server listening on port ${port}`)
})
