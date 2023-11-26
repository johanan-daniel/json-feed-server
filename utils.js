/* https://github.com/nashwaan/xml-js */
import { xml2js } from 'xml-js'

const jsonTemplate = {
  version: 'https://jsonfeed.org/version/1.1',
  title: 'ENTER TITLE',
  home_page_url: 'https://bing.com',
  feed_url: 'https://rss-test.fly.dev/example',
  description: 'ENTER DESCRIPTION',
  icon: 'https://example.org/favicon-timeline-512x512.png',
  favicon: 'https://example.org/favicon-sourcelist-64x64.png',
  language: 'en-US',
  items: [
    {
      id: '2',
      content_text: 'This is a second item.',
      url: 'https://example.org/second-item',
      attachments: [
        {
          url: 'https://example.org/second-item/audio.ogg',
          mime_type: 'audio/ogg',
          title: 'Optional Title',
          size_in_bytes: 31415927,
          duration_in_seconds: 1800,
        },
      ],
    },
    {
      id: 'required-unique-string-that-does-not-change: number, guid, url, etc.',
      url: 'https://en.wikipedia.org/wiki/Tree',
      external_url: 'https://en.wikipedia.org/w/index.php?title=JSON_Feed',
      title: 'Optional Title',
      content_html:
        '<p>Optional content for the feed reader. You may also use content_text or both at the same time.</p>',
      content_text: 'Optional text for simple feeds.',
      summary: 'Optional summary of the item.',
      image:
        'https://s3-eu-west-1.amazonaws.com/blog-ecotree/blog/0001/01/ad46dbb447cd0e9a6aeecd64cc2bd332b0cbcb79.jpeg',
      banner_image:
        'https://images.immediate.co.uk/production/volatile/sites/30/2020/08/apples-700x350-edfec3b.png',
      date_published: '2021-10-25T19:30:00-01:00',
      date_modified: '2021-10-26T19:45:00-01:00',
      authors: [
        {
          name: 'Optional Author',
          url: 'https://example.org/authors/optional-author',
          avatar:
            'https://example.org/authors/optional-author/avatar-512x512.png',
        },
      ],
      tags: ['Optional Tag', 'Example'],
      language: 'en-US',
    },
  ],
}

const updateJSONWithObject = (input) => {
  const { title, home_page_url, feed_url, description, items } = input
  const jsonFromTemplate = structuredClone(jsonTemplate)

  jsonFromTemplate.title = title
  jsonFromTemplate.home_page_url = home_page_url
  jsonFromTemplate.feed_url = feed_url
  jsonFromTemplate.description = description
  jsonFromTemplate.items = items

  return jsonFromTemplate
}

const getObjectFromRSS = async (url) => {
  let xml = 'empty'

  await fetch(url)
    .then((res) => res.text())
    .then((str) => (xml = str))

  return xml2js(xml, { compact: true })
}

const logRequestDetails = (req) => {
  console.log(req.method, req.route.path, req.query)
}

export {
  jsonTemplate,
  logRequestDetails,
  getObjectFromRSS,
  updateJSONWithObject,
}
