import { baseURL, updateJSONWithObject } from '../utils.js'
import fs from 'fs'

export const getJsonFeed = async (path) => {
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
        feed_url: `${baseURL}${path}`,
        description: 'Some articles people like apparently',
        items,
    }
    const json = updateJSONWithObject(updatesObj)
    return json
}
