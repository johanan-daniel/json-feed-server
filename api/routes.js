import express from 'express'
const router = express.Router()

import {
  getExampleXML,
  getHome,
  getBBC_JSON,
  getGoodWorkJSON,
  getMaxFoshJSON,
  getLostInThePondJSON,
  getPhilEdwardsJSON,
  getJohnnyHarrisJSON,
  getMKBHD_JSON,
  getAIPNewsletter,
  getAvailableFeeds,
  getTimelessArticles,
  get_xkcd,
  get_404,
} from './controllers.js'
import { check_params, request_logger, response_logger } from './middleware.js'

router.use(request_logger)
router.use(response_logger)

router.get('/feeds/example.json', check_params, getExampleXML)

router.get('/', getHome)
router.get('/feeds', check_params, getAvailableFeeds)

// articles
router.get('/feeds/articles/bbc_travel.json', check_params, getBBC_JSON)
router.get('/feeds/articles/aip.json', getAIPNewsletter)
router.get(
  '/feeds/articles/timeless_articles.json',
  check_params,
  getTimelessArticles
)
router.get('/feeds/articles/xkcd.json', check_params, get_xkcd)

// youtube
router.get('/feeds/youtube/good_work.json', check_params, getGoodWorkJSON)
router.get('/feeds/youtube/max_fosh.json', check_params, getMaxFoshJSON)
router.get(
  '/feeds/youtube/lost_in_the_pond.json',
  check_params,
  getLostInThePondJSON
)
router.get('/feeds/youtube/phil_edwards.json', check_params, getPhilEdwardsJSON)
router.get(
  '/feeds/youtube/johnny_harris.json',
  check_params,
  getJohnnyHarrisJSON
)
router.get('/feeds/youtube/mkbhd.json', check_params, getMKBHD_JSON)

router.get('*', get_404)

export default router
