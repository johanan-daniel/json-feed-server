// source_1: https://stackoverflow.com/questions/72456535/referenceerror-dirname-is-not-defined-in-es-module-scope

import express from 'express'
const router = express.Router()
import path from 'path'
import { fileURLToPath } from 'url'

import {
    getExampleXML,
    getHome,
    getBBC_JSON,
    // getGoodWorkJSON,
    // getMaxFoshJSON,
    // getLostInThePondJSON,
    // getPhilEdwardsJSON,
    // getJohnnyHarrisJSON,
    // getMKBHD_JSON,
    // getAIPNewsletter,
    getAvailableFeeds,
    getTimelessArticles,
    get_xkcd,
    get_404,
    get_backlon_threads,
    get_tom_scott,
    get_bing_image,
    get_reddit_purdue,
    get_reddit_programmer_humor,
    get_reddit_f_cars,
    get_reddit_landscape_photography,
    get_notion_tech,
    get_health,
} from './controllers.js'
import { check_params, request_logger, response_logger } from './middleware.js'

router.use(request_logger)
router.use(response_logger)

// source_1
// serve static files from folders: [assets/public]
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const static_path = path.join(__dirname, '../assets/public')
router.use('/static', express.static(static_path))

router.get('/feeds/example.json', check_params, getExampleXML)
router.get('/', getHome)
router.get('/feeds', getAvailableFeeds)
router.get('/health', get_health)

// social
router.get('/feeds/social/backlon.json', get_backlon_threads)
router.get('/feeds/social/reddit_purdue.json', get_reddit_purdue)
router.get(
    '/feeds/social/reddit_programmer_humor.json',
    get_reddit_programmer_humor
)
router.get('/feeds/social/reddit_f_cars.json', get_reddit_f_cars)
router.get(
    '/feeds/social/reddit_landscape_photography.json',
    get_reddit_landscape_photography
)

// articles
router.get('/feeds/articles/bbc_travel.json', check_params, getBBC_JSON)
router.get(
    '/feeds/articles/timeless_articles.json',
    check_params,
    getTimelessArticles
)
router.get('/feeds/articles/xkcd.json', get_xkcd)
router.get('/feeds/articles/tom_scott.*', get_tom_scott)
router.get('/feeds/articles/bing_image.json', get_bing_image)
router.get('/feeds/articles/notion_tech.json', get_notion_tech)

router.get('*', get_404)

export default router
