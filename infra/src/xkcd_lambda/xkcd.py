import os
import boto3
from boto3.dynamodb.conditions import Key
import requests
from datetime import datetime

xkcd_feed_name = 'xkcd'
# technically not needed since python hoists variables to top
dynamodb_table = None

def handler(event, context):
    main()

    print()
    return {"body": "xkcd lambda done"}


def main():
    print()
    
    # Verify DynamoDB connection
    if not dynamodb_table:
        print('DynamoDB table not found')
        return

    prune_feed_items(xkcd_feed_name, 20)
    save_new_xkcd_post()

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

def save_new_xkcd_post():
    data = get_new_xkcd_post()
    if not data:
        print('No new post data found')
        return
    
    # check if post already is saved
    response = dynamodb_table.query(
        KeyConditionExpression= Key('Feed').eq(xkcd_feed_name) & Key('Post').begins_with('POST#'),
        ProjectionExpression='Post',
        Limit=1,
        ScanIndexForward=False
    )
    if response['Items']:
        post_id_str: str = response['Items'][0]['Post']
        post_id = int(post_id_str[5:])

        if post_id == data['num']:
            print(f'Post {post_id} already saved')
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
    
    # save post
    response = dynamodb_table.put_item(Item=post)
    table_name = dynamodb_table.table_name
    print(f"Item added to {table_name}: {post['id']}")
    print()

def get_new_xkcd_post():
    # get feed url
    response = dynamodb_table.get_item(
        Key={
            'Feed': xkcd_feed_name,
            'Post': xkcd_feed_name
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
    
    data = response.json()
    return data

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