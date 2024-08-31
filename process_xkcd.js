import fs from 'fs'

const processXkcd = async () => {
  // const db_id = 'sj6un2m1c46ivvh'

  const main_url = 'https://xkcd.com/info.0.json'
  let item = {}

  await fetch(main_url)
    .then((res) => res.json())
    .then((json) => (item = json))

  const startingNum = item.num
  const items = []

  for (let itemNum = startingNum; itemNum > 0; itemNum -= 1) {
    let hadError = false

    if (itemNum === 404) {
      item = {
        month: '4',
        num: 404,
        year: '2008',
        alt: 'As an April Fools Joke, this xkcd appears as an HTTP 404 error',
        img: 'https://imgs.xkcd.com/comics/wall_art.png',
        title: 'Not Found',
        day: '1',
      }
    } else {
      await fetch(`https://xkcd.com/${itemNum}/info.0.json`)
        .then((res) => {
          if (res.status === 200) return res.json()
          else {
            hadError = true
            return {}
          }
        })
        .then((json) => (item = json))
    }

    if (hadError) continue
    items.push(item)
    console.log('added', itemNum)
  }

  const articles = items.map((item) => {
    const date = new Date(item.year, item.month - 1, item.day)

    return {
      // title: item.title,
      // url: `https://xkcd.com/${item.num}`,
      // external_url: `https://xkcd.com/${item.num}`,
      // id: `https://xkcd.com/${item.num}`,
      // summary: item.alt,
      // date_published: date.toISOString(),
      // content_text: item.alt,
      // content_html: `<div><img src=${item.img}><p>${item.alt}</p>\
      // <a href="http://www.explainxkcd.com/${item.num}>Explanation</a>"</div>`,
      // image: item.img,
      title: item.title,
      img_url: item.img,
      num: item.num,
      date_published: date.toISOString(),
      url: `https://xkcd.com/${item.num}`,
      alt: item.alt,
      explain_xkcd_url: `http://www.explainxkcd.com/${item.num}`,
    }
  })

  const all = items.map((item) => {
    const date = new Date(item.year, item.month - 1, item.day)

    return {
      title: item.title,
      img_url: item.img,
      num: item.num,
      date_published: date.toISOString(),
      url: `https://xkcd.com/${item.num}`,
      alt: item.alt,
      explain_xkcd_url: `http://www.explainxkcd.com/${item.num}`,
      transcript: item.transcript,
      link: item.link,
      news: item.news,
      safe_title: item.safe_title,
      has_unique_safe_title: item.safe_title !== item.title,
      has_link: item.link !== '',
      has_news: item.news !== '',
    }
  })

  fs.writeFileSync(
    `./assets/xkcd_${startingNum}_to_${item.num}.json`,
    JSON.stringify(articles)
  )

  fs.writeFileSync(
    `./assets/xkcd_all_data_${startingNum}_to_${item.num}.json`,
    JSON.stringify(all)
  )

  console.time('Time process took to run')
  const lastItem = item.num
  console.timeEnd('Time process took to run')
  console.log(
    '*****************************************************************'
  )
  console.log('last item:', lastItem)
  console.log(
    '*****************************************************************'
  )
}

// await processXkcd()
