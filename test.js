import fs from 'fs'

let json = 'moooo'
let data

try {
  data = fs.readFileSync('articles_sorted_by_date.json', 'utf8')
} catch (err) {
  console.log('Error reading file', err)
}

json = JSON.parse(data.toString())
