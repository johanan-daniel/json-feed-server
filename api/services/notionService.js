import { JSDOM } from 'jsdom'
import { baseURL, updateJSONWithObject } from '../utils.js'

const getJsonFeed = async (path) => {
    const posts = await getPosts()

    const items = posts.map((post) => {
        return {
            title: post.title,
            id: post.url,
            url: post.url,
            summary: post.subtitle,
            date_published: post.date,
            image: post.thumbnail,
            content_html: post.html,
        }
    })

    const updatesObj = {
        title: 'Notion Engineering Blog',
        home_page_url: 'https://www.notion.com/blog/topic/tech',
        feed_url: `${baseURL}${path}`,
        description: 'Notion Engineering Blog',
        icon: baseURL + '/static/xkcd_icon.png',
        favicon: baseURL + '/static/xkcd_icon_64.png',
        items,
    }
    const jsonFeed = updateJSONWithObject(updatesObj)

    return jsonFeed
}

const getPosts = async () => {
    let status
    const pageData = await fetch(`https://www.notion.com/blog/topic/tech`)
        .then((res) => {
            status = res.status
            return res.text()
        })
        .then((res) => {
            return res
        })

    const { document: postListDocument } = new JSDOM(pageData).window

    const elementId = '#__NEXT_DATA__'
    const element = postListDocument.querySelector(elementId)
    const rawJson = element.innerHTML
    const parsedJson = JSON.parse(rawJson)
    const posts = parsedJson['props']['pageProps']['posts']
    // fs.writeFileSync('./api/notion_tech.json', JSON.stringify(posts, null, 4), 'utf-8')

    // extract post details from json
    const postDetails = posts.map((post) => {
        const title = post['fields']['title']
        const subtitle = post['fields']['subtitle']
        const slug = post['fields']['slug']
        const thumbnail = post['fields']['thumbnail']['fields']['file']['url']
        const date = new Date().toISOString()
        const url = `https://www.notion.com/blog/${slug}`

        return {
            title,
            subtitle,
            slug,
            thumbnail,
            date,
            url,
        }
    })

    await Promise.all(
        postDetails.map(async (post) => {
            const html = await getHtmlForPost(post, postListDocument)
            post['html'] = html
        })
    )

    return postDetails
}

const getHtmlForPost = async (post, postListDocument) => {
    // get article from first post
    const article = await fetch(post['url'])
        .then((res) => res.text())
        .then((res) => {
            return res
        })
    const { document: fullArticleDocument } = new JSDOM(article).window
    const articleElement = fullArticleDocument.querySelector('main')

    // remove unwanted elements
    const hrElement = fullArticleDocument.querySelectorAll('hr')
    hrElement.forEach((element) => {
        element.remove()
    })

    const lastSectionElement = fullArticleDocument.querySelector(
        'div[class*="_slug__postBodyLeft"]'
    )
    lastSectionElement.remove()

    const secondShareElement = fullArticleDocument.querySelectorAll(
        "div[class*='spacing_margin']"
    )
    Array.from(secondShareElement)
        .slice(1)
        .forEach((element) => {
            element.remove()
        })

    // Attributes to convert
    const attributes = ['src', 'href', 'srcset']

    attributes.forEach((attr) => {
        const elements = articleElement.querySelectorAll(`[${attr}]`)
        elements.forEach((el) => absolutify(attr, el))
    })

    const articleHtmlString = articleElement.outerHTML

    const styleSheets = postListDocument.querySelectorAll(
        'link[rel="stylesheet"]'
    )
    let styleSheetsAsString = ''

    styleSheets.forEach((link) => {
        // @ts-ignore href does in fact exist on this element
        const href = link.href
        styleSheetsAsString += `<link rel="stylesheet" href="https://www.notion.com${href}" />`
    })

    const fullHtml = `<html>
        <head>
        ${styleSheetsAsString}
        </head>
        <body>${articleHtmlString}</body>
    </html>`

    return fullHtml
}

const absolutify = (attr, element) => {
    const value = element.getAttribute(attr)
    if (!value) return

    const notionURL = 'https://www.notion.com'

    // Special handling for srcset (can contain multiple URLs)
    if (attr === 'srcset') {
        const newValue = value
            .split(',')
            .map((part) => {
                const [urlPart, descriptor] = part.trim().split(/\s+/, 2)
                try {
                    const absURL = new URL(urlPart, notionURL).href
                    return descriptor ? `${absURL} ${descriptor}` : absURL
                } catch (e) {
                    return part // fallback if not a valid URL
                }
            })
            .join(', ')
        element.setAttribute(attr, newValue)
    } else {
        try {
            const absURL = new URL(value, notionURL).href
            element.setAttribute(attr, absURL)
        } catch (e) {
            // Not a valid URL, do nothing
        }
    }
}

export { getPosts, getHtmlForPost, getJsonFeed }
