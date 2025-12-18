# chatbot_backend.py - Health Analytics Chatbot
import json
import re
import sqlite3
from datetime import datetime
from typing import Dict, List, Tuple
import numpy as np

class HealthAnalyticsChatbot:
    def __init__(self, db_path='health_analytics.db'):
        self.db_path = db_path
        self.initialize_database()
        self.load_knowledge_base()
        
    def initialize_database(self):
        """Initialize SQLite database for chatbot conversations"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create conversation history table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                user_message TEXT,
                bot_response TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                intent_category TEXT
            )
        ''')
        
        # Create contact form submissions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS contact_submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT,
                subject TEXT,
                message TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'pending'
            )
        ''')
        
        conn.commit()
        conn.close()
        
    def load_knowledge_base(self):
        """Load comprehensive knowledge base for health analytics"""
        self.knowledge_base = {
            # Project Information
            'project_overview': {
                'title': 'Project Overview',
                'responses': [
                    'This project analyzes 14 years of Google search trends (2004-2017) for 9 major health conditions across all US states and major cities. We correlate search data with CDC health statistics to understand public health interests.',
                    'The Eagle Health Analytics Dashboard provides interactive visualizations and analytics on health search patterns, helping researchers identify trends and correlations between online search behavior and actual health statistics.',
                    'Our platform enables exploration of health search trends across 14 years, 9 conditions, and 50+ states with 1M+ data points for comprehensive public health insights.'
                ],
                'keywords': ['project', 'overview', 'dashboard', 'what is this', 'purpose', 'goal']
            },
            
            'health_conditions': {
                'title': 'Health Conditions',
                'responses': [
                    'We analyze 9 health conditions: Cancer, Cardiovascular, Depression, Diabetes, Diarrhea, Obesity, Stroke, Vaccine, and Rehab. Cancer has the highest search volume nationally.',
                    'The tracked conditions include Cancer, Cardiovascular disease, Depression, Diabetes, Diarrhea, Obesity, Stroke, Vaccine-related searches, and Rehabilitation. Diabetes shows strong correlations with depression in search patterns.',
                    '9 conditions tracked: 1. Cancer 2. Cardiovascular 3. Depression 4. Diabetes 5. Diarrhea 6. Obesity 7. Stroke 8. Vaccine 9. Rehab. Each has distinct search patterns and geographic distributions.'
                ],
                'keywords': ['conditions', 'diseases', 'health issues', 'cancer', 'diabetes', 'conditions analyzed', 'what conditions']
            },
            
            'data_sources': {
                'title': 'Data Sources',
                'responses': [
                    'Primary data sources: Google Trends search volume data (2004-2017) and CDC official health statistics. Data covers all US states and major metropolitan areas.',
                    'We use two main data sources: 1. Google Trends API for search volume across locations and time 2. CDC public datasets for health statistics and leading causes of death.',
                    'Data collected from Google Trends (search behavior) and Centers for Disease Control and Prevention (health statistics). Combined dataset enables correlation analysis between search interest and actual health outcomes.'
                ],
                'keywords': ['data', 'sources', 'google trends', 'cdc', 'data collection', 'where data', 'source']
            },
            
            'methodology': {
                'title': 'Methodology',
                'responses': [
                    'Methodology includes: data collection from APIs, cleaning with Python Pandas, statistical correlation analysis, time series trend analysis, and geographic visualization using D3.js and Plotly.',
                    'Our approach: Collect raw data → Clean and preprocess → Perform statistical analysis → Create interactive visualizations → Deploy dashboard with Flask API backend.',
                    'We use a data science pipeline: Data ingestion → ETL processing → Exploratory analysis → Statistical modeling → Visualization development → Dashboard deployment.'
                ],
                'keywords': ['methodology', 'approach', 'how', 'analysis method', 'statistical', 'process']
            },
            
            'insights': {
                'title': 'Key Insights',
                'responses': [
                    'Key insights: 1. Cancer is most searched nationwide 2. Search volume increased 300% from 2004-2017 3. Strong correlation between Diabetes and Depression searches (0.74) 4. California, Texas, New York have highest search volumes 5. Seasonal patterns in vaccine searches.',
                    'Notable findings: Online health searches grew with internet adoption, metropolitan areas show 40% higher search activity, comorbidities are reflected in search correlations, geographic patterns match known health disparities.',
                    'Insights include: Search interest predicts emerging health concerns, geographic variations reveal public health needs, correlation analysis shows interconnected health interests, time trends reflect growing digital health engagement.'
                ],
                'keywords': ['insights', 'findings', 'results', 'discoveries', 'key findings', 'what found']
            },
            
            'team': {
                'title': 'Team',
                'responses': [
                    'Eagle Health Analytics team: Ermias Gaga (Lead Data Scientist), Amanda Qianyue Ma (Economics & Analytics), Amos Johnson (Data Journalist), Adedamola Atekoja (Data Analyst), Maria Lorena (Project Manager).',
                    'Our multidisciplinary team combines data science, economics, journalism, accounting, and project management expertise to deliver comprehensive health analytics insights.',
                    'Team members: Ermias Gaga (lead), Amanda Qianyue Ma, Amos Johnson, Adedamola Atekoja, Maria Lorena. Diverse backgrounds in data analysis, research, and visualization.'
                ],
                'keywords': ['team', 'who made', 'creators', 'developers', 'who built', 'team members']
            },
            
            'usage': {
                'title': 'How to Use',
                'responses': [
                    'Dashboard features: 1. Explore trends with line charts 2. Compare states with bar charts 3. View geographic heatmaps 4. Analyze correlations 5. Download data/visualizations 6. Use comparison dashboard for cities.',
                    'How to use: Select conditions from dropdowns, hover over charts for details, click legend items to toggle visibility, use download buttons for data export, compare cities in comparison dashboard.',
                    'Usage tips: Start with Overview dashboard for trends, use Comparison for city analysis, download CSV for your own analysis, explore API endpoints for programmatic access.'
                ],
                'keywords': ['how to use', 'usage', 'features', 'dashboard use', 'how work', 'tutorial']
            },
            
            'technical': {
                'title': 'Technical Details',
                'responses': [
                    'Tech stack: Flask (Python backend), PostgreSQL/SQLite (database), D3.js/Plotly (visualization), Bootstrap (UI), JavaScript/HTML/CSS (frontend). Deployed on Render cloud platform.',
                    'Built with: Python for data processing, SQL for database, JavaScript for interactivity, Bootstrap for responsive design. All visualizations are interactive and downloadable.',
                    'Technical implementation: RESTful Flask API serves JSON data to frontend visualizations. Database stores 1M+ records. Charts rendered with D3.js and Plotly for maximum interactivity.'
                ],
                'keywords': ['technical', 'technology', 'stack', 'programming', 'code', 'github', 'api']
            },
            
            'api': {
                'title': 'API Access',
                'responses': [
                    'Available API endpoints: /searchbyyear, /searchyearandcondition, /searchbystate, /searchbycity, /bystateandyear, /casesleadingdeath, /allsearchrecord, /location, /conditions, /mostsserached, /totalcondition, /totaldeathcase',
                    'All data accessible via REST API returning JSON format. No authentication required. Use dropdown menus in dashboard to explore different endpoints.',
                    'API documentation: Each dashboard view corresponds to an API endpoint. Data available for programmatic access in JSON format for research and analysis.'
                ],
                'keywords': ['api', 'endpoints', 'data access', 'json', 'rest api', 'programmatic']
            },
            
            'contact': {
                'title': 'Contact',
                'responses': [
                    'Contact options: 1. Use contact form on About page 2. Email: ermiasgelaye@gmail.com 3. GitHub: github.com/ermiasgelaye 4. LinkedIn: linkedin.com/in/egaga',
                    'For inquiries: Submit contact form, email directly, or create GitHub issue. Research collaborations and data access requests welcome.',
                    'Get in touch via contact form for questions, collaborations, or data access. Team responds within 24-48 hours.'
                ],
                'keywords': ['contact', 'email', 'support', 'help', 'questions', 'collaborate']
            }
        }
        
    def process_question(self, question: str, session_id: str = None) -> Dict:
        """Process user question and return appropriate response"""
        question_lower = question.lower().strip()
        
        # Log the question
        self.log_conversation(session_id, question, 'user')
        
        # Check for greetings
        if any(greet in question_lower for greet in ['hello', 'hi', 'hey', 'greetings']):
            response = self.get_greeting_response()
            self.log_conversation(session_id, response, 'bot', 'greeting')
            return self.format_response(response, 'greeting')
        
        # Check for thanks
        if any(thanks in question_lower for thanks in ['thank', 'thanks', 'appreciate']):
            response = "You're welcome! Is there anything else about the health analytics project you'd like to know?"
            self.log_conversation(session_id, response, 'bot', 'thanks')
            return self.format_response(response, 'thanks')
        
        # Check for help
        if 'help' in question_lower or 'what can you do' in question_lower:
            response = self.get_help_response()
            self.log_conversation(session_id, response, 'bot', 'help')
            return self.format_response(response, 'help')
        
        # Find best matching category
        best_match = self.find_best_match(question_lower)
        
        if best_match:
            response = self.get_category_response(best_match)
            self.log_conversation(session_id, response, 'bot', best_match)
            return self.format_response(response, best_match)
        
        # Fallback response
        response = self.get_fallback_response(question_lower)
        self.log_conversation(session_id, response, 'bot', 'fallback')
        return self.format_response(response, 'fallback')
    
    def find_best_match(self, question: str) -> str:
        """Find the best matching knowledge base category"""
        scores = {}
        
        for category, data in self.knowledge_base.items():
            score = 0
            # Check keywords
            for keyword in data['keywords']:
                if keyword in question:
                    score += 2
            
            scores[category] = score
        
        # Return category with highest score
        if scores:
            best_category = max(scores, key=scores.get)
            return best_category if scores[best_category] > 0 else None
        return None
    
    def get_category_response(self, category: str) -> str:
        """Get response for a specific category"""
        if category in self.knowledge_base:
            responses = self.knowledge_base[category]['responses']
            return np.random.choice(responses)
        return self.get_fallback_response()
    
    def get_greeting_response(self) -> str:
        """Return greeting response"""
        greetings = [
            "👋 Hello! I'm your Health Analytics Assistant. I can help you understand our dashboard, data, methodology, and insights from 14 years of health search trends.",
            "Hi there! Welcome to Eagle Health Analytics. Ask me about the project, health conditions, data sources, or how to use our interactive dashboard.",
            "Hello! I'm here to help you explore health search trends data. What would you like to know about our analytics project?"
        ]
        return np.random.choice(greetings)
    
    def get_help_response(self) -> str:
        """Return help response"""
        return """🤖 **I can help you with:**

📊 **Project Overview**
• What this project is about
• Health conditions analyzed  
• Data sources and methodology

🔍 **Data & Analysis**
• Understanding the charts and visualizations
• Key insights and findings
• How to interpret results

💻 **Technical Details**
• Technologies used
• How to use the dashboard
• API access and endpoints

🤝 **Team & Contact**
• Who created this project
• How to contact the team
• Collaboration opportunities

**Try asking:**
• "What health conditions are analyzed?"
• "How was the data collected?"
• "What are the key findings?"
• "How do I use the comparison dashboard?"
• "Who created this project?"""
    
    def get_fallback_response(self, question: str = None) -> str:
        """Return fallback response when no match is found"""
        fallbacks = [
            "I'm not sure I understand your question. Could you rephrase it or ask about one of these topics: project overview, health conditions, data sources, or how to use the dashboard?",
            "That's an interesting question! I'm specialized in the health analytics project. Try asking about the data, charts, or insights from our analysis.",
            "I don't have information on that specific topic. I can help you with questions about health search trends, data analysis, or project details."
        ]
        
        if question and ('who' in question or 'your' in question):
            return "I'm an AI assistant for the Eagle Health Analytics Dashboard. I can answer questions about the project, data, visualizations, and team."
        
        return np.random.choice(fallbacks)
    
    def format_response(self, response: str, category: str) -> Dict:
        """Format response with metadata"""
        return {
            'response': response,
            'category': category,
            'timestamp': datetime.now().isoformat(),
            'suggested_questions': self.get_suggested_questions(category)
        }
    
    def get_suggested_questions(self, category: str) -> List[str]:
        """Get suggested follow-up questions based on category"""
        suggestions = {
            'project_overview': ["What health conditions?", "What data sources?", "Who created this?"],
            'health_conditions': ["Which is most searched?", "Are there correlations?", "State variations?"],
            'data_sources': ["Google Trends data?", "CDC statistics?", "Time period covered?"],
            'methodology': ["Statistical methods?", "Data cleaning?", "Tools used?"],
            'insights': ["Key findings?", "State rankings?", "Trend patterns?"],
            'team': ["Team backgrounds?", "Contact info?", "Open source?"],
            'usage': ["How to use dashboard?", "Download data?", "Interpret charts?"],
            'technical': ["Tech stack?", "Deployment?", "API endpoints?"],
            'api': ["Data formats?", "Rate limits?", "Research use?"],
            'contact': ["Contact form?", "Report bugs?", "Documentation?"]
        }
        
        return suggestions.get(category, [
            "What is this project about?",
            "How do I use the dashboard?",
            "What are the key findings?"
        ])
    
    def log_conversation(self, session_id: str, message: str, sender: str, category: str = None):
        """Log conversation to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO chat_history (session_id, user_message, bot_response, intent_category)
                VALUES (?, ?, ?, ?)
            ''', (session_id, 
                  message if sender == 'user' else None,
                  message if sender == 'bot' else None,
                  category))
            
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Error logging conversation: {e}")
    
    def save_contact_form(self, name: str, email: str, subject: str, message: str) -> bool:
        """Save contact form submission to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO contact_submissions (name, email, subject, message)
                VALUES (?, ?, ?, ?)
            ''', (name, email, subject, message))
            
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Error saving contact form: {e}")
            return False
    
    def get_conversation_history(self, session_id: str, limit: int = 10) -> List[Dict]:
        """Get conversation history for a session"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT timestamp, user_message, bot_response, intent_category
                FROM chat_history
                WHERE session_id = ?
                ORDER BY timestamp DESC
                LIMIT ?
            ''', (session_id, limit))
            
            history = []
            for row in cursor.fetchall():
                history.append({
                    'timestamp': row[0],
                    'user_message': row[1],
                    'bot_response': row[2],
                    'category': row[3]
                })
            
            conn.close()
            return history[::-1]  # Return in chronological order
        except Exception as e:
            print(f"Error getting conversation history: {e}")
            return []

# Singleton instance
chatbot_instance = HealthAnalyticsChatbot()