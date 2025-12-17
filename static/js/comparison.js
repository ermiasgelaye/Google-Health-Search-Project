// Enhanced Comparison Dashboard with Professional Masculine Design
class ComparisonDashboard {
    constructor() {
        this.currentCity = 'Abilene-Sweetwater';
        this.statsData = null;
        this.cityList = [];
        
        // Professional Masculine Color Palette
        this.colors = {
            primary: {
                navy: '#1a237e',
                darkBlue: '#0d47a1',
                steelBlue: '#1565c0',
                slate: '#37474f',
                charcoal: '#263238',
                midnight: '#0a192f',
                darkGray: '#424242'
            },
            accents: {
                gold: '#ffb300',
                bronze: '#cd7f32',
                teal: '#00695c',
                emerald: '#2e7d32',
                crimson: '#c62828',
                amber: '#ff8f00'
            },
            conditions: {
                cancer: '#0d47a1',        // Dark Blue
                cardiovascular: '#1565c0', // Steel Blue
                depression: '#37474f',     // Slate
                diabetes: '#1a237e',       // Navy
                diarrhea: '#00695c',       // Teal
                obesity: '#2e7d32',        // Emerald
                rehab: '#263238',          // Charcoal
                stroke: '#424242',         // Dark Gray
                vaccine: '#ffb300'         // Gold
            },
            scatter: {
                blue: '#2E86AB',
                red: '#C62828',
                green: '#2E7D32',
                purple: '#6A1B9A',
                orange: '#EF6C00'
            }
        };
        
        this.chartConfig = {
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d'],
            modeBarButtonsToAdd: [],
            modeBarButtons: [
                ['toImage', 'resetScale2d'],
                ['zoom2d', 'pan2d'],
                ['zoomIn2d', 'zoomOut2d']
            ],
            toImageButtonOptions: {
                format: 'png',
                filename: 'comparison_chart',
                height: 600,
                width: 1000,
                scale: 2
            },
            scrollZoom: true,
            showTips: true
        };
        
        this.fonts = {
            title: { size: 24, family: 'Segoe UI, -apple-system, BlinkMacSystemFont, sans-serif', weight: 'bold' },
            axisTitle: { size: 18, family: 'Segoe UI, sans-serif', weight: '600' },
            axisLabels: { size: 14, family: 'Segoe UI, sans-serif' },
            legend: { size: 13, family: 'Segoe UI, sans-serif' },
            tickLabels: { size: 12, family: 'Segoe UI, sans-serif' }
        };
        
        this.init();
    }

    init() {
        console.log('🚀 Initializing Enhanced Comparison Dashboard...');
        this.addStatsOverview();
        this.loadData();
        this.setupDownloadButtons();
        this.setupEventListeners();
        this.setupMobileOptimizations();
        this.setupAccessibility();
        this.applyProfessionalTheme();
    }

    applyProfessionalTheme() {
        // Apply professional styling to page elements
        document.querySelectorAll('.chart-frame').forEach(frame => {
            frame.style.border = 'none';
            frame.style.boxShadow = '0 4px 12px rgba(26, 35, 126, 0.08)';
            frame.style.borderRadius = '8px';
        });
        
        // Style dropdowns
        const citySelect = document.getElementById('city-select');
        if (citySelect) {
            citySelect.style.fontSize = '16px';
            citySelect.style.padding = '10px 15px';
            citySelect.style.border = '2px solid #1565c0';
            citySelect.style.borderRadius = '4px';
        }
        
        // Style buttons
        document.querySelectorAll('.btn').forEach(btn => {
            btn.style.fontSize = '14px';
            btn.style.fontWeight = '600';
            btn.style.padding = '8px 20px';
        });
    }

    addStatsOverview() {
        const statsHTML = `
            <section class="stats-overview-section mb-5" role="region" aria-labelledby="comparison-stats-title">
                <div class="container">
                    <div class="row justify-content-center mb-4">
                        <div class="col-md-12">
                            <h2 id="comparison-stats-title" class="text-center mb-4" style="color: #1a237e; font-size: 28px; font-weight: 700;">
                                <i class="fas fa-chart-line mr-2"></i>Urban Health Intelligence
                            </h2>
                            <p class="text-center mb-4" style="color: #546e7a; font-size: 18px; max-width: 900px; margin: 0 auto;">
                                Comparative analysis of health search trends across major US metropolitan areas (2004-2017)
                            </p>
                            <div class="stats-overview-container">
                                <div class="stat-card" role="article" aria-label="200+ cities analyzed" 
                                     style="background: linear-gradient(135deg, #1a237e, #0d47a1);">
                                    <h3 style="font-size: 32px; color: #ffffff; font-weight: 800;">200+</h3>
                                    <p style="font-size: 16px; color: rgba(255, 255, 255, 0.9); font-weight: 500;">Urban Centers</p>
                                </div>
                                <div class="stat-card" role="article" aria-label="9 health conditions tracked"
                                     style="background: linear-gradient(135deg, #1565c0, #0d47a1);">
                                    <h3 style="font-size: 32px; color: #ffffff; font-weight: 800;">9</h3>
                                    <p style="font-size: 16px; color: rgba(255, 255, 255, 0.9); font-weight: 500;">Health Indicators</p>
                                </div>
                                <div class="stat-card" role="article" aria-label="14 years of data"
                                     style="background: linear-gradient(135deg, #0d47a1, #1565c0);">
                                    <h3 style="font-size: 32px; color: #ffffff; font-weight: 800;">14</h3>
                                    <p style="font-size: 16px; color: rgba(255, 255, 255, 0.9); font-weight: 500;">Year Analysis</p>
                                </div>
                                <div class="stat-card" role="article" aria-label="1M+ data points"
                                     style="background: linear-gradient(135deg, #2e7d32, #00695c);">
                                    <h3 style="font-size: 32px; color: #ffffff; font-weight: 800;">1M+</h3>
                                    <p style="font-size: 16px; color: rgba(255, 255, 255, 0.9); font-weight: 500;">Data Points</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
        
        const statsContainer = document.getElementById('stats-container');
        if (statsContainer) {
            statsContainer.innerHTML = statsHTML;
        } else {
            const jumbotron = document.querySelector('.dashboard-jumbotron');
            if (jumbotron) {
                jumbotron.insertAdjacentHTML('afterend', statsHTML);
            }
        }
    }

    setupDownloadButtons() {
        // Bar chart download
        document.querySelectorAll('.download-chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chartFrame = e.target.closest('.chart-frame');
                if (!chartFrame) return;
                
                const chartElement = chartFrame.querySelector('.plot');
                if (!chartElement) return;
                
                const chartId = chartElement.id;
                const chartName = e.target.dataset.chartName || 'Comparison_Chart';
                this.downloadChart(chartId, chartName);
            });
        });

        // CSV download
        document.querySelectorAll('.download-csv-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const endpoint = e.target.dataset.endpoint;
                const chartName = e.target.dataset.chartName || 'Comparison_Data';
                if (endpoint) {
                    await this.downloadCSV(endpoint, chartName);
                }
            });
        });
    }

    setupEventListeners() {
        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.resizeCharts();
            }, 250);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                const activeChart = document.querySelector('.plot:focus');
                if (activeChart) {
                    this.downloadChart(activeChart.id, 'Comparison_Chart');
                }
            }
        });
    }

    setupAccessibility() {
        document.querySelectorAll('.plot').forEach(plot => {
            plot.setAttribute('tabindex', '0');
            plot.setAttribute('role', 'img');
        });

        const citySelect = document.getElementById('city-select');
        if (citySelect) {
            citySelect.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.handleCityChange();
                }
            });
        }
    }

    setupMobileOptimizations() {
        window.addEventListener('resize', () => {
            this.adjustLayoutForMobile();
        });
        
        this.adjustLayoutForMobile();
    }

    adjustLayoutForMobile() {
        const isMobile = window.innerWidth <= 992;
        
        if (isMobile) {
            document.querySelectorAll('.plot').forEach(plot => {
                if (plot.id !== 'comparison-1') {
                    plot.style.height = '400px';
                }
            });
            
            const gauge = document.getElementById('container');
            if (gauge) {
                gauge.style.minHeight = '350px';
            }
        }
    }

    resizeCharts() {
        const chartIds = ['comparison-1', 'IntermapDiv', 'scatter1', 'scatter2', 'scatter3', 'scatter4'];
        chartIds.forEach(id => {
            const element = document.getElementById(id);
            if (element && element.data) {
                Plotly.Plots.resize(id).catch(console.warn);
            }
        });
    }

    async downloadChart(chartId, chartName) {
        const cleanName = this.cleanFileName(chartName);
        
        if (chartId === 'container') {
            const chart = Highcharts.charts.find(ch => ch && ch.renderTo.id === chartId);
            if (chart) {
                chart.exportChart({
                    type: 'image/png',
                    filename: cleanName
                });
            }
        } else {
            try {
                await Plotly.downloadImage(chartId, {
                    format: 'png',
                    filename: cleanName,
                    height: 600,
                    width: 1000,
                    scale: 2
                });
            } catch (error) {
                console.error('Download failed:', error);
                this.showErrorMessage('Failed to download chart. Please try again.');
            }
        }
    }

    async downloadCSV(endpoint, chartName) {
        try {
            const response = await fetch(endpoint);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            const cleanName = this.cleanFileName(chartName);
            
            if (data.data && data.data.length > 0) {
                this.convertToCSVAndDownload(data.data, cleanName);
            } else {
                throw new Error('No data available');
            }
        } catch (error) {
            console.error('Error downloading CSV:', error);
            this.showErrorMessage('Error downloading CSV data. Please try again.');
        }
    }

    convertToCSVAndDownload(data, filename) {
        if (!data || data.length === 0) {
            this.showErrorMessage('No data available to download.');
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
        URL.revokeObjectURL(url);
    }

    cleanFileName(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s_-]/g, '')
            .replace(/\s+/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '');
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger alert-dismissible fade show';
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '80px';
        errorDiv.style.right = '20px';
        errorDiv.style.zIndex = '10000';
        errorDiv.style.maxWidth = '300px';
        errorDiv.innerHTML = `
            <strong>Error:</strong> ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        `;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    loadData() {
        console.log('📥 Loading comparison data...');
        
        d3.json('/allsearchrecord')
            .then(rows => {
                this.statsData = rows.data;
                this.processData();
                this.setupCitySelector();
                this.setBarPlot(this.currentCity);
            })
            .catch(error => {
                console.error('Error loading data:', error);
                this.showErrorMessage('Failed to load data. Please refresh the page.');
            });
    }

    processData() {
        if (!this.statsData) return;
        const cities = [...new Set(this.statsData.map(row => row.city))].sort();
        this.cityList = cities.filter(city => city && city.trim() !== '');
    }

    setupCitySelector() {
        const citySelector = document.getElementById('city-select') || document.querySelector('.citydata');
        if (citySelector && this.cityList) {
            citySelector.innerHTML = '<option value="">Select a city...</option>';
            
            this.cityList.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                citySelector.appendChild(option);
            });

            if (this.cityList.includes(this.currentCity)) {
                citySelector.value = this.currentCity;
            }

            citySelector.addEventListener('change', (e) => {
                this.currentCity = e.target.value;
                if (this.currentCity) {
                    this.setBarPlot(this.currentCity);
                }
            });
        }
    }

    handleCityChange() {
        const citySelector = document.getElementById('city-select') || document.querySelector('.citydata');
        if (citySelector && citySelector.value) {
            this.currentCity = citySelector.value;
            this.setBarPlot(this.currentCity);
        }
    }

    setBarPlot(chosenCity) {
        if (!this.statsData || !chosenCity) return;

        const cityData = this.statsData.filter(row => row.city === chosenCity);
        if (cityData.length === 0) {
            this.showErrorMessage(`No data available for ${chosenCity}`);
            return;
        }

        const searchedYears = cityData.map(row => row.year);
        const cancerSearch = cityData.map(row => row.Cancer || 0);
        const cardiovascularSearch = cityData.map(row => row.cardiovascular || 0);
        const depressionSearch = cityData.map(row => row.depression || 0);
        const diabetesSearch = cityData.map(row => row.diabetes || 0);
        const diarrheaSearch = cityData.map(row => row.diarrhea || 0);
        const obesitySearch = cityData.map(row => row.obesity || 0);
        const rehabSearch = cityData.map(row => row.rehab || 0);
        const strokeSearch = cityData.map(row => row.stroke || 0);
        const vaccineSearch = cityData.map(row => row.vaccine || 0);
        const searchedState = cityData.map(row => row.postal || row.state || '');

        const traces = [
            { x: searchedYears, y: cancerSearch, name: 'Cancer', type: 'bar', 
              marker: { color: this.colors.conditions.cancer }, 
              hovertemplate: '<b>Year:</b> %{x}<br><b>Cancer:</b> %{y:,}<extra></extra>' },
            { x: searchedYears, y: cardiovascularSearch, name: 'Cardiovascular', type: 'bar', 
              marker: { color: this.colors.conditions.cardiovascular }, 
              hovertemplate: '<b>Year:</b> %{x}<br><b>Cardiovascular:</b> %{y:,}<extra></extra>' },
            { x: searchedYears, y: depressionSearch, name: 'Depression', type: 'bar', 
              marker: { color: this.colors.conditions.depression }, 
              hovertemplate: '<b>Year:</b> %{x}<br><b>Depression:</b> %{y:,}<extra></extra>' },
            { x: searchedYears, y: diabetesSearch, name: 'Diabetes', type: 'bar', 
              marker: { color: this.colors.conditions.diabetes }, 
              hovertemplate: '<b>Year:</b> %{x}<br><b>Diabetes:</b> %{y:,}<extra></extra>' },
            { x: searchedYears, y: diarrheaSearch, name: 'Diarrhea', type: 'bar', 
              marker: { color: this.colors.conditions.diarrhea }, 
              hovertemplate: '<b>Year:</b> %{x}<br><b>Diarrhea:</b> %{y:,}<extra></extra>' },
            { x: searchedYears, y: obesitySearch, name: 'Obesity', type: 'bar', 
              marker: { color: this.colors.conditions.obesity }, 
              hovertemplate: '<b>Year:</b> %{x}<br><b>Obesity:</b> %{y:,}<extra></extra>' },
            { x: searchedYears, y: rehabSearch, name: 'Rehab', type: 'bar', 
              marker: { color: this.colors.conditions.rehab }, 
              hovertemplate: '<b>Year:</b> %{x}<br><b>Rehab:</b> %{y:,}<extra></extra>' },
            { x: searchedYears, y: strokeSearch, name: 'Stroke', type: 'bar', 
              marker: { color: this.colors.conditions.stroke }, 
              hovertemplate: '<b>Year:</b> %{x}<br><b>Stroke:</b> %{y:,}<extra></extra>' },
            { x: searchedYears, y: vaccineSearch, name: 'Vaccine', type: 'bar', 
              marker: { color: this.colors.conditions.vaccine }, 
              hovertemplate: '<b>Year:</b> %{x}<br><b>Vaccine:</b> %{y:,}<extra></extra>' }
        ];

        const layout = {
            width: null,
            height: 550,
            title: {
                text: `<b>${chosenCity}</b><br>Health Search Volume Trends (2004-2017)`,
                font: { 
                    size: this.fonts.title.size,
                    family: this.fonts.title.family,
                    color: this.colors.primary.navy,
                    weight: this.fonts.title.weight
                },
                x: 0.5,
                xanchor: 'center',
                y: 0.95
            },
            barmode: 'stack',
            xaxis: {
                title: {
                    text: 'Year',
                    font: { 
                        size: this.fonts.axisTitle.size,
                        family: this.fonts.axisTitle.family,
                        color: this.colors.primary.slate,
                        weight: this.fonts.axisTitle.weight
                    },
                    standoff: 20
                },
                showgrid: true,
                gridcolor: 'rgba(55, 71, 79, 0.15)',
                gridwidth: 1,
                tickmode: 'linear',
                tick0: 2004,
                dtick: 1,
                tickfont: { 
                    size: this.fonts.tickLabels.size,
                    family: this.fonts.tickLabels.family,
                    color: this.colors.primary.slate
                },
                tickangle: 0,
                automargin: true,
                showline: true,
                linecolor: this.colors.primary.slate,
                linewidth: 1,
                mirror: true
            },
            yaxis: {
                title: {
                    text: 'Search Volume',
                    font: { 
                        size: this.fonts.axisTitle.size,
                        family: this.fonts.axisTitle.family,
                        color: this.colors.primary.slate,
                        weight: this.fonts.axisTitle.weight
                    },
                    standoff: 20
                },
                showgrid: true,
                gridcolor: 'rgba(55, 71, 79, 0.15)',
                gridwidth: 1,
                tickformat: ',',
                tickfont: { 
                    size: this.fonts.tickLabels.size,
                    family: this.fonts.tickLabels.family,
                    color: this.colors.primary.slate
                },
                showline: true,
                linecolor: this.colors.primary.slate,
                linewidth: 1,
                mirror: true,
                automargin: true
            },
            plot_bgcolor: '#ffffff',
            paper_bgcolor: '#ffffff',
            margin: { t: 120, r: 40, b: 120, l: 80 },
            hovermode: 'closest',
            legend: {
                orientation: 'h',
                y: -0.25,
                x: 0.5,
                xanchor: 'center',
                font: { 
                    size: this.fonts.legend.size,
                    family: this.fonts.legend.family,
                    color: this.colors.primary.slate
                },
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                bordercolor: this.colors.primary.slate,
                borderwidth: 1,
                itemclick: 'toggle',
                itemdoubleclick: 'toggleothers'
            },
            autosize: true,
            font: { 
                family: this.fonts.title.family,
                color: this.colors.primary.slate
            },
            separators: ',',
            bargap: 0.15,
            bargroupgap: 0.1
        };

        const chartElement = document.getElementById('comparison-1');
        if (chartElement) {
            chartElement.innerHTML = '';
        }

        Plotly.newPlot('comparison-1', traces, layout, this.chartConfig);
        this.updateScatterPlots(cityData, searchedYears);
        
        if (searchedState.length > 0) {
            this.updateMap(searchedState[0], chosenCity);
        }
        
        this.updateGauge(cityData, chosenCity);
    }

    updateScatterPlots(cityData, years) {
        const diabetesSearch = cityData.map(row => row.diabetes || 0);
        const diarrheaSearch = cityData.map(row => row.diarrhea || 0);
        const depressionSearch = cityData.map(row => row.depression || 0);
        const vaccineSearch = cityData.map(row => row.vaccine || 0);

        const scatterConfigs = [
            {
                id: 'scatter1',
                title: 'Diabetes vs Diarrhea Correlation',
                x: diabetesSearch,
                y: diarrheaSearch,
                xLabel: 'Diabetes Searches',
                yLabel: 'Diarrhea Searches',
                color: this.colors.scatter.blue
            },
            {
                id: 'scatter2',
                title: 'Diabetes vs Depression Correlation',
                x: diabetesSearch,
                y: depressionSearch,
                xLabel: 'Diabetes Searches',
                yLabel: 'Depression Searches',
                color: this.colors.scatter.red
            },
            {
                id: 'scatter3',
                title: 'Diabetes vs Vaccine Correlation',
                x: diabetesSearch,
                y: vaccineSearch,
                xLabel: 'Diabetes Searches',
                yLabel: 'Vaccine Searches',
                color: this.colors.scatter.green
            },
            {
                id: 'scatter4',
                title: 'Depression vs Vaccine Correlation',
                x: vaccineSearch,
                y: depressionSearch,
                xLabel: 'Vaccine Searches',
                yLabel: 'Depression Searches',
                color: this.colors.scatter.purple
            }
        ];

        scatterConfigs.forEach(config => {
            const container = document.getElementById(config.id);
            if (container) container.innerHTML = '';
            
            const scatter = {
                x: config.x,
                y: config.y,
                mode: 'markers',
                type: 'scatter',
                marker: { 
                    size: 16,
                    color: config.color,
                    opacity: 0.8,
                    line: {
                        color: '#ffffff',
                        width: 2
                    }
                },
                name: 'Data Points',
                text: years.map(year => `Year: ${year}`),
                hovertemplate: '<b>Year:</b> %{text}<br><b>' + config.xLabel + ':</b> %{x:,}<br><b>' + config.yLabel + ':</b> %{y:,}<extra></extra>'
            };

            const layout = {
                title: {
                    text: `<b>${config.title}</b>`,
                    font: { 
                        size: this.fonts.title.size - 4,
                        family: this.fonts.title.family,
                        color: this.colors.primary.navy,
                        weight: this.fonts.title.weight
                    },
                    x: 0.5,
                    xanchor: 'center'
                },
                xaxis: { 
                    title: {
                        text: config.xLabel,
                        font: { 
                            size: this.fonts.axisTitle.size - 2,
                            family: this.fonts.axisTitle.family,
                            color: this.colors.primary.slate,
                            weight: this.fonts.axisTitle.weight
                        },
                        standoff: 20
                    },
                    showgrid: true,
                    gridcolor: 'rgba(55, 71, 79, 0.15)',
                    gridwidth: 1,
                    tickformat: ',',
                    tickfont: { 
                        size: this.fonts.tickLabels.size,
                        family: this.fonts.tickLabels.family,
                        color: this.colors.primary.slate
                    },
                    automargin: true,
                    showline: true,
                    linecolor: this.colors.primary.slate,
                    linewidth: 1,
                    mirror: true
                },
                yaxis: { 
                    title: {
                        text: config.yLabel,
                        font: { 
                            size: this.fonts.axisTitle.size - 2,
                            family: this.fonts.axisTitle.family,
                            color: this.colors.primary.slate,
                            weight: this.fonts.axisTitle.weight
                        },
                        standoff: 20
                    },
                    showgrid: true,
                    gridcolor: 'rgba(55, 71, 79, 0.15)',
                    gridwidth: 1,
                    tickformat: ',',
                    tickfont: { 
                        size: this.fonts.tickLabels.size,
                        family: this.fonts.tickLabels.family,
                        color: this.colors.primary.slate
                    },
                    automargin: true,
                    showline: true,
                    linecolor: this.colors.primary.slate,
                    linewidth: 1,
                    mirror: true
                },
                height: 450,
                plot_bgcolor: '#ffffff',
                paper_bgcolor: '#ffffff',
                margin: { t: 80, r: 40, b: 80, l: 80 },
                font: { 
                    family: this.fonts.title.family,
                    color: this.colors.primary.slate
                },
                showlegend: false
            };

            Plotly.newPlot(config.id, [scatter], layout, this.chartConfig);
        });
    }

    updateMap(stateCode, cityName) {
        if (!stateCode) return;

        const mapContainer = document.getElementById('IntermapDiv');
        if (mapContainer) mapContainer.innerHTML = '';

        const mapData = [{
            type: "choropleth",
            locations: [stateCode],
            z: [100],
            locationmode: 'USA-states',
            text: [`Selected: ${cityName}, ${stateCode}`],
            hovertemplate: '<b>%{text}</b><extra></extra>',
            colorscale: [
                [0, '#e3f2fd'],
                [1, '#1565c0']
            ],
            zmin: 0,
            zmax: 100,
            marker: {
                line: {
                    color: '#ffffff',
                    width: 2
                }
            },
            showscale: false
        }];

        const layout = {
            title: {
                text: `<b>${cityName}, ${stateCode}</b><br>Geographic Location`,
                font: { 
                    size: this.fonts.title.size - 4,
                    family: this.fonts.title.family,
                    color: this.colors.primary.navy,
                    weight: this.fonts.title.weight
                },
                x: 0.5,
                xanchor: 'center'
            },
            width: null,
            height: 450,
            geo: {
                scope: 'usa',
                projection: { type: 'albers usa' },
                showlakes: true,
                lakecolor: '#e3f2fd',
                bgcolor: '#ffffff',
                showland: true,
                landcolor: '#f5f5f5',
                subunitcolor: '#ffffff',
                coastlinecolor: '#b0bec5'
            },
            plot_bgcolor: '#ffffff',
            paper_bgcolor: '#ffffff',
            margin: { t: 80, r: 0, b: 0, l: 0 },
            autosize: true,
            font: { 
                family: this.fonts.title.family,
                color: this.colors.primary.slate
            }
        };

        Plotly.newPlot('IntermapDiv', mapData, layout, this.chartConfig);
    }

    updateGauge(cityData, cityName) {
        const totalSearches = cityData.reduce((sum, row) => {
            return sum + (
                (row.Cancer || 0) + (row.cardiovascular || 0) + (row.depression || 0) + 
                (row.diabetes || 0) + (row.diarrhea || 0) + (row.obesity || 0) + 
                (row.rehab || 0) + (row.stroke || 0) + (row.vaccine || 0)
            );
        }, 0);

        const diabetesSearches = cityData.reduce((sum, row) => sum + (row.diabetes || 0), 0);
        const depressionSearches = cityData.reduce((sum, row) => sum + (row.depression || 0), 0);
        const diarrheaSearches = cityData.reduce((sum, row) => sum + (row.diarrhea || 0), 0);

        const diabetesPercent = totalSearches > 0 ? (diabetesSearches / totalSearches * 100).toFixed(1) : 0;
        const depressionPercent = totalSearches > 0 ? (depressionSearches / totalSearches * 100).toFixed(1) : 0;
        const diarrheaPercent = totalSearches > 0 ? (diarrheaSearches / totalSearches * 100).toFixed(1) : 0;

        this.createGaugeChart(diabetesPercent, depressionPercent, diarrheaPercent, cityName);
    }

    createGaugeChart(diabetesPercent, depressionPercent, diarrheaPercent, cityName) {
        const gaugeContainer = document.getElementById('container');
        if (gaugeContainer) gaugeContainer.innerHTML = '';
        
        Highcharts.chart('container', {
            chart: {
                type: 'solidgauge',
                height: '100%',
                backgroundColor: 'transparent',
                events: {
                    render: function() {
                        const chart = this;
                        chart.labelGroup && chart.labelGroup.destroy();
                        chart.labelGroup = chart.renderer.g('labels').add();
                        
                        const conditions = ['Diabetes', 'Depression', 'Diarrhea'];
                        const percents = [diabetesPercent, depressionPercent, diarrheaPercent];
                        const colors = [this.colors.conditions.diabetes, this.colors.conditions.depression, this.colors.conditions.diarrhea];
                        
                        conditions.forEach((condition, i) => {
                            chart.renderer.text(
                                `<b>${condition}: ${percents[i]}%</b>`,
                                chart.chartWidth / 2,
                                140 + (i * 35)
                            )
                            .css({
                                fontSize: '16px',
                                fontWeight: 'bold',
                                fill: colors[i],
                                textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                            })
                            .attr({
                                align: 'center',
                                'text-anchor': 'middle'
                            })
                            .add(chart.labelGroup);
                        });
                    }.bind(this)
                }
            },

            title: {
                text: `<b>${cityName}</b><br>Top Correlated Conditions Distribution`,
                style: {
                    fontSize: '18px',
                    fontFamily: this.fonts.title.family,
                    color: this.colors.primary.navy,
                    fontWeight: 'bold'
                }
            },

            tooltip: {
                borderWidth: 1,
                borderColor: this.colors.primary.slate,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                shadow: true,
                style: {
                    fontSize: '14px',
                    color: this.colors.primary.slate,
                    fontFamily: this.fonts.title.family
                },
                valueSuffix: '%',
                pointFormat: '<b>{series.name}</b><br><span style="font-size:1.5em; color: {point.color}; font-weight: bold">{point.y}</span>%',
                positioner: function(labelWidth) {
                    return {
                        x: (this.chart.chartWidth - labelWidth) / 2,
                        y: (this.chart.plotHeight / 2) + 15
                    };
                }
            },

            pane: {
                startAngle: 0,
                endAngle: 360,
                background: [{ 
                    outerRadius: '112%',
                    innerRadius: '88%',
                    backgroundColor: Highcharts.color(this.colors.conditions.diabetes).setOpacity(0.1).get(),
                    borderWidth: 0
                }, { 
                    outerRadius: '87%',
                    innerRadius: '63%',
                    backgroundColor: Highcharts.color(this.colors.conditions.depression).setOpacity(0.1).get(),
                    borderWidth: 0
                }, { 
                    outerRadius: '62%',
                    innerRadius: '38%',
                    backgroundColor: Highcharts.color(this.colors.conditions.diarrhea).setOpacity(0.1).get(),
                    borderWidth: 0
                }]
            },

            yAxis: {
                min: 0,
                max: 100,
                lineWidth: 0,
                tickPositions: []
            },

            plotOptions: {
                solidgauge: {
                    dataLabels: {
                        enabled: false
                    },
                    linecap: 'round',
                    stickyTracking: false,
                    rounded: true
                }
            },

            series: [{
                name: 'Diabetes',
                data: [{
                    color: this.colors.conditions.diabetes,
                    radius: '112%',
                    innerRadius: '88%',
                    y: parseFloat(diabetesPercent),
                }]
            }, {
                name: 'Depression',
                data: [{
                    color: this.colors.conditions.depression,
                    radius: '87%',
                    innerRadius: '63%',
                    y: parseFloat(depressionPercent)
                }]
            }, {
                name: 'Diarrhea',
                data: [{
                    color: this.colors.conditions.diarrhea,
                    radius: '62%',
                    innerRadius: '38%',
                    y: parseFloat(diarrheaPercent)
                }]
            }],

            credits: {
                enabled: false
            },

            exporting: {
                enabled: true,
                buttons: {
                    contextButton: {
                        menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG'],
                        theme: {
                            fill: this.colors.primary.navy,
                            stroke: this.colors.primary.navy,
                            'stroke-width': 1,
                            style: {
                                color: '#ffffff'
                            }
                        }
                    }
                }
            }
        });
    }
}

// Initialize dashboard with enhanced styling
document.addEventListener('DOMContentLoaded', function() {
    // Add enhanced CSS
    const enhancedCSS = `
        /* Enhanced Professional Styling */
        .comparison-dashboard-loaded {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .comparison-dashboard-loaded .chart-frame {
            background: #ffffff;
            border: none;
            border-radius: 10px;
            box-shadow: 0 6px 20px rgba(26, 35, 126, 0.1);
            padding: 25px;
            margin-bottom: 30px;
        }
        
        .comparison-dashboard-loaded .chart-frame h3 {
            color: #1a237e;
            font-size: 22px;
            font-weight: 700;
            border-bottom: 3px solid #1565c0;
            padding-bottom: 12px;
            margin-bottom: 25px;
        }
        
        .comparison-dashboard-loaded .card {
            background: #ffffff;
            border: none;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(26, 35, 126, 0.08);
            transition: all 0.3s ease;
            height: 100%;
        }
        
        .comparison-dashboard-loaded .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(26, 35, 126, 0.15);
        }
        
        .comparison-dashboard-loaded .card-title {
            color: #1a237e;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .comparison-dashboard-loaded .btn-outline-primary {
            border: 2px solid #1565c0;
            color: #1565c0;
            font-size: 14px;
            font-weight: 600;
            padding: 10px 25px;
            border-radius: 4px;
            transition: all 0.3s ease;
        }
        
        .comparison-dashboard-loaded .btn-outline-primary:hover {
            background: #1565c0;
            color: #ffffff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(21, 101, 192, 0.3);
        }
        
        .comparison-dashboard-loaded .plot {
            border-radius: 6px;
            overflow: hidden;
        }
        
        /* Hide loading elements */
        .chart-loading,
        .spinner-border,
        .visually-hidden,
        .plotly-notifier {
            display: none !important;
        }
        
        /* Improved form controls */
        .comparison-dashboard-loaded .form-control {
            font-size: 16px;
            padding: 12px 15px;
            border: 2px solid #1565c0;
            border-radius: 4px;
            font-weight: 500;
        }
        
        .comparison-dashboard-loaded .form-control:focus {
            border-color: #1a237e;
            box-shadow: 0 0 0 0.2rem rgba(26, 35, 126, 0.25);
        }
        
        /* Enhanced stat cards */
        .stat-card {
            background: linear-gradient(135deg, #1a237e, #0d47a1);
            color: white;
            padding: 25px 15px;
            border-radius: 12px;
            margin: 10px;
            text-align: center;
            min-height: 140px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            box-shadow: 0 6px 15px rgba(26, 35, 126, 0.2);
            transition: all 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(26, 35, 126, 0.3);
        }
        
        .stat-card h3 {
            font-size: 36px;
            font-weight: 800;
            margin-bottom: 10px;
            color: #ffffff;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
        }
        
        .stat-card p {
            font-size: 16px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.9);
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = enhancedCSS;
    document.head.appendChild(styleSheet);
    
    // Initialize dashboard
    window.comparisonDashboard = new ComparisonDashboard();
    document.body.classList.add('comparison-dashboard-loaded');
    
    // Set reduced motion if preferred
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--transition-normal', '0s');
        document.documentElement.style.setProperty('--transition-fast', '0s');
    }
});