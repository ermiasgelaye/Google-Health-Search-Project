import pandas as pd
import os
import json
import requests
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
import pandas.io.sql as pdsql
from flask import Flask, jsonify, render_template, abort, redirect
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
# Add these imports at the top of app.py
import uuid
import json
from datetime import datetime

#################################################
# Database Setup
##################################################

load_dotenv()
DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable not set")

# Fix old-style postgres:// URLs if needed
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)


#################################################
# Flask Setup
#################################################

app = Flask(__name__)

# Use the same DATABASE_URL for Flask-SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

#################################################
# Flask Routes
#################################################

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/Home")
def home():
    return render_template("index.html")

@app.route('/searchbyyear')
def searchbyyear():
    sqlStatement = """
   SELECT year, SUM ("Cancer" + "cardiovascular" + "stroke" + "depression" + "rehab" + "vaccine" + "diarrhea" + "obesity" + "diabetes") AS Searches  
   FROM search_condition 
   GROUP BY year
    ORDER BY year;
    """
    df = pdsql.read_sql(sqlStatement, engine)
    df.set_index('year', inplace=True)
    df = df.to_json(orient='table')
    result = json.loads(df)
    return jsonify(result)

@app.route('/searchyearandcondition')
def searchyearandcondition():
    sqlStatement = """
    SELECT year, SUM ("Cancer") AS Cancer,SUM ("cardiovascular") As Cardiovascular,SUM ("stroke") As Stroke,SUM ("depression") As Depression,SUM ("rehab") AS Rehab,SUM ("vaccine") AS Vaccine, SUM ("diarrhea") AS Diarrhea, SUM("obesity") AS Obesity, SUM ("diabetes") AS Diabetes    
    FROM search_condition 
    GROUP BY year
    ORDER BY year;

    """
    df = pdsql.read_sql(sqlStatement, engine)
    df.set_index('year', inplace=True)
    df = df.to_json(orient='table')
    result = json.loads(df)
    return jsonify(result)
@app.route("/dashboards/main")
def main_dashboard():
    return render_template("main.html")

@app.route("/dashboards/comparison")
def comparison_dashboard():
    return render_template("comparison.html")

@app.route("/dashboards/about")
def about_page():
    return render_template("about.html")
@app.route('/searchbycity')
def searchbycity():
    sqlStatement = """
SELECT l.city,l.postal,l.state, l.latitude, l.longitude, SUM (s."Cancer" + s."cardiovascular" + s."stroke" + s."depression" + s."rehab" + s."vaccine" + s."diarrhea" + s."obesity" + s."diabetes") AS Searches  
FROM location l
INNER JOIN search_condition s on s.location_id = l.location_id
GROUP BY l.city,l.state,l.postal, l.latitude, l.longitude
ORDER BY l.city;
    """
    df = pdsql.read_sql(sqlStatement, engine)
    df.set_index('city', inplace=True)
    df = df.to_json(orient='table')
    result = json.loads(df)
    return jsonify(result)

@app.route('/searchbystate')
def searchbystate():
    sqlStatement = """
SELECT l.state,l.postal, SUM (s."Cancer" + s."cardiovascular" + s."stroke" + s."depression" + s."rehab" + s."vaccine" + s."diarrhea" + s."obesity" + s."diabetes") AS Searches  
FROM location l
INNER JOIN search_condition s on s.location_id = l.location_id
GROUP BY l.state,l.postal;
 """
    df = pdsql.read_sql(sqlStatement, engine)
    df.set_index('state', inplace=True)
    df = df.to_json(orient='table')
    result = json.loads(df)
    return jsonify(result)

@app.route('/bystateandyear')
def bylocationandyear():
    sqlStatement = """
 SELECT l.state, l.latitude, l.longitude,s.year, SUM (s."Cancer" + s."cardiovascular" + s."stroke" + s."depression" + s."rehab" + s."vaccine" + s."diarrhea" + s."obesity" + s."diabetes") AS Searches  
FROM location l
INNER JOIN search_condition s on s.location_id = l.location_id
GROUP BY l.state, l.latitude, l.longitude, s.year
ORDER BY s.year;
    """
    df = pdsql.read_sql(sqlStatement, engine)
    df.set_index('state', inplace=True)
    df = df.to_json(orient='table')
    result = json.loads(df)
    return jsonify(result)

@app.route('/casesleadingdeath')
def casesleadingdeath():
    sqlStatement = """
    SELECT * FROM leading_causes_of_death;

    """
    df = pdsql.read_sql(sqlStatement, engine)
    df.set_index('year', inplace=True)
    df = df.to_json(orient='table')
    result = json.loads(df)
    return jsonify(result)

@app.route('/allsearchrecord')
def allsearchrecord():
    sqlStatement = """
    SELECT *
    FROM location l
    INNER JOIN search_condition s on s.location_id = l.location_id
    ORDER BY s.year;
    """
    df = pdsql.read_sql(sqlStatement, engine)
    df.set_index('year', inplace=True)
    df = df.to_json(orient='table')
    result = json.loads(df)
    return jsonify(result)

@app.route('/location')
def location():
    sqlStatement = """
    SELECT * FROM location;
    """
    df = pdsql.read_sql(sqlStatement, engine)
    df.set_index('location_id', inplace=True)
    df = df.to_json(orient='table')
    result = json.loads(df)
    return jsonify(result)

@app.route('/conditions')
def conditions():
    sqlStatement = """
    SELECT * FROM search_condition;
    """
    df = pdsql.read_sql(sqlStatement, engine)
    df.set_index('location_id', inplace=True)
    df = df.to_json(orient='table')
    result = json.loads(df)
    return jsonify(result)

@app.route('/mostsserached')
def mostsserached():
    sqlStatement = """
    SELECT l.state, SUM ("Cancer") AS Cancer,SUM ("cardiovascular") As Cardiovascular,SUM ("stroke") As Stroke,SUM ("depression") As Depression,SUM ("rehab") AS Rehab,SUM ("vaccine") AS Vaccine, SUM ("diarrhea") AS Diarrhea, SUM("obesity") AS Obesity, SUM ("diabetes") AS Diabetes 
    FROM location l
    INNER JOIN search_condition s on s.location_id = l.location_id
    GROUP BY state
    order by Cancer desc, Cardiovascular desc,Stroke desc,Depression desc,Rehab desc,Vaccine desc, Diarrhea desc, Diabetes desc, Obesity desc
    LIMIT 10; 
    """
    df = pdsql.read_sql(sqlStatement, engine)
    df.set_index('state', inplace=True)
    df = df.to_json(orient='table')
    result = json.loads(df)
    return jsonify(result)

@app.route('/totalcondition')
def totalcondition():
    sqlStatement = """
    SELECT SUM ("Cancer") AS Cancer,SUM ("cardiovascular") As Cardiovascular,SUM ("stroke") As Stroke,SUM ("depression") As Depression,SUM ("rehab") AS Rehab,SUM ("vaccine") AS Vaccine, SUM ("diarrhea") AS Diarrhea, SUM("obesity") AS Obesity, SUM ("diabetes") AS Diabetes    
    FROM search_condition 
    """
    df = pdsql.read_sql(sqlStatement, engine)
    df.set_index('cancer', inplace=True)
    df = df.to_json(orient='table')
    result = json.loads(df)
    return jsonify(result)

@app.route('/totaldeathcase')
def totaldeathcase():
    sqlStatement = """
    SELECT SUM ("Accidents") AS Accidents,SUM ("Alzheimer") As Alzheimer,SUM ("Cerebrovascular") As Cerebrovascular,SUM ("Diabetes") As Diabetes,SUM ("Diseases_of_heart") AS Diseases_of_Heart, SUM ("Influenza_and_pneumonia") AS Influenza_and_Pneumonia, SUM ("Malignant_neoplasms") AS Malignant_eoplasms, SUM("Nephrosis") AS Nephrosis, SUM ("Suicide") AS Suicide,SUM ("Respiratory") AS Respiratory   
    FROM leading_causes_of_death
    """
    df = pdsql.read_sql(sqlStatement, engine)
    df.set_index('alzheimer', inplace=True)
    df = df.to_json(orient='table')
    result = json.loads(df)
    return jsonify(result)

# Enhanced Chatbot class definition
class HealthAnalyticsChatbot:
    def __init__(self):
        self.knowledge_base = {
            'data_sources': {
                'title': 'Data Sources',
                'responses': [
                    'This project uses two primary data sources: 1) Google Trends search volume data from 2004-2017 covering all US states and major cities, and 2) CDC (Centers for Disease Control and Prevention) official health statistics and leading causes of death data.',
                    'We integrate data from Google Trends API (public search interest) with CDC public health datasets. The Google data shows what people search for, while CDC data shows actual health outcomes.',
                    'Data Sources: Google Trends (search behavior patterns 2004-2017) + CDC Health Statistics (official health metrics). Combined dataset enables correlation analysis between public interest and actual health statistics.'
                ],
                'keywords': ['data', 'sources', 'google trends', 'cdc', 'data collection', 'where data', 'source']
            },
            'project_overview': {
                'title': 'Project Overview',
                'responses': [
                    'Eagle Health Analytics analyzes 14 years of Google search trends (2004-2017) for 9 major health conditions across US states and cities, correlating search data with CDC health statistics.',
                    'This dashboard visualizes health search patterns to understand public health interests and correlate them with actual health outcomes using interactive charts and maps.',
                    'Our project examines how online search behavior for health conditions relates to real-world health statistics over a 14-year period.'
                ],
                'keywords': ['project', 'overview', 'dashboard', 'what is this', 'purpose']
            },
            'health_conditions': {
                'title': 'Health Conditions',
                'responses': [
                    'We analyze 9 health conditions: Cancer, Cardiovascular, Depression, Diabetes, Diarrhea, Obesity, Stroke, Vaccine, and Rehab. Cancer consistently has the highest search volume.',
                    'Tracked conditions: Cancer (most searched), Cardiovascular disease, Depression, Diabetes, Diarrhea, Obesity, Stroke, Vaccine-related searches, and Rehabilitation.',
                    '9 conditions: 1. Cancer 2. Cardiovascular 3. Depression 4. Diabetes 5. Diarrhea 6. Obesity 7. Stroke 8. Vaccine 9. Rehab'
                ],
                'keywords': ['conditions', 'diseases', 'health issues', 'what conditions']
            },
            'methodology': {
                'title': 'Methodology',
                'responses': [
                    'Our methodology involves: 1) Data collection from Google Trends API, 2) Data cleaning and preprocessing, 3) Integration with CDC datasets, 4) Statistical analysis including correlation and trend analysis, 5) Visualization using Plotly, D3.js, and Highcharts.',
                    'We use data science techniques including time series analysis, correlation matrices, geographic visualization (choropleth maps), and comparative analysis to identify patterns between search behavior and health outcomes.',
                    'Methodological approach: Collect search data → Clean and normalize → Merge with CDC data → Analyze correlations → Visualize insights → Draw conclusions about public health awareness.'
                ],
                'keywords': ['method', 'methodology', 'how', 'approach', 'technique', 'analysis']
            },
            'team_members': {
                'title': 'Team Members',
                'responses': [
                    'Our team consists of 5 members: 1) Ermias Gaga (Data Scientist & Researcher), 2) Amanda Qianyue Ma (Economics & Analytics), 3) Amos Johnson (Data Journalist), 4) Adedamola Atekoja (Chartered Accountant & Data Analyst), 5) Maria Lorena (Project Manager & Data Analyst).',
                    'Team Eagle: Ermias Gaga, Amanda Ma, Amos Johnson, Damola Atekoja, and Maria Lorena. Each member contributes expertise in data analysis, visualization, project management, and research.',
                    'The project team includes professionals with backgrounds in data science, economics, journalism, accounting, and project management working together on this health analytics initiative.'
                ],
                'keywords': ['team', 'members', 'who', 'people', 'creators', 'developers']
            },
            'time_period': {
                'title': 'Time Period',
                'responses': [
                    'The data covers 14 years from 2004 to 2017, providing a comprehensive view of how health search behavior has evolved over time.',
                    'Our analysis spans 2004-2017, capturing changes in health search patterns across different presidential administrations, economic conditions, and healthcare policy changes.',
                    '14-year period (2004-2017): This timeframe allows us to see long-term trends in public health awareness and search behavior.'
                ],
                'keywords': ['years', 'time', 'period', 'duration', '2004', '2017', 'when']
            },
            'geographic_scope': {
                'title': 'Geographic Scope',
                'responses': [
                    'The analysis covers all 50 US states plus major metropolitan areas, allowing for both national and regional insights.',
                    'Geographic coverage includes: All 50 states, 200+ cities, and major urban centers across the United States. We analyze both state-level and city-level data.',
                    'Our geographic analysis spans the entire United States, with detailed data for states and cities to identify regional health search patterns.'
                ],
                'keywords': ['states', 'cities', 'geography', 'location', 'where', 'us', 'america']
            },
            'data_science_concepts': {
                'title': 'Data Science Concepts',
                'responses': [
                    'Key data science techniques used: Correlation analysis (measuring relationships between variables), Time series analysis (tracking changes over time), Data visualization (charts, maps, graphs), and Statistical modeling.',
                    'We employ concepts like correlation coefficients (measuring how search patterns relate), trend analysis (identifying patterns over time), and geographic data visualization (mapping search intensity).',
                    'Data science approaches: 1) Correlation matrices to find relationships, 2) Time series for trend analysis, 3) Geographic mapping for spatial patterns, 4) Comparative analysis between search data and health outcomes.'
                ],
                'keywords': ['data science', 'machine learning', 'analysis', 'statistics', 'correlation', 'visualization']
            },
            'insights_findings': {
                'title': 'Key Insights & Findings',
                'responses': [
                    'Key findings: 1) Cancer is consistently the most searched health condition, 2) Search interest has steadily increased from 2004-2017, 3) Strong correlation between Depression and Diabetes searches, 4) California, Texas, and New York show highest search volumes.',
                    'Major insights: Public health search interest grows over time, cancer awareness dominates online searches, geographic patterns show higher search activity in populous states, and correlations exist between comorbid conditions.',
                    'Findings include: Increasing trend in health searches, cancer as top searched condition, geographic concentration in populous states, and interesting correlations between conditions like depression and diabetes.'
                ],
                'keywords': ['findings', 'insights', 'results', 'discoveries', 'what did you find']
            },
            'technology_stack': {
                'title': 'Technology Stack',
                'responses': [
                    'Technology stack: Python (Flask backend), JavaScript (Plotly, D3.js, Highcharts for visualization), HTML/CSS/Bootstrap for frontend, PostgreSQL database, and various data science libraries (pandas, numpy).',
                    'We built this using: Backend - Flask/Python, Frontend - JavaScript/Plotly/D3.js, Database - PostgreSQL, Visualization - Plotly, Highcharts, Mapbox for maps.',
                    'Technical implementation: Python Flask server, Plotly for interactive charts, D3.js for custom visualizations, Bootstrap for responsive design, PostgreSQL for data storage.'
                ],
                'keywords': ['technology', 'stack', 'tools', 'software', 'how built', 'implementation']
            },
            'usage_help': {
                'title': 'How to Use Dashboard',
                'responses': [
                    'How to use: 1) Explore different dashboards using the navigation menu, 2) Use the comparison dashboard to analyze specific cities, 3) Download charts and data using the download buttons, 4) Access raw data through API links in the navigation.',
                    'Dashboard usage tips: Use the city comparison dashboard to analyze specific locations, explore time trends in the analytics dashboard, download data for your own analysis, and use the API endpoints for programmatic access.',
                    'Get started: Browse dashboards from the navigation menu, select cities for comparison, download visualizations, and explore the API links for direct data access.'
                ],
                'keywords': ['how to use', 'help', 'instructions', 'guide', 'tutorial']
            },
            'future_work': {
                'title': 'Future Work & Extensions',
                'responses': [
                    'Future extensions could include: Real-time data updates, predictive modeling of health trends, integration with social media data, mobile app development, and expansion to international data.',
                    'Potential future work: Adding machine learning predictions, expanding to global data, incorporating real-time search trends, developing predictive models for disease outbreaks based on search patterns.',
                    'Future possibilities: Predictive analytics for health trends, global expansion, real-time monitoring, mobile applications, and integration with healthcare provider data.'
                ],
                'keywords': ['future', 'next', 'extensions', 'improvements', 'what next']
            },
            'contact_info': {
                'title': 'Contact Information',
                'responses': [
                    'You can contact the team through the contact form on the About Us page. Team members are also available on LinkedIn and GitHub (links on About page).',
                    'Contact us via the form on the About page or find individual team member links there for LinkedIn and GitHub profiles.',
                    'Reach out through the contact form or connect with team members individually via their professional profiles on the About Us page.'
                ],
                'keywords': ['contact', 'email', 'reach', 'connect', 'get in touch']
            }
        }
    
    def get_response(self, question):
        question_lower = question.lower()
        
        # Check each knowledge base category
        for category, content in self.knowledge_base.items():
            if any(keyword in question_lower for keyword in content['keywords']):
                import random
                return random.choice(content['responses'])
        
        # Check for specific patterns
        if 'hello' in question_lower or 'hi' in question_lower or 'hey' in question_lower:
            return "Hello! I'm the Health Analytics Assistant. I can help you understand our project, data sources, methodology, team members, and findings. What would you like to know about?"
        
        elif 'thank' in question_lower:
            return "You're welcome! Is there anything else you'd like to know about our health analytics project?"
        
        elif 'help' in question_lower:
            return "I can help you with questions about: data sources, health conditions, methodology, team members, time period, geographic scope, findings, technology, how to use the dashboard, future work, or contact information. Try asking about any of these topics!"
        
        elif 'what can you do' in question_lower or 'capabilities' in question_lower:
            return "I can explain: 1) Project overview and purpose, 2) Data sources and methodology, 3) Health conditions analyzed, 4) Team information, 5) Key findings and insights, 6) How to use the dashboards, 7) Technology stack, 8) Future work plans."
        
        # Default response with suggestions
        else:
            suggestions = [
                "Try asking about: 'What data sources are used?'",
                "Try asking about: 'What health conditions are analyzed?'",
                "Try asking about: 'What are the key findings?'",
                "Try asking about: 'Who is on the project team?'",
                "Try asking about: 'What methodology was used?'",
                "Try asking about: 'How do I use the dashboard?'"
            ]
            import random
            suggestion = random.choice(suggestions)
            return f"I'm here to help you understand our health analytics project. {suggestion}"



# Chatbot API endpoint
@app.route('/api/chat', methods=['POST'])
def chat_api():
    try:
        data = request.get_json()
        if not data or 'question' not in data:
            return jsonify({'success': False, 'error': 'No question provided'})
        
        question = data['question'].lower()
        chatbot = HealthAnalyticsChatbot()
        response = chatbot.get_response(question)
        
        return jsonify({
            'success': True,
            'response': response,
            'session_id': data.get('session_id', 'default_session')
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})



if __name__ == '__main__':
    app.run(debug=False)

