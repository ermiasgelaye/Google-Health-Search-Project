import json

def handler(event, context):
    path = event.get('path', '')
    
    if path.endswith('/chat'):
        return chat_handler(event, context)
    elif path.endswith('/conditions'):
        return conditions_handler(event, context)
    elif path.endswith('/team'):
        return team_handler(event, context)
    elif path.endswith('/stats'):
        return stats_handler(event, context)
    else:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Endpoint not found'})
        }

def chat_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        question = body.get('question', 'Hello')
        
        responses = {
            'hello': "👋 Hello! I'm your Health Analytics Assistant. I can help you explore health search data from 2004-2017.",
            'cancer': "🏥 **Cancer Analysis**:\n- Most searched condition overall\n- Consistent interest across all states\n- California leads in cancer searches\n- Strong correlation with awareness campaigns",
            'diabetes': "🩺 **Diabetes Analysis**:\n- 45% growth in searches (2004-2017)\n- Strong correlation with depression\n- Highest in Southern states\n- Seasonal patterns observed",
            'team': "👥 **Project Team**:\n- Ermias Gaga: Data Scientist & Project Lead\n- Amanda Qianyue Ma: Economics & Analytics\n- Amos Johnson: Data Journalist\n- Adedamola Atekoja: Financial Analyst\n- Maria Lorena: Project Manager",
            'default': f"🤖 I understand you're asking about '{question}'. For detailed analysis, please visit the full dashboard."
        }
        
        question_lower = question.lower()
        response = responses.get('default')
        
        if any(word in question_lower for word in ['hi', 'hello', 'hey']):
            response = responses['hello']
        elif 'cancer' in question_lower:
            response = responses['cancer']
        elif 'diabetes' in question_lower:
            response = responses['diabetes']
        elif any(word in question_lower for word in ['team', 'who', 'members']):
            response = responses['team']
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'response': response,
                'question': question
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }

def conditions_handler(event, context):
    conditions = [
        {'name': 'Cancer', 'description': 'Most searched condition overall'},
        {'name': 'Diabetes', 'description': '45% growth in searches'},
        {'name': 'Depression', 'description': 'Mental health awareness trending up'},
        {'name': 'Obesity', 'description': 'January search peaks'},
        {'name': 'Cardiovascular', 'description': 'Higher in states with older populations'},
        {'name': 'Stroke', 'description': 'Spikes after awareness campaigns'},
        {'name': 'Vaccine', 'description': 'Seasonal flu-related searches'},
        {'name': 'Rehab', 'description': 'Consistent year-round interest'},
        {'name': 'Diarrhea', 'description': 'Summer peaks (foodborne illness)'}
    ]
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({
            'success': True,
            'conditions': conditions,
            'count': len(conditions)
        })
    }

def team_handler(event, context):
    team = {
        'Ermias Gaga': 'Data Scientist & Project Lead',
        'Amanda Qianyue Ma': 'Economics & Analytics Specialist',
        'Amos Johnson': 'Data Journalist & Analyst',
        'Adedamola Atekoja': 'Chartered Accountant & Data Analyst',
        'Maria Lorena': 'Project Manager & Data Analyst'
    }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({
            'success': True,
            'team': team,
            'count': len(team)
        })
    }

def stats_handler(event, context):
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({
            'success': True,
            'stats': {
                'years_covered': '2004-2017',
                'conditions_analyzed': 9,
                'states_covered': 50,
                'data_points': '1M+',
                'methodology': 'Statistical correlation & AI analysis'
            }
        })
    }