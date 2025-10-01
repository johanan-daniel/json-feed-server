import fs from 'fs'

import {
    jsonTemplate,
    logResponseDetails,
    getObjectFromXML,
    updateJSONWithObject,
    parseRedditFeedIntoItems,
    baseURL,
} from './utils.js'
// import { xml2js } from 'xml-js'
import { getJsonFeed as getNotionJsonFeed } from './services/notionService.js'
import { getJsonFeed as getAvailableFeedsJsonFeed } from './services/availableFeedsService.js'
import { getJsonFeed as getXkcdJsonFeed } from './services/xkcdService.js'
import { getJsonFeed as getBbcTravelJsonFeed } from './services/bbcTravelService.js'
import { getJsonFeed as getThreadsBacklonJsonFeed } from './services/threadsBacklonService.js'
import { getJsonFeed as getBingImageJsonFeed } from './services/bingImageService.js'
import { getJsonFeed as getRedditPurdueJsonFeed } from './services/redditPurdueService.js'
import { getJsonFeed as getRedditProgrammerHumorJsonFeed } from './services/redditProgrammerHumor.js'

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
    const output = await getAvailableFeedsJsonFeed()
    res.send(output)
}

const getBBC_JSON = async (req, res) => {
    const jsonFeed = await getBbcTravelJsonFeed(req.path)
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
    const jsonFeed = await getXkcdJsonFeed(req.path)
    return res.send(jsonFeed)
}

const get_backlon_threads = async (req, res) => {
    const jsonFeed = await getThreadsBacklonJsonFeed(req.path)
    res.send(jsonFeed)
}

const get_bing_image = async (req, res) => {
    const jsonFeed = await getBingImageJsonFeed(req.path)
    res.send(jsonFeed)
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
    const jsonFeed = await getRedditPurdueJsonFeed(req.path)
    res.send(jsonFeed)
}

const get_reddit_programmer_humor = async (req, res) => {
    const jsonFeed = await getRedditProgrammerHumorJsonFeed(req.path)
    res.send(jsonFeed)
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
    const jsonFeed = await getNotionJsonFeed(req.path)
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
