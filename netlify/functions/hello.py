import json

def handler(event, context):
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'message': 'Health Analytics API is running!',
            'status': 'success',
            'function': 'health-api',
            'version': '1.0',
            'timestamp': '2024-01-10T18:00:00Z'
        })
    }