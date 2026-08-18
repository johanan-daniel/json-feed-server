import { XMLParser } from 'fast-xml-parser'
import { baseURL, updateJSONWithObject } from '../utils.js'

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
})

export const getJsonFeed = async (path) => {
    const rss_url = 'https://www.theatlantic.com/feed/all/'

    const res = await fetch(rss_url)
    const xml = await res.text()

    const feed = parser.parse(xml).feed

    // fast-xml-parser collapses a single occurrence into an object
    const entries = [].concat(feed.entry ?? [])
    const feedLinks = [].concat(feed.link ?? [])

    const items = entries.map((entry) => {
        const url = [].concat(entry.link ?? []).find(
            (link) => link['@_rel'] === 'alternate'
        )?.['@_href']
        const summary = entry.summary?.['#text'] ?? entry.summary ?? ''
        const content = entry.content?.['#text'] ?? entry.content ?? ''
        const date = new Date(entry.published ?? entry.updated)
        const authors = [].concat(entry.author ?? []).map((author) => ({
            name: author.name,
            url: author.uri,
        }))

        const item = {
            title: entry.title?.['#text'] ?? entry.title,
            url,
            external_url: url,
            id: entry.id ?? url,
            summary,
            date_published: date.toISOString(),
            content_text: summary,
            content_html: content || `<p>${summary}</p>`,
            image: entry['media:content']?.['@_url'],
        }

        if (authors.length) {
            item.authors = authors
        }

        return item
    })

    const updatesObj = {
        title: feed.title?.['#text'] ?? feed.title,
        home_page_url: feedLinks.find((link) => link['@_rel'] === 'alternate')?.[
            '@_href'
        ],
        feed_url: `${baseURL}${path}`,
        description: feed.subtitle?.['#text'] ?? `${feed.title} feed`,
        items,
    }

    return updateJSONWithObject(updatesObj)
}
