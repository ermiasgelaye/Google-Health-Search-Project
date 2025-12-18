// static/js/chatbot.js - Health Analytics Chatbot Frontend
class HealthAnalyticsChatbot {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.isOpen = false;
        this.isLoading = false;
        this.messageHistory = [];
        
        // Initialize
        this.initializeElements();
        this.setupEventListeners();
        this.loadChatHistory();
        
        // Auto-open after delay (optional)
        setTimeout(() => this.showWelcomeNotification(), 5000);
    }
    
    generateSessionId() {
        return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    initializeElements() {
        // Create chatbot container if it doesn't exist
        if (!document.getElementById('chatbot-container')) {
            this.createChatbotHTML();
        }
        
        this.container = document.getElementById('chatbot-container');
        this.toggleBtn = document.getElementById('chatbot-toggle');
        this.closeBtn = document.getElementById('chatbot-close');
        this.body = document.getElementById('chatbot-body');
        this.input = document.getElementById('chatbot-input');
        this.sendBtn = document.getElementById('chatbot-send');
        this.form = document.getElementById('chatbot-form');
        this.notification = document.getElementById('chatbot-notification');
        
        // Quick action buttons
        this.quickActions = document.querySelectorAll('.quick-action');
    }
    
    createChatbotHTML() {
        const chatbotHTML = `
        <!-- Chatbot Widget -->
        <div class="chatbot-wrapper">
            <!-- Toggle Button -->
            <button class="chatbot-toggle" id="chatbot-toggle">
                <i class="fas fa-robot"></i>
                <span class="chatbot-notification" id="chatbot-notification"></span>
            </button>
            
            <!-- Chat Container -->
            <div class="chatbot-container" id="chatbot-container">
                <!-- Header -->
                <div class="chatbot-header">
                    <div class="chatbot-title">
                        <i class="fas fa-robot"></i>
                        <div>
                            <h5>Health Analytics Assistant</h5>
                            <small class="text-muted">Ask about data, insights, or methodology</small>
                        </div>
                    </div>
                    <button class="chatbot-close" id="chatbot-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- Body -->
                <div class="chatbot-body" id="chatbot-body">
                    <!-- Messages will be inserted here -->
                </div>
                
                <!-- Quick Actions -->
                <div class="chatbot-quick-actions">
                    <button class="quick-action" data-action="project">
                        <i class="fas fa-info-circle"></i> Project
                    </button>
                    <button class="quick-action" data-action="data">
                        <i class="fas fa-database"></i> Data
                    </button>
                    <button class="quick-action" data-action="insights">
                        <i class="fas fa-chart-line"></i> Insights
                    </button>
                    <button class="quick-action" data-action="help">
                        <i class="fas fa-question-circle"></i> Help
                    </button>
                </div>
                
                <!-- Input Area -->
                <div class="chatbot-input-area">
                    <form id="chatbot-form">
                        <div class="input-group">
                            <input type="text" 
                                   class="form-control" 
                                   id="chatbot-input"
                                   placeholder="Ask about health analytics data..."
                                   autocomplete="off">
                            <div class="input-group-append">
                                <button class="btn btn-primary" type="submit" id="chatbot-send">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                    </form>
                    <small class="form-text text-muted mt-2">
                        Try: "What health conditions are analyzed?" or "How do I use the dashboard?"
                    </small>
                </div>
            </div>
        </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }
    
    setupEventListeners() {
        // Toggle chatbot
        this.toggleBtn.addEventListener('click', () => this.toggleChatbot());
        this.closeBtn.addEventListener('click', () => this.closeChatbot());
        
        // Send message
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });
        
        // Quick actions
        this.quickActions.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleQuickAction(action);
            });
        });
        
        // Input focus
        this.input.addEventListener('focus', () => {
            if (!this.isOpen) {
                this.openChatbot();
            }
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.isOpen && 
                !this.container.contains(e.target) && 
                !this.toggleBtn.contains(e.target)) {
                this.closeChatbot();
            }
        });
        
        // Enter key to send
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }
    
    toggleChatbot() {
        if (this.isOpen) {
            this.closeChatbot();
        } else {
            this.openChatbot();
        }
    }
    
    openChatbot() {
        this.container.classList.add('active');
        this.isOpen = true;
        this.input.focus();
        
        // Clear notification
        if (this.notification) {
            this.notification.textContent = '';
        }
        
        // Add welcome message if empty
        if (this.body.children.length === 0) {
            this.addWelcomeMessage();
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
                <p>👋 <strong>Hello! I'm your Health Analytics Assistant</strong></p>
                <p>I can help you understand:</p>
                <ul>
                    <li>📊 Project overview and methodology</li>
                    <li>🏥 Health conditions analyzed</li>
                    <li>📈 Key insights and findings</li>
                    <li>💻 How to use the dashboard</li>
                    <li>👥 Team information and contact</li>
                </ul>
                <p class="mt-3"><em>Try asking: "What health conditions are analyzed?" or "How do I use the comparison dashboard?"</em></p>
            </div>
        </div>
        `;
        
        this.body.innerHTML = welcomeMsg;
    }
    
    async sendMessage() {
        const message = this.input.value.trim();
        if (!message || this.isLoading) return;
        
        // Clear input
        this.input.value = '';
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Send to backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: message,
                    session_id: this.sessionId
                })
            });
            
            const data = await response.json();
            
            // Remove typing indicator
            this.removeTypingIndicator();
            
            if (data.success) {
                // Add bot response
                this.addMessage(data.response, 'bot', data.suggested_questions);
                
                // Add suggested questions if available
                if (data.suggested_questions && data.suggested_questions.length > 0) {
                    this.addSuggestedQuestions(data.suggested_questions);
                }
            } else {
                this.addMessage("Sorry, I encountered an error. Please try again.", 'bot');
            }
            
        } catch (error) {
            this.removeTypingIndicator();
            this.addMessage("Sorry, I'm having trouble connecting. Please check your internet connection.", 'bot');
            console.error('Chatbot error:', error);
        }
    }
    
    async handleQuickAction(action) {
        const questions = {
            'project': "What is this project about?",
            'data': "What data sources are used?",
            'insights': "What are the key findings?",
            'help': "What can you help me with?"
        };
        
        if (questions[action]) {
            this.input.value = questions[action];
            this.sendMessage();
        }
    }
    
    addMessage(content, sender, suggestions = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = this.formatMessage(content);
        
        messageDiv.appendChild(messageContent);
        this.body.appendChild(messageDiv);
        
        // Scroll to bottom
        this.scrollToBottom();
        
        // Store in history
        this.messageHistory.push({
            sender,
            content,
            timestamp: new Date().toISOString(),
            suggestions
        });
    }
    
    formatMessage(content) {
        // Convert markdown-like formatting
        let formatted = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
            .replace(/\n/g, '<br>');
        
        return formatted;
    }
    
    addSuggestedQuestions(questions) {
        const container = document.createElement('div');
        container.className = 'suggested-questions mt-3';
        
        const title = document.createElement('p');
        title.className = 'text-muted mb-2';
        title.innerHTML = '<small><em>You might also ask:</em></small>';
        container.appendChild(title);
        
        questions.forEach(question => {
            const button = document.createElement('button');
            button.className = 'btn btn-outline-secondary btn-sm mr-2 mb-2 suggested-question';
            button.textContent = question;
            button.addEventListener('click', () => {
                this.input.value = question;
                this.sendMessage();
            });
            container.appendChild(button);
        });
        
        this.body.appendChild(container);
        this.scrollToBottom();
    }
    
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        `;
        
        this.body.appendChild(typingDiv);
        this.scrollToBottom();
        this.isLoading = true;
    }
    
    removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
        this.isLoading = false;
    }
    
    scrollToBottom() {
        this.body.scrollTop = this.body.scrollHeight;
    }
    
    showWelcomeNotification() {
        if (!this.isOpen && this.notification) {
            this.notification.textContent = '💬';
        }
    }
    
    async loadChatHistory() {
        try {
            const response = await fetch(`/api/chat/history?session_id=${this.sessionId}`);
            const data = await response.json();
            
            if (data.success && data.history.length > 0) {
                // Load history
                data.history.forEach(msg => {
                    if (msg.user_message) {
                        this.addMessage(msg.user_message, 'user');
                    }
                    if (msg.bot_response) {
                        this.addMessage(msg.bot_response, 'bot');
                    }
                });
            } else {
                // Add welcome message
                this.addWelcomeMessage();
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
            this.addWelcomeMessage();
        }
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.healthChatbot = new HealthAnalyticsChatbot();
});