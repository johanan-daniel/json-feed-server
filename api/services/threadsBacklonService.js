import { baseURL, updateJSONWithObject } from '../utils.js'

const getJsonFeed = async (path) => {
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
        feed_url: `${baseURL}${path}`,
        authors: [{ name: account_info['display_name'] }],
        description:
            'Working at Google, formerly founded Verge, Android Central, iMore, Windows Central, PreCentral. Enjoyer of puns, protected bike lanes, and typos',
        icon: account_info['avatar'],
        items,
    }

    const json = updateJSONWithObject(updatesObj)

    return json
}

export { getJsonFeed }
