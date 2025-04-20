import { getHtmlForPost } from './api/services/notionService.js'

await getHtmlForPost({
    title: 'Test',
    subtitle: 'Test',
    slug: 'test',
    thumbnail: 'test',
    date: new Date().toISOString(),
    url: 'https://www.notion.com/blog/observability-for-notions-redis-queue',
})
    .then((html) => {
        console.log(html)
    })
    .catch((error) => {
        console.error(error)
    })
