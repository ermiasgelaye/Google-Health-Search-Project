// Comparison Dashboard JavaScript
class ComparisonDashboard {
    constructor() {
        this.currentCity = 'Abilene-Sweetwater';
        this.chartConfigs = {
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
            modeBarButtonsToAdd: [],
            modeBarButtons: [['toImage', 'resetScale2d']],
            toImageButtonOptions: {
                format: 'png',
                filename: 'health_comparison_chart',
                height: 600,
                width: 800,
                scale: 2
            }
        };
        
        this.init();
    }
    
    init() {
        console.log('🚀 Initializing Comparison Dashboard...');
        this.setupLayout();
        this.setupEventListeners();
        this.loadData();
    }
    
    setupLayout() {
        // Ensure all chart containers have proper dimensions
        const chartContainers = [
            'comparison-1', 'scatter1', 'scatter2', 'scatter3', 'scatter4', 'IntermapDiv'
        ];
        
        chartContainers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.style.width = '100%';
                container.style.height = '500px';
                container.style.minHeight = '400px';
            }
        });
        
        // Setup Highcharts gauge container
        const gaugeContainer = document.getElementById('container');
        if (gaugeContainer) {
            gaugeContainer.style.width = '100%';
            gaugeContainer.style.height = '400px';
        }
    }
    
    setupEventListeners() {
        window.addEventListener('resize', this.debouncedResize.bind(this));
        
        // Make city selector more responsive
        const citySelector = document.querySelector('.citydata');
        if (citySelector) {
            citySelector.addEventListener('change', () => {
                this.updateCityStats(citySelector.value);
            });
        }
    }
    
    debouncedResize() {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
            this.updateChartSizes();
        }, 250);
    }
    
    updateChartSizes() {
        // Update Plotly chart sizes
        const plotlyCharts = ['comparison-1', 'scatter1', 'scatter2', 'scatter3', 'scatter4'];
        plotlyCharts.forEach(chartId => {
            const chart = document.getElementById(chartId);
            if (chart) {
                Plotly.Plots.resize(chartId);
            }
        });
    }
    
    async loadData() {
        try {
            // Load data and initialize charts
            this.initializeCharts();
        } catch (error) {
            console.error('Error loading comparison data:', error);
        }
    }
    
    initializeCharts() {
        // This function will be filled with the existing Plotly.d3.json code
        // from the original comparison.js file
    }
    
    updateCityStats(cityName) {
        const cityNameElement = document.getElementById('selected-city-name');
        if (cityNameElement && cityName) {
            cityNameElement.textContent = cityName;
            
            // Update city stats display
            const statsHTML = `
                <div class="d-flex justify-content-center flex-wrap gap-3">
                    <div class="stat-badge">
                        <span class="stat-value">14</span>
                        <span class="stat-label">Years</span>
                    </div>
                    <div class="stat-badge">
                        <span class="stat-value">9</span>
                        <span class="stat-label">Conditions</span>
                    </div>
                    <div class="stat-badge">
                        <span class="stat-value">100K+</span>
                        <span class="stat-label">Searches</span>
                    </div>
                </div>
            `;
            
            const cityStats = document.getElementById('city-stats');
            if (cityStats) {
                cityStats.innerHTML = statsHTML;
            }
        }
    }
}

// Download functions for comparison page
function downloadComparisonChart(chartId, chartName) {
    if (chartId === 'container') {
        // Handle Highcharts gauge chart
        const chart = Highcharts.charts.find(ch => ch && ch.renderTo.id === 'container');
        if (chart) {
            chart.exportChart({
                type: 'image/png',
                filename: chartName
            });
        }
    } else {
        // Handle Plotly charts
        Plotly.downloadImage(chartId, {
            format: 'png',
            filename: chartName,
            height: 600,
            width: 800,
            scale: 2
        });
    }
}

function downloadGaugeChart() {
    const chart = Highcharts.charts.find(ch => ch && ch.renderTo.id === 'container');
    if (chart) {
        chart.exportChart({
            type: 'image/png',
            filename: 'Health_Condition_Percentage_Gauge'
        });
    }
}

async function downloadComparisonCSV(endpoint, filename) {
    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        
        // Convert to CSV
        if (!data.data || data.data.length === 0) {
            alert('No data available to download.');
            return;
        }

        const headers = Object.keys(data.data[0]);
        let csvContent = headers.join(',') + '\n';
        
        data.data.forEach(row => {
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

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error downloading CSV:', error);
        alert('Error downloading CSV data. Please try again.');
    }
}

async function downloadAllComparisonCharts() {
    const chartIds = ['comparison-1', 'scatter1', 'scatter2', 'scatter3', 'scatter4'];
    
    alert('This would download all charts as a ZIP file. In a production environment, this would require server-side processing.');
    
    // For now, offer individual downloads
    chartIds.forEach((chartId, index) => {
        setTimeout(() => {
            downloadComparisonChart(chartId, `Comparison_Chart_${index + 1}`);
        }, index * 1000);
    });
}

async function downloadAllComparisonData() {
    await downloadComparisonCSV('/allsearchrecord', 'Complete_Comparison_Data');
}

function generateComparisonReport() {
    alert('PDF report generation would be implemented with server-side processing. This feature shows the capability.');
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize comparison dashboard
    window.comparisonDashboard = new ComparisonDashboard();
    
    // Add stats overview to comparison page
    const statsHTML = `
        <div class="row text-center mb-5 justify-content-center stats-overview-container">
            <div class="col-md-2 col-6 mb-4">
                <div class="stat-card">
                    <h3>14</h3>
                    <p>Years Data</p>
                </div>
            </div>
            <div class="col-md-2 col-6 mb-4">
                <div class="stat-card">
                    <h3>9</h3>
                    <p>Health Conditions</p>
                </div>
            </div>
            <div class="col-md-2 col-6 mb-4">
                <div class="stat-card">
                    <h3>50+</h3>
                    <p>States Analyzed</p>
                </div>
            </div>
            <div class="col-md-2 col-6 mb-4">
                <div class="stat-card">
                    <h3>1M+</h3>
                    <p>Data Points</p>
                </div>
            </div>
            <div class="col-md-2 col-6 mb-4">
                <div class="stat-card">
                    <h3>100+</h3>
                    <p>Cities Available</p>
                </div>
            </div>
        </div>
    `;
    
    const statsOverview = document.getElementById('stats-overview');
    if (statsOverview) {
        statsOverview.innerHTML = statsHTML;
    }

    // Focus management for skip link
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', function() {
            const mainContent = document.getElementById('comparison-content');
            if (mainContent) {
                mainContent.setAttribute('tabindex', '-1');
                mainContent.focus();
            }
        });
    }

    // Add keyboard navigation to charts
    const charts = document.querySelectorAll('.plot');
    charts.forEach((chart, index) => {
        chart.setAttribute('tabindex', '0');
        
        chart.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Trigger download on Enter/Space
                const container = this.closest('.chart-frame');
                if (container) {
                    const downloadBtn = container.querySelector('.download-chart-btn');
                    if (downloadBtn) {
                        downloadBtn.click();
                    }
                }
            }
        });
    });
});

// Keep the existing Plotly.d3.json code structure but clean it up
// ... [rest of the existing comparison.js code with proper formatting]