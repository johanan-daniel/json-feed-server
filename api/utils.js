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

const parseRedditFeedIntoItems = async (
    raw_items,
    post_upvotes_threshold,
    comment_upvotes_limit = 0,
    num_comments_limit = 0
) => {
    // Additional HTTP requests get made, so this is wrapped in a Promise.all
    const items = await Promise.all(
        raw_items.map(async (obj) => {
            const item = obj['data']
            const url = 'https://reddit.com' + item['permalink']

            const upvotes = item['score']
            let top_comment_upvotes = -1

            // skips posts that don't meet criteria
            if (upvotes < post_upvotes_threshold) {
                if (comment_upvotes_limit == 0 || item['num_comments'] == 0) {
                    return
                }

                const res = await fetch(
                    `https://old-reddit-com.translate.goog${item['permalink']}.json?sort=top&_x_tr_sl=fr&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`
                )
                const post_raw_data = await res.json()
                const comments = post_raw_data[1]['data']['children']
                const num_comments = item['num_comments']

                // finds top comment after skipping AutoModerator
                let i = 0
                while (
                    i < comments.length - 1 &&
                    comments[i]['data']['author'] == 'AutoModerator'
                ) {
                    i += 1
                }
                top_comment_upvotes = comments[i]['data']['score']

                if (
                    top_comment_upvotes < comment_upvotes_limit &&
                    num_comments < num_comments_limit
                ) {
                    return
                }
            }

            let content = ''
            if (item['selftext']) {
                content += `<p>${item['selftext'].replace(/\n/g, '<br>')}</p>`
            }

            if (item['thumbnail'] !== 'self') {
                if (item['preview']) {
                    content += `<img src=${item['preview']['images'][0]['resolutions'][0]['url']} />`
                }
            }

            const top_comment_html =
                top_comment_upvotes != -1
                    ? `<div>Top comment: <strong>${top_comment_upvotes}</strong></div>`
                    : ''

            const metadata = `<div>Upvotes: <strong>${item['score']}</strong></div>${top_comment_html}<div>Number of comments: <strong>${item['num_comments']}</strong></div><br>`

            return {
                title: item['title'],
                id: url,
                url,
                summary: item['selftext'],
                // Reddit only sends the sig figs of date, so suffix digits are added
                date_published: new Date(
                    item['created_utc'] * 1000
                ).toISOString(),
                authors: [
                    {
                        name: item['author'],
                        url: `https://reddit.com/u/${item['author']}`,
                    },
                ],
                content_html: metadata + content,
            }
        })
    )

    return items
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
    parseRedditFeedIntoItems,
}
