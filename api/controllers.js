import fs from 'fs'
import { JSDOM } from 'jsdom'

import {
    jsonTemplate,
    logResponseDetails,
    getObjectFromXML,
    updateJSONWithObject,
    parseRedditFeedIntoItems,
    baseURL,
} from './utils.js'
import { xml2js } from 'xml-js'
import { getJsonFeed as getNotionJsonFeed } from './services/notionService.js'
import { getJsonFeed as getAvailableFeedsJsonFeed } from './services/availableFeedsService.js'
import { getJsonFeed as getXkcdJsonFeed } from './services/xkcdService.js'
import { getJsonFeed as getBbcTravelJsonFeed } from './services/bbcTravelService.js'

const getExampleXML = (req, res) => {
    logResponseDetails(req, res)
    return res.send(jsonTemplate)
}

const getHome = (req, res) => {
    return res.send('<p>hello there</p>')
}

const get_404 = async (_, res) => {
    res.status(404).send(
        'This route does not exist<a style="display:block" href="/">Go home?</a>'
    )
}

const get_health = (req, res) => {
    return res.status(200).send('OK')
}

const getAvailableFeeds = async (req, res) => {
    const output = await getAvailableFeedsJsonFeed(req)
    res.send(output)
}

const getBBC_JSON = async (req, res) => {
    const jsonFeed = await getBbcTravelJsonFeed(req)
    return res.send(jsonFeed)
}

const getTimelessArticles = async (req, res) => {
    // if (!logRequestDetails(req, res, { checkForAnyParams: true })) return

    // let json = 'moooo'
    let data

    try {
        data = fs.readFileSync('./assets/articles_sorted_by_date.json', 'utf8')
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
    // logResponseDetails(req, res)
    return res.send(json)
}

const get_xkcd = async (req, res) => {
    // if (!logRequestDetails(req, res, { checkForAnyParams: true })) return

    // logResponseDetails(req, res)
    const jsonFeed = await getXkcdJsonFeed(req)
    return res.send(jsonFeed)
}

const get_backlon_threads = async (req, res) => {
    let data = []
    await fetch(
        'https://mastodon.world/api/v1/accounts/112136961701411930/statuses?exclude_replies=true'
    )
        .then((res) => {
            return res.json()
        })
        .then((items) => (data = items))

    const items = data.map((item) => {
        let content = item['content']
        let regex = '<.*?>'
        var re = new RegExp(regex, 'g')
        content = content.replace(re, '')

        // let image = item['media_attachments']['preview_url']
        let html = ''
        if (item['media_attachments'].length > 0) {
            const img_url = item['media_attachments'][0]['preview_url']
            html = `<img src=${img_url} />`
        }

        // console.log(html)

        const object = {
            title: content,
            url: item['url'],
            id: item['url'],
            summary: content,
            date_published: item['created_at'],
            content_html: `<p>${item['content']}</p>${html}`,
            // image: item['media_attachments']['preview_url'],
        }

        return object
    })

    const account_info = data[0]['account']
    const updatesObj = {
        title: 'Dieter Bohn',
        home_page_url: account_info['url'],
        feed_url: `${baseURL}${req.route.path}`,
        authors: [{ name: account_info['display_name'] }],
        description:
            'Working at Google, formerly founded Verge, Android Central, iMore, Windows Central, PreCentral. Enjoyer of puns, protected bike lanes, and typos',
        icon: account_info['avatar'],
        items,
    }

    const json = updateJSONWithObject(updatesObj)

    res.send(json)
}

const get_bing_image = async (req, res) => {
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
        feed_url: `${baseURL}${req.route.path}`,
        items,
        icon: baseURL + '/static/bing_icon.png',
        favicon: baseURL + '/static/bing_icon.png',
    }

    const json = updateJSONWithObject(updatesObj)

    res.send(json)
}

const get_tom_scott = async (req, res) => {
    let data = []

    if (req.path.split('.').pop() == 'rss') {
        let raw_xml
        try {
            raw_xml = fs.readFileSync('./api/asdf.xml', 'utf8')
        } catch (err) {
            console.log('Error reading file', err)
            return res.status(500).send('Error reading file')
        }

        res.set('Content-Type', 'application/xml')
        return res.send(raw_xml)
    }

    try {
        const xmlAsObject = await getObjectFromXML(
            'https://kill-the-newsletter.com/feeds/08p151fwjtiynfac7k8l.xml'
        )
        // const xmlAsObject = await getObjectFromXML('./api/asdf.xml', 'file')

        const status = xmlAsObject['status']
        if (status == 404) {
            return res.status(503).send('The XML URL was not found')
        } else if (status == 429) {
            return res
                .status(429)
                .send('The newsletter feed was accessed too many times')
        }

        data = data.concat(xmlAsObject['data']['feed']['entry'])
    } catch {
        console.log('Error parsing XML')
        return res.status(500).send('An error occurred while parsing the XML')
    }

    const items = data.map((item) => {
        const date = new Date(item['published']['_text'])
        const article_url = `https://www.tomscott.com/newsletter/${date.getFullYear()}-${(
            date.getMonth() + 1
        )
            .toString()
            .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
        return {
            title: item['title']['_text'],
            id: article_url,
            url: article_url,
            summary: item['title']['_text'],
            date_published: item['published']['_text'],
            content_html: item['content']['_text'],
        }
    })

    const updatesObj = {
        title: "Tom Scott's Newsletter",
        home_page_url: 'https://www.tomscott.com/newsletter/',
        feed_url: `${baseURL}${req.path}`,
        authors: [{ name: 'Tom Scott', url: 'https://www.tomscott.com/' }],
        favicon: baseURL + '/static/tom_scott_icon.png',
        items,
    }

    const json = updateJSONWithObject(updatesObj)

    res.send(json)
}

const get_reddit_purdue = async (req, res) => {
    // goes through Google translate because either Reddit or Node isn't playing nice
    const data = await (
        await fetch(
            'https://www-reddit-com.translate.goog/r/Purdue/top.json?t=today&limit=10&_x_tr_sl=fr&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp'
        )
    ).json()

    const raw_items = data['data']['children']

    // Additional HTTP requests get made, so this is wrapped in a Promise.all
    let items = await parseRedditFeedIntoItems(raw_items, 100, 35, 40)

    // Removes null items that were skipped in map
    items = items.filter((item) => item)

    const updatesObj = {
        title: 'r/Purdue',
        home_page_url: 'https://www.reddit.com/r/Purdue',
        feed_url: `${baseURL}${req.path}`,
        favicon:
            'https://www.redditstatic.com/shreddit/assets/favicon/64x64.png',
        items,
    }

    const json = updateJSONWithObject(updatesObj)

    res.send(json)
}

const get_reddit_programmer_humor = async (req, res) => {
    // goes through Google translate because either Reddit or Node isn't playing nice
    const data = await (
        await fetch(
            'https://www-reddit-com.translate.goog/r/ProgrammerHumor/top.json?t=today&limit=5&_x_tr_sl=fr&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp'
        )
    ).json()

    const raw_items = data['data']['children']

    // 15000 or 7000?
    let items = await parseRedditFeedIntoItems(raw_items, 5500)

    // Removes null items that were skipped in map
    items = items.filter((item) => item)

    const updatesObj = {
        title: 'r/ProgrammerHumor',
        home_page_url: 'https://www.reddit.com/r/ProgrammerHumor',
        feed_url: `${baseURL}${req.path}`,
        favicon:
            'https://www.redditstatic.com/shreddit/assets/favicon/64x64.png',
        items,
    }

    const json = updateJSONWithObject(updatesObj)

    res.send(json)
}

const get_reddit_f_cars = async (req, res) => {
    // goes through Google translate because either Reddit or Node isn't playing nice
    const middle = 'uc'
    const data = await (
        await fetch(
            `https://www-reddit-com.translate.goog/r/f${middle}kcars/top.json?t=today&limit=5&_x_tr_sl=fr&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`
        )
    ).json()

    const raw_items = data['data']['children']

    let items = await parseRedditFeedIntoItems(raw_items, 4000)

    // Removes null items that were skipped in map
    items = items.filter((item) => item)

    const updatesObj = {
        title: `r/fcars`,
        home_page_url: `https://www.reddit.com/r/f${middle}kcars`,
        feed_url: `${baseURL}${req.path}`,
        favicon:
            'https://www.redditstatic.com/shreddit/assets/favicon/64x64.png',
        items,
    }

    const json = updateJSONWithObject(updatesObj)

    res.send(json)
}

const get_reddit_landscape_photography = async (req, res) => {
    // goes through Google translate because either Reddit or Node isn't playing nice
    const data = await (
        await fetch(
            `https://www-reddit-com.translate.goog/r/LandscapePhotography/top.json?t=today&limit=5&_x_tr_sl=fr&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`
        )
    ).json()

    const raw_items = data['data']['children']

    let items = await parseRedditFeedIntoItems(raw_items, 1300)

    // Removes null items that were skipped in map
    items = items.filter((item) => item)

    const updatesObj = {
        title: `r/LandscapePhotography`,
        home_page_url: `https://www.reddit.com/r/LandscapePhotography`,
        feed_url: `${baseURL}${req.path}`,
        favicon:
            'https://www.redditstatic.com/shreddit/assets/favicon/64x64.png',
        items,
    }

    const json = updateJSONWithObject(updatesObj)

    res.send(json)
}

const get_notion_tech = async (req, res) => {
    const jsonFeed = await getNotionJsonFeed(req)

    return res.json(jsonFeed)
}

const get_doordash_eng = async (req, res) => {
    // const raw_data = await getObjectFromXML('./api/doordash.xml', 'file')
    // const raw_data = await getObjectFromXML(
    //     'https://careersatdoordash.com/feed/'
    // )
    let status = 0
    const raw_data = await fetch('https://careersatdoordash.com/feed/', {
        headers: {
            // exactly Postman’s UA
            'User-Agent': 'PostmanRuntime/7.43.3',
            Accept: '*/*',
            'Cache-Control': 'no-cache',
            'Accept-Encoding': 'gzip, deflate, br',
            Connection: 'keep-alive',
            // you can also add a referer if needed:
            Referer: 'https://careersatdoordash.com/',
        },
    }).then((res) => {
        status = res.status
        return res.text()
    })
    console.log('status', status)
    fs.writeFileSync('./api/doordash_req.xml', raw_data, 'utf-8')
    // xml2js(raw_data)

    // console.log(raw_data)
    res.send(raw_data)
}

export {
    getExampleXML,
    getHome,
    get_404,
    get_health,
    getAvailableFeeds,
    getBBC_JSON,
    getTimelessArticles,
    get_xkcd,
    get_backlon_threads,
    get_bing_image,
    get_tom_scott,
    get_reddit_purdue,
    get_reddit_programmer_humor,
    get_reddit_f_cars,
    get_reddit_landscape_photography,
    get_notion_tech,
    get_doordash_eng,
}
