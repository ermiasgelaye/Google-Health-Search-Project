// Enhanced Health Analytics Chatbot
class SimpleHealthChatbot {
    constructor() {
        this.sessionId = 'chat_' + Date.now();
        this.isOpen = false;
        this.conversationHistory = [];
        
        // Create chatbot HTML
        this.createChatbotHTML();
        this.setupEventListeners();
        
        // Add welcome message
        this.addWelcomeMessage();
        
        // Add keyboard shortcut
        this.setupKeyboardShortcut();
    }
    
    createChatbotHTML() {
        const chatbotHTML = `
        <style>
            /* Enhanced Chatbot Styles */
            .simple-chatbot-wrapper {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
            }
            
            .simple-chatbot-toggle {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #1a237e, #0d47a1);
                color: white;
                border: none;
                cursor: pointer;
                font-size: 1.5rem;
                box-shadow: 0 4px 15px rgba(26, 35, 126, 0.3);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .simple-chatbot-toggle:hover {
                background: linear-gradient(135deg, #0d47a1, #1565c0);
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(26, 35, 126, 0.4);
            }
            
            .simple-chatbot-container {
                position: absolute;
                bottom: 70px;
                right: 0;
                width: 380px;
                height: 500px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 30px rgba(0,0,0,0.15);
                display: none;
                flex-direction: column;
                border: 1px solid #e0e0e0;
                overflow: hidden;
            }
            
            .simple-chatbot-container.active {
                display: flex;
                animation: slideIn 0.3s ease;
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .simple-chatbot-header {
                background: linear-gradient(135deg, #1a237e, #0d47a1);
                color: white;
                padding: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            
            .simple-chatbot-body {
                flex: 1;
                padding: 15px;
                overflow-y: auto;
                background: #f8fafc;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .simple-chatbot-input {
                padding: 15px;
                border-top: 1px solid #e0e0e0;
                background: white;
                box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
            }
            
            .chat-message {
                max-width: 85%;
                animation: messageAppear 0.3s ease;
            }
            
            @keyframes messageAppear {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .user-message {
                margin-left: auto;
                align-self: flex-end;
            }
            
            .bot-message {
                margin-right: auto;
                align-self: flex-start;
            }
            
            .message-content {
                padding: 12px 16px;
                border-radius: 18px;
                font-size: 0.95rem;
                line-height: 1.5;
                word-wrap: break-word;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }
            
            .user-message .message-content {
                background: linear-gradient(135deg, #1a237e, #0d47a1);
                color: white;
                border-radius: 18px 18px 6px 18px;
            }
            
            .bot-message .message-content {
                background: white;
                color: #2c3e50;
                border: 1px solid #e0e0e0;
                border-radius: 18px 18px 18px 6px;
            }
            
            .bot-message .message-content ul {
                margin: 8px 0;
                padding-left: 20px;
            }
            
            .bot-message .message-content li {
                margin-bottom: 4px;
            }
            
            .quick-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 12px;
                justify-content: center;
            }
            
            .quick-btn {
                background: white;
                border: 1px solid #1a237e;
                color: #1a237e;
                border-radius: 16px;
                padding: 6px 12px;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s;
                font-weight: 500;
            }
            
            .quick-btn:hover {
                background: #1a237e;
                color: white;
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(26, 35, 126, 0.2);
            }
            
            .chatbot-typing {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 15px;
                background: #f0f0f0;
                border-radius: 15px;
                font-style: italic;
                color: #666;
            }
            
            .typing-dots {
                display: flex;
                gap: 4px;
            }
            
            .typing-dot {
                width: 6px;
                height: 6px;
                background: #666;
                border-radius: 50%;
                animation: typing 1.4s infinite;
            }
            
            .typing-dot:nth-child(2) {
                animation-delay: 0.2s;
            }
            
            .typing-dot:nth-child(3) {
                animation-delay: 0.4s;
            }
            
            @keyframes typing {
                0%, 60%, 100% { opacity: 0.4; }
                30% { opacity: 1; }
            }
            
            .simple-chatbot-body::-webkit-scrollbar {
                width: 6px;
            }
            
            .simple-chatbot-body::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 3px;
            }
            
            .simple-chatbot-body::-webkit-scrollbar-thumb {
                background: #c1c1c1;
                border-radius: 3px;
            }
            
            .simple-chatbot-body::-webkit-scrollbar-thumb:hover {
                background: #a8a8a8;
            }
            
            .suggestions-title {
                font-size: 0.85rem;
                color: #666;
                margin: 10px 0 8px;
                text-align: center;
            }
            
            .chatbot-status {
                font-size: 0.75rem;
                color: #666;
                text-align: center;
                margin-top: 5px;
            }
        </style>
        
        <div class="simple-chatbot-wrapper">
            <button class="simple-chatbot-toggle" id="simpleChatbotToggle" aria-label="Open Health Analytics Chatbot">
                <i class="fas fa-robot"></i>
            </button>
            
            <div class="simple-chatbot-container" id="simpleChatbotContainer" role="dialog" aria-label="Health Analytics Chatbot">
                <div class="simple-chatbot-header">
                    <div>
                        <h6 class="mb-0">🤖 Health Analytics Assistant</h6>
                        <small class="opacity-75">Ask me about the project</small>
                    </div>
                    <button class="btn btn-sm btn-light rounded-circle" id="simpleChatbotClose" aria-label="Close chatbot">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="simple-chatbot-body" id="simpleChatbotBody">
                    <!-- Messages go here -->
                </div>
                
                <div class="simple-chatbot-input">
                    <div class="input-group">
                        <input type="text" 
                               class="form-control" 
                               id="simpleChatbotInput"
                               placeholder="Ask about data, methodology, team, insights..."
                               autocomplete="off"
                               aria-label="Chatbot input field">
                        <div class="input-group-append">
                            <button class="btn btn-primary" id="simpleChatbotSend" aria-label="Send message">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="quick-actions" id="quickActionsContainer">
                        <button class="quick-btn" data-question="What data sources are used?">📊 Data Sources</button>
                        <button class="quick-btn" data-question="What methodology was used?">🔬 Methodology</button>
                        <button class="quick-btn" data-question="Who is on the team?">👥 Team</button>
                        <button class="quick-btn" data-question="What are key findings?">📈 Findings</button>
                    </div>
                    
                    <div class="chatbot-status" id="chatbotStatus">
                        Press Ctrl+/ to toggle
                    </div>
                </div>
            </div>
        </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }
    
    setupEventListeners() {
        this.toggleBtn = document.getElementById('simpleChatbotToggle');
        this.closeBtn = document.getElementById('simpleChatbotClose');
        this.container = document.getElementById('simpleChatbotContainer');
        this.body = document.getElementById('simpleChatbotBody');
        this.input = document.getElementById('simpleChatbotInput');
        this.sendBtn = document.getElementById('simpleChatbotSend');
        
        // Toggle chatbot
        this.toggleBtn.addEventListener('click', () => this.toggleChatbot());
        this.closeBtn.addEventListener('click', () => this.closeChatbot());
        
        // Send message
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Quick actions
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const question = e.target.dataset.question;
                this.input.value = question;
                this.sendMessage();
            });
        });
        
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && 
                !this.container.contains(e.target) && 
                !this.toggleBtn.contains(e.target)) {
                this.closeChatbot();
            }
        });
    }
    
    setupKeyboardShortcut() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.toggleChatbot();
            }
            
            // Escape to close
            if (e.key === 'Escape' && this.isOpen) {
                this.closeChatbot();
            }
        });
    }
    
    toggleChatbot() {
        this.container.classList.toggle('active');
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.input.focus();
            this.toggleBtn.innerHTML = '<i class="fas fa-times"></i>';
            this.toggleBtn.setAttribute('aria-label', 'Close Health Analytics Chatbot');
        } else {
            this.toggleBtn.innerHTML = '<i class="fas fa-robot"></i>';
            this.toggleBtn.setAttribute('aria-label', 'Open Health Analytics Chatbot');
        }
    }
    
    closeChatbot() {
        this.container.classList.remove('active');
        this.isOpen = false;
        this.toggleBtn.innerHTML = '<i class="fas fa-robot"></i>';
        this.toggleBtn.setAttribute('aria-label', 'Open Health Analytics Chatbot');
    }
    
    addWelcomeMessage() {
        const welcomeMsg = `
        <div class="chat-message bot-message">
            <div class="message-content">
                <p><strong>👋 Hello! I'm your Health Analytics Assistant</strong></p>
                <p>I can help you understand:</p>
                <ul>
                    <li>📊 <strong>Data Sources & Methodology</strong> - Google Trends & CDC data</li>
                    <li>🏥 <strong>Health Conditions</strong> - 9 major conditions analyzed</li>
                    <li>👥 <strong>Team & Contact</strong> - Project team information</li>
                    <li>📈 <strong>Findings & Insights</strong> - Key discoveries</li>
                    <li>💻 <strong>Technology</strong> - How it was built</li>
                    <li>🖥️ <strong>Dashboard Usage</strong> - How to explore data</li>
                </ul>
                <p><em>Try asking or click quick buttons below!</em></p>
            </div>
        </div>
        `;
        
        this.body.innerHTML = welcomeMsg;
        this.conversationHistory.push({
            role: 'bot',
            content: 'Welcome message displayed'
        });
    }
    
    async sendMessage() {
        const question = this.input.value.trim();
        if (!question) return;
        
        // Add user message
        this.addMessage(question, 'user');
        this.conversationHistory.push({ role: 'user', content: question });
        this.input.value = '';
        
        // Show typing indicator
        this.showTyping();
        
        try {
            // Send to backend API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: question,
                    session_id: this.sessionId
                })
            });
            
            const data = await response.json();
            
            // Remove typing indicator
            this.removeTyping();
            
            if (data.success) {
                this.addMessage(data.response, 'bot');
                this.conversationHistory.push({ role: 'bot', content: data.response });
            } else {
                const errorMsg = "I apologize, but I'm having trouble accessing my knowledge base. Here's what I can tell you about our project...";
                this.addMessage(errorMsg, 'bot');
                this.conversationHistory.push({ role: 'bot', content: errorMsg });
            }
            
        } catch (error) {
            this.removeTyping();
            console.error('Chatbot error:', error);
            
            // Enhanced fallback with more categories
            const fallbackResponses = {
                'data|source': 'This project uses Google Trends search data (2004-2017) and CDC health statistics. We analyze correlations between public search interest and actual health outcomes across all 50 US states.',
                'condition|disease|health': 'We analyze 9 health conditions: Cancer, Cardiovascular, Depression, Diabetes, Diarrhea, Obesity, Stroke, Vaccine, and Rehab. Cancer is consistently the most searched condition.',
                'method|methodology|how|analyze': 'Methodology: Data collection from Google Trends API, cleaning & preprocessing, integration with CDC data, statistical analysis (correlation, trends), and visualization using Plotly, D3.js, and Highcharts.',
                'team|who|member|creator': 'Our team includes Ermias Gaga (Data Scientist), Amanda Ma (Economics), Amos Johnson (Journalist), Damola Atekoja (Accountant/Analyst), and Maria Lorena (Project Manager). See the About page for details.',
                'find|insight|result|discover': 'Key findings: Cancer is most searched, search interest increases over time (2004-2017), strong correlation between depression and diabetes searches, highest search volumes in California, Texas, and New York.',
                'technology|stack|tool|built': 'Technology stack: Python Flask backend, JavaScript/Plotly/D3.js frontend, PostgreSQL database, Bootstrap for responsive design, and various data science libraries.',
                'use|help|dashboard|explore': 'Dashboard usage: Use navigation menu to switch between dashboards. Comparison dashboard for city analysis, Analytics dashboard for trends, download buttons for data, API links for raw data access.',
                'future|next|extension|improve': 'Future work could include: real-time data updates, predictive modeling, global expansion, mobile applications, and integration with healthcare provider data.',
                'contact|email|reach|connect': 'Contact us via the form on the About page or connect with individual team members on LinkedIn/GitHub (links available on the About page).',
                'hello|hi|hey': "Hello! I'm the Health Analytics Assistant. I can help you understand our project, data sources, methodology, team members, and findings. What would you like to know about?",
                'thank|thanks': "You're welcome! Is there anything else you'd like to know about our health analytics project?",
                'default': 'I can help you understand: data sources, health conditions, methodology, team information, key findings, technology, dashboard usage, and future plans. Try asking about any of these topics!'
            };
            
            let fallbackResponse = fallbackResponses.default;
            const questionLower = question.toLowerCase();
            
            // Find matching category
            for (const [keywords, response] of Object.entries(fallbackResponses)) {
                if (keywords.split('|').some(keyword => questionLower.includes(keyword))) {
                    fallbackResponse = response;
                    break;
                }
            }
            
            this.addMessage(fallbackResponse, 'bot');
            this.conversationHistory.push({ role: 'bot', content: fallbackResponse });
        }
    }
    
    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        
        // Format content with better readability
        let formattedContent = content;
        
        // Format lists if they contain numbers or bullets
        if (content.includes('1)') || content.includes('1.') || content.includes('•')) {
            formattedContent = content
                .replace(/(\d+[\)\.])\s+/g, '<br>• $1 ')
                .replace(/<br>• (.*?):/g, '<br><strong>$1:</strong>')
                .replace(/•/g, '•');
        }
        
        // Highlight key terms
        const keyTerms = ['Google Trends', 'CDC', 'Cancer', 'Correlation', 'Methodology', 'Findings', 'Dashboard', 'Python', 'Flask', 'JavaScript'];
        keyTerms.forEach(term => {
            const regex = new RegExp(`\\b(${term})\\b`, 'gi');
            formattedContent = formattedContent.replace(regex, '<strong>$1</strong>');
        });
        
        messageDiv.innerHTML = `<div class="message-content">${formattedContent}</div>`;
        this.body.appendChild(messageDiv);
        
        // Scroll to bottom
        this.body.scrollTop = this.body.scrollHeight;
    }
    
    showTyping() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot-message';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content chatbot-typing">
                <span>Thinking</span>
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        this.body.appendChild(typingDiv);
        this.body.scrollTop = this.body.scrollHeight;
    }
    
    removeTyping() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
}

// Enhanced initialization with error handling
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Check if chatbot already exists
        if (!window.simpleHealthChatbot) {
            window.simpleHealthChatbot = new SimpleHealthChatbot();
            console.log('✅ Health Analytics Chatbot initialized');
        }
    } catch (error) {
        console.error('Failed to initialize chatbot:', error);
        
        // Fallback: Create a simple toggle button if chatbot fails
        const fallbackHTML = `
            <style>
                .chatbot-fallback {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 10000;
                }
                .chatbot-fallback-btn {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: #1a237e;
                    color: white;
                    border: none;
                    cursor: pointer;
                    font-size: 1.5rem;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }
            </style>
            <div class="chatbot-fallback">
                <button class="chatbot-fallback-btn" onclick="alert('Chatbot is temporarily unavailable. Please visit the About page for project information.')">
                    <i class="fas fa-robot"></i>
                </button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', fallbackHTML);
    }
});

// Ensure chatbot works even if loaded after DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.simpleHealthChatbot) {
            window.simpleHealthChatbot = new SimpleHealthChatbot();
        }
    });
} else {
    // DOM already loaded
    if (!window.simpleHealthChatbot) {
        window.simpleHealthChatbot = new SimpleHealthChatbot();
    }
}