import dotenv from 'dotenv'
import fs from 'fs'

import {
  jsonTemplate,
  logRequestDetails,
  logResponseDetails,
  getObjectFromRSS,
  updateJSONWithObject,
  JSONParsingForYoutube,
} from './utils.js'

dotenv.config()

const baseURL = process.env.base_url || 'https://rss-test.fly.dev'

const getExampleXML = (req, res) => {
  if (!logRequestDetails(req, res, { checkForAnyParams: true })) return

  logResponseDetails(req, res)
  return res.send(jsonTemplate)
}

const getHome = (req, res) => {
  logRequestDetails(req)

  return res.send('<p>hello there</p>')
}

const getAvailableFeeds = (req, res) => {
  if (!logRequestDetails(req, res, { checkForAnyParams: true })) return

  const from = req.query.from

  const url_array = [
    '/articles/bbc_travel.json',
    '/articles/aip.json',
    '/articles/timeless_articles.json',
    '/articles/xkcd.json',

    '/youtube/good_work.json',
    '/youtube/max_fosh.json',
    '/youtube/lost_in_the_pond.json',
    '/youtube/phil_edwards.json',
    '/youtube/johnny_harris.json',
    '/youtube/mkbhd.json',
  ]

  let output = ''

  for (const url of url_array) {
    const feed_url = `${baseURL}/feeds${url}?from=${from}`
    const html = `<div><a href='${feed_url}'>${feed_url}</a></div>`
    output = output.concat(html)
  }

  output.concat(`base_url=${baseURL}`)

  res.send(output)
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
      let descriptionLength = item.summary
        .trim()
        .split(/\s+/)
        .filter((word) => {
          return word.length > 0
        }).length

      return descriptionLength >= 28
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

const getPhilEdwardsJSON = async (req, res) => {
  if (!logRequestDetails(req, res, { checkForAnyParams: true })) return

  const filterFunction = (items) => {
    let filteredItems = items.filter((item) => {
      let hashtagInTitle = item.title.includes('#')
      let descriptionLength = item.summary.length

      // console.log(item.title, descriptionLength)

      return !hashtagInTitle && descriptionLength > 700
    })

    return filteredItems
  }

  const json = await JSONParsingForYoutube(
    req,
    'UCb_MAhL8Thb3HJ_wPkH3gcw',
    filterFunction
  )

  logResponseDetails(req, res)
  return res.send(json)
}

const getJohnnyHarrisJSON = async (req, res) => {
  if (!logRequestDetails(req, res, { checkForAnyParams: true })) return

  const filterFunction = (items) => {
    let filteredItems = items.filter((item) => {
      let descriptionLength = item.summary.length

      return descriptionLength > 2800
    })

    return filteredItems
  }

  const json = await JSONParsingForYoutube(
    req,
    'UCmGSJVG3mCRXVOP4yZrU1Dw',
    filterFunction
  )

  logResponseDetails(req, res)
  return res.send(json)
}

const getMKBHD_JSON = async (req, res) => {
  if (!logRequestDetails(req, res, { checkForAnyParams: true })) return

  const filterFunction = (items) => {
    let filteredItems = items.filter((item) => {
      let descriptionLength = item.summary.length

      return descriptionLength > 120
    })

    return filteredItems
  }

  const json = await JSONParsingForYoutube(
    req,
    'UCBJycsmduvYEL83R_U4JriQ',
    filterFunction
  )

  logResponseDetails(req, res)
  return res.send(json)
}

const getAIPNewsletter = async (req, res) => {
  if (!logRequestDetails(req, res, { checkForAnyParams: true })) return

  const xmlAsObject = (
    await getObjectFromRSS('https://answerinprogress.substack.com/feed')
  ).rss.channel

  //builds items array
  const items = xmlAsObject.item.map((item) => {
    const date = new Date(item.pubDate._text)
    const image = item.enclosure && item.enclosure._attributes.url

    return {
      title: item.title._cdata,
      url: item.link._text,
      external_url: item.link._text,
      id: item.link._text,
      summary: item.description._cdata,
      date_published: date.toISOString(),
      content_text: item.description._cdata,
      content_html: `<p>${item['content:encoded']._cdata}</p>`,
      image,
    }
  })

  //adds feed specific metadata along with items array at end
  const updatesObj = {
    title: xmlAsObject.title._cdata,
    home_page_url: xmlAsObject['link']._text,
    feed_url: `https://rss-test.fly.dev${req.route.path}`,
    description: xmlAsObject.description._cdata,
    items,
  }

  //adds shared metadata
  const json = updateJSONWithObject(updatesObj)
  logResponseDetails(req, res)
  return res.send(json)
}

const getTimelessArticles = async (req, res) => {
  if (!logRequestDetails(req, res, { checkForAnyParams: true })) return

  // let json = 'moooo'
  let data

  try {
    data = fs.readFileSync('articles_sorted_by_date.json', 'utf8')
  } catch (err) {
    console.log('Error reading file', err)
  }

  const json_data = JSON.parse(data.toString())

  const items = json_data.results.map((item) => {
    return {
      title: item.title,
      url: item.url,
      external_url: item.url,
      authors: [{ name: item.author_name }],
      id: item.url,
      summary: item.title,
      date_published: item.publication_date,
      content_text: item.title,
      content_html: `<p>${item.title}</p>`,
      image: item.screenshot,
    }
  })

  const updatesObj = {
    title: 'Timeless Articles',
    home_page_url: 'https://readsomethingwonderful.com',
    feed_url: `${baseURL}${req.route.path}`,
    description: 'Some articles people like apparently',
    items,
  }
  const json = updateJSONWithObject(updatesObj)
  logResponseDetails(req, res)
  return res.send(json)
}

const get_xkcd = async (req, res) => {
  if (!logRequestDetails(req, res, { checkForAnyParams: true })) return

  const main_url = 'https://xkcd.com/info.0.json'
  let item

  await fetch(main_url)
    .then((res) => res.json())
    .then((json) => (item = json))

  let lastItem = item.num

  let items = [item]

  for (let i = 0; i < 9; i++) {
    lastItem -= 1
    await fetch(`https://xkcd.com/${lastItem}/info.0.json`)
      .then((res) => res.json())
      .then((json) => (item = json))

    items.push(item)
  }

  items = items.map((item) => {
    const date = new Date(item.year, item.month - 1, item.day)

    return {
      title: item.title,
      url: `https://xkcd.com/${item.num}/info.0.json`,
      external_url: `https://xkcd.com/${item.num}/info.0.json`,
      id: `https://xkcd.com/${item.num}/info.0.json`,
      summary: item.alt,
      date_published: date.toISOString(),
      content_text: item.alt,
      content_html: `<p>${item.alt}</p>`,
      image: item.img,
    }
  })

  const updatesObj = {
    title: 'xkcd',
    home_page_url: 'https://xkcd.com',
    feed_url: `${baseURL}${req.route.path}`,
    description: 'A webcomic of romance, sarcasm, math, and language.',
    items,
  }
  const json = updateJSONWithObject(updatesObj)
  logResponseDetails(req, res)
  return res.send(json)
}

export {
  getExampleXML,
  getHome,
  getAvailableFeeds,
  getBBC_JSON,
  getGoodWorkJSON,
  getMaxFoshJSON,
  getLostInThePondJSON,
  getPhilEdwardsJSON,
  getJohnnyHarrisJSON,
  getMKBHD_JSON,
  getAIPNewsletter,
  getTimelessArticles,
  get_xkcd,
}
