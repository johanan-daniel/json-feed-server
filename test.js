import dotenv from 'dotenv'
dotenv.config()

import { JSDOM } from 'jsdom'
import { readFileSync, writeFileSync } from 'fs'

const volume_base = process.env.volume_base

// const date_str = '202501070800'
// const year = Number(date_str.slice(0, 4))
// const month = Number(date_str.slice(4, 6)) - 1
// const day = Number(date_str.slice(6, 8))
// const hour = Number(date_str.slice(8, 10))
// const min = Number(date_str.slice(10))
// const date = new Date(year, month, day, hour, min)

// console.log(year, month, day, hour, min)
// console.log(date)

// const res = await fetch('https://oauth.reddit.com/r/funny/top.json?t=week')
// const status = res.status
// const data = await res.text()
// console.log(data)
// console.log(status)

// const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
//     method: 'GET',
//     headers: {
//         'User-Agent': 'JSONFeed/1.0',
//     },
// })

// const data = await res.json()
// console.log(res.status, data)
// const cookies = `MUID=25C844D537C9654539C351A43613647C; domain=.bing.com; expires=Thu, 05-Feb-2026 23:49:02 GMT; path=/; secure; SameSite=None, MUIDB=25C844D537C9654539C351A43613647C; expires=Thu, 05-Feb-2026 23:49:02 GMT; path=/; HttpOnly, _EDGE_S=F=1&SID=241EFFC0AB226C0A34F4EAB1AAF86DAA; domain=.bing.com; path=/; HttpOnly, _EDGE_V=1; domain=.bing.com; expires=Thu, 05-Feb-2026 23:49:02 GMT; path=/; HttpOnly, SRCHD=AF=hpcapt; domain=.bing.com; expires=Mon, 11-Jan-2027 23:49:02 GMT; path=/, SRCHUID=V=2&GUID=8303DC2A68694CA681E85B918DE331AF&dmnchg=1; domain=.bing.com; expires=Mon, 11-Jan-2027 23:49:02 GMT; path=/, SRCHUSR=DOB=20250111; domain=.bing.com; expires=Mon, 11-Jan-2027 23:49:02 GMT; path=/, SRCHHPGUSR=SRCHLANG=en&IG=997F1BA4C69940D896BACE327B4AE270; domain=.bing.com; expires=Mon, 11-Jan-2027 23:49:02 GMT; path=/, _SS=SID=241EFFC0AB226C0A34F4EAB1AAF86DAA; domain=.bing.com; path=/, ak_bmsc=6147C875B30C8E6490AAB1D7DD4BFA08~000000000000000000000000000000~YAAQk8osF8lb10yUAQAAKGnFVxoLuvqb2cjc5q5D56/95IssZaCLSCwb4L13fk/JvDuzAGp++Iwa7HDAh8pAPMjQHXLvgvBZyBHrAxRmL5Ju522s6M4ZLbX6Vm1thTRmrVQo0uYXtGxkTHlS11DNTNOgZmGsazIU94DIn+tfSB1BHbHFIpN80FuTMCabXEbY4VlpTCbo88IB29ofYYUDX4RzbjuEZk70q2xBkRMujjqOpcuVhnIQNrnC/Ng4yXkqaDnV6krkw1Bv905dv+jMPf8qj9ekkz3TTE6P2dVkIJGDohDrFtsuQcs+bD6LJ4xBs/RdexzZOY4b9cUuaPYfGQg+S0lUjBP1mSMefLLhqbs/EsUt4naYJORP; Domain=.bing.com; Path=/; Expires=Sun, 12 Jan 2025 01:49:02 GMT; Max-Age=7200`
// const cookies = `MUID=1B2E9F94F6FE69A838208AE5F71A68B6; domain=.bing.com; expires=Thu, 05-Feb-2026 23:59:59 GMT; path=/; secure; SameSite=None, MUIDB=1B2E9F94F6FE69A838208AE5F71A68B6; expires=Thu, 05-Feb-2026 23:59:59 GMT; path=/; HttpOnly, _EDGE_S=F=1&SID=1E09A8FB37DE6C241166BD8A363A6D7D; domain=.bing.com; path=/; HttpOnly, _EDGE_V=1; domain=.bing.com; expires=Thu, 05-Feb-2026 23:59:59 GMT; path=/; HttpOnly, SRCHD=AF=hpcapt; domain=.bing.com; expires=Mon, 11-Jan-2027 23:59:59 GMT; path=/, SRCHUID=V=2&GUID=0B1FB7B4A12E4E3AB0CB6020D2E904B0&dmnchg=1; domain=.bing.com; expires=Mon, 11-Jan-2027 23:59:59 GMT; path=/, SRCHUSR=DOB=20250111; domain=.bing.com; expires=Mon, 11-Jan-2027 23:59:59 GMT; path=/, SRCHHPGUSR=SRCHLANG=en&IG=00CC82BD34E045429E1F2E74E80D0FC3; domain=.bing.com; expires=Mon, 11-Jan-2027 23:59:59 GMT; path=/, _SS=SID=1E09A8FB37DE6C241166BD8A363A6D7D; domain=.bing.com; path=/, ak_bmsc=389E84B6979D33A9AED5D3CDAA44D2CB~000000000000000000000000000000~YAAQlvPaFzpHmEKUAQAAkm/PVxoDEdhQX1i5bpj727K/2iCtuk7aBjkB0LvROBu+YA5tVX/278QSvzUNoXkiPUivWHo09+i7UKtj/mK9opX1pTCaoOnc0K5Q0f3j0spI4afTzrEzAMMjfgegn1Yx3fjw9KaL/gVVWuxXgEF1Y0r42x2v8Oc/ZAEXWkj0LRAgZ3nT0siZ7ChqfwBvrWcZ9LT6USeOvZj6lLdDvWltb7cHEhedrXEGw9HxntQThcxW8FOYck8kASTMZ5nvbLezXgajWsVldjoNTcVLhyu/v1HmT+5i0IDphl8TD00uwbiP+vWmdKdz3ImxYFoq7MWAl5T4QSvWtY2eivMUsaVA3sLiLFoScoQWsJHI; Domain=.bing.com; Path=/; Expires=Sun, 12 Jan 2025 01:59:59 GMT; Max-Age=7200`
console.log()
console.log()
console.log()

const cookies_to_read = readFileSync(`${volume_base}cookies.txt`, 'utf-8')
console.log(`Cookies from file: <<${cookies_to_read}>>`)
const desc_page_url = `https://www.bing.com/search?q=Meknes+Morocco&form=hpcapt&filters=HpDate%3a%2220250111_0800%22`
const res = await fetch(desc_page_url, {
    headers: {
        'User-Agent': 'JSONFeed/1.1',
        'set-cookie': cookies_to_read,
    },
    // credentials: 'include',
})

console.log()

let cookies_to_write = res.headers.get('set-cookie')
console.log('Cookies from response:', cookies_to_write)
console.log()
writeFileSync(`${volume_base}cookies.txt`, cookies_to_write)

const page = await res.text()
const { document } = new JSDOM(page).window

const elementId = '#ency_desc_full'
const element = document.querySelector(elementId)
let elementText = ''
if (element) {
    elementText = element.innerHTML
    console.log(elementText)
    console.log()
} else {
    console.log('error when accessing URL:', desc_page_url)
    // writeFileSync('./outputs/bing_image.html', page)
}
