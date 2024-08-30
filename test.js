import Pocketbase from 'pocketbase'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const db_url = process.env.db_url

const pb = new Pocketbase(db_url)

const get_all_items_for_feed = async (/** @type {string} */ feed_id) => {
  const record = await pb.collection('feeds').getOne(feed_id, {
    expand: 'relField1,relField2.subRelField',
  })

  return record['send_all_items']
}

const get_articles_by_feed = async (/** @type {string} */ feed_id) => {
  const get_all_items = await get_all_items_for_feed(feed_id)
  let records = []

  if (get_all_items) {
    records = await pb.collection('articles').getFullList({
      sort: '-date_published',
      filter: `feed_id = "${feed_id}"`,
    })
  } else {
    records = (
      await pb.collection('articles').getList(1, 50, {
        sort: '-date_published',
        filter: `feed_id = "${feed_id}"`,
      })
    )['items']
  }
  return records
}

const xkcd_id = 'sj6un2m1c46ivvh'

const articles = await get_articles_by_feed(xkcd_id).then((items) => items)

console.log('retrieved', articles.length, 'items')

const createArticle = async () => {
  const startIndex = 5
  const numItems = 10

  let json_data = {}
  try {
    const data = fs.readFileSync('xkcd.json', 'utf8')
    json_data = JSON.parse(data.toString())
  } catch (err) {
    console.log('Error reading file', err)
  }

  for (let i = startIndex; i < startIndex + numItems; i++) {
    const {
      title,
      img_url,
      num,
      date_published,
      url,
      alt,
      explain_xkcd_url,
      link,
      news,
    } = json_data[i]

    const data = {
      data: {
        title,
        img_url,
        num,
        date_published,
        url,
        alt,
        explain_xkcd_url,
        link,
        news,
      },
      date_published,
      feed_id: xkcd_id,
    }

    const record = await pb.collection('articles').create(data)
    // console.log(record)
  }

  console.log(`added ${numItems} items`)
}

// createArticle()
