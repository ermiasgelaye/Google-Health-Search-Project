# netlify/functions/api.py
import json
import sys
import os

# Add the parent directory to the path so we can import your app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

# Now import your Flask app components
from app import app  # Import your Flask app instance
from flask import request

def handler(event, context):
    """Handle Netlify function requests"""
    
    # Parse the event from Netlify
    http_method = event['httpMethod']
    path = event['path'].replace('/.netlify/functions/api', '')
    
    # For POST requests
    body = event.get('body', '{}')
    if body and event.get('isBase64Encoded'):
        import base64
        body = base64.b64decode(body).decode('utf-8')
    
    # For GET requests
    query_string = event.get('queryStringParameters', {})
    
    # Create a mock request for Flask
    with app.test_request_context(
        path=path,
        method=http_method,
        data=body,
        query_string=query_string
    ):
        # Process the request with Flask
        response = app.full_dispatch_request()
        
        # Return in Netlify format
        return {
            'statusCode': response.status_code,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(response.get_json()) if response.is_json else response.get_data(as_text=True)
        }