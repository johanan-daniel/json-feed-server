import dotenv from 'dotenv'
import fs from 'fs'
// import { firefox } from 'playwright'

import {
    jsonTemplate,
    logResponseDetails,
    getObjectFromXML,
    updateJSONWithObject,
} from './utils.js'

dotenv.config()

const baseURL = process.env.base_url

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

const getAvailableFeeds = (req, res) => {
    // if (!logRequestDetails(req, res, { checkForAnyParams: true })) return

    const from = req.query.from

    const url_array = [
        '/articles/bbc_travel.json',
        '/articles/timeless_articles.json',
        '/articles/xkcd.json',
        '/articles/tom_scott.json',
        // '/articles/bing_image.json',

        '/social/backlon.json',
        '/social/reddit_purdue.json',

        '/youtube/good_work.json',
        '/youtube/max_fosh.json',
        '/youtube/lost_in_the_pond.json',
        '/youtube/phil_edwards.json',
        '/youtube/johnny_harris.json',
        '/youtube/mkbhd.json',
    ]

    let output = ''

    for (const url of url_array) {
        const feed_url = `${baseURL}/feeds${url}`
        const html = `<div><a href='${feed_url}'>${feed_url}</a></div>`
        output = output.concat(html)
    }

    output.concat(`base_url=${baseURL}`)

    res.send(output)
}

const getBBC_JSON = async (req, res) => {
    // if (!logRequestDetails(req, res, { checkForAnyParams: true })) return

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
        feed_url: `https://rss-test.fly.dev${req.route.path}`,
        description: xmlAsObject.description._text,
        items,
    }

    //adds shared metadata
    const json = updateJSONWithObject(updatesObj)
    // logResponseDetails(req, res)
    return res.send(json)
}

// const getGoodWorkJSON = async (req, res) => {
//     // if (!logRequestDetails(req, res, { checkForAnyParams: true })) return

//     const filterFunction = (items) => {
//         let filteredItems = items.filter((item) => {
//             let descriptionLength = item.summary
//                 .trim()
//                 .split(/\s+/)
//                 .filter((word) => {
//                     return word.length > 0
//                 }).length

//             return descriptionLength >= 28
//         })

//         return filteredItems
//     }

//     const json = await JSONParsingForYoutube(
//         req,
//         'UC_-hYjoNe4PJNFa9iZ4lraA',
//         filterFunction
//     )

//     // logResponseDetails(req, res)
//     return res.send(json)
// }

// const getMaxFoshJSON = async (req, res) => {
//     // if (!logRequestDetails(req, res, { checkForAnyParams: true })) return

//     const filterFunction = (items) => {
//         let filteredItems = items.filter((item) => {
//             let titleBeginsLowercase =
//                 item.title[0].toLowerCase() === item.title[0]
//             return !titleBeginsLowercase
//         })

//         return filteredItems
//     }

//     const json = await JSONParsingForYoutube(
//         req,
//         'UCb31gOY6OD8ES0zP8M0GhAw',
//         filterFunction
//     )

//     // logResponseDetails(req, res)
//     return res.send(json)
// }

// const getLostInThePondJSON = async (req, res) => {
//     // if (!logRequestDetails(req, res, { checkForAnyParams: true })) return

//     const filterFunction = (items) => {
//         let filteredItems = items.filter((item) => {
//             let hashtagInTitle = item.title.includes('#')
//             let hasDescription = item.summary.length > 0

//             return !hashtagInTitle && hasDescription
//         })

//         return filteredItems
//     }

//     const json = await JSONParsingForYoutube(
//         req,
//         'UCqabPJa-N6ORAlO5yMBtWXg',
//         filterFunction
//     )

//     // logResponseDetails(req, res)
//     return res.send(json)
// }

// const getPhilEdwardsJSON = async (req, res) => {
//     // if (!logRequestDetails(req, res, { checkForAnyParams: true })) return

//     const filterFunction = (items) => {
//         let filteredItems = items.filter((item) => {
//             let hashtagInTitle = item.title.includes('#')
//             let descriptionLength = item.summary.length

//             // console.log(item.title, descriptionLength)

//             return !hashtagInTitle && descriptionLength > 700
//         })

//         return filteredItems
//     }

//     const json = await JSONParsingForYoutube(
//         req,
//         'UCb_MAhL8Thb3HJ_wPkH3gcw',
//         filterFunction
//     )

//     // logResponseDetails(req, res)
//     return res.send(json)
// }

// const getJohnnyHarrisJSON = async (req, res) => {
//     // if (!logRequestDetails(req, res, { checkForAnyParams: true })) return

//     const filterFunction = (items) => {
//         let filteredItems = items.filter((item) => {
//             let descriptionLength = item.summary.length

//             return descriptionLength > 2800
//         })

//         return filteredItems
//     }

//     const json = await JSONParsingForYoutube(
//         req,
//         'UCmGSJVG3mCRXVOP4yZrU1Dw',
//         filterFunction
//     )

//     // logResponseDetails(req, res)
//     return res.send(json)
// }

// const getMKBHD_JSON = async (req, res) => {
//     // if (!logRequestDetails(req, res, { checkForAnyParams: true })) return

//     const filterFunction = (items) => {
//         let filteredItems = items.filter((item) => {
//             let descriptionLength = item.summary.length

//             return descriptionLength > 120
//         })

//         return filteredItems
//     }

//     const json = await JSONParsingForYoutube(
//         req,
//         'UCBJycsmduvYEL83R_U4JriQ',
//         filterFunction
//     )

//     // logResponseDetails(req, res)
//     return res.send(json)
// }

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

    const db_id = 'sj6un2m1c46ivvh'

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
    // logResponseDetails(req, res)
    return res.send(json)
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

// const get_bing_image = async (req, res) => {
//     const url = 'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1'
//     const local_base_url = 'https://bing.com/'
//     const response = await fetch(url)
//     const data = await response.json()
//     const item = data['images'][0]
//     const page_url = item['copyrightlink']
//     const summary = item['copyright'].split(' (')[0]
//     const title = item['title']
//     const img_url = `${local_base_url}${item['url']}`
//     const raw_date = item['fullstartdate']
//     // gets author info from 3rd character up to but excluding last character
//     const author_name = item['copyright'].split(' (')[1].slice(2, -1)

//     const year = Number(raw_date.slice(0, 4))
//     const month = Number(raw_date.slice(4, 6))
//     const day = Number(raw_date.slice(6, 8))
//     const hour = Number(raw_date.slice(8, 10))
//     const min = Number(raw_date.slice(10))
//     const date = new Date(year, month, day, hour, min)

//     // Launch a browser
//     const browser = await firefox.launch()
//     const page = await browser.newPage()

//     // Navigate to the webpage
//     await page.goto(page_url)

//     // Select the element with the specific ID and get its text content
//     const elementId = '#ency_desc_full'
//     const elementText = await page.$eval(elementId, (el) => el.innerHTML)
//     const split_text = elementText.split('<br><br>')

//     // Close the browser
//     await browser.close()

//     const items = [
//         {
//             title,
//             authors: [{ name: author_name }],
//             url: page_url,
//             id: page_url,
//             summary,
//             date_published: date.toISOString(),
//             content_html: `<div><h3>${summary}</h3><img src=${img_url}/><p>${split_text[0]}</p><p>${split_text[1]}</p></div>`,
//             image: img_url,
//         },
//     ]

//     const updatesObj = {
//         title: 'Bing Image of the Day',
//         home_page_url: 'https://bing.com',
//         feed_url: `${baseURL}${req.route.path}`,
//         items,
//         icon: baseURL + '/static/bing_icon.png',
//         favicon: baseURL + '/static/bing_icon.png',
//     }

//     const json = updateJSONWithObject(updatesObj)

//     res.send(json)
// }

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

export {
    getExampleXML,
    getHome,
    get_404,
    getAvailableFeeds,
    getBBC_JSON,
    // getGoodWorkJSON,
    // getMaxFoshJSON,
    // getLostInThePondJSON,
    // getPhilEdwardsJSON,
    // getJohnnyHarrisJSON,
    // getMKBHD_JSON,
    getTimelessArticles,
    get_xkcd,
    get_backlon_threads,
    // get_bing_image,
    get_tom_scott,
}
