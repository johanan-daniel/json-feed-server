import { expect, test } from '@jest/globals'

import { getJsonFeed } from '../../api/services/bbcTravelService.js'

test('getJsonFeed returns at least one item', async () => {
    const feed = await getJsonFeed('/the-atlantic')
    const items = feed?.items ?? feed?.item

    expect(Array.isArray(items)).toBe(true)
    expect(items.length).toBeGreaterThan(0)
})
