// Enhanced Comparison Dashboard with Stats and Download Functionality - FINAL VERSION

class ComparisonDashboard {
    constructor() {
        this.currentCity = 'Abilene-Sweetwater';
        this.statsData = null;
        this.cityList = [];
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
                height: 500,
                width: 800,
                scale: 2
            },
            scrollZoom: true,
            showTips: true
        };
        
        this.init();
    }

    init() {
        console.log('🚀 Initializing Comparison Dashboard...');
        this.addStatsOverview();
        this.loadData();
        this.setupDownloadButtons();
        this.setupEventListeners();
        this.setupMobileOptimizations();
        this.setupAccessibility();
    }

    addStatsOverview() {
        const statsHTML = `
            <section class="stats-overview-section mb-5" role="region" aria-labelledby="comparison-stats-title">
                <div class="container">
                    <div class="row justify-content-center mb-4">
                        <div class="col-md-12">
                            <h2 id="comparison-stats-title" class="text-center mb-4">Comparison Insights</h2>
                            <div class="stats-overview-container">
                                <div class="stat-card" role="article" aria-label="200+ cities analyzed">
                                    <h3>200+</h3>
                                    <p>Cities Analyzed</p>
                                </div>
                                <div class="stat-card" role="article" aria-label="9 health conditions tracked">
                                    <h3>9</h3>
                                    <p>Health Conditions</p>
                                </div>
                                <div class="stat-card" role="article" aria-label="14 years of data">
                                    <h3>14</h3>
                                    <p>Years of Data</p>
                                </div>
                                <div class="stat-card" role="article" aria-label="4 strong correlations found">
                                    <h3>4</h3>
                                    <p>Strong Correlations</p>
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
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                const activeChart = document.querySelector('.plot:focus');
                if (activeChart) {
                    this.downloadChart(activeChart.id, 'Comparison_Chart');
                }
            }
            
            // Escape to close tooltips
            if (e.key === 'Escape') {
                document.querySelectorAll('.plotly-notifier').forEach(el => {
                    el.style.display = 'none';
                });
            }
        });
    }

    setupAccessibility() {
        // Add ARIA labels to charts
        document.querySelectorAll('.plot').forEach(plot => {
            plot.setAttribute('tabindex', '0');
            plot.setAttribute('role', 'img');
        });

        // Improve keyboard navigation for dropdown
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
            // Adjust chart heights
            document.querySelectorAll('.plot').forEach(plot => {
                if (plot.id !== 'comparison-1') {
                    plot.style.height = '350px';
                }
            });
            
            // Adjust gauge height
            const gauge = document.getElementById('container');
            if (gauge) {
                gauge.style.minHeight = '300px';
            }
        }
    }

    resizeCharts() {
        const chartIds = ['comparison-1', 'IntermapDiv', 'scatter1', 'scatter2', 'scatter3', 'scatter4'];
        
        chartIds.forEach(id => {
            const element = document.getElementById(id);
            if (element && element.data) {
                Plotly.Plots.resize(id).catch(error => {
                    console.warn(`Could not resize chart ${id}:`, error);
                });
            }
        });
    }

    async downloadChart(chartId, chartName) {
        const cleanName = this.cleanFileName(chartName);
        
        if (chartId === 'container') {
            // Handle Highcharts gauge
            const chart = Highcharts.charts.find(ch => ch && ch.renderTo.id === chartId);
            if (chart) {
                chart.exportChart({
                    type: 'image/png',
                    filename: cleanName
                });
            }
        } else {
            // Handle Plotly charts
            try {
                await Plotly.downloadImage(chartId, {
                    format: 'png',
                    filename: cleanName,
                    height: 500,
                    width: 800,
                    scale: 2
                });
                this.announceToScreenReader(`Chart ${chartName} downloaded successfully.`);
            } catch (error) {
                console.error('Download failed:', error);
                this.showErrorMessage('Failed to download chart. Please try again.');
            }
        }
    }

    async downloadCSV(endpoint, chartName) {
        try {
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const cleanName = this.cleanFileName(chartName);
            
            if (data.data && data.data.length > 0) {
                this.convertToCSVAndDownload(data.data, cleanName);
                this.announceToScreenReader(`CSV data ${chartName} downloaded successfully.`);
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

    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
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
        
        // Auto-dismiss after 5 seconds
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

        // Extract unique cities
        const cities = [...new Set(this.statsData.map(row => row.city))].sort();
        this.cityList = cities;
        
        // Filter out empty/null city names
        this.cityList = this.cityList.filter(city => city && city.trim() !== '');
    }

    setupCitySelector() {
        const citySelector = document.getElementById('city-select') || document.querySelector('.citydata');
        if (citySelector && this.cityList) {
            // Clear existing options
            citySelector.innerHTML = '<option value="">Select a city...</option>';
            
            // Add city options
            this.cityList.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                citySelector.appendChild(option);
            });

            // Set default value if available
            if (this.cityList.includes(this.currentCity)) {
                citySelector.value = this.currentCity;
            }

            // Set up change event
            citySelector.addEventListener('change', (e) => {
                this.currentCity = e.target.value;
                if (this.currentCity) {
                    this.setBarPlot(this.currentCity);
                    this.announceToScreenReader(`Loading data for ${this.currentCity}`);
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

        // Filter data for selected city
        const cityData = this.statsData.filter(row => row.city === chosenCity);
        
        if (cityData.length === 0) {
            this.showErrorMessage(`No data available for ${chosenCity}`);
            return;
        }

        // Process city data
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

        // Color scheme for conditions
        const colors = {
            cancer: 'rgba(255, 144, 14, 0.8)',
            cardiovascular: 'rgba(44, 160, 101, 0.8)',
            depression: 'rgba(255, 65, 54, 0.8)',
            diabetes: 'rgba(207, 114, 255, 0.8)',
            diarrhea: 'rgba(127, 96, 0, 0.8)',
            obesity: 'rgba(255, 140, 184, 0.8)',
            rehab: 'rgba(79, 90, 117, 0.8)',
            stroke: 'rgba(222, 223, 0, 0.8)',
            vaccine: 'rgba(0, 188, 212, 0.8)'
        };

        // Create traces
        const traces = [
            { x: searchedYears, y: cancerSearch, name: 'Cancer', type: 'bar', marker: { color: colors.cancer }, hovertemplate: '<b>Year:</b> %{x}<br><b>Cancer:</b> %{y:,}<extra></extra>' },
            { x: searchedYears, y: cardiovascularSearch, name: 'Cardiovascular', type: 'bar', marker: { color: colors.cardiovascular }, hovertemplate: '<b>Year:</b> %{x}<br><b>Cardiovascular:</b> %{y:,}<extra></extra>' },
            { x: searchedYears, y: depressionSearch, name: 'Depression', type: 'bar', marker: { color: colors.depression }, hovertemplate: '<b>Year:</b> %{x}<br><b>Depression:</b> %{y:,}<extra></extra>' },
            { x: searchedYears, y: diabetesSearch, name: 'Diabetes', type: 'bar', marker: { color: colors.diabetes }, hovertemplate: '<b>Year:</b> %{x}<br><b>Diabetes:</b> %{y:,}<extra></extra>' },
            { x: searchedYears, y: diarrheaSearch, name: 'Diarrhea', type: 'bar', marker: { color: colors.diarrhea }, hovertemplate: '<b>Year:</b> %{x}<br><b>Diarrhea:</b> %{y:,}<extra></extra>' },
            { x: searchedYears, y: obesitySearch, name: 'Obesity', type: 'bar', marker: { color: colors.obesity }, hovertemplate: '<b>Year:</b> %{x}<br><b>Obesity:</b> %{y:,}<extra></extra>' },
            { x: searchedYears, y: rehabSearch, name: 'Rehab', type: 'bar', marker: { color: colors.rehab }, hovertemplate: '<b>Year:</b> %{x}<br><b>Rehab:</b> %{y:,}<extra></extra>' },
            { x: searchedYears, y: strokeSearch, name: 'Stroke', type: 'bar', marker: { color: colors.stroke }, hovertemplate: '<b>Year:</b> %{x}<br><b>Stroke:</b> %{y:,}<extra></extra>' },
            { x: searchedYears, y: vaccineSearch, name: 'Vaccine', type: 'bar', marker: { color: colors.vaccine }, hovertemplate: '<b>Year:</b> %{x}<br><b>Vaccine:</b> %{y:,}<extra></extra>' }
        ];

        const layout = {
            width: null,
            height: 500,
            title: {
                text: `Health Search Trends in ${chosenCity} (2004-2017)`,
                font: { size: 20 }
            },
            barmode: 'stack',
            xaxis: {
                title: 'Year',
                showgrid: true,
                gridcolor: 'rgba(0,0,0,0.1)',
                tickmode: 'linear',
                tick0: 2004,
                dtick: 1
            },
            yaxis: {
                title: 'Search Volume',
                showgrid: true,
                gridcolor: 'rgba(0,0,0,0.1)',
                tickformat: ','
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 80, r: 40, b: 80, l: 60 },
            hovermode: 'closest',
            legend: {
                orientation: 'h',
                y: -0.3,
                x: 0.5,
                xanchor: 'center',
                font: { size: 12 }
            },
            autosize: true,
            font: { family: 'Open Sans, sans-serif' }
        };

        // Hide loading state
        const chartElement = document.getElementById('comparison-1');
        if (chartElement) {
            const loadingElement = chartElement.querySelector('.chart-loading');
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
        }

        Plotly.newPlot('comparison-1', traces, layout, this.chartConfig);

        // Update scatter plots
        this.updateScatterPlots(cityData, searchedYears);
        
        // Update map
        if (searchedState.length > 0) {
            this.updateMap(searchedState[0], chosenCity);
        }
        
        // Update gauge
        this.updateGauge(cityData, chosenCity);
    }

    updateScatterPlots(cityData, years) {
        // Prepare data for scatter plots
        const diabetesSearch = cityData.map(row => row.diabetes || 0);
        const diarrheaSearch = cityData.map(row => row.diarrhea || 0);
        const depressionSearch = cityData.map(row => row.depression || 0);
        const vaccineSearch = cityData.map(row => row.vaccine || 0);

        // Scatter plot 1: Diarrhea vs Diabetes
        const scatter1 = {
            x: diabetesSearch,
            y: diarrheaSearch,
            mode: 'markers',
            type: 'scatter',
            marker: { 
                size: 12,
                color: '#2E86AB',
                opacity: 0.7
            },
            name: 'Data Points',
            text: years.map(year => `Year: ${year}`),
            hovertemplate: '<b>Year:</b> %{text}<br><b>Diabetes:</b> %{x:,}<br><b>Diarrhea:</b> %{y:,}<extra></extra>'
        };

        const layout1 = {
            title: {
                text: 'Diarrhea vs. Diabetes Correlation',
                font: { size: 16 }
            },
            xaxis: { 
                title: 'Diabetes Searches',
                showgrid: true,
                gridcolor: 'rgba(0,0,0,0.1)',
                tickformat: ','
            },
            yaxis: { 
                title: 'Diarrhea Searches',
                showgrid: true,
                gridcolor: 'rgba(0,0,0,0.1)',
                tickformat: ','
            },
            height: 400,
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 60, r: 40, b: 80, l: 60 },
            font: { family: 'Open Sans, sans-serif' }
        };

        Plotly.newPlot('scatter1', [scatter1], layout1, this.chartConfig);

        // Scatter plot 2: Depression vs Diabetes
        const scatter2 = {
            x: diabetesSearch,
            y: depressionSearch,
            mode: 'markers',
            type: 'scatter',
            marker: { 
                size: 12,
                color: '#E74C3C',
                opacity: 0.7
            },
            name: 'Data Points',
            text: years.map(year => `Year: ${year}`),
            hovertemplate: '<b>Year:</b> %{text}<br><b>Diabetes:</b> %{x:,}<br><b>Depression:</b> %{y:,}<extra></extra>'
        };

        const layout2 = {
            title: {
                text: 'Depression vs. Diabetes Correlation',
                font: { size: 16 }
            },
            xaxis: { 
                title: 'Diabetes Searches',
                showgrid: true,
                gridcolor: 'rgba(0,0,0,0.1)',
                tickformat: ','
            },
            yaxis: { 
                title: 'Depression Searches',
                showgrid: true,
                gridcolor: 'rgba(0,0,0,0.1)',
                tickformat: ','
            },
            height: 400,
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 60, r: 40, b: 80, l: 60 },
            font: { family: 'Open Sans, sans-serif' }
        };

        Plotly.newPlot('scatter2', [scatter2], layout2, this.chartConfig);

        // Scatter plot 3: Vaccine vs Diabetes
        const scatter3 = {
            x: diabetesSearch,
            y: vaccineSearch,
            mode: 'markers',
            type: 'scatter',
            marker: { 
                size: 12,
                color: '#27AE60',
                opacity: 0.7
            },
            name: 'Data Points',
            text: years.map(year => `Year: ${year}`),
            hovertemplate: '<b>Year:</b> %{text}<br><b>Diabetes:</b> %{x:,}<br><b>Vaccine:</b> %{y:,}<extra></extra>'
        };

        const layout3 = {
            title: {
                text: 'Vaccine vs. Diabetes Correlation',
                font: { size: 16 }
            },
            xaxis: { 
                title: 'Diabetes Searches',
                showgrid: true,
                gridcolor: 'rgba(0,0,0,0.1)',
                tickformat: ','
            },
            yaxis: { 
                title: 'Vaccine Searches',
                showgrid: true,
                gridcolor: 'rgba(0,0,0,0.1)',
                tickformat: ','
            },
            height: 400,
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 60, r: 40, b: 80, l: 60 },
            font: { family: 'Open Sans, sans-serif' }
        };

        Plotly.newPlot('scatter3', [scatter3], layout3, this.chartConfig);

        // Scatter plot 4: Depression vs Vaccine
        const scatter4 = {
            x: vaccineSearch,
            y: depressionSearch,
            mode: 'markers',
            type: 'scatter',
            marker: { 
                size: 12,
                color: '#8E44AD',
                opacity: 0.7
            },
            name: 'Data Points',
            text: years.map(year => `Year: ${year}`),
            hovertemplate: '<b>Year:</b> %{text}<br><b>Vaccine:</b> %{x:,}<br><b>Depression:</b> %{y:,}<extra></extra>'
        };

        const layout4 = {
            title: {
                text: 'Depression vs. Vaccine Correlation',
                font: { size: 16 }
            },
            xaxis: { 
                title: 'Vaccine Searches',
                showgrid: true,
                gridcolor: 'rgba(0,0,0,0.1)',
                tickformat: ','
            },
            yaxis: { 
                title: 'Depression Searches',
                showgrid: true,
                gridcolor: 'rgba(0,0,0,0.1)',
                tickformat: ','
            },
            height: 400,
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 60, r: 40, b: 80, l: 60 },
            font: { family: 'Open Sans, sans-serif' }
        };

        Plotly.newPlot('scatter4', [scatter4], layout4, this.chartConfig);
    }

    updateMap(stateCode, cityName) {
        if (!stateCode) return;

        const mapData = [{
            type: "choropleth",
            locations: [stateCode],
            z: [100],
            locationmode: 'USA-states',
            text: [`Selected: ${cityName}, ${stateCode}`],
            hovertemplate: '<b>%{text}</b><extra></extra>',
            colorscale: [
                [0, '#e8f5e9'],
                [1, '#2e7d32']
            ],
            zmin: 0,
            zmax: 100,
            marker: {
                line: {
                    color: 'rgb(255,255,255)',
                    width: 2
                }
            },
            showscale: false
        }];

        const layout = {
            title: {
                text: `Location: ${cityName}, ${stateCode}`,
                font: { size: 16 }
            },
            width: null,
            height: 400,
            geo: {
                scope: 'usa',
                projection: { type: 'albers usa' },
                showlakes: true,
                lakecolor: 'rgb(255, 255, 255)',
                bgcolor: 'rgba(0,0,0,0)',
                showland: true,
                landcolor: 'rgb(217, 217, 217)',
                subunitcolor: 'rgb(255, 255, 255)'
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 60, r: 0, b: 0, l: 0 },
            autosize: true,
            font: { family: 'Open Sans, sans-serif' }
        };

        Plotly.newPlot('IntermapDiv', mapData, layout, this.chartConfig);
    }

    updateGauge(cityData, cityName) {
        // Calculate percentages
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

        // Create gauge chart
        this.createGaugeChart(diabetesPercent, depressionPercent, diarrheaPercent, cityName);
    }

    createGaugeChart(diabetesPercent, depressionPercent, diarrheaPercent, cityName) {
        Highcharts.chart('container', {
            chart: {
                type: 'solidgauge',
                height: '100%',
                backgroundColor: 'transparent',
                events: {
                    render: function() {
                        // Add percentage labels
                        const chart = this;
                        const diabetesPoint = chart.series[0].points[0];
                        const depressionPoint = chart.series[1].points[0];
                        const diarrheaPoint = chart.series[2].points[0];
                        
                        // Clear previous labels
                        chart.labelGroup && chart.labelGroup.destroy();
                        
                        // Create new labels
                        chart.labelGroup = chart.renderer.g('labels').add();
                        
                        // Add labels for each gauge
                        [diabetesPoint, depressionPoint, diarrheaPoint].forEach((point, i) => {
                            const condition = ['Diabetes', 'Depression', 'Diarrhea'][i];
                            const percent = [diabetesPercent, depressionPercent, diarrheaPercent][i];
                            const color = ['#2E86AB', '#E74C3C', '#27AE60'][i];
                            
                            const label = chart.renderer.text(
                                `${condition}: ${percent}%`,
                                chart.chartWidth / 2,
                                150 + (i * 40)
                            )
                            .css({
                                fontSize: '14px',
                                fontWeight: 'bold',
                                fill: color
                            })
                            .attr({
                                align: 'center',
                                'text-anchor': 'middle'
                            })
                            .add(chart.labelGroup);
                        });
                    }
                }
            },

            title: {
                text: `Strongly Correlated Conditions: ${cityName}`,
                style: {
                    fontSize: '18px',
                    fontFamily: 'Montserrat, sans-serif'
                }
            },

            tooltip: {
                borderWidth: 0,
                backgroundColor: 'none',
                shadow: false,
                style: {
                    fontSize: '16px'
                },
                valueSuffix: '%',
                pointFormat: '{series.name}<br><span style="font-size:2em; color: {point.color}; font-weight: bold">{point.y}</span>',
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
                background: [{ // Track for Diabetes
                    outerRadius: '112%',
                    innerRadius: '88%',
                    backgroundColor: Highcharts.color('#2E86AB')
                        .setOpacity(0.3)
                        .get(),
                    borderWidth: 0
                }, { // Track for Depression
                    outerRadius: '87%',
                    innerRadius: '63%',
                    backgroundColor: Highcharts.color('#E74C3C')
                        .setOpacity(0.3)
                        .get(),
                    borderWidth: 0
                }, { // Track for Diarrhea
                    outerRadius: '62%',
                    innerRadius: '38%',
                    backgroundColor: Highcharts.color('#27AE60')
                        .setOpacity(0.3)
                        .get(),
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
                    color: '#2E86AB',
                    radius: '112%',
                    innerRadius: '88%',
                    y: parseFloat(diabetesPercent),
                }]
            }, {
                name: 'Depression',
                data: [{
                    color: '#E74C3C',
                    radius: '87%',
                    innerRadius: '63%',
                    y: parseFloat(depressionPercent)
                }]
            }, {
                name: 'Diarrhea',
                data: [{
                    color: '#27AE60',
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
                        menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG']
                    }
                }
            }
        });
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        // Disable animations
        document.documentElement.style.setProperty('--transition-normal', '0s');
        document.documentElement.style.setProperty('--transition-fast', '0s');
    }
    
    // Initialize dashboard
    window.comparisonDashboard = new ComparisonDashboard();
    
    // Add loading state
    document.body.classList.add('comparison-dashboard-loaded');
});