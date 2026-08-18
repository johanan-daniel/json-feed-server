import { expect, test } from '@jest/globals'
import {getJsonFeed} from "../../api/services/theAtlanticService.js";


test('getJsonFeed returns a json feed with at least one item', async () => {
    const json = await getJsonFeed('/the-atlantic')

    expect(Array.isArray(json.items)).toBe(true)
    expect(json.items.length).toBeGreaterThan(0)
})
