import express from 'express'
const router = express.Router()

import {
  getExampleXML,
  getHome,
  getBBC_JSON,
  getGoodWorkJSON,
  getMaxFoshJSON,
  getLostInThePondJSON,
} from './controllers.js'

router.get('/feeds/example.xml', getExampleXML)

router.get('/', getHome)

router.get('/feeds/articles/bbc_travel.json', getBBC_JSON)

router.get('/feeds/youtube/good_work.json', getGoodWorkJSON)
router.get('/feeds/youtube/max_fosh.json', getMaxFoshJSON)
router.get('/feeds/youtube/lost_in_the_pond.json', getLostInThePondJSON)

export default router
