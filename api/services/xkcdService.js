import { baseURL, updateJSONWithObject } from '../utils.js'

const getJsonFeed = async (req) => {
    const main_url = 'https://xkcd.com/info.0.json'
    let item = {}

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
        const date = new Date(item.year, item.month - 1, item.day, 4)

        const news = item.news

        const object = {
            title: item.title,
            url: `https://xkcd.com/${item.num}`,
            id: `https://xkcd.com/${item.num}`,
            summary: item.alt,
            date_published: date.toISOString(),
            content_html: `<div><img src=${item.img} /><p>${item.alt}</p>
      <a href="https://www.explainxkcd.com/${item.num}">Explanation</a><p>${news}</p></div>`,
            image: item.img,
        }

        if (item.link) {
            object['external_url'] = item.link
        }

        return object
    })

    const updatesObj = {
        title: 'xkcd',
        home_page_url: 'https://xkcd.com',
        feed_url: `${baseURL}${req.route.path}`,
        // authors: [{ name: 'Randall Munroe', url: 'https://xkcd.com/about/' }],
        description: 'A webcomic of romance, sarcasm, math, and language.',
        icon: baseURL + '/static/xkcd_icon.png',
        favicon: baseURL + '/static/xkcd_icon_64.png',
        items,
    }
    const json = updateJSONWithObject(updatesObj)
    return json
}

export { getJsonFeed }
