import assert from 'node:assert/strict'
import test from 'node:test'

import { getJsonFeed } from '../../api/services/theAtlanticService.js'

test('getJsonFeed returns at least one item', async () => {
    const feed = await getJsonFeed('/the-atlantic')
    const items = feed?.items ?? feed?.item

    assert.ok(Array.isArray(items), 'expected feed to expose an items array')
    assert.ok(items.length > 0, 'expected feed to contain at least one item')
})