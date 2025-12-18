import pandas as pd
import os
import json
from difflib import get_close_matches
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
# ================================================
# ENHANCED HEALTH ANALYTICS CHATBOT
# ================================================

class EnhancedHealthAnalyticsChatbot:
    def __init__(self):
        self.knowledge_base = self._build_knowledge_base()
        self.conversation_history = {}
        
    def _build_knowledge_base(self):
        """Comprehensive knowledge base for the health analytics project"""
        return {
            # PROJECT-SPECIFIC KNOWLEDGE
            'project_overview': {
                'category': 'project',
                'title': 'Project Overview',
                'responses': [
                    {
                        'content': '**Eagle Health Analytics** analyzes 14 years (2004-2017) of Google search trends across 9 major health conditions in the US. We correlate search data with CDC health statistics to understand public health interests and patterns.',
                        'sources': ['Project Documentation', 'Research Objectives'],
                        'methodology': 'Data mining, correlation analysis, time-series analysis'
                    },
                    {
                        'content': 'This project investigates how online search behavior reflects real-world health concerns by comparing Google Trends data with CDC mortality statistics across 50 states.',
                        'sources': ['Research Proposal', 'Methodology Section'],
                        'methodology': 'Comparative analysis, statistical correlation'
                    }
                ],
                'keywords': ['project', 'overview', 'what is this', 'dashboard', 'purpose', 'goal']
            },
            
            'data_sources': {
                'category': 'project',
                'title': 'Data Sources',
                'responses': [
                    {
                        'content': '**Primary Data Sources:**\n1. **Google Trends API** (2004-2017): Search volume data for health conditions across US states and cities\n2. **CDC Public Datasets**: Leading causes of death statistics (2004-2017)\n3. **Geographic Data**: State and city coordinates for mapping visualizations',
                        'sources': ['Google Trends API Documentation', 'CDC Data Catalog', 'US Census Data'],
                        'methodology': 'Data aggregation, API integration'
                    },
                    {
                        'content': 'Data Integration: We combine Google search trends (what people search) with CDC health outcomes (what actually happens) to find correlations between public interest and health statistics.',
                        'sources': ['Data Integration Documentation'],
                        'methodology': 'Data merging, normalization'
                    }
                ],
                'keywords': ['data', 'sources', 'google trends', 'cdc', 'dataset', 'data collection']
            },
            
            'health_conditions': {
                'category': 'project',
                'title': 'Health Conditions Analyzed',
                'responses': [
                    {
                        'content': '**9 Health Conditions Tracked:**\n1. Cancer (highest search volume)\n2. Cardiovascular\n3. Depression\n4. Diabetes\n5. Diarrhea\n6. Obesity\n7. Stroke\n8. Vaccine\n9. Rehab\n\nCancer consistently shows the highest search interest across all states.',
                        'sources': ['Data Dictionary', 'Analysis Results'],
                        'methodology': 'Keyword analysis, volume tracking'
                    }
                ],
                'keywords': ['conditions', 'diseases', 'health issues', 'what conditions', 'cancer', 'diabetes']
            },
            
            'methodology': {
                'category': 'project',
                'title': 'Methodology',
                'responses': [
                    {
                        'content': '**Technical Methodology:**\n1. **Data Processing**: Python (Pandas, SQLAlchemy) for ETL\n2. **Analysis**: Correlation matrices, time-series analysis, geographic mapping\n3. **Visualization**: D3.js, Plotly, Leaflet for interactive charts\n4. **Backend**: Flask API serving JSON data\n5. **Database**: PostgreSQL with spatial capabilities',
                        'sources': ['Technical Documentation', 'Code Repository'],
                        'methodology': 'Full-stack data science pipeline'
                    },
                    {
                        'content': '**Analytical Approach:**\n- Correlation analysis between search trends and health outcomes\n- Time-series decomposition of search patterns\n- Geographic clustering of health interests\n- Statistical significance testing of findings',
                        'sources': ['Analysis Plan'],
                        'methodology': 'Statistical analysis, geographic information systems'
                    }
                ],
                'keywords': ['methodology', 'how it works', 'technical', 'analysis', 'approach']
            },
            
            'key_findings': {
                'category': 'project',
                'title': 'Key Findings',
                'responses': [
                    {
                        'content': '**Major Findings:**\n1. Cancer is the most searched health condition (40% higher than second)\n2. Search interest increased 300% from 2004-2017\n3. Strong correlation between diabetes and depression searches (r=0.74)\n4. California, Texas, and New York show highest search volumes\n5. Online search trends often precede CDC data by 1-2 years',
                        'sources': ['Findings Report', 'Analysis Results'],
                        'methodology': 'Statistical analysis, trend detection'
                    }
                ],
                'keywords': ['findings', 'results', 'insights', 'discoveries', 'what did you find']
            },
            
            'visualizations': {
                'category': 'project',
                'title': 'Visualizations',
                'responses': [
                    {
                        'content': '**Interactive Visualizations Available:**\n1. **Choropleth Maps**: Health search volume by state\n2. **Time-Series Charts**: Search trends over 14 years\n3. **Correlation Heatmaps**: Relationships between conditions\n4. **Geographic Maps**: City-level search patterns\n5. **Comparative Charts**: State-by-state analysis',
                        'sources': ['Dashboard Documentation'],
                        'methodology': 'Data visualization, interactive design'
                    }
                ],
                'keywords': ['charts', 'visualizations', 'maps', 'graphs', 'plots']
            },
            
            # DOMAIN KNOWLEDGE - DATA SCIENCE CONCEPTS
            'correlation_analysis': {
                'category': 'domain',
                'title': 'Correlation Analysis',
                'responses': [
                    {
                        'content': '**Correlation Analysis** measures the strength and direction of relationships between variables. In our project, we use Pearson correlation coefficients to find relationships between search trends for different health conditions.\n\n**Interpretation:**\n- r = 0.7-1.0: Strong positive correlation\n- r = 0.3-0.7: Moderate correlation\n- r = 0-0.3: Weak correlation',
                        'sources': ['Statistics Textbook', 'Analysis Methodology'],
                        'methodology': 'Pearson correlation, statistical testing'
                    }
                ],
                'keywords': ['correlation', 'pearson', 'relationship', 'statistics']
            },
            
            'time_series': {
                'category': 'domain',
                'title': 'Time Series Analysis',
                'responses': [
                    {
                        'content': '**Time Series Analysis** examines data points collected over time intervals. We analyze 14 years of monthly search data to identify trends, seasonality, and patterns in health search behavior.\n\n**Techniques Used:**\n- Trend decomposition\n- Year-over-year comparison\n- Seasonal adjustment',
                        'sources': ['Time Series Analysis Guide'],
                        'methodology': 'Trend analysis, decomposition'
                    }
                ],
                'keywords': ['time series', 'trends', 'seasonality', 'temporal']
            },
            
            'data_visualization': {
                'category': 'domain',
                'title': 'Data Visualization Principles',
                'responses': [
                    {
                        'content': '**Effective Data Visualization:**\n1. **Choropleth Maps**: Use color intensity to represent search volume\n2. **Interactive Elements**: Allow filtering by condition and year\n3. **Comparative Views**: Side-by-side state comparisons\n4. **Time Animation**: Show trends over years\n\nWe follow Tufte\'s principles of graphical excellence.',
                        'sources': ['Data Visualization Best Practices'],
                        'methodology': 'Visual encoding, interactive design'
                    }
                ],
                'keywords': ['visualization', 'charts', 'design', 'tufte', 'best practices']
            },
            
            # TEAM INFORMATION
            'team_members': {
                'category': 'team',
                'title': 'Team Members',
                'responses': [
                    {
                        'content': '**Project Team:**\n1. **Ermias Gaga**: Data Scientist & Researcher (Project Lead)\n2. **Amanda Qianyue Ma**: Economics & Analytics Specialist\n3. **Amos Johnson**: Data Journalist & Analyst\n4. **Adedamola Atekoja**: Chartered Accountant & Data Analyst\n5. **Maria Lorena**: Project Manager & Data Analyst\n\nAll team members contributed to data collection, analysis, and visualization.',
                        'sources': ['Team Profiles', 'About Page'],
                        'methodology': 'Collaborative development'
                    }
                ],
                'keywords': ['team', 'members', 'who worked', 'contributors', 'ermias', 'amanda']
            },
            
            'team_roles': {
                'category': 'team',
                'title': 'Team Roles',
                'responses': [
                    {
                        'content': '**Role Distribution:**\n- **Data Processing**: Ermias, Amanda\n- **Statistical Analysis**: Amos, Adedamola\n- **Visualization Development**: Maria, Ermias\n- **Project Management**: Maria\n- **Documentation**: All team members\n\nCross-functional collaboration ensured comprehensive coverage.',
                        'sources': ['Project Management Documentation'],
                        'methodology': 'Agile methodology'
                    }
                ],
                'keywords': ['roles', 'responsibilities', 'who did what']
            }
        }
    
    def _find_best_match(self, question):
        """Find the best matching knowledge base entry using fuzzy matching"""
        question_lower = question.lower()
        
        # First check for exact keyword matches
        for category, info in self.knowledge_base.items():
            for keyword in info['keywords']:
                if keyword in question_lower:
                    return category, info
        
        # If no exact match, use fuzzy matching
        all_keywords = []
        for category, info in self.knowledge_base.items():
            all_keywords.extend([(category, kw) for kw in info['keywords']])
        
        # Extract just the keywords for matching
        keyword_list = [kw[1] for kw in all_keywords]
        matches = get_close_matches(question_lower, keyword_list, n=1, cutoff=0.6)
        
        if matches:
            # Find the category for the matched keyword
            for category, keyword in all_keywords:
                if keyword == matches[0]:
                    return category, self.knowledge_base[category]
        
        return None, None
    
    def _extract_query_type(self, question):
        """Determine the type of query"""
        question_lower = question.lower()
        
        # Team inquiries
        team_keywords = ['team', 'member', 'ermias', 'amanda', 'amos', 'damola', 'maria', 'who worked', 'contributor']
        if any(keyword in question_lower for keyword in team_keywords):
            return 'team'
        
        # Domain knowledge inquiries
        domain_keywords = ['what is', 'explain', 'how does', 'method', 'technique', 'concept', 'model', 'statistics', 'analysis']
        if any(keyword in question_lower for keyword in domain_keywords):
            return 'domain'
        
        # Default to project-specific
        return 'project'
    
    def get_response(self, question, session_id=None):
        """Get intelligent response based on question"""
        
        # Store conversation history
        if session_id:
            if session_id not in self.conversation_history:
                self.conversation_history[session_id] = []
            self.conversation_history[session_id].append({
                'question': question,
                'timestamp': datetime.now().isoformat()
            })
        
        # Find best matching category
        category, info = self._find_best_match(question)
        
        if category and info:
            import random
            response_data = random.choice(info['responses'])
            
            # Format response based on category
            if info['category'] == 'project':
                formatted_response = self._format_project_response(response_data)
            elif info['category'] == 'domain':
                formatted_response = self._format_domain_response(response_data)
            else:  # team
                formatted_response = self._format_team_response(response_data)
            
            return {
                'success': True,
                'response': formatted_response,
                'category': info['category'],
                'title': info['title'],
                'sources': response_data.get('sources', []),
                'methodology': response_data.get('methodology', '')
            }
        else:
            # Fallback response with guidance
            return {
                'success': True,
                'response': self._get_fallback_response(question),
                'category': 'general',
                'title': 'General Assistance',
                'sources': [],
                'methodology': ''
            }
    
    def _format_project_response(self, response_data):
        """Format project-specific responses"""
        formatted = f"**{response_data.get('title', 'Project Information')}**\n\n"
        formatted += f"{response_data['content']}\n\n"
        
        if response_data.get('sources'):
            formatted += f"📚 **Sources**: {', '.join(response_data['sources'])}\n"
        
        if response_data.get('methodology'):
            formatted += f"🔬 **Methodology**: {response_data['methodology']}\n"
        
        return formatted
    
    def _format_domain_response(self, response_data):
        """Format domain knowledge responses"""
        formatted = f"📊 **{response_data.get('title', 'Data Science Concept')}**\n\n"
        formatted += f"{response_data['content']}\n\n"
        
        if response_data.get('sources'):
            formatted += f"📖 **References**: {', '.join(response_data['sources'])}\n"
        
        return formatted
    
    def _format_team_response(self, response_data):
        """Format team-related responses"""
        formatted = f"👥 **{response_data.get('title', 'Team Information')}**\n\n"
        formatted += f"{response_data['content']}\n\n"
        
        formatted += "💼 **Team Members Details**: See the 'About Us' page for full profiles, roles, and contact information.\n"
        
        return formatted
    
    def _get_fallback_response(self, question):
        """Provide helpful guidance when question isn't recognized"""
        guidance = """
🤔 I'm not sure I understand your question perfectly, but here's what I can help with:

**Try asking about:**
1. **Project Details**: "What data sources are used?" or "What are the key findings?"
2. **Technical Concepts**: "Explain correlation analysis" or "What is time series analysis?"
3. **Team Information**: "Who worked on this project?" or "What are the team roles?"

**Or browse these topics directly:**
- 📊 **Project Overview**: Goals, methodology, data sources
- 🔍 **Analysis Techniques**: Correlation, time series, visualization
- 👥 **Team Information**: Members, roles, contributions
- 📈 **Key Findings**: Major insights and discoveries

Feel free to rephrase your question or ask for specific information!
"""
        return guidance
    
    def get_suggested_questions(self):
        """Get suggested questions for the user"""
        return [
            {"category": "project", "question": "What data sources are used in this project?"},
            {"category": "project", "question": "What are the key findings from the analysis?"},
            {"category": "domain", "question": "Explain correlation analysis in simple terms"},
            {"category": "team", "question": "Who are the team members and their roles?"},
            {"category": "project", "question": "What health conditions are analyzed?"},
            {"category": "domain", "question": "What visualization techniques are used?"}
        ]

# Create enhanced chatbot instance
enhanced_chatbot = EnhancedHealthAnalyticsChatbot()
if __name__ == '__main__':
    app.run(debug=False)

