import os
import boto3
from boto3.dynamodb.conditions import Key, Attr
import requests
from datetime import datetime

xkcd_feed_name = 'xkcd'

def handler(event, context):
    main()

    print()
    return {"body": "xkcd lambda done"}

def get_dynamodb_table():
    table_name = os.environ['TABLE_NAME']
    endpoint_url = os.environ.get('DYNAMODB_ENDPOINT_URL')

    print('endpoint_url', endpoint_url)

    dynamodb_args = {}
    if endpoint_url:
        dynamodb_args['endpoint_url'] = endpoint_url
        dynamodb_args['aws_access_key_id'] = 'dummy'
        dynamodb_args['aws_secret_access_key'] = 'dummy'

    _dynamodb = boto3.resource('dynamodb', **dynamodb_args)
    table = _dynamodb.Table(table_name)
    return table

dynamodb_table = get_dynamodb_table()

def save_post_to_table(post: dict):
    # print(post)
    response = dynamodb_table.put_item(Item=post)
    table_name = dynamodb_table.table_name

    print(f"Item added to {table_name}: {response}")
    print()

def get_feed_url() -> str | None:
    response = dynamodb_table.get_item(
        Key={
            'Feed': xkcd_feed_name,
            'Post': xkcd_feed_name
        }
    )

    if 'Item' not in response or 'url' not in response['Item']:
        print(f'Feed <{xkcd_feed_name} not found')
        return None
    else:
        return str(response['Item']['url'])

def main():
    print()
    # post = {
    #     'Feed': 'xkcd',
    #     'Post': 'https://xkcd.com/3086/',
    #     'title': 'Globe Safety',
    #     'url': 'https://xkcd.com/3086/',
    # }

    # save_post_to_table(post, dynamodb_table)
    prune_feed_items(xkcd_feed_name, 20)
    save_new_xkcd_post()
    
def save_new_xkcd_post():
    data = get_new_xkcd_post()
    if not data:
        print('No new post data found')
        return

    date = datetime(year=int(data['year']), month=int(data['month']), day=int(data['day']), hour=5)
    
    post = {
        'Feed': xkcd_feed_name,
        'Post': f"POST#{data['num']}",
        'title': data['title'],
        'url': f'https://xkcd.com/{data['num']}',
        'id': f'https://xkcd.com/{data['num']}',
        'summary': data['alt'],
        'date_published': date.isoformat(),
        'content_html': f'<div><img src={data['img']} /><p>{data['alt']}</p> \
            <a href="https://www.explainxkcd.com/{data['num']}">Explanation</a><p>{data['news']}</p></div>',
        'image': data['img']
    }

    if 'link' in data:
        post['external_url'] = data['link']
    
    save_post_to_table(post)

def prune_feed_items(feed: str, limit: int=10):
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
    
def get_new_xkcd_post():
    url = get_feed_url()
    print(url)
    if not url:
        print('url was not found')
        return None

    response = requests.get(url)
    data = {}
    
    if response.status_code >= 300:
        print('Url request failed')
        return None
    
    data = response.json()
    return data