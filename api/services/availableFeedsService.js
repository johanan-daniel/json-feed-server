import { baseURL } from '../utils.js'

const getJsonFeed = async () => {
    const url_array = [
        '/social/reddit_purdue.json',
        '/social/reddit_programmer_humor.json',
        '/social/reddit_f_cars.json',
        '/social/reddit_landscape_photography.json',

        // '/articles/bbc_travel.json',
        // '/articles/timeless_articles.json',
        '/articles/xkcd.json',
        '/articles/tom_scott.json',
        '/articles/bing_image.json',

        // '/social/backlon.json',
    ]

    let output = ''

    for (const url of url_array) {
        const feed_url = `${baseURL}/feeds${url}`
        const html = `<div><a href='${feed_url}'>${feed_url}</a></div>`
        output = output.concat(html)
    }

    output.concat(`base_url=${baseURL}`)

    return output
}

export { getJsonFeed }
