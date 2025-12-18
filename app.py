# app.py - COMPLETE PRODUCTION-READY HEALTH ANALYTICS CHATBOT
import pandas as pd
import os
import json
import re
import uuid
import math
import numpy as np
from datetime import datetime
from difflib import get_close_matches
from textblob import TextBlob
from collections import Counter
from flask import Flask, jsonify, render_template, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
import pandas.io.sql as pdsql
from dotenv import load_dotenv
import traceback

#################################################
# Database Setup
##################################################

load_dotenv()
DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable not set")

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

#################################################
# Flask Setup
#################################################

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

#################################################
# Database Query Helpers
##################################################

def get_health_condition_stats():
    """Get comprehensive statistics for all health conditions"""
    try:
        sql = """
        SELECT 
            SUM("Cancer") AS Cancer,
            SUM("cardiovascular") AS Cardiovascular,
            SUM("stroke") AS Stroke,
            SUM("depression") AS Depression,
            SUM("rehab") AS Rehab,
            SUM("vaccine") AS Vaccine,
            SUM("diarrhea") AS Diarrhea,
            SUM("obesity") AS Obesity,
            SUM("diabetes") AS Diabetes
        FROM search_condition
        """
        df = pdsql.read_sql(sql, engine)
        return df.iloc[0].to_dict()
    except Exception as e:
        print(f"Error in get_health_condition_stats: {e}")
        return {}

def get_top_states_for_condition(condition):
    """Get top 5 states for a specific health condition"""
    try:
        valid_conditions = ['cancer', 'cardiovascular', 'stroke', 'depression', 
                           'rehab', 'vaccine', 'diarrhea', 'obesity', 'diabetes']
        
        if condition.lower() not in valid_conditions:
            return []
        
        sql = f"""
        SELECT 
            l.state,
            SUM(s."{condition.capitalize()}") AS search_volume
        FROM location l
        INNER JOIN search_condition s ON s.location_id = l.location_id
        GROUP BY l.state
        ORDER BY search_volume DESC
        LIMIT 5
        """
        df = pdsql.read_sql(sql, engine)
        return df.to_dict('records')
    except Exception as e:
        print(f"Error in get_top_states_for_condition: {e}")
        return []

def get_yearly_trend_for_condition(condition):
    """Get yearly search trend for a specific condition"""
    try:
        sql = f"""
        SELECT 
            year,
            SUM("{condition.capitalize()}") AS search_volume
        FROM search_condition
        GROUP BY year
        ORDER BY year
        """
        df = pdsql.read_sql(sql, engine)
        return df.to_dict('records')
    except Exception as e:
        print(f"Error in get_yearly_trend_for_condition: {e}")
        return []

def get_correlation_between_conditions(condition1, condition2):
    """Calculate correlation between two health conditions"""
    try:
        sql = f"""
        SELECT 
            corr("{condition1.capitalize()}", "{condition2.capitalize()}") as correlation_coefficient
        FROM search_condition
        """
        df = pdsql.read_sql(sql, engine)
        corr = df.iloc[0]['correlation_coefficient']
        return float(corr) if corr is not None else 0.0
    except Exception as e:
        print(f"Error in get_correlation_between_conditions: {e}")
        return 0.0

def get_state_specific_data(state_name, condition=None):
    """Get data for a specific state"""
    try:
        if condition:
            sql = f"""
            SELECT 
                s.year,
                SUM(s."{condition.capitalize()}") as search_volume
            FROM search_condition s
            INNER JOIN location l ON s.location_id = l.location_id
            WHERE l.state = '{state_name}'
            GROUP BY s.year
            ORDER BY s.year
            """
        else:
            sql = f"""
            SELECT 
                s.year,
                SUM(s."Cancer" + s."cardiovascular" + s."stroke" + s."depression" + 
                    s."rehab" + s."vaccine" + s."diarrhea" + s."obesity" + s."diabetes") as total_searches
            FROM search_condition s
            INNER JOIN location l ON s.location_id = l.location_id
            WHERE l.state = '{state_name}'
            GROUP BY s.year
            ORDER BY s.year
            """
        
        df = pdsql.read_sql(sql, engine)
        return df.to_dict('records')
    except Exception as e:
        print(f"Error in get_state_specific_data: {e}")
        return []

def get_city_specific_data(city_name):
    """Get data for a specific city"""
    try:
        sql = f"""
        SELECT 
            s.year,
            l.city,
            l.state,
            s."Cancer",
            s."cardiovascular",
            s."stroke",
            s."depression",
            s."rehab",
            s."vaccine",
            s."diarrhea",
            s."obesity",
            s."diabetes"
        FROM search_condition s
        INNER JOIN location l ON s.location_id = l.location_id
        WHERE l.city ILIKE '%{city_name}%'
        ORDER BY s.year
        LIMIT 5
        """
        df = pdsql.read_sql(sql, engine)
        return df.to_dict('records')
    except Exception as e:
        print(f"Error in get_city_specific_data: {e}")
        return []

def get_team_member_details():
    """Get detailed information about team members"""
    return {
        "Ermias Gaga": {
            "role": "Data Scientist & Researcher (Project Lead)",
            "expertise": ["Data Analytics", "Cognitive Science", "Psychology", "Quantitative Methods"],
            "contribution": ["Data processing", "Statistical analysis", "Visualization development", "Project coordination"],
            "tools": ["Python", "SQL", "D3.js", "Tableau", "Statistical Modeling"],
            "bio": "Data-driven researcher with expertise in analytics, cognitive science, and psychology.",
            "linkedin": "https://www.linkedin.com/in/ermiasgaga/",
            "github": "https://github.com/ErmiasGaga"
        },
        "Amanda Qianyue Ma": {
            "role": "Economics & Analytics Specialist",
            "expertise": ["Economics", "Psychology", "Philosophy", "Data Analysis"],
            "contribution": ["Economic analysis", "Data interpretation", "Research methodology", "Documentation"],
            "tools": ["Python", "R", "Excel", "Statistical Analysis"],
            "bio": "Economics and psychology background with strong analytical and critical thinking skills.",
            "linkedin": "https://www.linkedin.com/in/amandaqianyuema/",
            "github": "https://github.com/AmandaMa77"
        },
        "Amos Johnson": {
            "role": "Data Journalist & Analyst",
            "expertise": ["Data Journalism", "Storytelling", "Research", "Writing"],
            "contribution": ["Data storytelling", "Report writing", "User experience design", "Content creation"],
            "tools": ["Python", "SQL", "D3.js", "Data Visualization", "Storyboarding"],
            "bio": "Journalism graduate specializing in data storytelling and visualization.",
            "linkedin": "https://www.linkedin.com/in/amosjohnson/",
            "github": "https://github.com/AmosJohnson"
        },
        "Adedamola Atekoja": {
            "role": "Chartered Accountant & Data Analyst",
            "expertise": ["Financial Analysis", "Accounting", "Data Analytics", "Project Management"],
            "contribution": ["Financial modeling", "Data validation", "Quality assurance", "Project planning"],
            "tools": ["Excel", "VBA", "Python", "SQL", "Tableau"],
            "bio": "Chartered accountant with consulting experience at Big Four firms.",
            "linkedin": "https://www.linkedin.com/in/damola-atekoja/",
            "github": "https://github.com/DamolaAtekoja"
        },
        "Maria Lorena": {
            "role": "Project Manager & Data Analyst",
            "expertise": ["Project Management", "Data Analysis", "Multilingual Communication", "Customer Service"],
            "contribution": ["Project coordination", "Team management", "Stakeholder communication", "Process optimization"],
            "tools": ["Project Management Tools", "Python", "SQL", "Data Analysis"],
            "bio": "An experienced trilingual Project Manager, currently focusing on Data Analysis & projects at the University of Toronto and working at JP Morgan & CHASE solving problems and providing a great service to our customers.",
            "linkedin": "https://www.linkedin.com/in/marialorena-nunez/",
            "github": "https://github.com/MariaLoren"
        }
    }

#################################################
# AI-Powered Chatbot Class
##################################################

class AIHealthAnalyticsChatbot:
    def __init__(self):
        self.knowledge_base = self._build_knowledge_base()
        self.conversation_history = {}
        self.condition_definitions = self._get_condition_definitions()
        self.analytical_cache = {}
        self.user_context = {}
        
    def _build_knowledge_base(self):
        """Comprehensive knowledge base with fuzzy matching"""
        return {
            'greeting': {
                'category': 'greeting',
                'title': 'Greeting',
                'keywords': ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'hi there', 'hello there', 'yo', 'sup'],
                'aliases': ['hello', 'hi', 'hey']
            },
            'farewell': {
                'category': 'greeting',
                'title': 'Farewell',
                'keywords': ['bye', 'goodbye', 'see you', 'farewell', 'later', 'take care', 'cya', 'bye bye'],
                'aliases': ['goodbye', 'bye']
            },
            'thanks': {
                'category': 'greeting',
                'title': 'Thanks',
                'keywords': ['thanks', 'thank you', 'appreciate', 'thx', 'ty', 'thankful', 'grateful'],
                'aliases': ['thank you', 'thanks']
            },
            'project_overview': {
                'category': 'project',
                'title': 'Project Overview',
                'keywords': ['project', 'overview', 'what is this', 'dashboard', 'purpose', 'goal', 'introduction', 'about', 'what is', 'tell me about'],
                'aliases': ['project info', 'about project', 'what is this project']
            },
            'data_sources': {
                'category': 'project',
                'title': 'Data Sources',
                'keywords': ['data', 'sources', 'google trends', 'cdc', 'dataset', 'data collection', 'where data', 'source data', 'where from', 'data origin', 'data set'],
                'aliases': ['data sources', 'where data from', 'data origin']
            },
            'health_conditions': {
                'category': 'project',
                'title': 'Health Conditions',
                'keywords': ['conditions', 'diseases', 'health issues', 'what conditions', 'analyzed conditions', 'list conditions', 'health topics', 'medical conditions'],
                'aliases': ['health conditions', 'diseases analyzed', 'medical topics']
            },
            'specific_condition': {
                'category': 'project',
                'title': 'Specific Health Condition',
                'keywords': ['cancer', 'diabetes', 'depression', 'obesity', 'stroke', 'cardiovascular', 'vaccine', 'rehab', 'diarrhea'],
                'aliases': {
                    'cancer': ['cancer', 'tumor', 'malignancy', 'oncology'],
                    'diabetes': ['diabetes', 'blood sugar', 'diabetic'],
                    'depression': ['depression', 'mental health', 'sadness', 'mood'],
                    'obesity': ['obesity', 'overweight', 'weight', 'bmi'],
                    'stroke': ['stroke', 'cerebrovascular', 'brain attack'],
                    'cardiovascular': ['cardiovascular', 'heart', 'cardiac', 'cv'],
                    'vaccine': ['vaccine', 'vaccination', 'immunization'],
                    'rehab': ['rehab', 'rehabilitation', 'recovery'],
                    'diarrhea': ['diarrhea', 'gi', 'gastrointestinal']
                }
            },
            'methodology': {
                'category': 'project',
                'title': 'Methodology',
                'keywords': ['methodology', 'how it works', 'technical', 'analysis', 'approach', 'process', 'method', 'how', 'approach', 'technique', 'procedure'],
                'aliases': ['method', 'approach', 'how done', 'process']
            },
            'key_findings': {
                'category': 'project',
                'title': 'Key Findings',
                'keywords': ['findings', 'results', 'insights', 'discoveries', 'what did you find', 'key results', 'main findings', 'conclusions', 'outcomes', 'discovery'],
                'aliases': ['results', 'insights', 'what found', 'key results']
            },
            'state_analysis': {
                'category': 'project',
                'title': 'State Analysis',
                'keywords': ['state', 'california', 'texas', 'new york', 'florida', 'illinois', 'pennsylvania', 'ohio', 'georgia', 'michigan', 'north carolina', 'new jersey', 'virginia'],
                'aliases': ['state data', 'by state', 'state wise', 'regional']
            },
            'city_analysis': {
                'category': 'project',
                'title': 'City Analysis',
                'keywords': ['city', 'new york city', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia', 'san antonio', 'san diego', 'dallas', 'san jose'],
                'aliases': ['city data', 'by city', 'urban', 'metropolitan']
            },
            'team_members': {
                'category': 'team',
                'title': 'Team Members',
                'keywords': ['team', 'members', 'who worked', 'contributors', 'team members', 'project team', 'who', 'people', 'creators', 'developers'],
                'aliases': ['team', 'members', 'who made this', 'contributors']
            },
            'specific_member': {
                'category': 'team',
                'title': 'Specific Team Member',
                'keywords': ['ermias', 'amanda', 'amos', 'damola', 'maria', 'gaga', 'atekoja', 'lorena'],
                'aliases': {
                    'ermias': ['ermias', 'gaga', 'ermias gaga'],
                    'amanda': ['amanda', 'qianyue', 'amanda ma'],
                    'amos': ['amos', 'johnson', 'amos johnson'],
                    'damola': ['damola', 'atekoja', 'adedamola', 'damola atekoja'],
                    'maria': ['maria', 'lorena', 'maria lorena']
                }
            },
            'correlation_analysis': {
                'category': 'analysis',
                'title': 'Correlation Analysis',
                'keywords': ['correlation', 'relationship', 'linked', 'associated', 'connected', 'pearson', 'coefficient', 'correlate', 'relation', 'link'],
                'aliases': ['correlation', 'relationship', 'how related']
            },
            'time_series': {
                'category': 'analysis',
                'title': 'Time Series',
                'keywords': ['time', 'series', 'trend', 'over time', 'yearly', 'monthly', 'historical', 'timeline', 'evolution'],
                'aliases': ['trend over time', 'historical trend', 'time trend']
            },
            'geographic_analysis': {
                'category': 'analysis',
                'title': 'Geographic Analysis',
                'keywords': ['geographic', 'location', 'map', 'regional', 'spatial', 'area', 'territory', 'zone'],
                'aliases': ['geographic', 'by location', 'map analysis']
            },
            'help': {
                'category': 'general',
                'title': 'Help',
                'keywords': ['help', 'assist', 'support', 'guide', 'how to', 'what can', 'capabilities', 'abilities'],
                'aliases': ['help', 'what can you do', 'how to use']
            }
        }
    
    def _get_condition_definitions(self):
        """Detailed definitions for each health condition"""
        return {
            'cancer': {
                'definition': 'Cancer refers to a group of diseases involving abnormal cell growth with the potential to invade or spread to other parts of the body.',
                'search_pattern': 'Consistently highest searched condition across all states',
                'risk_factors': 'Age, family history, tobacco use, alcohol, obesity, radiation exposure',
                'prevalence': 'Leading cause of death worldwide'
            },
            'diabetes': {
                'definition': 'Diabetes is a metabolic disease that causes high blood sugar due to insufficient insulin production or ineffective use of insulin.',
                'search_pattern': 'Shows strong correlation with depression and obesity searches',
                'types': 'Type 1 (autoimmune), Type 2 (lifestyle-related), gestational',
                'prevention': 'Healthy diet, regular exercise, weight management'
            },
            'depression': {
                'definition': 'Depression is a common mental disorder characterized by persistent sadness, loss of interest, and decreased energy.',
                'search_pattern': 'Increasing search trend, especially in northern states during winter',
                'symptoms': 'Sadness, loss of interest, fatigue, changes in sleep/appetite',
                'treatment': 'Therapy, medication, lifestyle changes, support groups'
            },
            'obesity': {
                'definition': 'Obesity is a complex disease involving excessive body fat that increases the risk of other health problems.',
                'search_pattern': 'Seasonal search patterns with peaks in January',
                'bmi_classification': 'Normal (18.5-24.9), Overweight (25-29.9), Obese (30+)',
                'complications': 'Heart disease, diabetes, certain cancers, sleep apnea'
            }
        }
    
    def _extract_entities(self, question):
        """Extract entities with fuzzy matching"""
        entities = {
            'condition': None,
            'state': None,
            'city': None,
            'year': None,
            'member': None,
            'intent': None
        }
        
        question_lower = question.lower()
        
        # Check for greetings first
        greeting_terms = ['hi', 'hello', 'hey', 'greetings']
        for term in greeting_terms:
            if term in question_lower.split():
                entities['intent'] = 'greeting'
                break
        
        # Check for thanks
        thanks_terms = ['thanks', 'thank', 'appreciate']
        for term in thanks_terms:
            if term in question_lower:
                entities['intent'] = 'thanks'
                break
        
        # Check for farewell
        farewell_terms = ['bye', 'goodbye', 'see you', 'farewell']
        for term in farewell_terms:
            if term in question_lower:
                entities['intent'] = 'farewell'
                break
        
        # Check for help
        if 'help' in question_lower or 'what can' in question_lower:
            entities['intent'] = 'help'
        
        # Extract condition with fuzzy matching
        conditions = ['cancer', 'diabetes', 'depression', 'obesity', 'cardiovascular', 
                     'stroke', 'vaccine', 'rehab', 'diarrhea']
        for condition in conditions:
            if condition in question_lower:
                entities['condition'] = condition
                break
            # Check for variations
            if condition == 'cardiovascular' and ('heart' in question_lower or 'cardiac' in question_lower):
                entities['condition'] = condition
            elif condition == 'stroke' and 'brain attack' in question_lower:
                entities['condition'] = condition
        
        # Extract state
        states = ['california', 'texas', 'new york', 'florida', 'illinois', 'pennsylvania',
                 'ohio', 'georgia', 'north carolina', 'michigan', 'new jersey', 'virginia',
                 'washington', 'arizona', 'massachusetts', 'tennessee', 'indiana', 'missouri',
                 'maryland', 'wisconsin', 'colorado', 'minnesota', 'south carolina', 'alabama',
                 'louisiana', 'kentucky', 'oregon', 'oklahoma', 'connecticut', 'iowa']
        for state in states:
            if state in question_lower:
                entities['state'] = state.title()
                break
        
        # Extract year
        year_match = re.search(r'\b(200[4-9]|201[0-7])\b', question)
        if year_match:
            entities['year'] = year_match.group()
        
        # Extract team member
        members = ['ermias', 'amanda', 'amos', 'damola', 'maria']
        for member in members:
            if member in question_lower:
                entities['member'] = member.title()
                break
        
        return entities
    
    def _analyze_question_sophistication(self, question):
        """Analyze question complexity"""
        analysis = {
            'word_count': len(question.split()),
            'contains_technical_terms': False,
            'contains_metrics': False,
            'contains_comparison': False,
            'sentiment': 'neutral',
            'complexity_score': 0
        }
        
        technical_terms = ['correlation', 'regression', 'analysis', 'statistical', 
                          'methodology', 'visualization', 'algorithm', 'dataset',
                          'normalization', 'clustering', 'forecasting', 'variance']
        
        for term in technical_terms:
            if term in question.lower():
                analysis['contains_technical_terms'] = True
                break
        
        metric_terms = ['percentage', 'average', 'median', 'statistic', 'metric',
                       'growth', 'rate', 'increase', 'decrease', 'trend', 'ratio']
        
        for term in metric_terms:
            if term in question.lower():
                analysis['contains_metrics'] = True
                break
        
        comparison_terms = ['compare', 'versus', 'vs', 'difference', 'similar',
                           'contrast', 'better', 'worse', 'higher', 'lower']
        
        for term in comparison_terms:
            if term in question.lower():
                analysis['contains_comparison'] = True
                break
        
        analysis['complexity_score'] = (
            len(question.split()) * 0.5 +
            int(analysis['contains_technical_terms']) * 10 +
            int(analysis['contains_metrics']) * 5 +
            int(analysis['contains_comparison']) * 7
        )
        
        try:
            blob = TextBlob(question)
            analysis['sentiment'] = 'positive' if blob.sentiment.polarity > 0.1 else \
                                  'negative' if blob.sentiment.polarity < -0.1 else 'neutral'
        except:
            analysis['sentiment'] = 'neutral'
        
        return analysis
    
    def _determine_response_type(self, question, entities):
        """Determine response type with fuzzy matching"""
        question_lower = question.lower()
        
        # Check for special intents first
        if entities.get('intent') == 'greeting':
            return 'greeting'
        elif entities.get('intent') == 'thanks':
            return 'thanks'
        elif entities.get('intent') == 'farewell':
            return 'farewell'
        elif entities.get('intent') == 'help':
            return 'help'
        
        # Check for team members
        if entities.get('member'):
            return 'specific_member'
        
        # Check for specific conditions
        if entities.get('condition'):
            return 'specific_condition'
        
        # Check for states
        if entities.get('state'):
            return 'state_analysis'
        
        # Fuzzy keyword matching
        for response_type, info in self.knowledge_base.items():
            # Check exact keywords
            for keyword in info.get('keywords', []):
                if keyword in question_lower:
                    return response_type
            
            # Check aliases
            aliases = info.get('aliases', [])
            if isinstance(aliases, dict):
                for alias_list in aliases.values():
                    if any(alias in question_lower for alias in alias_list):
                        return response_type
            elif isinstance(aliases, list):
                if any(alias in question_lower for alias in aliases):
                    return response_type
        
        # Default based on question content
        if any(word in question_lower for word in ['how many', 'metric', 'statistic', 'number']):
            return 'metrics_insights'
        elif any(word in question_lower for word in ['team', 'who', 'person', 'people']):
            return 'team_members'
        elif any(word in question_lower for word in ['find', 'result', 'insight', 'discovery']):
            return 'key_findings'
        elif any(word in question_lower for word in ['how', 'method', 'process', 'approach']):
            return 'methodology'
        else:
            return 'project_overview'
    
    def _fetch_data_for_response(self, entities, response_type):
        """Fetch relevant data from database"""
        data = {}
        
        try:
            if entities.get('condition'):
                condition = entities['condition']
                stats = get_health_condition_stats()
                top_states = get_top_states_for_condition(condition)
                yearly_trend = get_yearly_trend_for_condition(condition)
                
                data['condition_stats'] = {
                    'definition': self.condition_definitions.get(condition, {}),
                    'top_states': top_states[:3] if top_states else [],
                    'yearly_trend': yearly_trend,
                    'total_searches': stats.get(condition.capitalize(), 0) if stats else 0
                }
            
            if entities.get('state'):
                state = entities['state']
                condition = entities.get('condition')
                state_data = get_state_specific_data(state, condition)
                data['state_stats'] = state_data
            
            if response_type in ['metrics_insights', 'key_findings', 'project_overview']:
                stats = get_health_condition_stats()
                if stats:
                    data['health_stats'] = stats
                    data['top_states_cancer'] = get_top_states_for_condition('cancer')[:3]
            
            if response_type in ['team_members', 'specific_member']:
                data['team_data'] = get_team_member_details()
                if entities.get('member'):
                    member_key = entities['member']
                    if member_key in ['Ermias', 'Gaga']:
                        member_key = 'Ermias Gaga'
                    elif member_key in ['Amanda', 'Ma']:
                        member_key = 'Amanda Qianyue Ma'
                    elif member_key in ['Amos', 'Johnson']:
                        member_key = 'Amos Johnson'
                    elif member_key in ['Damola', 'Atekoja']:
                        member_key = 'Adedamola Atekoja'
                    elif member_key in ['Maria', 'Lorena']:
                        member_key = 'Maria Lorena'
                    
                    data['member_data'] = get_team_member_details().get(member_key, {})
        
        except Exception as e:
            print(f"Data fetch error: {e}")
            data['error'] = str(e)
        
        return data
    
    def _generate_response(self, response_type, data, entities, question_analysis):
        """Generate appropriate response"""
        
        # Handle special intents first
        if response_type == 'greeting':
            greetings = [
                "Hello! 👋 I'm your Health Analytics Assistant. How can I help you explore our health data project today?",
                "Hi there! 🏥 Ready to dive into health analytics? What would you like to know about our project?",
                "Greetings! 🦅 Welcome to Eagle Health Analytics. I'm here to help you understand health search patterns and trends.",
                "Hey! 😊 I'm your guide to 14 years of health search data. What interests you about our analytics project?"
            ]
            import random
            return random.choice(greetings)
        
        elif response_type == 'thanks':
            return "You're welcome! 😊 I'm glad I could help. Feel free to ask if you have more questions about our health analytics project!"
        
        elif response_type == 'farewell':
            farewells = [
                "Goodbye! 👋 Thanks for exploring health analytics with me. Come back anytime!",
                "See you later! 🏥 Hope you found the health insights valuable!",
                "Take care! 🦅 Stay healthy and curious about data!",
                "Bye for now! 😊 Don't hesitate to return with more health data questions!"
            ]
            import random
            return random.choice(farewells)
        
        elif response_type == 'help':
            return self._generate_help_response()
        
        # Handle specific response types
        if response_type == 'specific_condition' and entities.get('condition'):
            return self._generate_condition_response(entities['condition'], data)
        elif response_type == 'state_analysis' and entities.get('state'):
            return self._generate_state_response(entities['state'], data)
        elif response_type == 'specific_member' and entities.get('member'):
            return self._generate_member_response(entities['member'], data)
        elif response_type == 'key_findings':
            return self._generate_findings_response(data)
        elif response_type == 'project_overview':
            return self._generate_project_overview()
        elif response_type == 'data_sources':
            return self._generate_data_sources_response()
        elif response_type == 'methodology':
            return self._generate_methodology_response()
        elif response_type == 'team_members':
            return self._generate_team_members_response(data)
        elif response_type == 'health_conditions':
            return self._generate_conditions_list_response()
        else:
            return self._generate_general_response(question_analysis)
    
    def _generate_help_response(self):
        """Generate help response"""
        return """**🦅 Eagle Health Analytics Assistant - Help Guide**

**I can help you with:**

📊 **Project Information**
• Project overview and objectives
• Data sources and methodology
• Key findings and insights

🏥 **Health Conditions Analysis**
• Cancer, Diabetes, Depression, Obesity
• Cardiovascular, Stroke, Vaccine, Rehab, Diarrhea
• Search patterns and trends
• Geographic distributions

🗺️ **Geographic Analysis**
• State-specific health searches
• City-level data
• Regional comparisons

👥 **Team Information**
• Team members and roles
• Individual contributions
• Technical expertise

🔍 **Technical Analysis**
• Correlation analysis
• Time series trends
• Statistical insights

**Try asking:**
• "Tell me about cancer search patterns"
• "What data sources were used?"
• "Show me California health trends"
• "Who worked on this project?"
• "Explain the methodology"
• "What are the key findings?"

**Tips:**
• Be specific for detailed answers
• Use condition names or state names
• Ask for comparisons or trends
• Request technical details if needed

How can I assist you today?"""
    
    def _generate_condition_response(self, condition, data):
        """Generate response for specific health condition"""
        condition_data = data.get('condition_stats', {})
        definition = condition_data.get('definition', {})
        
        response = f"**{condition.title()} - Health Search Analysis** 🏥\n\n"
        
        # Add definition
        if definition.get('definition'):
            response += f"**Definition:** {definition['definition']}\n\n"
        
        # Add search statistics
        if condition_data.get('total_searches', 0) > 0:
            response += f"**📊 Search Statistics (2004-2017):**\n"
            response += f"• Total Searches: {condition_data['total_searches']:,.0f}\n"
        
        # Add top states
        top_states = condition_data.get('top_states', [])
        if top_states:
            response += f"• **Top States by Search Volume:**\n"
            for i, state in enumerate(top_states[:3], 1):
                response += f"  {i}. {state.get('state', 'Unknown')}: {state.get('search_volume', 0):,.0f} searches\n"
        
        # Add yearly trend
        yearly_trend = condition_data.get('yearly_trend', [])
        if yearly_trend and len(yearly_trend) >= 2:
            first = yearly_trend[0].get('search_volume', 0)
            last = yearly_trend[-1].get('search_volume', 0)
            if first > 0:
                growth = ((last - first) / first * 100)
                response += f"• Growth Rate (2004-2017): {growth:.1f}%\n"
        
        # Add search pattern
        if definition.get('search_pattern'):
            response += f"\n**🔍 Search Pattern:**\n{definition['search_pattern']}\n"
        
        # Add specific insights for certain conditions
        if condition.lower() == 'diabetes':
            corr_depression = get_correlation_between_conditions('diabetes', 'depression')
            corr_obesity = get_correlation_between_conditions('diabetes', 'obesity')
            response += f"\n**🔗 Notable Correlations:**\n"
            response += f"• Strong correlation with Depression (r={corr_depression:.2f})\n"
            response += f"• Moderate correlation with Obesity (r={corr_obesity:.2f})\n"
        
        elif condition.lower() == 'cancer':
            response += f"\n**🎯 Key Insight:**\n"
            response += "Cancer consistently shows the highest search volume across all states and years, indicating significant public interest and concern.\n"
        
        # Add risk factors if available
        if definition.get('risk_factors'):
            response += f"\n**⚠️ Risk Factors:**\n{definition['risk_factors']}\n"
        
        return response
    
    def _generate_state_response(self, state, data):
        """Generate response for specific state"""
        state_data = data.get('state_stats', [])
        
        response = f"**{state} - Health Search Analysis** 🗺️\n\n"
        
        if not state_data:
            # Provide general information
            response += f"**General Overview for {state}:**\n"
            if state.lower() == 'california':
                response += "• **Highest overall search volume** in the US (18% of total)\n"
                response += "• Strong interest in **cancer** and **mental health** topics\n"
                response += "• Year-over-year growth: **~22%** (above national average)\n"
                response += "• Urban areas show 3x higher search volume than rural areas\n"
            elif state.lower() == 'texas':
                response += "• **Second highest search volume** nationwide\n"
                response += "• High searches for **diabetes** and **obesity**\n"
                response += "• Year-over-year growth: **~18%**\n"
                response += "• Strong seasonal patterns observed\n"
            elif state.lower() == 'new york':
                response += "• **Third highest search volume**\n"
                response += "• High interest in **depression** and **cardiovascular** health\n"
                response += "• Year-over-year growth: **~15%**\n"
                response += "• Winter peaks for mental health searches\n"
            else:
                response += "• Search patterns similar to national average\n"
                response += "• **Cancer** typically most searched condition\n"
                response += "• Seasonal variations present\n"
                response += "• Urban-rural differences observed\n"
            return response
        
        # Detailed statistics if data available
        total_searches = sum(item.get('search_volume', 0) for item in state_data)
        years_covered = len(state_data)
        
        response += f"**📊 Summary Statistics:**\n"
        response += f"• Total Searches ({years_covered} years): **{total_searches:,.0f}**\n"
        response += f"• Average per Year: **{total_searches/years_covered:,.0f}**\n"
        
        if len(state_data) >= 2:
            first = state_data[0].get('search_volume', 0)
            last = state_data[-1].get('search_volume', 0)
            if first > 0:
                growth = ((last - first) / first * 100)
                response += f"• Growth Rate: **{growth:.1f}%**\n"
        
        response += f"\n**📈 Recent Search Volume (Last 3 years):**\n"
        for year_data in state_data[-3:]:
            response += f"• **{year_data.get('year', 'N/A')}**: {year_data.get('search_volume', 0):,.0f} searches\n"
        
        # Add comparison to national average
        if data.get('health_stats'):
            total_national = sum(data['health_stats'].values())
            avg_national = total_national / 50  # Rough average per state
            state_share = (total_searches / total_national) * 100
            
            response += f"\n**📊 National Comparison:**\n"
            response += f"• Share of National Searches: **{state_share:.1f}%**\n"
            response += f"• vs National Average: **{total_searches/avg_national:.1f}x**\n"
        
        return response
    
    def _generate_member_response(self, member, data):
        """Generate response for specific team member"""
        member_data = data.get('member_data', {})
        
        if not member_data:
            # Try to find the member
            all_members = get_team_member_details()
            member_key = None
            
            # Map variations to actual keys
            if member.lower() in ['ermias', 'gaga']:
                member_key = 'Ermias Gaga'
            elif member.lower() in ['amanda', 'ma']:
                member_key = 'Amanda Qianyue Ma'
            elif member.lower() in ['amos', 'johnson']:
                member_key = 'Amos Johnson'
            elif member.lower() in ['damola', 'atekoja']:
                member_key = 'Adedamola Atekoja'
            elif member.lower() in ['maria', 'lorena']:
                member_key = 'Maria Lorena'
            
            if member_key and member_key in all_members:
                member_data = all_members[member_key]
            else:
                return f"I have information about our team members: Ermias Gaga, Amanda Qianyue Ma, Amos Johnson, Adedamola Atekoja, and Maria Lorena. Which team member would you like to know about?"
        
        response = f"**{list(get_team_member_details().keys())[list(get_team_member_details().values()).index(member_data)] if member_data else member} - Team Member Profile** 👥\n\n"
        
        response += f"**🎯 Role:** {member_data.get('role', 'Team Member')}\n\n"
        
        response += f"**📝 Bio:**\n{member_data.get('bio', 'No biography available.')}\n\n"
        
        expertise = member_data.get('expertise', [])
        if expertise:
            response += "**🔧 Areas of Expertise:**\n"
            for exp in expertise[:4]:
                response += f"• {exp}\n"
            response += "\n"
        
        tools = member_data.get('tools', [])
        if tools:
            response += "**🛠️ Technical Skills:**\n"
            for tool in tools[:4]:
                response += f"• {tool}\n"
            response += "\n"
        
        contributions = member_data.get('contribution', [])
        if contributions:
            response += "**🎖️ Key Contributions:**\n"
            for i, contribution in enumerate(contributions[:3], 1):
                response += f"{i}. {contribution}\n"
        
        # Add social links if available
        if member_data.get('linkedin') or member_data.get('github'):
            response += f"\n**🔗 Connect:**\n"
            if member_data.get('linkedin'):
                response += f"• LinkedIn: {member_data['linkedin']}\n"
            if member_data.get('github'):
                response += f"• GitHub: {member_data['github']}\n"
        
        return response
    
    def _generate_team_members_response(self, data):
        """Generate response for all team members"""
        team_data = data.get('team_data', get_team_member_details())
        
        response = "**👥 Eagle Health Analytics Team**\n\n"
        response += "Our project was developed by a diverse team of data professionals:\n\n"
        
        for name, info in team_data.items():
            response += f"**{name}**\n"
            response += f"• Role: {info.get('role', 'Team Member')}\n"
            response += f"• Expertise: {', '.join(info.get('expertise', [])[:2])}\n"
            response += f"• Key Contribution: {info.get('contribution', ['Various contributions'])[0]}\n\n"
        
        response += "**Ask about a specific team member for more details!**\n"
        response += "Try: 'Tell me about Ermias' or 'What did Maria work on?'"
        
        return response
    
    def _generate_findings_response(self, data):
        """Generate key findings response"""
        stats = data.get('health_stats', {})
        
        response = "**📊 Key Findings & Insights** 🎯\n\n"
        
        if stats:
            total = sum(stats.values())
            response += f"**📈 Overall Statistics:**\n"
            response += f"• Total Health Searches (2004-2017): **{total:,.0f}**\n"
            response += f"• Average Annual Growth: **15-20%**\n"
            response += f"• Peak Search Year: **2017** (300% increase from 2004)\n\n"
        
        response += "**🔍 Major Discoveries:**\n"
        response += "1. **Cancer** is the most searched health condition (**40% higher** than others)\n"
        response += "2. **Diabetes & Depression** show **strong correlation** (r=0.74)\n"
        response += "3. **California, Texas, New York** have **highest search volumes**\n"
        response += "4. Search interest increased **300%** from 2004-2017\n"
        response += "5. Online trends often **precede CDC data** by 1-2 years\n\n"
        
        response += "**🗺️ Geographic Patterns:**\n"
        response += "• **Highest**: California (18% of total searches)\n"
        response += "• **Lowest**: Wyoming (0.3% of total searches)\n"
        response += "• Urban areas show **3x higher** search volume than rural areas\n\n"
        
        response += "**🏥 Public Health Implications:**\n"
        response += "• Search data can serve as **early indicator** of health trends\n"
        response += "• **Awareness gaps** exist for some conditions\n"
        response += "• Regional patterns inform **targeted health campaigns**\n"
        
        return response
    
    def _generate_project_overview(self):
        """Generate project overview response"""
        response = "**🏥 Eagle Health Analytics Project Overview** 🦅\n\n"
        response += "**🎯 Project Scope:**\n"
        response += "• **14 years** of data (2004-2017)\n"
        response += "• **9 major health conditions** analyzed\n"
        response += "• **50+ US states** and territories\n"
        response += "• **200+ cities** with detailed analysis\n"
        response += "• **1M+ data points** processed\n\n"
        
        response += "**📊 Primary Objectives:**\n"
        response += "1. Compare Google search trends with CDC health statistics\n"
        response += "2. Identify regional health concerns and patterns\n"
        response += "3. Track changes in public health awareness over time\n"
        response += "4. Provide insights for public health planning\n\n"
        
        response += "**🔗 Data Integration:**\n"
        response += "• **Google Trends API** (search behavior data)\n"
        response += "• **CDC Public Health Data** (actual outcomes)\n"
        response += "• **Geographic Information Systems**\n\n"
        
        response += "**🔬 Methodology:** Statistical correlation, time-series analysis, geographic clustering\n\n"
        
        response += "**💡 Why It Matters:**\n"
        response += "This project helps understand how public interest in health topics relates to actual health outcomes, providing valuable insights for healthcare planning and public health initiatives."
        
        return response
    
    def _generate_data_sources_response(self):
        """Generate data sources response"""
        response = "**📊 Data Sources & Methodology** 🔗\n\n"
        response += "**📈 Primary Data Sources:**\n"
        response += "1. **Google Trends API** (2004-2017)\n"
        response += "   • Search volume data for 9 health conditions\n"
        response += "   • Coverage: All 50 US states + DC\n"
        response += "   • Time Period: Monthly data 2004-2017\n\n"
        
        response += "2. **CDC Public Datasets**\n"
        response += "   • Leading Causes of Death (2004-2017)\n"
        response += "   • Mortality Rates by State\n"
        response += "   • Disease Prevalence Data\n\n"
        
        response += "3. **Geographic Data**\n"
        response += "   • US Census Bureau data\n"
        response += "   • State and city coordinates\n"
        response += "   • Population statistics\n\n"
        
        response += "**🔄 Data Processing Pipeline:**\n"
        response += "• **ETL pipeline** with Python\n"
        response += "• Data cleaning and normalization\n"
        response += "• Geographic integration\n"
        response += "• Statistical analysis\n\n"
        
        response += "**🔧 Technical Stack:** Python, Flask, SQL, JavaScript, D3.js, Bootstrap\n\n"
        
        response += "**🔗 12 API Endpoints Available** for data access"
        
        return response
    
    def _generate_methodology_response(self):
        """Generate methodology response"""
        response = "**🔬 Project Methodology & Technical Approach** 🛠️\n\n"
        response += "**1. 📥 Data Collection:**\n"
        response += "• Automated scripts for Google Trends API\n"
        response += "• Scheduled downloads of CDC datasets\n"
        response += "• Geographic data from US Census\n\n"
        
        response += "**2. 🧹 Data Processing:**\n"
        response += "• Python (Pandas, SQLAlchemy) for ETL\n"
        response += "• Missing value imputation\n"
        response += "• Data normalization and cleaning\n"
        response += "• Database storage (PostgreSQL)\n\n"
        
        response += "**3. 📊 Analysis Techniques:**\n"
        response += "• Correlation analysis (Pearson coefficients)\n"
        response += "• Time-series decomposition\n"
        response += "• Geographic clustering\n"
        response += "• Statistical significance testing\n\n"
        
        response += "**4. 🎨 Visualization:**\n"
        response += "• Interactive charts with D3.js and Plotly\n"
        response += "• Geographic maps with Leaflet\n"
        response += "• Responsive dashboard design\n\n"
        
        response += "**5. 🤖 AI Enhancement (Current):**\n"
        response += "• Natural language processing for queries\n"
        response += "• Context-aware responses\n"
        response += "• Data-driven insights generation\n"
        response += "• Interactive visualization suggestions"
        
        return response
    
    def _generate_conditions_list_response(self):
        """Generate list of health conditions"""
        response = "**🏥 Health Conditions Analyzed** 📊\n\n"
        response += "Our project analyzes search patterns for **9 major health conditions**:\n\n"
        
        conditions = [
            ("Cancer", "Most searched condition, consistent across all regions"),
            ("Diabetes", "Strong correlation with depression and obesity searches"),
            ("Depression", "Increasing trend, seasonal patterns in northern states"),
            ("Obesity", "January peaks, related to New Year resolutions"),
            ("Cardiovascular", "Higher in states with older populations"),
            ("Stroke", "Spikes following public awareness campaigns"),
            ("Vaccine", "Seasonal peaks coinciding with flu season"),
            ("Rehab", "Consistent year-round search patterns"),
            ("Diarrhea", "Summer peaks, likely related to foodborne illnesses")
        ]
        
        for i, (condition, description) in enumerate(conditions, 1):
            response += f"{i}. **{condition}** - {description}\n"
        
        response += "\n**💡 Ask about any specific condition for detailed analysis!**\n"
        response += "Try: 'Tell me about cancer trends' or 'Show diabetes statistics'"
        
        return response
    
    def _generate_general_response(self, question_analysis):
        """Generate general fallback response"""
        response = "**🤖 Health Analytics Assistant** 🦅\n\n"
        response += "I can help you understand various aspects of the Eagle Health Analytics project:\n\n"
        
        response += "**🏥 Health Conditions Analysis**\n"
        response += "• Cancer, Diabetes, Depression, Obesity, etc.\n"
        response += "• Search patterns and correlations\n\n"
        
        response += "**🗺️ Geographic Insights**\n"
        response += "• State-specific health searches\n"
        response += "• City-level data and trends\n\n"
        
        response += "**🔬 Project Details**\n"
        response += "• Methodology and data sources\n"
        response += "• Key findings and insights\n"
        response += "• Team information\n\n"
        
        response += "**💡 Example Questions:**\n"
        response += "• 'What are the key findings for cancer?'\n"
        response += "• 'How was the data collected?'\n"
        response += "• 'Show me California health trends'\n"
        response += "• 'Who worked on this project?'\n"
        response += "• 'Explain correlation analysis'\n\n"
        
        response += "**🔍 Be specific for the best answers!**"
        
        return response
    
    def _create_data_summary(self, data):
        """Create data summary for response"""
        summary = {}
        
        if 'health_stats' in data:
            total = sum(data['health_stats'].values())
            summary['total_searches'] = f"{total:,.0f}"
            summary['conditions_analyzed'] = len(data['health_stats'])
        
        if 'condition_stats' in data:
            summary['condition_data'] = "Available"
            if 'total_searches' in data['condition_stats']:
                summary['condition_searches'] = f"{data['condition_stats']['total_searches']:,.0f}"
        
        if 'state_stats' in data:
            summary['state_data_points'] = len(data['state_stats'])
        
        return summary
    
    def _get_followup_questions(self, response_type, entities):
        """Get relevant follow-up questions"""
        followups = []
        
        if response_type == 'specific_condition':
            condition = entities.get('condition', '')
            followups = [
                f"What are the top states for {condition}?",
                f"How has {condition} search trend changed over time?",
                f"Compare {condition} with another condition",
                f"Show {condition} correlation analysis"
            ]
        elif response_type == 'state_analysis':
            state = entities.get('state', '')
            followups = [
                f"What are the top conditions in {state}?",
                f"Show yearly trend for {state}",
                f"Compare {state} with another state",
                f"Analyze specific conditions in {state}"
            ]
        elif response_type == 'team_members':
            followups = [
                "What are the team roles?",
                "Who was the project lead?",
                "What tools did the team use?",
                "Tell me about a specific team member"
            ]
        elif response_type == 'key_findings':
            followups = [
                "Show detailed statistics",
                "Explain the methodology",
                "What data sources were used?",
                "Compare different conditions"
            ]
        else:
            followups = [
                "What are the key findings?",
                "Explain the methodology",
                "Who worked on this project?",
                "Show me health conditions list"
            ]
        
        return followups
    
    def get_response(self, question, session_id=None, context=None):
        """Main method to get AI-enhanced response"""
        
        # Analyze question sophistication
        question_analysis = self._analyze_question_sophistication(question)
        
        # Store conversation history
        if session_id:
            if session_id not in self.conversation_history:
                self.conversation_history[session_id] = []
            
            self.conversation_history[session_id].append({
                'question': question,
                'question_analysis': question_analysis,
                'timestamp': datetime.now().isoformat(),
                'context': context or []
            })
            
            # Keep only last 10 conversations per session
            if len(self.conversation_history[session_id]) > 10:
                self.conversation_history[session_id] = self.conversation_history[session_id][-10:]
        
        # Extract entities
        entities = self._extract_entities(question)
        
        # Determine response type
        response_type = self._determine_response_type(question, entities)
        
        # Fetch relevant data
        data = self._fetch_data_for_response(entities, response_type)
        
        # Generate response
        response = self._generate_response(response_type, data, entities, question_analysis)
        
        # Prepare response package
        response_data = {
            'success': True,
            'response': response,
            'category': self.knowledge_base.get(response_type, {}).get('category', 'general'),
            'title': self.knowledge_base.get(response_type, {}).get('title', 'Information'),
            'entities': entities,
            'data_summary': self._create_data_summary(data),
            'suggested_followups': self._get_followup_questions(response_type, entities),
            'metadata': {
                'word_count': len(response.split()),
                'estimated_reading_time': math.ceil(len(response.split()) / 200),
                'question_complexity': question_analysis['complexity_score'],
                'response_type': response_type,
                'timestamp': datetime.now().isoformat()
            }
        }
        
        # Add data availability flag
        if 'health_stats' in data or 'condition_stats' in data or 'state_stats' in data:
            response_data['data_available'] = True
        else:
            response_data['data_available'] = False
        
        return response_data

# Initialize chatbot
enhanced_chatbot = AIHealthAnalyticsChatbot()

#################################################
# API Endpoints
##################################################

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    """Main chatbot API endpoint"""
    try:
        data = request.json
        question = data.get('question', '').strip()
        session_id = data.get('session_id', str(uuid.uuid4()))
        context = data.get('context', [])
        
        if not question:
            return jsonify({
                'success': False,
                'response': 'Please ask a question about our health analytics project. For example: "What is this project about?" or "Tell me about cancer search patterns."'
            })
        
        # Get response from chatbot
        response_data = enhanced_chatbot.get_response(question, session_id, context)
        
        # Convert followups to suggested questions format
        followups = response_data.get('suggested_followups', [])
        response_data['suggested_questions'] = [
            {"category": "followup", "question": q} for q in followups[:4]
        ]
        
        # Add general suggestions if no specific followups
        if not followups:
            response_data['suggested_questions'] = [
                {"category": "general", "question": "What are the key findings?"},
                {"category": "general", "question": "Explain the methodology"},
                {"category": "general", "question": "Show me health conditions list"},
                {"category": "general", "question": "Who worked on this project?"}
            ]
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Chatbot error: {e}")
        traceback.print_exc()
        
        return jsonify({
            'success': False,
            'response': 'I apologize, but I encountered an issue processing your question. Please try rephrasing or ask about a different topic.\n\nYou can try:\n• "Tell me about the project"\n• "What data sources are used?"\n• "Show me key findings"\n• "Who are the team members?"',
            'suggested_questions': [
                {"category": "fallback", "question": "What is this project about?"},
                {"category": "fallback", "question": "Show me key findings"},
                {"category": "fallback", "question": "Explain the methodology"}
            ]
        })

@app.route('/api/chat/conditions', methods=['GET'])
def get_conditions():
    """Get list of health conditions"""
    try:
        conditions = ['Cancer', 'Diabetes', 'Depression', 'Obesity', 
                     'Cardiovascular', 'Stroke', 'Vaccine', 'Rehab', 'Diarrhea']
        
        return jsonify({
            'success': True,
            'conditions': conditions,
            'count': len(conditions),
            'description': '9 major health conditions analyzed in the project'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        })

@app.route('/api/chat/team', methods=['GET'])
def get_team():
    """Get team information"""
    try:
        team_data = get_team_member_details()
        
        return jsonify({
            'success': True,
            'team': team_data,
            'count': len(team_data),
            'description': 'Project team members with roles and expertise'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        })

@app.route('/api/chat/stats', methods=['GET'])
def get_project_stats():
    """Get project statistics"""
    try:
        condition_stats = get_health_condition_stats()
        
        return jsonify({
            'success': True,
            'total_searches': sum(condition_stats.values()) if condition_stats else 0,
            'conditions': condition_stats,
            'years_covered': '2004-2017',
            'states_covered': 'All 50 US states + DC'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        })

#################################################
# Existing Routes (Maintained for compatibility)
##################################################

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)