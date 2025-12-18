// simple-chatbot.js - PURE JavaScript only
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
    
    addWelcomeMessage() {
        const welcomeMsg = `
        <div class="chat-message bot-message">
            <div class="message-content">
                <p><strong>🦅 Welcome to Eagle Health Analytics Assistant!</strong></p>
                <p>I'm your intelligent guide to understanding our health analytics project.</p>
                
                <p><strong>I can help with:</strong></p>
                <ul>
                    <li>📊 <strong>Project Details</strong>: Data sources, methodology, findings</li>
                    <li>🔍 <strong>Technical Concepts</strong>: Correlation analysis, time series, visualization techniques</li>
                    <li>👥 <strong>Team Information</strong>: Members, roles, contributions</li>
                    <li>📈 <strong>Analysis Insights</strong>: Key discoveries and patterns</li>
                </ul>
                
                <p><em>Try asking:</em></p>
                <p>• "What data sources are used?"<br>
                   • "Explain correlation analysis"<br>
                   • "Who worked on this project?"<br>
                   • "What are the key findings?"</p>
            </div>
        </div>
        `;
        
        this.body.innerHTML = welcomeMsg;
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
            
            /* Enhanced Chatbot Styles */
            .simple-chatbot-container {
                z-index: 9999;
            }
            
            .simple-chatbot-body {
                scroll-behavior: smooth;
            }
            
            .message-content ul {
                padding-left: 20px;
                margin-bottom: 10px;
            }
            
            .message-content li {
                margin-bottom: 5px;
            }
            
            .message-content strong {
                color: #1a237e;
            }
            
            /* Suggested questions animation */
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .suggested-questions {
                animation: slideIn 0.3s ease-out;
            }
            
            /* Print styles - hide chatbot */
            @media print {
                .simple-chatbot-wrapper {
                    display: none !important;
                }
            }
            
            /* Dark mode support for chatbot */
            @media (prefers-color-scheme: dark) {
                .simple-chatbot-container {
                    background: #2d3748;
                    border-color: #4a5568;
                }
                
                .simple-chatbot-body {
                    background: #1a202c;
                }
                
                .simple-chatbot-input {
                    background: #2d3748;
                    border-color: #4a5568;
                }
                
                .bot-message .message-content {
                    background: #4a5568;
                    color: #e2e8f0;
                    border-color: #4a5568;
                }
                
                .suggested-questions {
                    background: #2d3748;
                    border-color: #4a5568;
                }
                
                .suggestion-btn {
                    background: #4a5568;
                    color: #e2e8f0;
                    border-color: #4a5568;
                }
                
                .suggestion-btn:hover {
                    background: #1a237e;
                    color: white;
                }
            }
            
            /* Data-driven response styles */
            .data-driven-response .message-content {
                border-left: 3px solid #1a237e;
                padding-left: 15px;
            }
            
            .data-summary {
                background: rgba(26, 35, 126, 0.05);
                border-radius: 8px;
                padding: 10px;
                margin-top: 15px;
                border: 1px solid rgba(26, 35, 126, 0.1);
            }
            
            .data-point {
                display: flex;
                justify-content: space-between;
                padding: 4px 0;
                border-bottom: 1px dashed rgba(0,0,0,0.1);
                font-size: 0.85rem;
            }
            
            .data-point:last-child {
                border-bottom: none;
            }
            
            .data-label {
                font-weight: 600;
                color: #1a237e;
            }
            
            .data-value {
                color: #37474f;
            }
            
            .entity-tags {
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px dashed #dee2e6;
            }
            
            .entity-tag {
                display: inline-block;
                background: #e3f2fd;
                color: #1565c0;
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 0.7rem;
                margin: 2px;
                font-weight: 500;
            }
            
            .entity-condition {
                background: #f3e5f5;
                color: #7b1fa2;
            }
            
            .entity-state {
                background: #e8f5e8;
                color: #2e7d32;
            }
            
            .entity-city {
                background: #fff3e0;
                color: #ef6c00;
            }
            
            .entity-member {
                background: #fce4ec;
                color: #c2185b;
            }
            
            /* Enhanced message formatting */
            .bot-message .message-content h3,
            .bot-message .message-content h4 {
                color: #1a237e;
                margin: 15px 0 8px 0;
            }
            
            .bot-message .message-content code {
                background: #f5f5f5;
                padding: 2px 4px;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
                font-size: 0.9em;
            }
            
            .bot-message .message-content pre {
                background: #f8f9fa;
                padding: 10px;
                border-radius: 5px;
                overflow-x: auto;
                border-left: 3px solid #1565c0;
            }
            
            /* Statistics highlight */
            .stat-highlight {
                background: linear-gradient(120deg, #a5d6a7 0%, #a5d6a7 100%);
                background-repeat: no-repeat;
                background-size: 100% 0.4em;
                background-position: 0 88%;
                padding: 0 2px;
                font-weight: 600;
            }
            
            /* Suggested questions styling */
            .suggested-questions {
                margin: 10px 0;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 10px;
                border-left: 3px solid #1a237e;
            }
            
            .suggestions-label {
                color: #6c757d;
                margin-bottom: 8px;
                font-size: 0.85rem;
            }
            
            .suggestions-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
            }
            
            .suggestion-btn {
                background: white;
                border: 1px solid #dee2e6;
                border-radius: 15px;
                padding: 5px 12px;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.2s;
                color: #1a237e;
                margin: 2px;
            }
            
            .suggestion-btn:hover {
                background: #1a237e;
                color: white;
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
                        <button class="quick-btn" data-question="Show detailed statistics for cancer">Cancer Stats</button>
                        <button class="quick-btn" data-question="Analyze diabetes search patterns">Diabetes Analysis</button>
                        <button class="quick-btn" data-question="What are the top states for depression searches?">Depression by State</button>
                        <button class="quick-btn" data-question="Explain the methodology in detail">Methodology</button>
                        <button class="quick-btn" data-question="Show key findings and insights">Key Findings</button>
                        <button class="quick-btn" data-question="Tell me about the team members">Team Info</button>
                        <button class="quick-btn" data-question="What data sources were used?">Data Sources</button>
                        <button class="quick-btn" data-question="Compare California and Texas health searches">State Comparison</button>
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
                // Use data-driven response display if available
                if (typeof this.addDataDrivenResponse === 'function') {
                    this.addDataDrivenResponse(data);
                } else {
                    // Fallback to simple message
                    this.addMessage(data.response, 'bot');
                }
                
                // Add suggested questions if available
                if (data.suggested_questions && data.suggested_questions.length > 0) {
                    this.addSuggestedQuestions(data.suggested_questions);
                }
            } else {
                this.addMessage(data.response || "Sorry, I couldn't process your question. Please try again.", 'bot');
            }
            
        } catch (error) {
            this.removeTyping();
            console.error('Chatbot error:', error);
            
            // Enhanced fallback response
            this.handleErrorFallback(question);
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
    
    addDataDrivenResponse(data) {
        // Create response container
        const responseDiv = document.createElement('div');
        responseDiv.className = 'chat-message bot-message data-driven-response';
        
        let content = `<div class="message-content">`;
        
        // Add response text
        content += `<div class="response-text">${data.response}</div>`;
        
        // Add data summary if available
        if (data.data_available && data.data_points) {
            content += `<div class="data-summary">`;
            content += `<small><i class="fas fa-database mr-1"></i>Data included in response:</small>`;
            
            for (const [key, value] of Object.entries(data.data_points)) {
                content += `<div class="data-point"><span class="data-label">${key}:</span> <span class="data-value">${value}</span></div>`;
            }
            
            content += `</div>`;
        }
        
        // Add entity tags if present
        if (data.entities) {
            const entities = data.entities;
            const activeEntities = Object.entries(entities).filter(([key, value]) => value);
            
            if (activeEntities.length > 0) {
                content += `<div class="entity-tags">`;
                content += `<small><i class="fas fa-tags mr-1"></i>Context detected:</small>`;
                
                activeEntities.forEach(([key, value]) => {
                    content += `<span class="entity-tag entity-${key}">${key}: ${value}</span>`;
                });
                
                content += `</div>`;
            }
        }
        
        content += `</div>`;
        
        responseDiv.innerHTML = content;
        this.body.appendChild(responseDiv);
        
        // Add suggested follow-ups
        if (data.suggested_questions && data.suggested_questions.length > 0) {
            this.addSuggestedQuestions(data.suggested_questions);
        }
        
        this.body.scrollTop = this.body.scrollHeight;
    }
    
    addSuggestedQuestions(suggestions) {
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'suggested-questions';
        suggestionsDiv.innerHTML = `
            <p class="suggestions-label"><small><i>Suggested questions:</i></small></p>
            <div class="suggestions-buttons">
                ${suggestions.map(q => 
                    `<button class="suggestion-btn" data-question="${q.question}">
                        ${q.question}
                    </button>`
                ).join('')}
            </div>
        `;
        
        // Add to chat
        this.body.appendChild(suggestionsDiv);
        
        // Add event listeners
        suggestionsDiv.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const question = e.target.dataset.question;
                this.input.value = question;
                this.sendMessage();
            });
        });
        
        this.body.scrollTop = this.body.scrollHeight;
    }
    
    handleErrorFallback(question) {
        const fallbackResponses = {
            'data': 'Data Sources 📊\n\nThis project integrates:\n1. Google Trends API (2004-2017): Health search volumes\n2. CDC Public Health Data: Mortality and health statistics\n3. Geographic Data: US state and city coordinates\n\nThese datasets are merged and analyzed to find correlations between search behavior and health outcomes.',
            'source': 'Data Integration 🔗\n\nWe combine Google Trends data (public search interest) with CDC statistics (actual health outcomes) using SQL joins and data normalization techniques.',
            'condition': 'Health Conditions Analyzed 🏥\n\n9 Conditions:\n1. Cancer (most searched)\n2. Cardiovascular\n3. Depression\n4. Diabetes\n5. Diarrhea\n6. Obesity\n7. Stroke\n8. Vaccine\n9. Rehab\n\nEach condition shows unique search patterns across states and years.',
            'project': 'Eagle Health Analytics 🦅\n\nA data science project analyzing 14 years of health search trends across the US. We visualize correlations between online search behavior and real-world health statistics.',
            'method': 'Methodology 🔬\n\n1. Data Collection: APIs and public datasets\n2. Processing: Python, SQL, data cleaning\n3. Analysis: Statistical correlation, time series\n4. Visualization: Interactive D3.js and Plotly charts',
            'team': 'Project Team 👥\n\n5-member team with expertise in data science, analytics, and visualization. See the "About Us" page for detailed profiles.',
            'default': 'Health Analytics Assistant 🤖\n\nI can help you understand:\n\n📊 Project Details: Data sources, methodology, findings\n🔍 Analysis Techniques: Correlation, time series, visualization\n👥 Team Information: Members, roles, contributions\n📈 Key Insights: Major discoveries and patterns\n\nTry asking: "What are the key findings?" or "Explain correlation analysis"'
        };
        
        let fallbackResponse = fallbackResponses.default;
        const questionLower = question.toLowerCase();
        
        if (questionLower.includes('data') || questionLower.includes('source')) {
            fallbackResponse = fallbackResponses.data;
        } else if (questionLower.includes('method') || questionLower.includes('how')) {
            fallbackResponse = fallbackResponses.method;
        } else if (questionLower.includes('condition') || questionLower.includes('disease')) {
            fallbackResponse = fallbackResponses.condition;
        } else if (questionLower.includes('project') || questionLower.includes('what is')) {
            fallbackResponse = fallbackResponses.project;
        } else if (questionLower.includes('team') || questionLower.includes('who')) {
            fallbackResponse = fallbackResponses.team;
        }
        
        this.addMessage(fallbackResponse, 'bot');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.simpleHealthChatbot = new SimpleHealthChatbot();
});