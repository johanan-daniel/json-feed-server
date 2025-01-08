const date_str = '202501070800'
const year = Number(date_str.slice(0, 4))
const month = Number(date_str.slice(4, 6))
const day = Number(date_str.slice(6, 8))
const hour = Number(date_str.slice(8, 10))
const min = Number(date_str.slice(10))
const date = new Date(year, month, day, hour, min)

console.log(year, month, day, hour, min)
console.log(date)
