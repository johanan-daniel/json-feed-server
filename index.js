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

  const xmlAsObject = await getObjectFromRSS(
    'https://www.bbc.com/travel/feed.rss'
  )

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

  const updatesObj = {
    title: xmlAsObject.title._text,
    home_page_url: xmlAsObject['atom:link']._attributes.href,
    feed_url: `https://rss-test.fly.dev${req.route.path}`,
    description: xmlAsObject.description._text,
    items,
  }

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
