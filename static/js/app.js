// Enhanced Health Search Trends Dashboard - FIXED VERSION

class HealthDashboard {
    constructor() {
        this.charts = {};
        this.currentFilters = {
            yearRange: [2004, 2017],
            conditions: [],
            states: []
        };
        
        this.colors = {
            conditions: {
                cancer: 'rgba(255, 144, 14, 0.5)',
                cardiovascular: 'rgba(44, 160, 101, 0.5)',
                depression: 'rgba(255, 65, 54, 0.5)',
                diabetes: 'rgba(207, 114, 255, 0.5)',
                diarrhea: 'rgba(127, 96, 0, 0.5)',
                obesity: 'rgba(255, 140, 184, 0.5)',
                rehab: 'rgba(79, 90, 117, 0.5)',
                stroke: 'rgba(222, 223, 0, 0.5)',
                vaccine: 'rgba(222, 223, 0, 0.5)'
            }
        };
        
        this.init();
    }

    init() {
        console.log('🚀 Initializing Health Analytics Dashboard...');
        this.setupLoadingStates();
        this.loadAllCharts();
        this.setupEventListeners();
        this.setupDownloadButtons();
    }

    // Setup loading states
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
                <div class="chart-loading">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading chart...</span>
                    </div>
                    <p>Loading visualization...</p>
                </div>
            `;
        }
    }

    hideLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            const loadingElement = container.querySelector('.chart-loading');
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
        }
    }

    // Setup download button event listeners
    setupDownloadButtons() {
        // Set up chart download buttons
        document.querySelectorAll('.download-chart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const chartId = e.target.closest('.chart-frame').querySelector('.plot').id;
                const chartName = e.target.dataset.chartName || this.getDefaultChartName(chartId);
                this.downloadChart(chartId, chartName);
            });
        });

        // Set up CSV download buttons
        document.querySelectorAll('.download-csv-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const endpoint = e.target.dataset.endpoint;
                const chartName = e.target.dataset.chartName || 'Health_Data';
                if (endpoint) {
                    this.downloadCSV(endpoint, chartName);
                }
            });
        });
    }

    getDefaultChartName(chartId) {
        const chartNames = {
            'line-chart': 'Total_Search_Volume_Trend',
            'line-chart2': 'Health_Condition_Trends',
            'myDiv': 'Health_Condition_Correlations',
            'boxDiv': 'Health_Search_Boxplot',
            'mymapDiv': 'Health_Search_Volume_Map',
            'bar-chart': 'Health_Search_By_State',
            'radarmyDiv': 'Health_Search_Radar',
            'radarmyDiv2': 'Death_Causes_Radar',
            'line-chart3': 'Leading_Causes_of_Death_Trends'
        };
        return chartNames[chartId] || 'Health_Chart';
    }

    // Load all charts
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
        } catch (error) {
            console.error('Error loading charts:', error);
        }
    }

    // Chart loading methods (unchanged from your original)
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
                    color: '#2E86AB',
                    width: 3
                }
            };

            const layout = {
                width: null,
                height: 500,
                xaxis: {
                    title: 'Years',
                    showgrid: false,
                    zeroline: false
                },
                yaxis: {
                    title: 'Searches',
                    showline: false
                },
                plot_bgcolor: 'rgba(0,0,0,0)',
                paper_bgcolor: 'rgba(0,0,0,0)',
                margin: { t: 60, r: 40, b: 80, l: 60 },
                hovermode: 'closest',
                autosize: true
            };

            Plotly.newPlot('line-chart', [totalvolume], layout, this.getChartConfig());
            this.hideLoading('line-chart');
        });
    }

    async loadSearchesByYearAndCondition() {
        Plotly.d3.json('/searchyearandcondition', (rows) => {
            const unpack = (rows, key) => rows.map(row => row[key]);
            const data = rows.data;

            const allyear = unpack(data, 'year'),
                  cancer = unpack(data, 'cancer'),
                  cardiovascular = unpack(data, 'cardiovascular'),
                  depression = unpack(data, 'depression'),
                  diabetes = unpack(data, 'diabetes'),
                  diarrhea = unpack(data, 'diarrhea'),
                  obesity = unpack(data, 'obesity'),
                  rehab = unpack(data, 'rehab'),
                  stroke = unpack(data, 'stroke'),
                  vaccine = unpack(data, 'vaccine');

            const traces = [
                { x: allyear, y: cancer, name: 'Cancer', type: 'scatter', line: { shape: 'spline', smoothing: 0.5, color: this.colors.conditions.cancer } },
                { x: allyear, y: cardiovascular, name: 'Cardiovascular', type: 'scatter', line: { shape: 'spline', smoothing: 0.5, color: this.colors.conditions.cardiovascular } },
                { x: allyear, y: depression, name: 'Depression', type: 'scatter', line: { shape: 'spline', smoothing: 0.5, color: this.colors.conditions.depression } },
                { x: allyear, y: diabetes, name: 'Diabetes', type: 'scatter', line: { shape: 'spline', smoothing: 0.5, color: this.colors.conditions.diabetes } },
                { x: allyear, y: diarrhea, name: 'Diarrhea', type: 'scatter', line: { shape: 'spline', smoothing: 0.5, color: this.colors.conditions.diarrhea } },
                { x: allyear, y: obesity, name: 'Obesity', type: 'scatter', line: { shape: 'spline', smoothing: 0.5, color: this.colors.conditions.obesity } },
                { x: allyear, y: rehab, name: 'Rehab', type: 'scatter', line: { shape: 'spline', smoothing: 0.5, color: this.colors.conditions.rehab } },
                { x: allyear, y: stroke, name: 'Stroke', type: 'scatter', line: { shape: 'spline', smoothing: 0.5, color: this.colors.conditions.stroke } },
                { x: allyear, y: vaccine, name: 'Vaccine', type: 'scatter', line: { shape: 'spline', smoothing: 0.5, color: this.colors.conditions.vaccine } }
            ];

            const layout = {
                width: null,
                height: 500,
                xaxis: {
                    title: 'Years',
                    showgrid: false,
                    zeroline: false
                },
                yaxis: {
                    title: 'Searches',
                    showline: false
                },
                plot_bgcolor: 'rgba(0,0,0,0)',
                paper_bgcolor: 'rgba(0,0,0,0)',
                margin: { t: 60, r: 40, b: 100, l: 60 },
                hovermode: 'closest',
                legend: {
                    orientation: 'h',
                    y: -0.3,
                    x: 0.5,
                    xanchor: 'center'
                },
                autosize: true
            };

            Plotly.newPlot('line-chart2', traces, layout, this.getChartConfig());
            this.hideLoading('line-chart2');
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

        const colorscale = [
            [0, '#3D9970'],
            [1, '#001f3f']
        ];

        const data = [{
            x: xValues,
            y: yValues,
            z: zValues,
            type: 'heatmap',
            colorscale: colorscale,
            showscale: true,
            colorbar: {
                title: 'Correlation',
                titleside: 'right',
                x: 1.02,
                xanchor: 'left',
                y: 0.5,
                yanchor: 'middle'
            }
        }];

        const layout = {
            width: null,
            height: 500,
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 60, r: 120, b: 100, l: 100 },
            xaxis: {
                tickangle: -45
            },
            yaxis: {
                autorange: 'reversed'
            },
            autosize: true
        };

        Plotly.newPlot('myDiv', data, layout, this.getChartConfig());
        this.hideLoading('myDiv');
    }

    async loadBoxPlot() {
        Plotly.d3.json('/searchyearandcondition', (rows) => {
            const unpack = (rows, key) => rows.map(row => row[key]);
            const data = rows.data;

            const cancer = unpack(data, 'cancer'),
                  cardiovascular = unpack(data, 'cardiovascular'),
                  depression = unpack(data, 'depression'),
                  diabetes = unpack(data, 'diabetes'),
                  diarrhea = unpack(data, 'diarrhea'),
                  obesity = unpack(data, 'obesity'),
                  rehab = unpack(data, 'rehab'),
                  stroke = unpack(data, 'stroke'),
                  vaccine = unpack(data, 'vaccine');

            const traces = [
                { y: cancer, type: 'box', name: 'Cancer', boxpoints: 'all', marker: { color: this.colors.conditions.cancer, size: 3 }, line: { width: 1 } },
                { y: cardiovascular, type: 'box', name: 'Cardiovascular', boxpoints: 'all', marker: { color: this.colors.conditions.cardiovascular, size: 3 }, line: { width: 1 } },
                { y: depression, type: 'box', name: 'Depression', boxpoints: 'all', marker: { color: this.colors.conditions.depression, size: 3 }, line: { width: 1 } },
                { y: diabetes, type: 'box', name: 'Diabetes', boxpoints: 'all', marker: { color: this.colors.conditions.diabetes, size: 3 }, line: { width: 1 } },
                { y: diarrhea, type: 'box', name: 'Diarrhea', boxpoints: 'all', marker: { color: this.colors.conditions.diarrhea, size: 3 }, line: { width: 1 } },
                { y: obesity, type: 'box', name: 'Obesity', boxpoints: 'all', marker: { color: this.colors.conditions.obesity, size: 3 }, line: { width: 1 } },
                { y: rehab, type: 'box', name: 'Rehab', boxpoints: 'all', marker: { color: this.colors.conditions.rehab, size: 3 }, line: { width: 1 } },
                { y: stroke, type: 'box', name: 'Stroke', boxpoints: 'all', marker: { color: this.colors.conditions.stroke, size: 3 }, line: { width: 1 } },
                { y: vaccine, type: 'box', name: 'Vaccine', boxpoints: 'all', marker: { color: this.colors.conditions.vaccine, size: 3 }, line: { width: 1 } }
            ];

            const layout = {
                width: null,
                height: 500,
                xaxis: {
                    title: 'Condition',
                    showgrid: false,
                    zeroline: false
                },
                yaxis: {
                    title: 'Search',
                    showline: false
                },
                plot_bgcolor: 'rgba(0,0,0,0)',
                paper_bgcolor: 'rgba(0,0,0,0)',
                margin: { t: 60, r: 40, b: 80, l: 60 },
                showlegend: false,
                autosize: true
            };

            Plotly.newPlot('boxDiv', traces, layout, this.getChartConfig());
            this.hideLoading('boxDiv');
        });
    }

    async loadChoroplethMap() {
        Plotly.d3.json('/searchbystate', (rows) => {
            const unpack = (rows, key) => rows.map(row => row[key]);
            const data = rows.data;

            const state = unpack(data, 'postal'),
                  searches = unpack(data, 'searches');

            const mapData = [{
                type: "choroplethmapbox",
                name: "Searches",
                geojson: "https://raw.githubusercontent.com/python-visualization/folium/master/examples/data/us-states.json",
                locations: state,
                z: searches,
                zmin: 2555,
                zmax: 98134,
                colorbar: { 
                    y: 0.5,
                    yanchor: "middle",
                    len: 0.8,
                    x: 1.02,
                    xanchor: "left",
                    orientation: "v",
                    title: { 
                        text: "Search Volume", 
                        side: "right" 
                    },
                    thickness: 20,
                    outlinewidth: 0
                },
                colorscale: [
                    [0, '#131f0c'],
                    [1, '#bdfe88']
                ],
                autocolorscale: false,
            }];

            const layout = {
                mapbox: { 
                    style: "dark", 
                    center: { lon: -95.712891, lat: 37.090240 }, 
                    zoom: 3 
                },
                width: null,
                height: 500,
                margin: { t: 40, b: 40, l: 40, r: 120 },
                plot_bgcolor: 'rgba(0,0,0,0)',
                paper_bgcolor: 'rgba(0,0,0,0)',
                autosize: true
            };

            const config = {
                mapboxAccessToken: "pk.eyJ1IjoiZWdhZ2EiLCJhIjoiY2tmOG51MXY4MGR3NjJ5cnE4N3B2NTl0cCJ9.vVCAwSF-oh9ymZ8-pM-nBQ",
                responsive: true,
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
                modeBarButtonsToAdd: [],
                modeBarButtons: [['toImage']]
            };

            Plotly.newPlot('mymapDiv', mapData, layout, config);
            this.hideLoading('mymapDiv');
        });
    }

    async loadHealthSearchesByState() {
        Plotly.d3.json('/mostsserached', (rows) => {
            const unpack = (rows, key) => rows.map(row => row[key]);
            const data = rows.data;

            const state = unpack(data, 'state'),
                  cancer = unpack(data, 'cancer'),
                  cardiovascular = unpack(data, 'cardiovascular'),
                  depression = unpack(data, 'depression'),
                  diabetes = unpack(data, 'diabetes'),
                  diarrhea = unpack(data, 'diarrhea'),
                  obesity = unpack(data, 'obesity'),
                  rehab = unpack(data, 'rehab'),
                  stroke = unpack(data, 'stroke'),
                  vaccine = unpack(data, 'vaccine');

            const traces = [
                { x: state, y: cancer, type: 'bar', marker: { color: '#448' }, name: 'Cancer' },
                { x: state, y: cardiovascular, type: 'bar', marker: { color: '#88C' }, name: 'Cardiovascular' },
                { x: state, y: depression, type: 'bar', marker: { color: '#CCF' }, name: 'Depression' },
                { x: state, y: diabetes, type: 'bar', marker: { color: '#080' }, name: 'Diabetes' },
                { x: state, y: diarrhea, type: 'bar', marker: { color: '#8c8' }, name: 'Diarrhea' },
                { x: state, y: obesity, type: 'bar', marker: { color: '#CFC' }, name: 'Obesity' },
                { x: state, y: rehab, type: 'bar', marker: { color: '#880' }, name: 'Rehab' },
                { x: state, y: stroke, type: 'bar', marker: { color: '#CC8' }, name: 'Stroke' },
                { x: state, y: vaccine, type: 'bar', marker: { color: '#FFC' }, name: 'Vaccine' }
            ];

            const layout = {
                width: null,
                height: 500,
                barmode: 'group',
                bargap: 0.15,
                bargroupgap: 0.1,
                xaxis: {
                    title: 'States',
                    showgrid: false,
                    zeroline: false,
                    tickangle: -45
                },
                yaxis: {
                    title: 'Searches',
                    showline: false
                },
                plot_bgcolor: 'rgba(0,0,0,0)',
                paper_bgcolor: 'rgba(0,0,0,0)',
                margin: { t: 60, r: 40, b: 120, l: 60 },
                legend: {
                    orientation: 'h',
                    y: -0.4,
                    x: 0.5,
                    xanchor: 'center'
                },
                autosize: true
            };

            Plotly.newPlot('bar-chart', traces, layout, this.getChartConfig());
            this.hideLoading('bar-chart');
        });
    }

    async loadRadarCharts() {
        // Radar Chart 1
        const healthData = [{
            type: 'scatterpolar',
            r: [179192, 94220, 137010, 167778, 150355, 121874, 137974, 155732, 143489],
            theta: ["Cancer", "Cardiovascular", "Depression", "Diabetes", "Diarrhea", "Obesity", "Rehab", "Stroke", "Vaccine"],
            fill: 'toself',
            line: { color: '#2E86AB' },
            fillcolor: 'rgba(46, 134, 171, 0.3)'
        }];

        const healthLayout = {
            width: null,
            height: 500,
            polar: {
                radialaxis: {
                    visible: true,
                    range: [0, 179192]
                }
            },
            showlegend: false,
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 60, r: 40, b: 80, l: 60 },
            autosize: true
        };

        Plotly.newPlot("radarmyDiv", healthData, healthLayout, this.getChartConfig());
        this.hideLoading('radarmyDiv');

        // Radar Chart 2
        const deathData = [{
            type: 'scatterpolar',
            r: [571, 357.3, 568.3, 308.5, 2574, 229.9, 2282.4, 196.8, 589.5, 171],
            theta: ["Accidents", "Alzheimer ", "Cerebrovascular", "Diabetes", "Diseases of heart", "Influenza and Pneumonia", "Malignant Neoplasms(Tumor)", "Nephrosis ", "Respiratory", "Suicide"],
            fill: 'toself',
            line: { color: '#F18F01' },
            fillcolor: 'rgba(241, 143, 1, 0.3)'
        }];

        const deathLayout = {
            width: null,
            height: 500,
            polar: {
                radialaxis: {
                    visible: true,
                    range: [-2000, 2874]
                }
            },
            showlegend: false,
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 60, r: 40, b: 80, l: 60 },
            autosize: true
        };

        Plotly.newPlot("radarmyDiv2", deathData, deathLayout, this.getChartConfig());
        this.hideLoading('radarmyDiv2');
    }

    async loadLeadingCausesOfDeath() {
        Plotly.d3.json('/casesleadingdeath', (rows) => {
            const unpack = (rows, key) => rows.map(row => row[key]);
            const data = rows.data;

            const year = unpack(data, 'year'),
                  accidents = unpack(data, "Accidents"),
                  alzheimer = unpack(data, "Alzheimer"),
                  cerebrovascular = unpack(data, "Cerebrovascular"),
                  ddiabetes = unpack(data, "Diabetes"),
                  heart = unpack(data, "Diseases_of_heart"),
                  influenza = unpack(data, "Influenza_and_pneumonia"),
                  malignant = unpack(data, "Malignant_neoplasms"),
                  nephrosis = unpack(data, "Nephrosis"),
                  respiratory = unpack(data, "Respiratory"),
                  suicide = unpack(data, "Suicide");

            const traces = [
                { x: year, y: accidents, name: 'Accidents', type: 'scatter', line: { shape: 'spline', smoothing: 0.5, color: '#D32F2F' } },
                { x: year, y: alzheimer, name: 'Alzheimer', type: 'scatter', line: { shape: 'spline', smoothing: 0.5, color: '#1976D2' } },
                { x: year, y: cerebrovascular, name: 'Cerebrovascular', type: 'scatter', line: { shape: 'spline', smoothing: 0.5, color: '#7B1FA2' } },
                { x: year, y: ddiabetes, name: 'Diabetes', type: 'scatter', line: { shape: 'spline', smoothing: 0.5, color: '#F57C00' } },
                { x: year, y: heart, name: 'Diseases of Heart', type: 'scatter', line: { shape: 'spline', smoothing: 0.5, color: '#E65100' } },
                { x: year, y: influenza, name: 'Influenza and Pneumonia', type: 'scatter', line: { shape: 'spline', smoothing: 0.5, color: '#00796B' } },
                { x: year, y: malignant, name: 'Malignant Neoplasms', type: 'scatter', line: { shape: 'spline', smoothing: 0.5, color: '#5D4037' } },
                { x: year, y: nephrosis, name: 'Nephrosis', type: 'scatter', line: { shape: 'spline', smoothing: 0.5, color: '#455A64' } },
                { x: year, y: respiratory, name: 'Respiratory', type: 'scatter', line: { shape: 'spline', smoothing: 0.5, color: '#F57C00' } },
                { x: year, y: suicide, name: 'Suicide', type: 'scatter', line: { shape: 'spline', smoothing: 0.5, color: '#616161' } }
            ];

            const layout = {
                width: null,
                height: 500,
                xaxis: {
                    title: 'Years',
                    showgrid: false,
                    zeroline: false
                },
                yaxis: {
                    title: 'Sum of number of death per 100,000',
                    showline: false
                },
                plot_bgcolor: 'rgba(0,0,0,0)',
                paper_bgcolor: 'rgba(0,0,0,0)',
                margin: { t: 60, r: 40, b: 100, l: 60 },
                hovermode: 'closest',
                legend: {
                    orientation: 'h',
                    y: -0.4,
                    x: 0.5,
                    xanchor: 'center'
                },
                autosize: true
            };

            Plotly.newPlot('line-chart3', traces, layout, this.getChartConfig());
            this.hideLoading('line-chart3');
        });
    }

    // Download functionality
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
                filename: 'health_analytics_chart',
                height: 500,
                width: 800,
                scale: 2
            }
        };
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
            const response = await fetch(endpoint);
            const data = await response.json();
            
            const cleanName = this.cleanFileName(chartName);
            this.convertToCSVAndDownload(data.data, cleanName);
        } catch (error) {
            console.error('Error downloading CSV:', error);
            alert('Error downloading CSV data. Please try again.');
        }
    }

    convertToCSVAndDownload(data, filename) {
        if (!data || data.length === 0) {
            alert('No data available to download.');
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
    }
}

// Add CSS for styling
const dashboardStyles = `
    .chart-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        color: #6c757d;
    }
    
    .chart-download-container {
        text-align: center;
        margin-top: 1rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #dee2e6;
    }
    
    .download-buttons-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
    }
    
    .download-chart-btn, .download-csv-btn {
        font-size: 0.875rem;
        padding: 0.5rem 1rem;
        min-width: 140px;
    }
    
    .plot-container .plot {
        border-radius: 8px;
        margin-bottom: 0;
        width: 100%;
        overflow: hidden;
    }
    
    /* Stats overview - fixed positioning */
    .stats-overview-container {
        display: flex;
        justify-content: center;
        align-items: stretch;
        flex-wrap: wrap;
        margin: 2rem 0 3rem 0;
    }
    
    .stat-card {
        background: linear-gradient(135deg, #2c3e50, #3498db);
        color: white;
        padding: 1.5rem 1rem;
        border-radius: 10px;
        margin: 0.5rem;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        min-height: 120px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        transition: transform 0.3s ease;
        flex: 1;
        min-width: 180px;
        max-width: 240px;
    }
    
    .stat-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    }
    
    .stat-card h3 {
        font-size: 2.2rem;
        font-weight: bold;
        color: white;
        margin-bottom: 0.5rem;
        line-height: 1;
    }
    
    .stat-card p {
        color: rgba(255,255,255,0.9);
        margin: 0;
        font-size: 0.9rem;
        line-height: 1.2;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    /* Chart frame styling */
    .chart-frame {
        background: white;
        border-radius: 10px;
        padding: 1.5rem;
        margin-bottom: 2rem;
        box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        border: 1px solid #eaeaea;
    }
    
    .chart-frame h2, .chart-frame h3 {
        color: #2c3e50;
        margin-bottom: 1.5rem;
        text-align: center;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .stat-card {
            min-width: 140px;
            padding: 1rem 0.5rem;
        }
        
        .stat-card h3 {
            font-size: 1.8rem;
        }
        
        .download-buttons-wrapper {
            flex-direction: column;
        }
        
        .download-chart-btn, .download-csv-btn {
            width: 100%;
            margin-bottom: 0.5rem;
        }
        
        .stats-overview-container {
            justify-content: space-around;
        }
    }
    
    @media (max-width: 576px) {
        .stat-card {
            min-width: 45%;
            margin: 0.25rem;
        }
        
        .stat-card h3 {
            font-size: 1.6rem;
        }
        
        .stat-card p {
            font-size: 0.8rem;
        }
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = dashboardStyles;
document.head.appendChild(styleSheet);

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.healthDashboard = new HealthDashboard();
});