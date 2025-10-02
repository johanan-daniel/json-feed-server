import { baseURL, getObjectFromXML, updateJSONWithObject } from '../utils.js'

export const getJsonFeed = async (path, res) => {
    let data = []

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
        feed_url: `${baseURL}${path}`,
        authors: [{ name: 'Tom Scott', url: 'https://www.tomscott.com/' }],
        favicon: baseURL + '/static/tom_scott_icon.png',
        items,
    }

    const json = updateJSONWithObject(updatesObj)
    return json
}
