// import { JSDOM } from 'jsdom'

// const date_str = '202501070800'
// const year = Number(date_str.slice(0, 4))
// const month = Number(date_str.slice(4, 6))
// const day = Number(date_str.slice(6, 8))
// const hour = Number(date_str.slice(8, 10))
// const min = Number(date_str.slice(10))
// const date = new Date(year, month, day, hour, min)

// console.log(year, month, day, hour, min)
// console.log(date)

// const { document } = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`).window
// console.log(document.querySelector('p').textContent) // "Hello world"

// const headers = new Headers()
// headers.append('Authorization', 'Bearer AyWBZFCM2DjK1NoyHoYiOWMaZ7v4KA')
// headers.append('User-Agent', 'rss-test.fly.dev/1.0 by /u/Fluffy__Pancake')

// const test = async () => {
//     const response = await fetch('https://oauth.reddit.com/api/v1/me', {
//         headers,
//     })
//     const data = await response.text()
//     console.log(data)
// }
// test()

// Replace these with your actual credentials

// Step 1: Obtain an access token
// const getAccessToken = async () => {
//     const response = await fetch('https://www.reddit.com/api/v1/access_token', {
//         method: 'POST',
//         headers: {
//             Authorization: 'Basic ' + btoa(`${clientId}:${clientSecret}`),
//             'Content-Type': 'application/x-www-form-urlencoded',
//             'User-Agent': 'your_app_name/1.0.0 by /u/your_username',
//         },
//         body: new URLSearchParams({
//             grant_type: 'password',
//             username: username,
//             password: password,
//         }),
//     })
//     const data = await response.json()
//     console.log('data', data)
//     return data.access_token
// }

// // Step 2: Make a GET request to /api/v1/me
// const fetchRedditUserData = async () => {
//     const accessToken = await getAccessToken()
//     console.log('token:', accessToken)
//     const response = await fetch('https://oauth.reddit.com/api/v1/me', {
//         method: 'GET',
//         headers: {
//             Authorization: `Bearer ${accessToken}`,
//             'User-Agent': 'your_app_name/1.0.0 by /u/Fluffy__Pancake',
//         },
//     })
//     const data = await response.text()
//     console.log(data)
// }

// fetchRedditUserData()
