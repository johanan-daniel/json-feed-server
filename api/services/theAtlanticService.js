import { XMLParser } from 'fast-xml-parser'
import { JSDOM } from 'jsdom'
import { baseURL, updateJSONWithObject } from '../utils.js'

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
})

// strips query params, hashes and trailing slashes so feed and page urls compare equally
const normalizeUrl = (url) => {
    if (!url) return null

    try {
        const { origin, pathname } = new URL(url, 'https://www.theatlantic.com')
        return `${origin}${pathname.replace(/\/+$/, '')}`
    } catch {
        return null
    }
}

const getEntryUrl = (entry) =>
    [].concat(entry.link ?? []).find((link) => link['@_rel'] === 'alternate')?.[
        '@_href'
    ]

export const getJsonFeed = async (path) => {
    const rss_url = 'https://www.theatlantic.com/feed/all/'
    const popular_url = 'https://www.theatlantic.com/most-popular/'

    const res = await fetch(rss_url)
    const xml = await res.text()

    const feed = parser.parse(xml).feed

    // fast-xml-parser collapses a single occurrence into an object
    const entries = [].concat(feed.entry ?? [])
    const feedLinks = [].concat(feed.link ?? [])

    const popularRes = await fetch(popular_url, {
        headers: {
            'User-Agent': 'JSONFeed/1.0',
        },
    })
    const popularHtml = await popularRes.text()
    const popularDoc = new JSDOM(popularHtml).window.document

    const riverSection = popularDoc.querySelector(
        'section[data-event-module="river"]'
    )
    const popularListItems = [...(riverSection?.querySelectorAll('li') ?? [])]

    const popularUrls = new Set(
        popularListItems
            .flatMap((item) => [...item.querySelectorAll('a[href]')])
            .map((anchor) => normalizeUrl(anchor.getAttribute('href')))
            .filter(Boolean)
    )

    const popularEntries = entries.filter((entry) =>
        popularUrls.has(normalizeUrl(getEntryUrl(entry)))
    )

    const items = popularEntries.map((entry) => {
        const url = getEntryUrl(entry)
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
            id: url,
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
