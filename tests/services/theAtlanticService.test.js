import { expect, test } from '@jest/globals'
import {getJsonFeed} from "../../api/services/theAtlanticService.js";


test('getJsonFeed returns a json feed with at least one item', async () => {
    const json = await getJsonFeed('/the-atlantic')

    expect(json.version).toBe('https://jsonfeed.org/version/1.1')
    expect(json.title).toBe('The Atlantic')
    expect(Array.isArray(json.items)).toBe(true)
    expect(json.items.length).toBeGreaterThan(0)

    const [item] = json.items
    expect(typeof item.title).toBe('string')
    expect(item.url).toMatch(/^https:\/\/www\.theatlantic\.com/)
    expect(new Date(item.date_published).toString()).not.toBe('Invalid Date')
})
