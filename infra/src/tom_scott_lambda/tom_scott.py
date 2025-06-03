import os
import boto3
from boto3.dynamodb.conditions import Key
import requests
from datetime import datetime
import xmltodict

def handler(event, context):
    feed_name = 'tom_scott'
    print()
    main(feed_name)
    print()

    return {"body": f'{feed_name} lambda done'}


def main(feed_name):
    dynamodb_table = get_dynamodb_table()
    if not dynamodb_table:
        print('DynamoDB table not found')
        return

    prune_feed_items(dynamodb_table, feed_name, 20)
    save_new_post(dynamodb_table, feed_name)

def prune_feed_items(dynamodb_table, feed: str, limit: int=10):
    response = dynamodb_table.query(
        KeyConditionExpression= Key('Feed').eq(feed) & Key('Post').begins_with('POST#'),
        ProjectionExpression='Post'
    )

    items = response['Items']
    
    if len(items) >= limit:
        print('Deleting items past limit')
        items_to_delete = items[limit - 1:]

        for item in items_to_delete:
            dynamodb_table.delete_item(
                Key={
                    'Feed': feed,
                    'Post': item['Post']
                }
            )

def save_new_post(dynamodb_table, feed_name):
    raw_json = get_new_post(dynamodb_table, feed_name)
    if not raw_json:
        print('No new post data found')
        return

    data_entries = raw_json['feed']['entry']
    if not data_entries:
        print('No entries in feed')
        return

    data = data_entries[0]
    
    # check if post already is saved
    response = dynamodb_table.query(
        KeyConditionExpression= Key('Feed').eq(feed_name) & Key('Post').begins_with('POST#'),
        ProjectionExpression='Post',
        Limit=1,
        ScanIndexForward=False
    )
    if response['Items']:
        post_id: str = response['Items'][0]['Post'][5:]

        if post_id == data['id']:
            print(f'Post {post_id} already saved')
            return

    # process data into post
    date = datetime.fromisoformat(data['published'])
    month_padded = str(date.month).rjust(2, '0')
    day_padded = str(date.day).rjust(2, '0')
    article_url = f'https://www.tomscott.com/newsletter/{date.year}-{month_padded}-{day_padded}'
    post = {
        'Feed': feed_name,
        'Post': f"POST#{data['id']}",
        'title': data['title'],
        'url': article_url,
        'id': article_url,
        'summary': data['title'],
        'date_published': data['published'],
        'content_html': data['content']['#text'],
    }

    # save post
    response = dynamodb_table.put_item(Item=post)
    table_name = dynamodb_table.table_name
    print(f"Item added to {table_name} under {feed_name}: {data['id']}")

def get_new_post(dynamodb_table, feed_name):
    # get feed url
    response = dynamodb_table.get_item(
        Key={
            'Feed': feed_name,
            'Post': feed_name
        }
    )
    url = ''
    if 'Item' not in response or 'url' not in response['Item']:
        print('url was not found')
        return None
    else:
        url = str(response['Item']['url'])

    # get data
    response = requests.get(url)
    data = {}
    
    if response.status_code >= 300:
        print('Url request failed')
        return None
    
    # convert xml to json
    xml_str = response.text
    data = xmltodict.parse(xml_str)
    return data

def get_dynamodb_table():
    table_name = os.environ['TABLE_NAME']
    endpoint_url = os.environ.get('DYNAMODB_ENDPOINT_URL')

    # print('endpoint_url', endpoint_url)

    dynamodb_args = {}
    # only for local dev
    if endpoint_url:
        dynamodb_args['endpoint_url'] = endpoint_url
        dynamodb_args['aws_access_key_id'] = 'dummy'
        dynamodb_args['aws_secret_access_key'] = 'dummy'

    _dynamodb = boto3.resource('dynamodb', **dynamodb_args)
    table = _dynamodb.Table(table_name)
    return table
