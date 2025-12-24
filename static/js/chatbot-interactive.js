// chatbot-interactive.js - Interactive Features
class ChatbotInteractiveFeatures {
    constructor(chatbot) {
        this.chatbot = chatbot;
        this.charts = {};
        this.setupInteractiveFeatures();
    }

    setupInteractiveFeatures() {
        // Add visualization rendering
        this.setupChartRenderer();

        // Add keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Add voice input support
        this.setupVoiceInput();

        // Add export functionality
        this.setupExportFeatures();
    }

    setupChartRenderer() {
        // Load Chart.js if not already loaded
        if (typeof Chart === 'undefined') {
            const chartScript = document.createElement('script');
            chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            chartScript.onload = () => this.initializeChartTemplates();
            document.head.appendChild(chartScript);
        } else {
            this.initializeChartTemplates();
        }
    }

    initializeChartTemplates() {
        this.chartTemplates = {
            trend: {
                type: 'line',
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Search Trend Over Time'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Search Volume'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Year'
                            }
                        }
                    }
                }
            },
            comparison: {
                type: 'bar',
                options: {
                    responsive: true,
                    indexAxis: 'y',
                    plugins: {
                        legend: {
                            position: 'top',
                        }
                    },
                    scales: {
                        x: {
                            stacked: true,
                        },
                        y: {
                            stacked: true
                        }
                    }
                }
            },
            correlation: {
                type: 'matrix',
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    return `Correlation: ${context.raw.v}`;
                                }
                            }
                        }
                    }
                }
            }
        };
    }

    renderChart(containerId, chartType, data, options = {}) {
        const canvas = document.createElement('canvas');
        canvas.id = `chart-${Date.now()}`;
        canvas.style.width = '100%';
        canvas.style.height = '300px';

        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const chartConfig = {
            ...this.chartTemplates[chartType],
            data: data,
            options: { ...this.chartTemplates[chartType].options, ...options }
        };

        const chart = new Chart(ctx, chartConfig);
        this.charts[canvas.id] = chart;

        return chart;
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only activate when chatbot is open
            if (!this.chatbot.isOpen) return;

            // Ctrl/Cmd + Enter to send
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.chatbot.sendMessage();
            }

            // Esc to close
            if (e.key === 'Escape') {
                this.chatbot.closeChatbot();
            }

            // Ctrl/Cmd + K to focus input
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.chatbot.input.focus();
            }

            // Up arrow for history
            if (e.key === 'ArrowUp' && document.activeElement === this.chatbot.input) {
                e.preventDefault();
                this.showMessageHistory();
            }
        });
    }

    setupVoiceInput() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const voiceBtn = document.createElement('button');
            voiceBtn.className = 'btn btn-outline-secondary ml-2';
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            voiceBtn.title = 'Voice Input';

            voiceBtn.addEventListener('click', () => {
                this.toggleVoiceInput();
            });

            this.chatbot.input.parentNode.insertBefore(
                voiceBtn,
                this.chatbot.sendBtn.parentNode
            );
        }
    }

    setupExportFeatures() {
        // Add export button to chatbot header
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn btn-sm btn-outline-light ml-2';
        exportBtn.innerHTML = '<i class="fas fa-download"></i>';
        exportBtn.title = 'Export Conversation';

        exportBtn.addEventListener('click', () => {
            this.exportConversation();
        });

        this.chatbot.closeBtn.parentNode.insertBefore(
            exportBtn,
            this.chatbot.closeBtn
        );
    }

    exportConversation() {
        const messages = Array.from(this.chatbot.body.querySelectorAll('.chat-message'));
        const conversation = messages.map(msg => {
            const isUser = msg.classList.contains('user-message');
            const content = msg.querySelector('.message-content').textContent;
            const time = msg.querySelector('.message-time')?.textContent || '';
            return `${isUser ? 'You' : 'Assistant'} (${time}): ${content}`;
        }).join('\n\n');

        const blob = new Blob([conversation], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `health-analytics-conversation-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Conversation exported successfully!', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '10001';
        notification.innerHTML = `
            ${message}
            <button type="button" class="close" data-dismiss="alert">
                <span>&times;</span>
            </button>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize interactive features when chatbot is created
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        if (window.healthAnalyticsAI) {
            window.chatbotInteractive = new ChatbotInteractiveFeatures(window.healthAnalyticsAI);
        }
    }, 1000);
});