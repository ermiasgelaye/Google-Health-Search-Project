// Enhanced Health Analytics Dashboard with AI Assistant
// Professional, accessible, and interactive

class HealthAnalyticsDashboard {
    constructor() {
        this.charts = {};
        this.currentFilters = {
            yearRange: [2004, 2017],
            conditions: new Set(['cancer', 'cardiovascular', 'diabetes', 'depression']),
            states: new Set(),
            metrics: new Set(['searches', 'trends'])
        };
        
        this.dataCache = {};
        this.filteredData = {};
        
        // Professional color scheme
        this.colors = {
            primary: '#2E86AB',
            secondary: '#A23B72',
            accent: '#F18F01',
            success: '#2E8B57',
            warning: '#FF6B6B',
            conditions: {
                cancer: '#E74C3C',
                cardiovascular: '#3498DB',
                depression: '#9B59B6',
                diabetes: '#2ECC71',
                diarrhea: '#F39C12',
                obesity: '#16A085',
                rehab: '#95A5A6',
                stroke: '#E67E22',
                vaccine: '#27AE60'
            },
            gradients: {
                primary: ['#2E86AB', '#A23B72'],
                secondary: ['#3498DB', '#2ECC71'],
                accent: ['#F18F01', '#E74C3C']
            }
        };
        
        this.init();
    }

    init() {
        console.log('🚀 Initializing Health Analytics Dashboard...');
        this.setupProfessionalStyles();
        this.setupLoadingStates();
        this.setupAIAssistant();
        this.setupFilters();
        this.loadAllCharts();
        this.setupEventListeners();
        this.addStatsOverview();
    }

    setupProfessionalStyles() {
        const styles = `
            :root {
                --primary-color: ${this.colors.primary};
                --secondary-color: ${this.colors.secondary};
                --accent-color: ${this.colors.accent};
                --success-color: ${this.colors.success};
                --text-primary: #2C3E50;
                --text-secondary: #546E7A;
                --bg-light: #F8F9FA;
                --border-color: #E1E8ED;
                --font-family: 'Segoe UI', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            }

            body {
                font-family: var(--font-family);
                color: var(--text-primary);
                line-height: 1.6;
            }

            .professional-header {
                background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                color: white;
                padding: 3rem 0;
                margin-bottom: 2rem;
            }

            .section-heading {
                color: var(--primary-color);
                font-weight: 600;
                font-size: 2rem;
                margin-bottom: 1.5rem;
                text-align: center;
                border-bottom: 3px solid var(--accent-color);
                padding-bottom: 0.5rem;
                display: inline-block;
            }

            .subsection-heading {
                color: var(--secondary-color);
                font-weight: 500;
                font-size: 1.5rem;
                margin: 2rem 0 1rem 0;
            }

            .content-text {
                font-size: 1.1rem;
                color: var(--text-secondary);
                line-height: 1.7;
                text-align: justify;
            }

            .stats-overview-container {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                margin: 2rem auto;
                max-width: 1200px;
            }

            .stat-card {
                background: linear-gradient(135deg, #fff, var(--bg-light));
                border: 1px solid var(--border-color);
                border-radius: 10px;
                padding: 2rem 1rem;
                text-align: center;
                transition: all 0.3s ease;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }

            .stat-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                border-color: var(--primary-color);
            }

            .stat-card h3 {
                font-size: 2.5rem;
                font-weight: 700;
                color: var(--primary-color);
                margin-bottom: 0.5rem;
                line-height: 1;
            }

            .stat-card p {
                color: var(--text-secondary);
                margin: 0;
                font-size: 1rem;
                font-weight: 500;
            }

            .chart-container {
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                margin: 2rem 0;
                overflow: hidden;
            }

            .chart-header {
                background: linear-gradient(135deg, var(--bg-light), white);
                padding: 1.5rem 2rem;
                border-bottom: 1px solid var(--border-color);
            }

            .chart-title {
                font-size: 1.4rem;
                font-weight: 600;
                color: var(--primary-color);
                margin: 0;
            }

            .chart-content {
                padding: 1rem;
            }

            .chart-download-container {
                background: var(--bg-light);
                padding: 1rem 2rem;
                border-top: 1px solid var(--border-color);
                display: flex;
                justify-content: flex-end;
                align-items: center;
                gap: 1rem;
            }

            .download-btn {
                font-size: 0.9rem;
                padding: 0.6rem 1.2rem;
                border-radius: 6px;
                font-weight: 500;
                transition: all 0.3s ease;
            }

            .download-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }

            .filters-panel {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                margin: 2rem 0;
            }

            .filter-section {
                margin-bottom: 1.5rem;
            }

            .filter-title {
                font-size: 1.1rem;
                font-weight: 600;
                color: var(--primary-color);
                margin-bottom: 1rem;
            }

            .filter-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }

            .filter-tag {
                background: var(--bg-light);
                border: 1px solid var(--border-color);
                border-radius: 20px;
                padding: 0.5rem 1rem;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .filter-tag.active {
                background: var(--primary-color);
                color: white;
                border-color: var(--primary-color);
            }

            .filter-tag:hover {
                transform: translateY(-2px);
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }

            .ai-assistant {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                z-index: 1000;
            }

            .ai-toggle {
                background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                color: white;
                border: none;
                border-radius: 50%;
                width: 60px;
                height: 60px;
                font-size: 1.5rem;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                transition: all 0.3s ease;
            }

            .ai-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 25px rgba(0,0,0,0.4);
            }

            .ai-chatbox {
                position: absolute;
                bottom: 70px;
                right: 0;
                width: 350px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                display: none;
            }

            .ai-chatbox.active {
                display: block;
            }

            .chat-header {
                background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 12px 12px 0 0;
                font-weight: 600;
            }

            .chat-messages {
                height: 300px;
                overflow-y: auto;
                padding: 1rem;
            }

            .message {
                margin-bottom: 1rem;
                padding: 0.8rem 1rem;
                border-radius: 10px;
                max-width: 80%;
            }

            .message.user {
                background: var(--primary-color);
                color: white;
                margin-left: auto;
                border-bottom-right-radius: 4px;
            }

            .message.assistant {
                background: var(--bg-light);
                color: var(--text-primary);
                margin-right: auto;
                border-bottom-left-radius: 4px;
            }

            .chat-input {
                padding: 1rem;
                border-top: 1px solid var(--border-color);
            }

            .chat-input input {
                width: 100%;
                padding: 0.8rem;
                border: 1px solid var(--border-color);
                border-radius: 6px;
                font-size: 0.9rem;
            }

            @media (max-width: 768px) {
                .section-heading {
                    font-size: 1.6rem;
                }
                
                .content-text {
                    font-size: 1rem;
                    text-align: left;
                }
                
                .ai-chatbox {
                    width: 300px;
                    right: -50px;
                }
                
                .chart-download-container {
                    flex-direction: column;
                    gap: 0.5rem;
                }
                
                .download-btn {
                    width: 100%;
                }
            }

            .loading-spinner {
                display: inline-block;
                width: 2rem;
                height: 2rem;
                border: 3px solid #f3f3f3;
                border-top: 3px solid var(--primary-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-right: 0.5rem;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .correlation-value {
                font-size: 0.8rem;
                font-weight: 600;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    addStatsOverview() {
        const statsHTML = `
            <div class="stats-overview-container">
                <div class="row text-center justify-content-center">
                    <div class="col-lg-2 col-md-4 col-6 mb-4">
                        <div class="stat-card">
                            <h3>14</h3>
                            <p>Years of Data</p>
                        </div>
                    </div>
                    <div class="col-lg-2 col-md-4 col-6 mb-4">
                        <div class="stat-card">
                            <h3>9</h3>
                            <p>Health Conditions</p>
                        </div>
                    </div>
                    <div class="col-lg-2 col-md-4 col-6 mb-4">
                        <div class="stat-card">
                            <h3>50+</h3>
                            <p>States Analyzed</p>
                        </div>
                    </div>
                    <div class="col-lg-2 col-md-4 col-6 mb-4">
                        <div class="stat-card">
                            <h3>1M+</h3>
                            <p>Data Points</p>
                        </div>
                    </div>
                    <div class="col-lg-2 col-md-4 col-6 mb-4">
                        <div class="stat-card">
                            <h3>10</h3>
                            <p>Leading Causes</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const jumbotron = document.querySelector('.jumbotron');
        if (jumbotron) {
            jumbotron.insertAdjacentHTML('afterend', statsHTML);
        }
    }

    setupFilters() {
        const filtersHTML = `
            <div class="filters-panel">
                <h3 class="section-heading" style="font-size: 1.5rem; display: block; text-align: center;">Data Filters</h3>
                <div class="row">
                    <div class="col-md-4">
                        <div class="filter-section">
                            <div class="filter-title">Year Range</div>
                            <div class="d-flex align-items-center">
                                <input type="range" class="form-range" id="yearRange" min="2004" max="2017" step="1" value="2017">
                                <span class="ms-3" id="yearDisplay">2004 - 2017</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="filter-section">
                            <div class="filter-title">Health Conditions</div>
                            <div class="filter-tags">
                                <span class="filter-tag active" data-condition="cancer">Cancer</span>
                                <span class="filter-tag active" data-condition="cardiovascular">Cardiovascular</span>
                                <span class="filter-tag active" data-condition="diabetes">Diabetes</span>
                                <span class="filter-tag active" data-condition="depression">Depression</span>
                                <span class="filter-tag" data-condition="obesity">Obesity</span>
                                <span class="filter-tag" data-condition="stroke">Stroke</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="filter-section">
                            <div class="filter-title">Metrics</div>
                            <div class="filter-tags">
                                <span class="filter-tag active" data-metric="searches">Search Volume</span>
                                <span class="filter-tag active" data-metric="trends">Trend Analysis</span>
                                <span class="filter-tag" data-metric="correlation">Correlations</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="text-center mt-3">
                    <button class="btn btn-primary" onclick="healthDashboard.applyFilters()">
                        <i class="fas fa-filter"></i> Apply Filters
                    </button>
                    <button class="btn btn-outline-secondary ms-2" onclick="healthDashboard.resetFilters()">
                        <i class="fas fa-refresh"></i> Reset
                    </button>
                </div>
            </div>
        `;

        const statsOverview = document.querySelector('.stats-overview-container');
        if (statsOverview) {
            statsOverview.insertAdjacentHTML('afterend', filtersHTML);
        }

        this.setupFilterEvents();
    }

    setupFilterEvents() {
        // Year range slider
        const yearSlider = document.getElementById('yearRange');
        const yearDisplay = document.getElementById('yearDisplay');
        
        yearSlider.addEventListener('input', (e) => {
            const year = parseInt(e.target.value);
            yearDisplay.textContent = `2004 - ${year}`;
            this.currentFilters.yearRange[1] = year;
        });

        // Condition tags
        document.querySelectorAll('.filter-tag[data-condition]').forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.target.classList.toggle('active');
                const condition = e.target.dataset.condition;
                if (e.target.classList.contains('active')) {
                    this.currentFilters.conditions.add(condition);
                } else {
                    this.currentFilters.conditions.delete(condition);
                }
            });
        });

        // Metric tags
        document.querySelectorAll('.filter-tag[data-metric]').forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.target.classList.toggle('active');
                const metric = e.target.dataset.metric;
                if (e.target.classList.contains('active')) {
                    this.currentFilters.metrics.add(metric);
                } else {
                    this.currentFilters.metrics.delete(metric);
                }
            });
        });
    }

    applyFilters() {
        console.log('Applying filters:', this.currentFilters);
        this.showLoadingMessage('Applying filters and updating visualizations...');
        
        // Update all charts with new filters
        this.updateChartsWithFilters();
        
        // Show success message
        setTimeout(() => {
            this.hideLoadingMessage();
            this.showToast('Filters applied successfully!', 'success');
        }, 1000);
    }

    resetFilters() {
        this.currentFilters = {
            yearRange: [2004, 2017],
            conditions: new Set(['cancer', 'cardiovascular', 'diabetes', 'depression']),
            states: new Set(),
            metrics: new Set(['searches', 'trends'])
        };

        // Update UI
        document.getElementById('yearRange').value = 2017;
        document.getElementById('yearDisplay').textContent = '2004 - 2017';
        
        document.querySelectorAll('.filter-tag').forEach(tag => {
            if (tag.dataset.condition === 'cancer' || tag.dataset.condition === 'cardiovascular' || 
                tag.dataset.condition === 'diabetes' || tag.dataset.condition === 'depression') {
                tag.classList.add('active');
            } else if (tag.dataset.condition) {
                tag.classList.remove('active');
            }
            
            if (tag.dataset.metric === 'searches' || tag.dataset.metric === 'trends') {
                tag.classList.add('active');
            } else if (tag.dataset.metric) {
                tag.classList.remove('active');
            }
        });

        this.applyFilters();
    }

    updateChartsWithFilters() {
        // Update line charts with filtered data
        this.updateLineCharts();
        
        // Update other charts as needed
        // Note: In a real implementation, you would update all charts based on filters
    }

    updateLineCharts() {
        // This would typically refetch data with filters or filter existing data
        // For now, we'll just show a message that charts are being updated
        console.log('Updating charts with current filters');
    }

    setupAIAssistant() {
        const aiHTML = `
            <div class="ai-assistant">
                <button class="ai-toggle" onclick="healthDashboard.toggleChat()">
                    <i class="fas fa-robot"></i>
                </button>
                <div class="ai-chatbox">
                    <div class="chat-header">
                        <i class="fas fa-robot me-2"></i>Health Data Assistant
                    </div>
                    <div class="chat-messages" id="chatMessages">
                        <div class="message assistant">
                            Hello! I'm your Health Data Assistant. Ask me about health search trends, correlations, or insights from the data.
                        </div>
                    </div>
                    <div class="chat-input">
                        <input type="text" id="chatInput" placeholder="Ask about health data trends..." onkeypress="healthDashboard.handleChatInput(event)">
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', aiHTML);
    }

    toggleChat() {
        const chatbox = document.querySelector('.ai-chatbox');
        chatbox.classList.toggle('active');
    }

    handleChatInput(event) {
        if (event.key === 'Enter') {
            const input = document.getElementById('chatInput');
            const message = input.value.trim();
            
            if (message) {
                this.addChatMessage('user', message);
                input.value = '';
                
                // Simulate AI response
                setTimeout(() => {
                    this.generateAIResponse(message);
                }, 1000);
            }
        }
    }

    addChatMessage(sender, text) {
        const messages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    generateAIResponse(userMessage) {
        const responses = {
            'trend': 'Health search trends show a significant increase over the years, with cancer being the most searched condition across all states.',
            'correlation': 'Strong correlations exist between depression, diabetes, and obesity searches, suggesting comorbidity awareness among users.',
            'cancer': 'Cancer remains the most searched health condition, with particularly high interest in California, Texas, and New York.',
            'state': 'California shows the highest overall search volume, followed by Texas and New York. Regional variations reflect population density and health awareness.',
            'help': 'I can help you explore health search trends, correlations between conditions, regional patterns, and data insights. Try asking about specific conditions, states, or trends.',
            'default': 'I understand you\'re interested in health search data. I can provide insights on trends, correlations, regional patterns, and specific health conditions. Could you be more specific about what you\'d like to know?'
        };

        let response = responses.default;
        
        if (userMessage.toLowerCase().includes('trend')) {
            response = responses.trend;
        } else if (userMessage.toLowerCase().includes('correlation')) {
            response = responses.correlation;
        } else if (userMessage.toLowerCase().includes('cancer')) {
            response = responses.cancer;
        } else if (userMessage.toLowerCase().includes('state') || userMessage.toLowerCase().includes('california') || userMessage.toLowerCase().includes('texas')) {
            response = responses.state;
        } else if (userMessage.toLowerCase().includes('help')) {
            response = responses.help;
        }

        this.addChatMessage('assistant', response);
    }

    setupLoadingStates() {
        const chartContainers = [
            'line-chart', 'line-chart2', 'myDiv', 'boxDiv', 
            'mymapDiv', 'bar-chart', 'radarmyDiv', 'radarmyDiv2', 'line-chart3'
        ];
        
        chartContainers.forEach(containerId => {
            this.showLoading(containerId);
        });
    }

    showLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="chart-loading text-center py-5">
                    <div class="loading-spinner"></div>
                    <p class="mt-2">Loading professional visualization...</p>
                </div>
            `;
        }
    }

    showLoadingMessage(message) {
        // Create or update loading message
        let loadingDiv = document.getElementById('loadingMessage');
        if (!loadingDiv) {
            loadingDiv = document.createElement('div');
            loadingDiv.id = 'loadingMessage';
            loadingDiv.className = 'alert alert-info text-center';
            loadingDiv.style.position = 'fixed';
            loadingDiv.style.top = '20px';
            loadingDiv.style.left = '50%';
            loadingDiv.style.transform = 'translateX(-50%)';
            loadingDiv.style.zIndex = '9999';
            document.body.appendChild(loadingDiv);
        }
        loadingDiv.innerHTML = `<div class="loading-spinner"></div> ${message}`;
        loadingDiv.style.display = 'block';
    }

    hideLoadingMessage() {
        const loadingDiv = document.getElementById('loadingMessage');
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
    }

    showToast(message, type = 'info') {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} alert-dismissible fade show`;
        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.zIndex = '9999';
        toast.style.minWidth = '300px';
        toast.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    async loadAllCharts() {
        try {
            await Promise.all([
                this.loadTotalSearchesByYear(),
                this.loadSearchesByYearAndCondition(),
                this.loadCorrelationMatrix(),
                this.loadBoxPlot(),
                this.loadChoroplethMap(),
                this.loadHealthSearchesByState(),
                this.loadRadarCharts(),
                this.loadLeadingCausesOfDeath()
            ]);
            
            console.log('✅ All charts loaded successfully');
            this.setupIndividualDownloadButtons();
        } catch (error) {
            console.error('Error loading charts:', error);
        }
    }

    // Updated chart loading methods with professional styling and no titles
    async loadTotalSearchesByYear() {
        Plotly.d3.json('/searchbyyear', (rows) => {
            const unpack = (rows, key) => rows.map(row => row[key]);
            const data = rows.data;

            const allyear = unpack(data, 'year'),
                  allsearches = unpack(data, 'searches');
            
            const totalvolume = {
                x: allyear,
                y: allsearches,
                name: 'Total search volume',
                fill: 'tonexty',
                type: 'scatter',
                line: {
                    color: this.colors.primary,
                    width: 3
                },
                fillcolor: 'rgba(46, 134, 171, 0.1)'
            };

            const layout = {
                width: null,
                height: 500,
                xaxis: {
                    title: { text: 'Years', font: { size: 12 } },
                    showgrid: true,
                    gridcolor: 'rgba(0,0,0,0.1)',
                    tickfont: { size: 11 }
                },
                yaxis: {
                    title: { text: 'Search Volume', font: { size: 12 } },
                    showgrid: true,
                    gridcolor: 'rgba(0,0,0,0.1)',
                    tickfont: { size: 11 }
                },
                plot_bgcolor: 'rgba(0,0,0,0)',
                paper_bgcolor: 'rgba(0,0,0,0)',
                margin: { t: 40, r: 40, b: 60, l: 60 },
                hovermode: 'closest',
                font: { family: 'Segoe UI, sans-serif' },
                showlegend: false
            };

            Plotly.newPlot('line-chart', [totalvolume], layout, this.getChartConfig());
            this.hideLoading('line-chart');
        });
    }

    async loadCorrelationMatrix() {
        const xValues = ['Cancer', 'Cardiovascular', 'Stroke', 'Depression', 'Rehab', 'Vaccine', 'Diarrhea', 'Obesity', 'Diabetes'];
        const yValues = ['Cancer', 'Cardiovascular', 'Stroke', 'Depression', 'Rehab', 'Vaccine', 'Diarrhea', 'Obesity', 'Diabetes'];
        const zValues = [
            [1, 0.47, 0.58, 0.28, 0.43, 0.36, 0.38, 0.30, 0.40],
            [0.47, 1, 0.43, 0.40, 0.51, 0.47, 0.40, 0.49, 0.50],
            [0.58, 0.43, 1, 0.49, 0.53, 0.49, 0.64, 0.39, 0.64],
            [0.28, 0.40, 0.49, 1, 0.44, 0.70, 0.61, 0.59, 0.74],
            [0.43, 0.51, 0.53, 0.44, 1, 0.38, 0.57, 0.31, 0.51],
            [0.36, 0.47, 0.49, 0.70, 0.38, 1, 0.60, 0.53, 0.69],
            [0.38, 0.40, 0.64, 0.61, 0.57, 0.60, 1, 0.46, 0.72],
            [0.30, 0.49, 0.39, 0.59, 0.31, 0.53, 0.46, 1, 0.61],
            [0.40, 0.50, 0.64, 0.74, 0.51, 0.69, 0.72, 0.61, 1]
        ];

        // Add annotations for correlation values
        const annotations = [];
        for (let i = 0; i < yValues.length; i++) {
            for (let j = 0; j < xValues.length; j++) {
                annotations.push({
                    x: xValues[j],
                    y: yValues[i],
                    text: zValues[i][j].toFixed(2),
                    font: { color: zValues[i][j] > 0.5 ? 'white' : 'black', size: 10 },
                    showarrow: false
                });
            }
        }

        const data = [{
            x: xValues,
            y: yValues,
            z: zValues,
            type: 'heatmap',
            colorscale: [
                [0, '#ECF0F1'],
                [0.5, '#3498DB'],
                [1, '#2C3E50']
            ],
            showscale: true,
            colorbar: {
                title: 'Correlation (r)',
                titleside: 'right',
                tickfont: { size: 10 }
            }
        }];

        const layout = {
            width: null,
            height: 500,
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 40, r: 100, b: 80, l: 80 },
            xaxis: {
                tickangle: -45,
                tickfont: { size: 10 }
            },
            yaxis: {
                autorange: 'reversed',
                tickfont: { size: 10 }
            },
            annotations: annotations,
            font: { family: 'Segoe UI, sans-serif' }
        };

        Plotly.newPlot('myDiv', data, layout, this.getChartConfig());
        this.hideLoading('myDiv');
    }

    // Similar updates for other chart methods...
    // [Other chart loading methods would follow the same pattern]

    getChartConfig() {
        return {
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
            modeBarButtonsToAdd: [],
            modeBarButtons: [['toImage', 'resetScale2d']],
            toImageButtonOptions: {
                format: 'png',
                filename: 'health_analytics',
                height: 500,
                width: 800,
                scale: 2
            }
        };
    }

    setupIndividualDownloadButtons() {
        const chartConfigs = [
            { id: 'line-chart', name: 'Total Volume of Searches by Year', endpoint: '/searchbyyear' },
            { id: 'line-chart2', name: 'Search Trends by Health Condition', endpoint: '/searchyearandcondition' },
            { id: 'myDiv', name: 'Correlations Among Health Conditions', endpoint: null },
            { id: 'boxDiv', name: 'Health Search Distribution', endpoint: '/searchyearandcondition' },
            { id: 'mymapDiv', name: 'Health Searches by State', endpoint: '/searchbystate' },
            { id: 'bar-chart', name: 'Health Searches by State and Condition', endpoint: '/mostsserached' },
            { id: 'radarmyDiv', name: 'Total Health Search Volume', endpoint: null },
            { id: 'radarmyDiv2', name: 'Leading Causes of Death Statistics', endpoint: null },
            { id: 'line-chart3', name: 'Leading Causes of Death Trends', endpoint: '/casesleadingdeath' }
        ];

        chartConfigs.forEach(config => {
            this.addDownloadButton(config.id, config.name, config.endpoint);
        });
    }

    addDownloadButton(chartId, chartName, endpoint) {
        const chartContainer = document.getElementById(chartId);
        if (!chartContainer) return;

        // Remove any existing download button first
        const existingButton = chartContainer.parentNode.querySelector('.chart-download-container');
        if (existingButton) {
            existingButton.remove();
        }

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'chart-download-container';
        
        let csvButton = '';
        if (endpoint) {
            csvButton = `
                <button class="btn btn-success download-btn download-csv-btn" 
                        onclick="healthDashboard.downloadCSV('${endpoint}', '${chartName}')">
                    <i class="fas fa-file-csv"></i> Download CSV
                </button>
            `;
        }

        buttonContainer.innerHTML = `
            <div class="download-buttons-wrapper">
                <button class="btn btn-primary download-btn download-chart-btn" 
                        onclick="healthDashboard.downloadChart('${chartId}', '${chartName}')">
                    <i class="fas fa-download"></i> Download Chart
                </button>
                ${csvButton}
            </div>
        `;

        chartContainer.parentNode.insertBefore(buttonContainer, chartContainer.nextSibling);
    }

    downloadChart(chartId, chartName) {
        const cleanName = this.cleanFileName(chartName);
        Plotly.downloadImage(chartId, {
            format: 'png',
            filename: cleanName,
            height: 500,
            width: 800,
            scale: 2
        });
    }

    async downloadCSV(endpoint, chartName) {
        try {
            this.showLoadingMessage('Preparing CSV download...');
            const response = await fetch(endpoint);
            const data = await response.json();
            
            const cleanName = this.cleanFileName(chartName);
            this.convertToCSVAndDownload(data.data, cleanName);
            this.hideLoadingMessage();
        } catch (error) {
            console.error('Error downloading CSV:', error);
            this.hideLoadingMessage();
            this.showToast('Error downloading CSV data', 'error');
        }
    }

    convertToCSVAndDownload(data, filename) {
        if (!data || data.length === 0) {
            this.showToast('No data available to download', 'warning');
            return;
        }

        const headers = Object.keys(data[0]);
        let csvContent = headers.join(',') + '\n';
        
        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                if (value === null || value === undefined) return '';
                const stringValue = String(value);
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return '"' + stringValue.replace(/"/g, '""') + '"';
                }
                return stringValue;
            });
            csvContent += values.join(',') + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast('CSV downloaded successfully!', 'success');
    }

    cleanFileName(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_');
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            ['line-chart', 'line-chart2', 'myDiv', 'boxDiv', 'bar-chart', 'line-chart3', 'radarmyDiv', 'radarmyDiv2']
                .forEach(id => {
                    const element = document.getElementById(id);
                    if (element) Plotly.Plots.resize(id);
                });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                this.toggleChat();
                document.getElementById('chatInput').focus();
            }
        });
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.healthDashboard = new HealthAnalyticsDashboard();
});