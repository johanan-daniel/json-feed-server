import dotenv from 'dotenv'
dotenv.config()

import { JSDOM } from 'jsdom'
import { writeFileSync } from 'fs'

const date_str = '202501070800'
const year = Number(date_str.slice(0, 4))
const month = Number(date_str.slice(4, 6)) - 1
const day = Number(date_str.slice(6, 8))
const hour = Number(date_str.slice(8, 10))
const min = Number(date_str.slice(10))
const date = new Date(year, month, day, hour, min)

console.log(year, month, day, hour, min)
console.log(date)

// const res = await fetch('https://oauth.reddit.com/r/funny/top.json?t=week')
// const status = res.status
// const data = await res.text()
// console.log(data)
// console.log(status)

// const res = await fetch(
//     'https://www.bing.com/search?q=Take+the+Stairs+Day&form=hpcapt&filters=HpDate:%2220250108_0800%22',
//     {
//         headers: {
//             'User-Agent': 'JSONFeed/1.0',
//         },
//     }
// )

// const data = await res.text()
// const { document } = new JSDOM(data).window
// const element = document.querySelector('#ency_desc_full')
// if (element) {
//     console.log(element.innerHTML)
// } else {
//     console.log('element not found')
// }
// writeFileSync('bing_output.html', data)
