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
  getMkbhdJSON,
} from './controllers.js'

router.get('/feeds/example.xml', getExampleXML)

router.get('/', getHome)

// articles
router.get('/feeds/articles/bbc_travel.json', getBBC_JSON)

// youtube
router.get('/feeds/youtube/good_work.json', getGoodWorkJSON)
router.get('/feeds/youtube/max_fosh.json', getMaxFoshJSON)
router.get('/feeds/youtube/lost_in_the_pond.json', getLostInThePondJSON)
router.get('/feeds/youtube/phil_edwards.json', getPhilEdwardsJSON)
router.get('/feeds/youtube/johnny_harris.json', getJohnnyHarrisJSON)
router.get('/feeds/youtube/mkbhd.json', getMkbhdJSON)

export default router
