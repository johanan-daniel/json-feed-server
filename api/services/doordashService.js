import fs from 'fs'

export const getJsonFeed = async (path) => {
    // const raw_data = await getObjectFromXML('./api/doordash.xml', 'file')
    // const raw_data = await getObjectFromXML(
    //     'https://careersatdoordash.com/feed/'
    // )
    let status = 0
    const raw_data = await fetch('https://careersatdoordash.com/feed/', {
        headers: {
            // exactly Postman’s UA
            'User-Agent': 'PostmanRuntime/7.43.3',
            Accept: '*/*',
            'Cache-Control': 'no-cache',
            'Accept-Encoding': 'gzip, deflate, br',
            Connection: 'keep-alive',
            // you can also add a referer if needed:
            Referer: 'https://careersatdoordash.com/',
        },
    }).then((res) => {
        status = res.status
        return res.text()
    })
    console.log('status', status)
    fs.writeFileSync('./api/doordash_req.xml', raw_data, 'utf-8')
    // xml2js(raw_data)

    // console.log(raw_data)
    return raw_data
}
