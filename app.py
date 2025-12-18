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

if __name__ == '__main__':
    app.run(debug=False)

# Chatbot class definition
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
            }
        }
    
    def get_response(self, question):
        question_lower = question.lower()
        
        # Check for data sources questions
        if any(keyword in question_lower for keyword in ['data', 'source', 'google', 'cdc', 'where data']):
            import random
            return random.choice(self.knowledge_base['data_sources']['responses'])
        
        # Check for project questions
        elif any(keyword in question_lower for keyword in ['project', 'what is this', 'overview', 'dashboard']):
            import random
            return random.choice(self.knowledge_base['project_overview']['responses'])
        
        # Check for conditions questions
        elif any(keyword in question_lower for keyword in ['condition', 'disease', 'health issue', 'what conditions']):
            import random
            return random.choice(self.knowledge_base['health_conditions']['responses'])
        
        # Default response
        else:
            return "I can help you with questions about data sources, health conditions, or the project overview. Try asking: 'What data sources are used?' or 'What health conditions are analyzed?'"

# Create chatbot instance
chatbot = HealthAnalyticsChatbot()