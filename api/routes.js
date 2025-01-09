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

// social
router.get('/feeds/social/backlon.json', get_backlon_threads)
router.get('/feeds/social/reddit_purdue.json', get_reddit_purdue)

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

router.get('*', get_404)

export default router
