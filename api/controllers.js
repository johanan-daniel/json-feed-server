import { jsonTemplate, logResponseDetails } from './utils.js'
// import { xml2js } from 'xml-js'
import { getJsonFeed as getNotionJsonFeed } from './services/notionService.js'
import { getJsonFeed as getAvailableFeedsJsonFeed } from './services/availableFeedsService.js'
import { getJsonFeed as getXkcdJsonFeed } from './services/xkcdService.js'
import { getJsonFeed as getBbcTravelJsonFeed } from './services/bbcTravelService.js'
import { getJsonFeed as getThreadsBacklonJsonFeed } from './services/threadsBacklonService.js'
import { getJsonFeed as getBingImageJsonFeed } from './services/bingImageService.js'
import { getJsonFeed as getRedditPurdueJsonFeed } from './services/redditPurdueService.js'
import { getJsonFeed as getRedditProgrammerHumorJsonFeed } from './services/redditProgrammerHumor.js'
import { getJsonFeed as getRedditLandscapePhotoJsonFeed } from './services/redditLandscapePhotoService.js'
import { getJsonFeed as getDoordashJsonFeed } from './services/doordashService.js'
import { getJsonFeed as getTimelessArticlesJsonFeed } from './services/timelessArticlesService.js'
import { getJsonFeed as getTomScottJsonFeed } from './services/tomScottService.js'

const getExampleXML = (req, res) => {
    logResponseDetails(req, res)
    return res.send(jsonTemplate)
}

const getHome = (_, res) => {
    return res.send('<p>hello there</p>')
}

const get_404 = async (_, res) => {
    res.status(404).send(
        'This route does not exist<a style="display:block" href="/">Go home?</a>'
    )
}

const get_health = (_, res) => {
    return res.status(200).send('OK')
}

const getAvailableFeeds = async (_, res) => {
    const output = await getAvailableFeedsJsonFeed()
    res.send(output)
}

const getBBC_JSON = async (req, res) => {
    const jsonFeed = await getBbcTravelJsonFeed(req.path)
    return res.send(jsonFeed)
}

const getTimelessArticles = async (req, res) => {
    const jsonFeed = await getTimelessArticlesJsonFeed(req.path)
    return res.send(jsonFeed)
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
    const jsonFeed = await getTomScottJsonFeed(req.path, res)
    res.send(jsonFeed)
}

const get_reddit_purdue = async (req, res) => {
    const jsonFeed = await getRedditPurdueJsonFeed(req.path)
    res.send(jsonFeed)
}

const get_reddit_programmer_humor = async (req, res) => {
    const jsonFeed = await getRedditProgrammerHumorJsonFeed(req.path)
    res.send(jsonFeed)
}

const get_reddit_landscape_photography = async (req, res) => {
    const jsonFeed = await getRedditLandscapePhotoJsonFeed(req.path)
    res.send(jsonFeed)
}

const get_notion_tech = async (req, res) => {
    const jsonFeed = await getNotionJsonFeed(req.path)
    return res.json(jsonFeed)
}

const get_doordash_eng = async (req, res) => {
    const raw_data = await getDoordashJsonFeed(req.path)
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
    get_reddit_landscape_photography,
    get_notion_tech,
    get_doordash_eng,
}
