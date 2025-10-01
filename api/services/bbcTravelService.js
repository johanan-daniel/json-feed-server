import { baseURL, getObjectFromXML, updateJSONWithObject } from '../utils.js'

const getJsonFeed = async (req) => {
    const xmlAsObject = (
        await getObjectFromXML('https://www.bbc.com/travel/feed.rss')
    )['data']['rss'].channel

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
        feed_url: `${baseURL}${req.route.path}`,
        description: xmlAsObject.description._text,
        items,
    }

    //adds shared metadata
    const json = updateJSONWithObject(updatesObj)
    return json
}

export { getJsonFeed }
