// simple-chatbot.js - ULTRA ENHANCED VERSION
class UltraHealthAnalyticsChatbot {
    constructor() {
        this.sessionId = 'chat_' + Date.now();
        this.isOpen = false;
        this.conversationContext = [];
        this.userPreferences = {
            showReadingTime: true,
            showEmojiReactions: true,
            enableDarkMode: false
        };

        // Create chatbot HTML
        this.createChatbotHTML();
        this.setupEventListeners();

        // Add enhanced welcome message
        this.addWelcomeMessage();

        // Load user preferences
        this.loadPreferences();
    }

    createChatbotHTML() {
        const chatbotHTML = `
        <style>
            /* ULTRA ENHANCED CHATBOT STYLES */
            .simple-chatbot-wrapper {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
            }
            
            .simple-chatbot-toggle {
                width: 70px;
                height: 70px;
                border-radius: 50%;
                background: linear-gradient(135deg, #1a237e, #1565c0);
                color: white;
                border: none;
                cursor: pointer;
                font-size: 1.8rem;
                box-shadow: 0 6px 20px rgba(26, 35, 126, 0.3);
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .simple-chatbot-toggle::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent);
                transform: translateX(-100%);
                transition: transform 0.6s ease;
            }
            
            .simple-chatbot-toggle:hover::before {
                transform: translateX(100%);
            }
            
            .simple-chatbot-toggle:hover {
                transform: scale(1.15) rotate(5deg);
                box-shadow: 0 8px 25px rgba(26, 35, 126, 0.4);
            }
            
            .simple-chatbot-toggle.pulse {
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(26, 35, 126, 0.7); }
                70% { box-shadow: 0 0 0 15px rgba(26, 35, 126, 0); }
                100% { box-shadow: 0 0 0 0 rgba(26, 35, 126, 0); }
            }
            
            .simple-chatbot-container {
                position: absolute;
                bottom: 85px;
                right: 0;
                width: 420px;
                height: 580px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                display: none;
                flex-direction: column;
                border: 1px solid #e0e0e0;
                overflow: hidden;
                transition: all 0.3s ease;
            }
            
            .simple-chatbot-container.active {
                display: flex;
                animation: slideUp 0.3s ease-out;
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            .simple-chatbot-header {
                background: linear-gradient(135deg, #1a237e, #1565c0);
                color: white;
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            
            .header-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .header-avatar {
                width: 40px;
                height: 40px;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
            }
            
            .header-text h6 {
                margin: 0;
                font-size: 1.1rem;
                font-weight: 600;
            }
            
            .header-text small {
                opacity: 0.9;
                font-size: 0.85rem;
            }
            
            .simple-chatbot-body {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                background: #fafafa;
                scroll-behavior: smooth;
            }
            
            /* Custom scrollbar */
            .simple-chatbot-body::-webkit-scrollbar {
                width: 6px;
            }
            
            .simple-chatbot-body::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 10px;
            }
            
            .simple-chatbot-body::-webkit-scrollbar-thumb {
                background: #c1c1c1;
                border-radius: 10px;
            }
            
            .simple-chatbot-body::-webkit-scrollbar-thumb:hover {
                background: #a1a1a1;
            }
            
            .simple-chatbot-input {
                padding: 20px;
                border-top: 1px solid #e0e0e0;
                background: white;
            }
            
            /* Enhanced message styles */
            .chat-message {
                margin-bottom: 20px;
                max-width: 90%;
                opacity: 0;
                animation: messageAppear 0.3s ease-out forwards;
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
            }
            
            .bot-message {
                margin-right: auto;
            }
            
            .message-content {
                padding: 16px 20px;
                border-radius: 20px;
                font-size: 0.95rem;
                line-height: 1.6;
                position: relative;
                box-shadow: 0 3px 15px rgba(0,0,0,0.08);
                transition: transform 0.2s ease;
            }
            
            .message-content:hover {
                transform: translateY(-2px);
            }
            
            .user-message .message-content {
                background: linear-gradient(135deg, #1a237e, #1565c0);
                color: white;
                border-radius: 20px 20px 6px 20px;
                border: none;
            }
            
            .bot-message .message-content {
                background: white;
                color: #2c3e50;
                border: 1px solid #e8e8e8;
                border-radius: 20px 20px 20px 6px;
            }
            
            /* Message metadata */
            .message-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 8px;
                font-size: 0.8rem;
                color: #7f8c8d;
                padding: 0 4px;
            }
            
            .message-time {
                opacity: 0.7;
            }
            
            .message-actions {
                display: flex;
                gap: 8px;
                opacity: 0;
                transition: opacity 0.2s ease;
            }
            
            .chat-message:hover .message-actions {
                opacity: 1;
            }
            
            .message-action-btn {
                background: none;
                border: none;
                color: #7f8c8d;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s ease;
                font-size: 0.9rem;
            }
            
            .message-action-btn:hover {
                background: #f8f9fa;
                color: #1a237e;
            }
            
            /* Enhanced content formatting */
            .bot-message .message-content h1,
            .bot-message .message-content h2,
            .bot-message .message-content h3,
            .bot-message .message-content h4 {
                color: #1a237e;
                margin-top: 1.2em;
                margin-bottom: 0.6em;
                font-weight: 600;
                border-bottom: 2px solid #f0f0f0;
                padding-bottom: 5px;
            }
            
            .bot-message .message-content h1 { font-size: 1.5rem; }
            .bot-message .message-content h2 { font-size: 1.3rem; }
            .bot-message .message-content h3 { font-size: 1.1rem; }
            .bot-message .message-content h4 { font-size: 1rem; }
            
            .bot-message .message-content p {
                margin-bottom: 1em;
            }
            
            .bot-message .message-content ul,
            .bot-message .message-content ol {
                padding-left: 24px;
                margin-bottom: 1em;
            }
            
            .bot-message .message-content li {
                margin-bottom: 0.5em;
                position: relative;
            }
            
            .bot-message .message-content ul li::before {
                content: "•";
                color: #1a237e;
                font-weight: bold;
                position: absolute;
                left: -15px;
            }
            
            .bot-message .message-content blockquote {
                border-left: 4px solid #1a237e;
                margin: 1.5em 0;
                padding: 0.5em 1em;
                background: #f8f9fa;
                border-radius: 0 8px 8px 0;
                font-style: italic;
                color: #555;
            }
            
            .bot-message .message-content code {
                background: #f5f5f5;
                padding: 2px 6px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 0.9em;
                color: #d63384;
                border: 1px solid #e0e0e0;
            }
            
            .bot-message .message-content pre {
                background: #2d3748;
                color: #e2e8f0;
                padding: 16px;
                border-radius: 8px;
                overflow-x: auto;
                margin: 1.5em 0;
                border: 1px solid #4a5568;
                font-family: 'Courier New', monospace;
                font-size: 0.9em;
                line-height: 1.5;
            }
            
            .bot-message .message-content pre code {
                background: none;
                border: none;
                color: inherit;
                padding: 0;
            }
            
            /* Data visualization blocks */
            .data-visualization {
                margin: 1.5em 0;
                padding: 16px;
                background: white;
                border-radius: 12px;
                border: 1px solid #e8e8e8;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            }
            
            .visualization-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
                padding-bottom: 8px;
                border-bottom: 2px solid #f0f0f0;
            }
            
            .visualization-title {
                font-weight: 600;
                color: #1a237e;
                font-size: 0.95rem;
            }
            
            .visualization-controls {
                display: flex;
                gap: 8px;
            }
            
            .viz-btn {
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 6px;
                padding: 4px 8px;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .viz-btn:hover {
                background: #e9ecef;
                border-color: #1a237e;
                color: #1a237e;
            }
            
            /* Progress indicators */
            .progress-indicator {
                height: 4px;
                background: #e0e0e0;
                border-radius: 2px;
                overflow: hidden;
                margin: 1em 0;
            }
            
            .progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #1a237e, #1565c0);
                width: 0%;
                animation: progressAnimation 2s ease-in-out infinite;
                border-radius: 2px;
            }
            
            @keyframes progressAnimation {
                0% { width: 0%; transform: translateX(-100%); }
                50% { width: 100%; transform: translateX(0%); }
                100% { width: 100%; transform: translateX(100%); }
            }
            
            /* Quick action chips */
            .quick-chips {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin: 1em 0;
            }
            
            .chip {
                background: rgba(26, 35, 126, 0.1);
                color: #1a237e;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s ease;
                border: 1px solid rgba(26, 35, 126, 0.2);
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .chip:hover {
                background: rgba(26, 35, 126, 0.2);
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(26, 35, 126, 0.1);
            }
            
            .chip i {
                font-size: 0.9rem;
            }
            
            /* Reading time indicator */
            .reading-time {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: #e8f5e8;
                color: #2e7d32;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 0.8rem;
                margin-bottom: 1em;
            }
            
            /* Response rating */
            .response-rating {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px dashed #e0e0e0;
            }
            
            .rating-btn {
                background: none;
                border: 1px solid #dee2e6;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                color: #7f8c8d;
            }
            
            .rating-btn:hover {
                background: #f8f9fa;
                border-color: #1a237e;
                color: #1a237e;
                transform: scale(1.1);
            }
            
            .rating-btn.active {
                background: #1a237e;
                border-color: #1a237e;
                color: white;
            }
            
            /* Quick actions toolbar */
            .quick-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 15px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 12px;
                border: 1px solid #e8e8e8;
            }
            
            .quick-btn {
                background: white;
                border: 1px solid #dee2e6;
                border-radius: 20px;
                padding: 10px 16px;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                color: #2c3e50;
                font-weight: 500;
            }
            
            .quick-btn:hover {
                background: #1a237e;
                color: white;
                border-color: #1a237e;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(26, 35, 126, 0.2);
            }
            
            .quick-btn i {
                font-size: 0.9rem;
            }
            
            /* Typing indicator */
            .typing-indicator {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 20px;
            }
            
            .typing-dots {
                display: flex;
                gap: 4px;
            }
            
            .typing-dot {
                width: 8px;
                height: 8px;
                background: #1a237e;
                border-radius: 50%;
                animation: typingAnimation 1.4s infinite ease-in-out;
            }
            
            .typing-dot:nth-child(1) { animation-delay: -0.32s; }
            .typing-dot:nth-child(2) { animation-delay: -0.16s; }
            
            @keyframes typingAnimation {
                0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
                40% { transform: scale(1); opacity: 1; }
            }
            
            /* Context awareness badge */
            .context-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: rgba(156, 39, 176, 0.1);
                color: #7b1fa2;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 0.8rem;
                margin-bottom: 1em;
                border: 1px solid rgba(156, 39, 176, 0.2);
            }
            
            /* Copy success notification */
            .copy-success {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: #2e7d32;
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 0.9rem;
                z-index: 10001;
                animation: slideInUp 0.3s ease-out, fadeOut 0.3s ease-out 2s forwards;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translate(-50%, 20px);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, 0);
                }
            }
            
            @keyframes fadeOut {
                to {
                    opacity: 0;
                    transform: translate(-50%, -20px);
                }
            }
            
            /* Dark mode support */
            .dark-mode .simple-chatbot-container {
                background: #2d3748;
                border-color: #4a5568;
            }
            
            .dark-mode .simple-chatbot-body {
                background: #1a202c;
            }
            
            .dark-mode .simple-chatbot-input {
                background: #2d3748;
                border-color: #4a5568;
            }
            
            .dark-mode .bot-message .message-content {
                background: #4a5568;
                color: #e2e8f0;
                border-color: #4a5568;
            }
            
            .dark-mode .message-action-btn:hover {
                background: #4a5568;
            }
            
            .dark-mode .quick-actions {
                background: #2d3748;
                border-color: #4a5568;
            }
            
            .dark-mode .quick-btn {
                background: #4a5568;
                color: #e2e8f0;
                border-color: #4a5568;
            }
            
            .dark-mode .quick-btn:hover {
                background: #1a237e;
                color: white;
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .simple-chatbot-wrapper {
                    bottom: 10px;
                    right: 10px;
                }
                
                .simple-chatbot-container {
                    width: calc(100vw - 40px);
                    right: 10px;
                    bottom: 75px;
                }
                
                .simple-chatbot-toggle {
                    width: 60px;
                    height: 60px;
                    font-size: 1.5rem;
                }
            }
        </style>
        
        <div class="simple-chatbot-wrapper">
            <button class="simple-chatbot-toggle" id="simpleChatbotToggle">
                <i class="fas fa-brain"></i>
            </button>
            
            <div class="simple-chatbot-container" id="simpleChatbotContainer">
                <div class="simple-chatbot-header">
                    <div class="header-content">
                        <div class="header-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="header-text">
                            <h6>Health Analytics AI</h6>
                            <small>Powered by Eagle Analytics</small>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-light" id="simpleChatbotClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="simple-chatbot-body" id="simpleChatbotBody">
                    <!-- Messages will be added here -->
                </div>
                
                <div class="simple-chatbot-input">
                    <div class="input-group">
                        <input type="text" 
                               class="form-control" 
                               id="simpleChatbotInput"
                               placeholder="Ask anything about health analytics..."
                               autocomplete="off"
                               aria-label="Chatbot input">
                        <div class="input-group-append">
                            <button class="btn btn-primary" id="simpleChatbotSend" aria-label="Send message">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="quick-actions mt-3">
                        <button class="quick-btn" data-question="📊 Show me interactive cancer statistics">
                            <i class="fas fa-chart-bar"></i> Cancer Stats
                        </button>
                        <button class="quick-btn" data-question="🔍 Analyze diabetes search patterns with visualizations">
                            <i class="fas fa-search"></i> Diabetes Analysis
                        </button>
                        <button class="quick-btn" data-question="🗺️ Show geographic health trends by state">
                            <i class="fas fa-map"></i> State Trends
                        </button>
                        <button class="quick-btn" data-question="📈 Display key findings with charts">
                            <i class="fas fa-chart-line"></i> Key Findings
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);

        // Add copy success element
        const copySuccess = document.createElement('div');
        copySuccess.className = 'copy-success';
        copySuccess.style.display = 'none';
        copySuccess.innerHTML = '<i class="fas fa-check-circle mr-2"></i> Copied to clipboard!';
        document.body.appendChild(copySuccess);
    }

    setupEventListeners() {
        this.toggleBtn = document.getElementById('simpleChatbotToggle');
        this.closeBtn = document.getElementById('simpleChatbotClose');
        this.container = document.getElementById('simpleChatbotContainer');
        this.body = document.getElementById('simpleChatbotBody');
        this.input = document.getElementById('simpleChatbotInput');
        this.sendBtn = document.getElementById('simpleChatbotSend');

        // Toggle chatbot with animation
        this.toggleBtn.addEventListener('click', () => this.toggleChatbot());
        this.closeBtn.addEventListener('click', () => this.closeChatbot());

        // Send message with enhanced features
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Quick actions with enhanced styling
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const question = e.target.dataset.question ||
                    e.target.closest('.quick-btn').dataset.question;
                this.input.value = question;
                this.input.focus();
                this.sendMessage();
            });
        });

        // Add toggle animation periodically
        setInterval(() => {
            if (!this.isOpen) {
                this.toggleBtn.classList.add('pulse');
                setTimeout(() => {
                    this.toggleBtn.classList.remove('pulse');
                }, 2000);
            }
        }, 30000); // Every 30 seconds

        // Add input auto-suggest
        this.setupAutoSuggest();
    }

    setupAutoSuggest() {
        const suggestions = [
            "Show me interactive cancer statistics",
            "Analyze diabetes search patterns",
            "Compare California and Texas health searches",
            "What are the key findings?",
            "Explain the methodology in detail",
            "Show team members and their roles",
            "Display correlation analysis results",
            "What data sources were used?",
            "Show geographic health trends",
            "How has search volume changed over time?"
        ];

        this.input.addEventListener('input', (e) => {
            const value = e.target.value.toLowerCase();
            if (value.length > 2) {
                const matches = suggestions.filter(s =>
                    s.toLowerCase().includes(value)
                ).slice(0, 3);

                // Could implement a dropdown here
                // For now, just log for debugging
                if (matches.length > 0 && this.isOpen) {
                    console.log('Suggestions:', matches);
                }
            }
        });
    }

    loadPreferences() {
        const saved = localStorage.getItem('health_chatbot_prefs');
        if (saved) {
            try {
                this.userPreferences = { ...this.userPreferences, ...JSON.parse(saved) };
                if (this.userPreferences.enableDarkMode) {
                    document.body.classList.add('dark-mode');
                }
            } catch (e) {
                console.log('Could not load preferences:', e);
            }
        }
    }

    savePreferences() {
        localStorage.setItem('health_chatbot_prefs', JSON.stringify(this.userPreferences));
    }

    toggleChatbot() {
        this.container.classList.toggle('active');
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.input.focus();
            this.toggleBtn.innerHTML = '<i class="fas fa-comment"></i>';
            this.toggleBtn.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
        } else {
            this.toggleBtn.innerHTML = '<i class="fas fa-brain"></i>';
            this.toggleBtn.style.background = 'linear-gradient(135deg, #1a237e, #1565c0)';
        }
    }

    closeChatbot() {
        this.container.classList.remove('active');
        this.isOpen = false;
        this.toggleBtn.innerHTML = '<i class="fas fa-brain"></i>';
        this.toggleBtn.style.background = 'linear-gradient(135deg, #1a237e, #1565c0)';
    }

    async sendMessage() {
        const question = this.input.value.trim();
        if (!question) return;

        // Add to conversation context
        this.conversationContext.push({
            role: 'user',
            content: question,
            timestamp: new Date()
        });

        // Add user message with enhanced styling
        this.addEnhancedMessage(question, 'user');
        this.input.value = '';

        // Show enhanced typing indicator
        this.showEnhancedTyping();

        try {
            // Send to backend with context
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: question,
                    session_id: this.sessionId,
                    context: this.conversationContext.slice(-5) // Last 5 messages
                })
            });

            const data = await response.json();

            // Remove typing indicator
            this.removeTyping();

            if (data.success) {
                // Add bot response with all enhancements
                this.addEnhancedBotResponse(data);

                // Add to conversation context
                this.conversationContext.push({
                    role: 'bot',
                    content: data.response,
                    timestamp: new Date()
                });

                // Keep context manageable
                if (this.conversationContext.length > 10) {
                    this.conversationContext = this.conversationContext.slice(-10);
                }
            } else {
                this.addEnhancedMessage(
                    "I apologize, but I encountered an issue. Let me try that differently...",
                    'bot'
                );
                this.addQuickChips([
                    { text: "Try rephrasing", question: "Can you ask that differently?" },
                    { text: "View project overview", question: "What is this project about?" },
                    { text: "See key findings", question: "What are the key findings?" }
                ]);
            }

        } catch (error) {
            this.removeTyping();
            console.error('Chatbot error:', error);

            // Enhanced error handling
            this.handleEnhancedError(question);
        }
    }

    addEnhancedMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;

        const timestamp = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        let actionsHTML = '';
        if (sender === 'bot') {
            actionsHTML = `
                <div class="message-actions">
                    <button class="message-action-btn copy-btn" title="Copy to clipboard">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="message-action-btn" title="Read aloud">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    <button class="message-action-btn" title="Save note">
                        <i class="fas fa-bookmark"></i>
                    </button>
                </div>
            `;
        }

        messageDiv.innerHTML = `
            <div class="message-content">
                ${this.formatMessageContent(content, sender)}
            </div>
            <div class="message-meta">
                <span class="message-time">${timestamp}</span>
                ${actionsHTML}
            </div>
        `;

        this.body.appendChild(messageDiv);

        // Add event listeners for action buttons
        if (sender === 'bot') {
            const copyBtn = messageDiv.querySelector('.copy-btn');
            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    this.copyToClipboard(content);
                });
            }
        }

        // Scroll to bottom with smooth behavior
        setTimeout(() => {
            this.body.scrollTo({
                top: this.body.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);

        return messageDiv;
    }

    formatMessageContent(content, sender) {
        if (sender === 'user') {
            return content;
        }

        // Enhanced Markdown/HTML parsing for bot messages
        let formatted = content
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Lists
            .replace(/^\* (.*$)/gim, '<li>$1</li>')
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            // Code blocks
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Blockquotes
            .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
            // Line breaks
            .replace(/\n/g, '<br>');

        // Wrap lists in ul tags
        formatted = formatted.replace(/(<li>.*?<\/li>)/g, '<ul>$1</ul>');

        // Add syntax highlighting for code blocks
        formatted = formatted.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, (match, code) => {
            return `<pre><code class="language-python">${this.escapeHtml(code)}</code></pre>`;
        });

        return formatted;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showEnhancedTyping() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot-message';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                    <span>Analyzing your question...</span>
                </div>
                <div class="progress-indicator">
                    <div class="progress-bar"></div>
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

    addEnhancedBotResponse(data) {
        const messageDiv = this.addEnhancedMessage(data.response, 'bot');

        // Add reading time estimate
        const wordCount = data.response.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
        if (this.userPreferences.showReadingTime && readingTime > 0) {
            const readingTimeEl = document.createElement('div');
            readingTimeEl.className = 'reading-time';
            readingTimeEl.innerHTML = `<i class="fas fa-clock"></i> ${readingTime} min read`;
            messageDiv.querySelector('.message-content').insertBefore(
                readingTimeEl,
                messageDiv.querySelector('.message-content').firstChild
            );
        }

        // Add context awareness badge if applicable
        if (data.entities && Object.values(data.entities).some(v => v)) {
            const contextEl = document.createElement('div');
            contextEl.className = 'context-badge';
            const entities = Object.entries(data.entities)
                .filter(([key, value]) => value)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
            contextEl.innerHTML = `<i class="fas fa-tag"></i> Context: ${entities}`;
            messageDiv.querySelector('.message-content').insertBefore(
                contextEl,
                messageDiv.querySelector('.message-content').firstChild
            );
        }

        // Add data visualization if available
        if (data.data_available && data.data_points) {
            this.addDataVisualization(messageDiv, data.data_points);
        }

        // Add quick chips for follow-up questions
        if (data.suggested_questions && data.suggested_questions.length > 0) {
            this.addQuickChips(data.suggested_questions.map(q => ({
                text: q.question,
                question: q.question
            })));
        }

        // Add response rating
        this.addResponseRating(messageDiv);

        // Highlight code blocks with Prism (if available)
        if (typeof Prism !== 'undefined') {
            setTimeout(() => {
                messageDiv.querySelectorAll('pre code').forEach(block => {
                    Prism.highlightElement(block);
                });
            }, 100);
        }
    }

    addDataVisualization(messageDiv, dataPoints) {
        const vizDiv = document.createElement('div');
        vizDiv.className = 'data-visualization';

        let vizHTML = `
            <div class="visualization-header">
                <div class="visualization-title">
                    <i class="fas fa-database mr-2"></i>Data Summary
                </div>
                <div class="visualization-controls">
                    <button class="viz-btn copy-data-btn" title="Copy data">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="viz-btn expand-btn" title="Expand">
                        <i class="fas fa-expand"></i>
                    </button>
                </div>
            </div>
            <div class="viz-content">
        `;

        Object.entries(dataPoints).forEach(([key, value]) => {
            vizHTML += `
                <div class="data-row" style="margin: 8px 0; padding: 8px; background: #f8f9fa; border-radius: 6px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="font-weight: 500; color: #495057;">${key.replace(/_/g, ' ')}:</span>
                        <span style="font-weight: 600; color: #1a237e;">${value}</span>
                    </div>
                </div>
            `;
        });

        vizHTML += `</div>`;
        vizDiv.innerHTML = vizHTML;

        messageDiv.querySelector('.message-content').appendChild(vizDiv);

        // Add event listeners for viz buttons
        vizDiv.querySelector('.copy-data-btn').addEventListener('click', () => {
            const dataText = Object.entries(dataPoints)
                .map(([k, v]) => `${k}: ${v}`)
                .join('\n');
            this.copyToClipboard(dataText);
        });

        vizDiv.querySelector('.expand-btn').addEventListener('click', () => {
            // Could implement modal view here
            alert('Expanded view would show here. Data points: ' + JSON.stringify(dataPoints));
        });
    }

    addQuickChips(chips) {
        const chipsContainer = document.createElement('div');
        chipsContainer.className = 'quick-chips';

        chips.forEach(chip => {
            const chipEl = document.createElement('div');
            chipEl.className = 'chip';
            chipEl.innerHTML = chip.text;
            chipEl.addEventListener('click', () => {
                this.input.value = chip.question;
                this.sendMessage();
            });
            chipsContainer.appendChild(chipEl);
        });

        this.body.appendChild(chipsContainer);
        this.body.scrollTop = this.body.scrollHeight;
    }

    addResponseRating(messageDiv) {
        const ratingDiv = document.createElement('div');
        ratingDiv.className = 'response-rating';
        ratingDiv.innerHTML = `
            <small style="margin-right: auto;">Was this helpful?</small>
            <button class="rating-btn" data-rating="down">
                <i class="fas fa-thumbs-down"></i>
            </button>
            <button class="rating-btn" data-rating="up">
                <i class="fas fa-thumbs-up"></i>
            </button>
        `;

        messageDiv.appendChild(ratingDiv);

        ratingDiv.querySelectorAll('.rating-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rating = e.currentTarget.dataset.rating;
                e.currentTarget.classList.add('active');

                // Send feedback to server (could be implemented)
                console.log(`User rated response: ${rating}`);

                // Show thank you message
                const thankYou = document.createElement('div');
                thankYou.className = 'reading-time';
                thankYou.innerHTML = `<i class="fas fa-heart"></i> Thanks for your feedback!`;
                thankYou.style.marginTop = '8px';
                ratingDiv.appendChild(thankYou);

                // Remove buttons after rating
                setTimeout(() => {
                    ratingDiv.querySelectorAll('.rating-btn').forEach(b => b.remove());
                }, 1000);
            });
        });
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showCopySuccess();
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    }

    showCopySuccess() {
        const successEl = document.querySelector('.copy-success');
        successEl.style.display = 'block';
        setTimeout(() => {
            successEl.style.display = 'none';
        }, 2500);
    }

    handleEnhancedError(question) {
        // Analyze the question for better fallback
        const analysis = this.analyzeQuestion(question);

        let fallbackResponse = this.generateSmartFallback(analysis);

        // Add enhanced error message
        const errorDiv = this.addEnhancedMessage(fallbackResponse, 'bot');

        // Add helpful suggestions based on question type
        this.addContextualSuggestions(errorDiv, analysis);

        // Add troubleshooting tips
        const tipsDiv = document.createElement('div');
        tipsDiv.className = 'data-visualization';
        tipsDiv.style.marginTop = '15px';
        tipsDiv.innerHTML = `
            <div class="visualization-header">
                <div class="visualization-title">
                    <i class="fas fa-lightbulb mr-2"></i>Troubleshooting Tips
                </div>
            </div>
            <div class="viz-content">
                <div style="margin: 8px 0;">
                    <i class="fas fa-check-circle text-success mr-2"></i>
                    Try rephrasing your question
                </div>
                <div style="margin: 8px 0;">
                    <i class="fas fa-check-circle text-success mr-2"></i>
                    Ask about specific conditions or states
                </div>
                <div style="margin: 8px 0;">
                    <i class="fas fa-check-circle text-success mr-2"></i>
                    Use the quick action buttons below
                </div>
            </div>
        `;

        errorDiv.querySelector('.message-content').appendChild(tipsDiv);

        // Add emergency quick actions
        this.addQuickChips([
            {
                text: "🔄 Try again",
                question: question
            },
            {
                text: "📊 View project overview",
                question: "What is this project about?"
            },
            {
                text: "🔧 See methodology",
                question: "Explain the methodology"
            }
        ]);
    }

    analyzeQuestion(question) {
        const analysis = {
            type: 'general',
            entities: [],
            complexity: 'simple',
            keywords: []
        };

        const lowerQ = question.toLowerCase();

        // Detect question type
        if (lowerQ.includes('how') || lowerQ.includes('method') || lowerQ.includes('process')) {
            analysis.type = 'methodology';
        } else if (lowerQ.includes('what') || lowerQ.includes('tell me about')) {
            analysis.type = 'information';
        } else if (lowerQ.includes('why') || lowerQ.includes('reason')) {
            analysis.type = 'explanation';
        } else if (lowerQ.includes('compare') || lowerQ.includes('difference')) {
            analysis.type = 'comparison';
        }

        // Extract keywords
        const keywords = ['cancer', 'diabetes', 'depression', 'obesity', 'cardiovascular',
            'stroke', 'vaccine', 'rehab', 'diarrhea', 'california', 'texas',
            'new york', 'data', 'source', 'trend', 'statistic', 'correlation'];

        analysis.keywords = keywords.filter(keyword =>
            lowerQ.includes(keyword)
        );

        // Assess complexity
        const wordCount = question.split(/\s+/).length;
        analysis.complexity = wordCount > 15 ? 'complex' :
            wordCount > 8 ? 'moderate' : 'simple';

        return analysis;
    }

    generateSmartFallback(analysis) {
        const templates = {
            methodology: `**🔍 Methodology Inquiry**\n\nI notice you're asking about our methodology. Here's a detailed breakdown:\n\n`,
            information: `**📚 Information Request**\n\nBased on your question, here's what I can tell you about our health analytics project:\n\n`,
            explanation: `**💡 Explanation Needed**\n\nLet me explain this aspect of our project in detail:\n\n`,
            comparison: `**⚖️ Comparison Request**\n\nI understand you want to compare different aspects. Here's what I can share:\n\n`,
            general: `**🤖 Health Analytics Assistant**\n\nI can provide detailed insights about our health analytics project. Here's what I know:\n\n`
        };

        const base = templates[analysis.type] || templates.general;

        let response = base;

        // Add context-specific information
        if (analysis.keywords.includes('cancer')) {
            response += `• **Cancer**: Most searched health condition across all states\n`;
        }
        if (analysis.keywords.includes('diabetes')) {
            response += `• **Diabetes**: Shows strong correlation with depression (r=0.74)\n`;
        }
        if (analysis.keywords.includes('california')) {
            response += `• **California**: Highest search volume state (18% of total)\n`;
        }

        response += `\n**Try asking more specifically:**\n`;
        response += `• "Show me cancer statistics with charts"\n`;
        response += `• "Compare diabetes searches in California vs Texas"\n`;
        response += `• "Explain the correlation analysis methodology"\n`;

        return response;
    }

    addContextualSuggestions(messageDiv, analysis) {
        const suggestions = [];

        if (analysis.keywords.includes('cancer')) {
            suggestions.push({
                text: "📈 View cancer statistics",
                question: "Show detailed cancer statistics with charts"
            });
        }

        if (analysis.keywords.includes('diabetes')) {
            suggestions.push({
                text: "🔗 Diabetes correlations",
                question: "Show correlations between diabetes and other conditions"
            });
        }

        if (analysis.type === 'methodology') {
            suggestions.push({
                text: "🔬 Detailed methodology",
                question: "Explain the full methodology with technical details"
            });
        }

        if (suggestions.length > 0) {
            this.addQuickChips(suggestions);
        }
    }

    addWelcomeMessage() {
        const welcomeMsg = `
        <div class="chat-message bot-message">
            <div class="message-content">
                <div class="context-badge">
                    <i class="fas fa-rocket"></i> Enhanced AI Assistant Activated
                </div>
                
                <h1>🦅 Welcome to Eagle Health Analytics AI!</h1>
                
                <p><strong>I'm your intelligent companion for exploring 14 years of health search data.</strong></p>
                
                <div class="data-visualization" style="margin: 1.5em 0;">
                    <div class="visualization-header">
                        <div class="visualization-title">
                            <i class="fas fa-chart-line mr-2"></i>Project at a Glance
                        </div>
                    </div>
                    <div class="viz-content">
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 10px;">
                            <div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); padding: 12px; border-radius: 8px; text-align: center;">
                                <div style="font-size: 1.8rem; font-weight: bold; color: #1565c0;">14</div>
                                <div style="font-size: 0.9rem; color: #37474f;">Years of Data</div>
                            </div>
                            <div style="background: linear-gradient(135deg, #f3e5f5, #e1bee7); padding: 12px; border-radius: 8px; text-align: center;">
                                <div style="font-size: 1.8rem; font-weight: bold; color: #7b1fa2;">9</div>
                                <div style="font-size: 0.9rem; color: #37474f;">Health Conditions</div>
                            </div>
                            <div style="background: linear-gradient(135deg, #e8f5e8, #c8e6c9); padding: 12px; border-radius: 8px; text-align: center;">
                                <div style="font-size: 1.8rem; font-weight: bold; color: #2e7d32;">50+</div>
                                <div style="font-size: 0.9rem; color: #37474f;">States Analyzed</div>
                            </div>
                            <div style="background: linear-gradient(135deg, #fff3e0, #ffcc80); padding: 12px; border-radius: 8px; text-align: center;">
                                <div style="font-size: 1.8rem; font-weight: bold; color: #ef6c00;">1M+</div>
                                <div style="font-size: 0.9rem; color: #37474f;">Data Points</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <h3>🚀 Enhanced Features Available:</h3>
                <ul>
                    <li><strong>Interactive Visualizations</strong> - See data come to life</li>
                    <li><strong>Smart Context Awareness</strong> - I remember our conversation</li>
                    <li><strong>Code Syntax Highlighting</strong> - Perfect for technical queries</li>
                    <li><strong>Quick Action Chips</strong> - Instant follow-up questions</li>
                    <li><strong>Reading Time Estimates</strong> - Know what to expect</li>
                    <li><strong>Response Ratings</strong> - Help me improve</li>
                </ul>
                
                <blockquote>
                    <strong>Pro Tip:</strong> Try asking complex questions with multiple aspects, 
                    like "Compare cancer and diabetes trends in California with correlation analysis"
                </blockquote>
                
                <div class="quick-chips">
                    <div class="chip" data-question="Show me interactive cancer statistics with visualizations">
                        <i class="fas fa-chart-bar"></i> Interactive Cancer Stats
                    </div>
                    <div class="chip" data-question="Explain the full methodology with code examples">
                        <i class="fas fa-code"></i> Technical Methodology
                    </div>
                    <div class="chip" data-question="Compare health searches across multiple states with charts">
                        <i class="fas fa-map-marked-alt"></i> Multi-State Comparison
                    </div>
                </div>
            </div>
        </div>
        `;

        this.body.innerHTML = welcomeMsg;

        // Add event listeners to welcome chips
        this.body.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const question = e.currentTarget.dataset.question;
                this.input.value = question;
                this.sendMessage();
            });
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    window.healthAnalyticsAI = new UltraHealthAnalyticsChatbot();

    // Load Prism.js for syntax highlighting
    const prismCSS = document.createElement('link');
    prismCSS.rel = 'stylesheet';
    prismCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/themes/prism-tomorrow.min.css';
    document.head.appendChild(prismCSS);

    const prismJS = document.createElement('script');
    prismJS.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/prism.min.js';
    document.head.appendChild(prismJS);

    const prismPython = document.createElement('script');
    prismPython.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/components/prism-python.min.js';
    document.head.appendChild(prismPython);
});