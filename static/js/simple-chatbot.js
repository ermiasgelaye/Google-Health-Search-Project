// Simple chatbot for Health Analytics
class SimpleHealthChatbot {
    constructor() {
        this.sessionId = 'chat_' + Date.now();
        this.isOpen = false;
        
        // Create chatbot HTML
        this.createChatbotHTML();
        this.setupEventListeners();
        
        // Add welcome message
        this.addWelcomeMessage();
    }
    
    createChatbotHTML() {
        const chatbotHTML = `
        <style>
            /* Simple Chatbot Styles */
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
                background: #1a237e;
                color: white;
                border: none;
                cursor: pointer;
                font-size: 1.5rem;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
            }
            
            .simple-chatbot-toggle:hover {
                background: #1565c0;
                transform: scale(1.1);
            }
            
            .simple-chatbot-container {
                position: absolute;
                bottom: 70px;
                right: 0;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 5px 25px rgba(0,0,0,0.2);
                display: none;
                flex-direction: column;
                border: 1px solid #dee2e6;
            }
            
            .simple-chatbot-container.active {
                display: flex;
            }
            
            .simple-chatbot-header {
                background: #1a237e;
                color: white;
                padding: 15px;
                border-radius: 10px 10px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .simple-chatbot-body {
                flex: 1;
                padding: 15px;
                overflow-y: auto;
                background: #f8f9fa;
            }
            
            .simple-chatbot-input {
                padding: 15px;
                border-top: 1px solid #dee2e6;
                background: white;
            }
            
            .chat-message {
                margin-bottom: 10px;
                max-width: 85%;
            }
            
            .user-message {
                margin-left: auto;
            }
            
            .bot-message {
                margin-right: auto;
            }
            
            .message-content {
                padding: 10px 15px;
                border-radius: 18px;
                font-size: 0.9rem;
                line-height: 1.4;
            }
            
            .user-message .message-content {
                background: #1a237e;
                color: white;
                border-radius: 18px 18px 4px 18px;
            }
            
            .bot-message .message-content {
                background: white;
                color: #333;
                border: 1px solid #dee2e6;
                border-radius: 18px 18px 18px 4px;
            }
            
            .quick-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                margin-top: 10px;
            }
            
            .quick-btn {
                background: white;
                border: 1px solid #dee2e6;
                border-radius: 15px;
                padding: 5px 10px;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .quick-btn:hover {
                background: #f8f9fa;
                border-color: #1a237e;
            }
        </style>
        
        <div class="simple-chatbot-wrapper">
            <button class="simple-chatbot-toggle" id="simpleChatbotToggle">
                <i class="fas fa-robot"></i>
            </button>
            
            <div class="simple-chatbot-container" id="simpleChatbotContainer">
                <div class="simple-chatbot-header">
                    <h6 class="mb-0">Health Analytics Assistant</h6>
                    <button class="btn btn-sm btn-light" id="simpleChatbotClose">
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
                               placeholder="Ask about health data..."
                               autocomplete="off">
                        <div class="input-group-append">
                            <button class="btn btn-primary" id="simpleChatbotSend">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="quick-actions mt-2">
                        <button class="quick-btn" data-question="What data sources are used?">Data Sources</button>
                        <button class="quick-btn" data-question="What health conditions are analyzed?">Health Conditions</button>
                        <button class="quick-btn" data-question="What is this project about?">Project Overview</button>
                        <button class="quick-btn" data-question="How do I use the dashboard?">Dashboard Help</button>
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
    }
    
    toggleChatbot() {
        this.container.classList.toggle('active');
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.input.focus();
        }
    }
    
    closeChatbot() {
        this.container.classList.remove('active');
        this.isOpen = false;
    }
    
    addWelcomeMessage() {
        const welcomeMsg = `
        <div class="chat-message bot-message">
            <div class="message-content">
                <p><strong>👋 Hello! I'm your Health Analytics Assistant</strong></p>
                <p>I can help you understand:</p>
                <ul>
                    <li>📊 Data sources and methodology</li>
                    <li>🏥 Health conditions analyzed</li>
                    <li>📈 How to use the dashboard</li>
                    <li>🔍 Key insights and findings</li>
                </ul>
                <p><em>Try asking about data sources or click the quick buttons!</em></p>
            </div>
        </div>
        `;
        
        this.body.innerHTML = welcomeMsg;
    }
    
    async sendMessage() {
        const question = this.input.value.trim();
        if (!question) return;
        
        // Add user message
        this.addMessage(question, 'user');
        this.input.value = '';
        
        // Show typing indicator
        this.showTyping();
        
        try {
            // Send to backend
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
            } else {
                this.addMessage("Sorry, I couldn't process your question. Please try again.", 'bot');
            }
            
        } catch (error) {
            this.removeTyping();
            console.error('Chatbot error:', error);
            
            // Fallback responses
            const fallbackResponses = {
                'data': 'This project uses Google Trends search data (2004-2017) and CDC health statistics.',
                'source': 'Data sources: Google Trends API and CDC public datasets.',
                'condition': 'We analyze 9 health conditions: Cancer, Cardiovascular, Depression, Diabetes, Diarrhea, Obesity, Stroke, Vaccine, and Rehab.',
                'project': 'Eagle Health Analytics visualizes 14 years of health search trends across US states.',
                'default': 'I can answer questions about data sources, health conditions, or the project. Try asking: "What data sources are used?"'
            };
            
            let fallbackResponse = fallbackResponses.default;
            const questionLower = question.toLowerCase();
            
            if (questionLower.includes('data') || questionLower.includes('source')) {
                fallbackResponse = fallbackResponses.data;
            } else if (questionLower.includes('condition') || questionLower.includes('disease')) {
                fallbackResponse = fallbackResponses.condition;
            } else if (questionLower.includes('project') || questionLower.includes('what is')) {
                fallbackResponse = fallbackResponses.project;
            }
            
            this.addMessage(fallbackResponse, 'bot');
        }
    }
    
    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
        this.body.appendChild(messageDiv);
        
        // Scroll to bottom
        this.body.scrollTop = this.body.scrollHeight;
    }
    
    showTyping() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot-message';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <i class="fas fa-ellipsis-h"></i> Thinking...
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.simpleHealthChatbot = new SimpleHealthChatbot();
});