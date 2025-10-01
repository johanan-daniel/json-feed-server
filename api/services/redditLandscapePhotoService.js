import {
    baseURL,
    parseRedditFeedIntoItems,
    updateJSONWithObject,
} from '../utils.js'

export const getJsonFeed = async (path) => {
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
        feed_url: `${baseURL}${path}`,
        favicon:
            'https://www.redditstatic.com/shreddit/assets/favicon/64x64.png',
        items,
    }

    const json = updateJSONWithObject(updatesObj)
    return json
}
