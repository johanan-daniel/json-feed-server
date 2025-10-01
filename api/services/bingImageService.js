import { baseURL, updateJSONWithObject } from '../utils.js'
import { JSDOM } from 'jsdom'

export const getJsonFeed = async (path) => {
    /**
     * Because Bing is silly, in order to get the description of the image
     * (which for whatever reason can't be directly accessed from their API),
     * this fetches the Bing webpage through Google Translate so the dynamic
     * webpage is rendered into HTML.
     * Then it parses the HTML like normal and gets the description.
     */
    const url = 'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1'
    const local_base_url = 'https://bing.com/'
    const response = await fetch(url)
    const data = await response.json()
    const item = data['images'][0]
    const desc_search_query = item['copyrightlink'].split('q=')[1]
    const summary = item['copyright'].split(' (')[0]
    const title = item['title']
    let img_url = local_base_url + item['url']
    const raw_date = item['fullstartdate']
    // gets author info from 3rd character up to but excluding last character
    const author_name = item['copyright'].split(' (')[1].slice(2, -1)

    const year = Number(raw_date.slice(0, 4))
    const month = Number(raw_date.slice(4, 6)) - 1
    const day = Number(raw_date.slice(6, 8))
    const hour = Number(raw_date.slice(8, 10))
    const min = Number(raw_date.slice(10))
    const date = new Date(year, month, day, hour, min)

    // fetch webpage from Google translate to because of dynamic webpage
    const desc_page_url = `https://www.bing.com/search?q=${desc_search_query}`
    const page = await (
        await fetch(desc_page_url, {
            headers: {
                'User-Agent': 'JSONFeed/1.0',
            },
            credentials: 'include',
        })
    ).text()
    const { document } = new JSDOM(page).window

    const elementId = '#ency_desc_full'
    const element = document.querySelector(elementId)
    let elementText = ''
    let paragraph_1 = '',
        paragraph_2 = ''

    if (element) {
        elementText = element.innerHTML
        const split_text = elementText.split('<br><br>')

        const html_paragraphs = split_text.map(
            (item) => `<p>${item.trim()}</p>`
        )
        paragraph_1 = html_paragraphs[0]
        if (html_paragraphs.length == 2) {
            paragraph_2 = html_paragraphs[1]
        }
    }
    const page_url = `https://www.bing.com/search?q=${desc_search_query}`

    const items = [
        {
            title,
            authors: [{ name: author_name }],
            url: page_url,
            id: page_url,
            summary,
            date_published: date.toISOString(),
            content_html: `<div><h3>${summary}</h3><img src=${img_url} />${paragraph_1}${paragraph_2}</div>`,
            // image: img_url,
        },
    ]

    const updatesObj = {
        title: 'Bing Image of the Day',
        home_page_url: 'https://bing.com',
        feed_url: `${baseURL}${path}`,
        items,
        icon: baseURL + '/static/bing_icon.png',
        favicon: baseURL + '/static/bing_icon.png',
    }

    const json = updateJSONWithObject(updatesObj)
    return json
}
