// Enhanced Health Search Trends Dashboard - FIXED VERSION

class HealthDashboard {
    constructor() {
        this.charts = {};
        this.currentFilters = {
            yearRange: [2004, 2017],
            conditions: [],
            states: []
        };
        
        // Professional Color Palette
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
            }
        };
        
        // Standard Font Settings for Visibility
        this.fonts = {
            title: { size: 20, family: 'Segoe UI, -apple-system, BlinkMacSystemFont, sans-serif', weight: 'bold' },
            axisTitle: { size: 16, family: 'Segoe UI, sans-serif', weight: '600' },
            axisLabels: { size: 16, family: 'Segoe UI, sans-serif' },
            legend: { size: 16, family: 'Segoe UI, sans-serif' },
            tickLabels: { size: 16, family: 'Segoe UI, sans-serif' }
        };
        
        this.init();
    }

    init() {
        console.log('🚀 Initializing Health Analytics Dashboard...');
        this.applyProfessionalTheme();
        this.loadAllCharts();
        this.setupEventListeners();
        this.setupDownloadButtons();
    }

    applyProfessionalTheme() {
        // Apply professional styling to chart frames
        document.querySelectorAll('.chart-frame').forEach(frame => {
            frame.style.background = '#ffffff';
            frame.style.border = 'none';
            frame.style.borderRadius = '8px';
            frame.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            frame.style.padding = '20px';
            frame.style.marginBottom = '25px';
        });
        
        // Style chart titles
        document.querySelectorAll('.chart-frame h2').forEach(title => {
            title.style.color = '#1a237e';
            title.style.fontSize = '20px';
            title.style.fontWeight = '700';
            title.style.borderBottom = '2px solid #1565c0';
            title.style.paddingBottom = '10px';
            title.style.marginBottom = '20px';
        });
        
        // Style download buttons
        document.querySelectorAll('.download-chart-btn, .download-csv-btn').forEach(btn => {
            btn.style.fontSize = '14px';
            btn.style.fontWeight = '600';
            btn.style.padding = '8px 20px';
            btn.style.borderRadius = '4px';
            btn.style.transition = 'all 0.3s ease';
        });
        
        // Style stat cards
        document.querySelectorAll('.stat-card').forEach(card => {
            card.style.background = 'linear-gradient(135deg, #1a237e, #0d47a1)';
            card.style.color = 'white';
            card.style.borderRadius = '10px';
            card.style.boxShadow = '0 4px 8px rgba(26, 35, 126, 0.2)';
            card.querySelector('h3').style.fontSize = '28px';
            card.querySelector('h3').style.fontWeight = '800';
            card.querySelector('p').style.fontSize = '14px';
            card.querySelector('p').style.fontWeight = '500';
        });
    }

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
            button.addEventListener('click', async (e) => {
                const endpoint = e.target.dataset.endpoint;
                const chartName = e.target.dataset.chartName || 'Health_Data';
                if (endpoint) {
                    await this.downloadCSV(endpoint, chartName);
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

    async loadTotalSearchesByYear() {
        Plotly.d3.json('/searchbyyear', (rows) => {
            const unpack = (rows, key) => rows.map(row => row[key]);
            const data = rows.data;

            const allyear = unpack(data, 'year'),
                  allsearches = unpack(data, 'searches');
            
            const totalvolume = {
                x: allyear,
                y: allsearches,
                name: 'Total Search Volume',
                fill: 'tonexty',
                type: 'scatter',
                mode: 'lines',
                line: {
                    color: '#1a237e',
                    width: 3,
                    shape: 'spline'
                },
                fillcolor: 'rgba(26, 35, 126, 0.1)'
            };

            const layout = {
                width: null,
                height: 500,
                xaxis: {
                    title: {
                        text: 'Year',
                        font: {
                            size: this.fonts.axisTitle.size,
                            family: this.fonts.axisTitle.family,
                            color: this.colors.primary.slate,
                            weight: this.fonts.axisTitle.weight
                        }
                    },
                    showgrid: true,
                    gridcolor: 'rgba(0, 0, 0, 0.1)',
                    gridwidth: 1,
                    showline: true,
                    linecolor: '#b0bec5',
                    linewidth: 1,
                    tickfont: {
                        size: this.fonts.tickLabels.size,
                        family: this.fonts.tickLabels.family,
                        color: this.colors.primary.slate
                    },
                    automargin: true,
                    tickmode: 'linear',
                    tick0: 2004,
                    dtick: 1
                },
                yaxis: {
                    title: {
                        text: 'Search Volume',
                        font: {
                            size: this.fonts.axisTitle.size,
                            family: this.fonts.axisTitle.family,
                            color: this.colors.primary.slate,
                            weight: this.fonts.axisTitle.weight
                        }
                    },
                    showgrid: true,
                    gridcolor: 'rgba(0, 0, 0, 0.1)',
                    gridwidth: 1,
                    showline: true,
                    linecolor: '#b0bec5',
                    linewidth: 1,
                    tickformat: ',',
                    tickfont: {
                        size: this.fonts.tickLabels.size,
                        family: this.fonts.tickLabels.family,
                        color: this.colors.primary.slate
                    },
                    automargin: true
                },
                plot_bgcolor: '#ffffff',
                paper_bgcolor: '#ffffff',
                margin: { t: 0, r: 0, b: 0, l: 0 },
                hovermode: 'closest',
                autosize: true,
                font: {
                    family: this.fonts.title.family,
                    color: this.colors.primary.slate
                }
            };

            Plotly.newPlot('line-chart', [totalvolume], layout, this.getChartConfig());
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
                { x: allyear, y: cancer, name: 'Cancer', type: 'scatter', mode: 'lines',
                  line: { shape: 'spline', smoothing: 0.5, width: 2, color: this.colors.conditions.cancer } },
                { x: allyear, y: cardiovascular, name: 'Cardiovascular', type: 'scatter', mode: 'lines',
                  line: { shape: 'spline', smoothing: 0.5, width: 2, color: this.colors.conditions.cardiovascular } },
                { x: allyear, y: depression, name: 'Depression', type: 'scatter', mode: 'lines',
                  line: { shape: 'spline', smoothing: 0.5, width: 2, color: this.colors.conditions.depression } },
                { x: allyear, y: diabetes, name: 'Diabetes', type: 'scatter', mode: 'lines',
                  line: { shape: 'spline', smoothing: 0.5, width: 2, color: this.colors.conditions.diabetes } },
                { x: allyear, y: diarrhea, name: 'Diarrhea', type: 'scatter', mode: 'lines',
                  line: { shape: 'spline', smoothing: 0.5, width: 2, color: this.colors.conditions.diarrhea } },
                { x: allyear, y: obesity, name: 'Obesity', type: 'scatter', mode: 'lines',
                  line: { shape: 'spline', smoothing: 0.5, width: 2, color: this.colors.conditions.obesity } },
                { x: allyear, y: rehab, name: 'Rehab', type: 'scatter', mode: 'lines',
                  line: { shape: 'spline', smoothing: 0.5, width: 2, color: this.colors.conditions.rehab } },
                { x: allyear, y: stroke, name: 'Stroke', type: 'scatter', mode: 'lines',
                  line: { shape: 'spline', smoothing: 0.5, width: 2, color: this.colors.conditions.stroke } },
                { x: allyear, y: vaccine, name: 'Vaccine', type: 'scatter', mode: 'lines',
                  line: { shape: 'spline', smoothing: 0.5, width: 2, color: this.colors.conditions.vaccine } }
            ];

            const layout = {
                width: null,
                height: 500,
                xaxis: {
                    title: {
                        text: 'Year',
                        font: {
                            size: this.fonts.axisTitle.size,
                            family: this.fonts.axisTitle.family,
                            color: this.colors.primary.slate,
                            weight: this.fonts.axisTitle.weight
                        }
                    },
                    showgrid: true,
                    gridcolor: 'rgba(0, 0, 0, 0.1)',
                    gridwidth: 1,
                    showline: true,
                    linecolor: '#b0bec5',
                    linewidth: 1,
                    tickfont: {
                        size: this.fonts.tickLabels.size,
                        family: this.fonts.tickLabels.family,
                        color: this.colors.primary.slate
                    },
                    automargin: true,
                    tickmode: 'linear',
                    tick0: 2004,
                    dtick: 1
                },
                yaxis: {
                    title: {
                        text: 'Search Volume',
                        font: {
                            size: this.fonts.axisTitle.size,
                            family: this.fonts.axisTitle.family,
                            color: this.colors.primary.slate,
                            weight: this.fonts.axisTitle.weight
                        }
                    },
                    showgrid: true,
                    gridcolor: 'rgba(0, 0, 0, 0.1)',
                    gridwidth: 1,
                    showline: true,
                    linecolor: '#b0bec5',
                    linewidth: 1,
                    tickformat: ',',
                    tickfont: {
                        size: this.fonts.tickLabels.size,
                        family: this.fonts.tickLabels.family,
                        color: this.colors.primary.slate
                    },
                    automargin: true
                },
                plot_bgcolor: '#ffffff',
                paper_bgcolor: '#ffffff',
                margin: { t: 0, r: 0, b: 0, l: 0 },
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
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    bordercolor: '#b0bec5',
                    borderwidth: 1
                },
                autosize: true,
                font: {
                    family: this.fonts.title.family,
                    color: this.colors.primary.slate
                }
            };

            Plotly.newPlot('line-chart2', traces, layout, this.getChartConfig());
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
                title: {
                    text: 'Correlation',
                    font: {
                        size: 12,
                        family: this.fonts.title.family,
                        color: this.colors.primary.slate
                    }
                },
                titleside: 'right',
                x: 1.05,
                xanchor: 'left',
                y: 0.5,
                yanchor: 'middle',
                thickness: 15,
                len: 0.8,
                tickfont: {
                    size: 10,
                    family: this.fonts.tickLabels.family,
                    color: this.colors.primary.slate
                }
            }
        }];

        const layout = {
            width: null,
            height: 500,
            plot_bgcolor: '#ffffff',
            paper_bgcolor: '#ffffff',
            margin: { t: 0, r: 0, b: 0, l: 0 },
            xaxis: {
                title: {
                    text: 'Health Conditions',
                    font: {
                        size: this.fonts.axisTitle.size,
                        family: this.fonts.axisTitle.family,
                        color: this.colors.primary.slate,
                        weight: this.fonts.axisTitle.weight
                    }
                },
                tickangle: -45,
                tickfont: {
                    size: this.fonts.tickLabels.size,
                    family: this.fonts.tickLabels.family,
                    color: this.colors.primary.slate
                },
                automargin: true
            },
            yaxis: {
                title: {
                    text: 'Health Conditions',
                    font: {
                        size: this.fonts.axisTitle.size,
                        family: this.fonts.axisTitle.family,
                        color: this.colors.primary.slate,
                        weight: this.fonts.axisTitle.weight
                    }
                },
                autorange: 'reversed',
                tickfont: {
                    size: this.fonts.tickLabels.size,
                    family: this.fonts.tickLabels.family,
                    color: this.colors.primary.slate
                },
                automargin: true
            },
            font: {
                family: this.fonts.title.family,
                color: this.colors.primary.slate
            },
            autosize: true
        };

        Plotly.newPlot('myDiv', data, layout, this.getChartConfig());
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
                { y: cancer, type: 'box', name: 'Cancer', boxpoints: 'outliers', 
                  marker: { color: this.colors.conditions.cancer, size: 4 }, 
                  line: { width: 2, color: this.colors.conditions.cancer } },
                { y: cardiovascular, type: 'box', name: 'Cardiovascular', boxpoints: 'outliers', 
                  marker: { color: this.colors.conditions.cardiovascular, size: 4 }, 
                  line: { width: 2, color: this.colors.conditions.cardiovascular } },
                { y: depression, type: 'box', name: 'Depression', boxpoints: 'outliers', 
                  marker: { color: this.colors.conditions.depression, size: 4 }, 
                  line: { width: 2, color: this.colors.conditions.depression } },
                { y: diabetes, type: 'box', name: 'Diabetes', boxpoints: 'outliers', 
                  marker: { color: this.colors.conditions.diabetes, size: 4 }, 
                  line: { width: 2, color: this.colors.conditions.diabetes } },
                { y: diarrhea, type: 'box', name: 'Diarrhea', boxpoints: 'outliers', 
                  marker: { color: this.colors.conditions.diarrhea, size: 4 }, 
                  line: { width: 2, color: this.colors.conditions.diarrhea } },
                { y: obesity, type: 'box', name: 'Obesity', boxpoints: 'outliers', 
                  marker: { color: this.colors.conditions.obesity, size: 4 }, 
                  line: { width: 2, color: this.colors.conditions.obesity } },
                { y: rehab, type: 'box', name: 'Rehab', boxpoints: 'outliers', 
                  marker: { color: this.colors.conditions.rehab, size: 4 }, 
                  line: { width: 2, color: this.colors.conditions.rehab } },
                { y: stroke, type: 'box', name: 'Stroke', boxpoints: 'outliers', 
                  marker: { color: this.colors.conditions.stroke, size: 4 }, 
                  line: { width: 2, color: this.colors.conditions.stroke } },
                { y: vaccine, type: 'box', name: 'Vaccine', boxpoints: 'outliers', 
                  marker: { color: this.colors.conditions.vaccine, size: 4 }, 
                  line: { width: 2, color: this.colors.conditions.vaccine } }
            ];

            const layout = {
                width: null,
                height: 500,
                title: {
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
                xaxis: {
                    title: {
                        text: 'Health Conditions',
                        font: {
                            size: this.fonts.axisTitle.size,
                            family: this.fonts.axisTitle.family,
                            color: this.colors.primary.slate,
                            weight: this.fonts.axisTitle.weight
                        }
                    },
                    showgrid: true,
                    gridcolor: 'rgba(0, 0, 0, 0.1)',
                    gridwidth: 1,
                    showline: true,
                    linecolor: '#b0bec5',
                    linewidth: 1,
                    tickfont: {
                        size: this.fonts.tickLabels.size,
                        family: this.fonts.tickLabels.family,
                        color: this.colors.primary.slate
                    },
                    automargin: true
                },
                yaxis: {
                    title: {
                        text: 'Search Volume',
                        font: {
                            size: this.fonts.axisTitle.size,
                            family: this.fonts.axisTitle.family,
                            color: this.colors.primary.slate,
                            weight: this.fonts.axisTitle.weight
                        }
                    },
                    showgrid: true,
                    gridcolor: 'rgba(0, 0, 0, 0.1)',
                    gridwidth: 1,
                    showline: true,
                    linecolor: '#b0bec5',
                    linewidth: 1,
                    tickformat: ',',
                    tickfont: {
                        size: this.fonts.tickLabels.size,
                        family: this.fonts.tickLabels.family,
                        color: this.colors.primary.slate
                    },
                    automargin: true
                },
                plot_bgcolor: '#ffffff',
                paper_bgcolor: '#ffffff',
                margin: { t: 0, r: 0, b: 0, l: 0 },
                showlegend: false,
                autosize: true,
                font: {
                    family: this.fonts.title.family,
                    color: this.colors.primary.slate
                }
            };

            Plotly.newPlot('boxDiv', traces, layout, this.getChartConfig());
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
                name: "Search Volume",
                geojson: "https://raw.githubusercontent.com/python-visualization/folium/master/examples/data/us-states.json",
                locations: state,
                z: searches,
                zmin: 2555,
                zmax: 98134,
                colorbar: { 
                    y: 0.5,
                    yanchor: "middle",
                    len: 0.8,
                    x: 1.05,
                    xanchor: "left",
                    orientation: "v",
                    title: { 
                        text: "Search Volume", 
                        side: "right",
                        font: {
                            size: 12,
                            family: this.fonts.title.family,
                            color: '#ffffff'
                        }
                    },
                    thickness: 20,
                    outlinewidth: 1,
                    outlinecolor: '#ffffff',
                    tickfont: {
                        size: 10,
                        family: this.fonts.tickLabels.family,
                        color: '#ffffff'
                    },
                    tickformat: ','
                },
                colorscale: [
                    [0, '#131f0c'],
                    [0.2, '#2d4d1e'],
                    [0.4, '#467c2f'],
                    [0.6, '#5fab40'],
                    [0.8, '#78da51'],
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
    
                margin: { t: 0, b: 0, l: 0, r: 0 },
                plot_bgcolor: '#000000',
                paper_bgcolor: '#000000',
                autosize: true,
                font: {
                    family: this.fonts.title.family,
                    color: '#ffffff'
                }
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
                { x: state, y: cancer, type: 'bar', marker: { color: this.colors.conditions.cancer }, name: 'Cancer' },
                { x: state, y: cardiovascular, type: 'bar', marker: { color: this.colors.conditions.cardiovascular }, name: 'Cardiovascular' },
                { x: state, y: depression, type: 'bar', marker: { color: this.colors.conditions.depression }, name: 'Depression' },
                { x: state, y: diabetes, type: 'bar', marker: { color: this.colors.conditions.diabetes }, name: 'Diabetes' },
                { x: state, y: diarrhea, type: 'bar', marker: { color: this.colors.conditions.diarrhea }, name: 'Diarrhea' },
                { x: state, y: obesity, type: 'bar', marker: { color: this.colors.conditions.obesity }, name: 'Obesity' },
                { x: state, y: rehab, type: 'bar', marker: { color: this.colors.conditions.rehab }, name: 'Rehab' },
                { x: state, y: stroke, type: 'bar', marker: { color: this.colors.conditions.stroke }, name: 'Stroke' },
                { x: state, y: vaccine, type: 'bar', marker: { color: this.colors.conditions.vaccine }, name: 'Vaccine' }
            ];

            const layout = {
                width: null,
                height: 500,
                barmode: 'group',
                bargap: 0.15,
                bargroupgap: 0.1,
                xaxis: {
                    title: {
                        text: 'States',
                        font: {
                            size: this.fonts.axisTitle.size,
                            family: this.fonts.axisTitle.family,
                            color: this.colors.primary.slate,
                            weight: this.fonts.axisTitle.weight
                        }
                    },
                    showgrid: true,
                    gridcolor: 'rgba(0, 0, 0, 0.1)',
                    gridwidth: 1,
                    showline: true,
                    linecolor: '#b0bec5',
                    linewidth: 1,
                    tickangle: -45,
                    tickfont: {
                        size: this.fonts.tickLabels.size,
                        family: this.fonts.tickLabels.family,
                        color: this.colors.primary.slate
                    },
                    automargin: true
                },
                yaxis: {
                    title: {
                        text: 'Search Volume',
                        font: {
                            size: this.fonts.axisTitle.size,
                            family: this.fonts.axisTitle.family,
                            color: this.colors.primary.slate,
                            weight: this.fonts.axisTitle.weight
                        }
                    },
                    showgrid: true,
                    gridcolor: 'rgba(0, 0, 0, 0.1)',
                    gridwidth: 1,
                    showline: true,
                    linecolor: '#b0bec5',
                    linewidth: 1,
                    tickformat: ',',
                    tickfont: {
                        size: this.fonts.tickLabels.size,
                        family: this.fonts.tickLabels.family,
                        color: this.colors.primary.slate
                    },
                    automargin: true
                },
                plot_bgcolor: '#ffffff',
                paper_bgcolor: '#ffffff',
                margin: { t: 0, r: 0, b: 0, l: 0 },
                legend: {
                    orientation: 'h',
                    y: -0.35,
                    x: 0.5,
                    xanchor: 'center',
                    font: {
                        size: this.fonts.legend.size,
                        family: this.fonts.legend.family,
                        color: this.colors.primary.slate
                    },
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    bordercolor: '#b0bec5',
                    borderwidth: 1
                },
                autosize: true,
                font: {
                    family: this.fonts.title.family,
                    color: this.colors.primary.slate
                }
            };

            Plotly.newPlot('bar-chart', traces, layout, this.getChartConfig());
        });
    }
async loadRadarCharts() {
    // Radar Chart 1 - Health Search Volume
    const healthData = [{
        type: 'scatterpolar',
        r: [179192, 94220, 167778, 143489, 137974, 155732, 137010, 150355, 121874],
        theta: ["Cancer", "Cardiovascular", "Diabetes", "Vaccine", "Rehab", "Stroke", "Depression", "Diarrhea", "Obesity"],
        fill: 'toself',
        line: { color: '#1a237e', width: 2 },
        fillcolor: 'rgba(26, 35, 126, 0.2)',
        name: 'Total Searches',
        hovertemplate: '%{theta}: %{r:,}<extra></extra>'
    }];

    const healthLayout = {
        width: null,
        height: 500,
        polar: {
            radialaxis: {
                visible: true,
                range: [0, 200000],
                tickfont: {
                    size: this.fonts.tickLabels.size,
                    family: this.fonts.tickLabels.family,
                    color: this.colors.primary.slate
                },
                gridcolor: 'rgba(0, 0, 0, 0.1)',
                linecolor: '#b0bec5',
                linewidth: 1,
                tickformat: ',d'  // Format numbers with commas
            },
            angularaxis: {
                tickfont: {
                    size: Math.max(10, this.fonts.tickLabels.size), // Ensure minimum font size
                    family: this.fonts.tickLabels.family,
                    color: this.colors.primary.slate
                },
                gridcolor: 'rgba(0, 0, 0, 0.1)',
                linecolor: '#b0bec5',
                linewidth: 1,
                layer: 'above traces', // Ensure labels are above the trace
                rotation: 90, // Rotate labels for better readability
                direction: 'clockwise'
            },
            bgcolor: '#ffffff',
            domain: {
                x: [0.1, 0.9], // Add padding on sides for labels
                y: [0.1, 0.9]
            }
        },
        showlegend: false,
        plot_bgcolor: '#ffffff',
        paper_bgcolor: '#ffffff',
        margin: { t: 40, r: 40, b: 40, l: 40 }, // Increased margins for labels
        autosize: true,
        font: {
            family: this.fonts.title.family,
            color: this.colors.primary.slate
        }
    };

    Plotly.newPlot("radarmyDiv", healthData, healthLayout, this.getChartConfig());

    // Radar Chart 2 - Leading Causes of Death
    const deathData = [{
        type: 'scatterpolar',
        r: [2574, 2282.4, 589.5, 568.3, 571, 357.3, 308.5, 229.9, 196.8, 171],
        theta: ["Diseases of Heart", "Malignant Neoplasms", "Respiratory", "Cerebrovascular", "Accidents", "Alzheimer", "Diabetes", "Influenza/Pneumonia", "Nephrosis", "Suicide"],
        fill: 'toself',
        line: { color: '#c62828', width: 2 },
        fillcolor: 'rgba(198, 40, 40, 0.2)',
        name: 'Deaths per 100,000',
        hovertemplate: '%{theta}: %{r:,.1f}<extra></extra>'
    }];

    const deathLayout = {
        width: null,
        height: 500,
        polar: {
            radialaxis: {
                visible: true,
                range: [0, 3000],
                tickfont: {
                    size: this.fonts.tickLabels.size,
                    family: this.fonts.tickLabels.family,
                    color: this.colors.primary.slate
                },
                gridcolor: 'rgba(0, 0, 0, 0.1)',
                linecolor: '#b0bec5',
                linewidth: 1,
                tickformat: ',d'
            },
            angularaxis: {
                tickfont: {
                    size: Math.max(10, this.fonts.tickLabels.size), // Ensure minimum font size
                    family: this.fonts.tickLabels.family,
                    color: this.colors.primary.slate
                },
                gridcolor: 'rgba(0, 0, 0, 0.1)',
                linecolor: '#b0bec5',
                linewidth: 1,
                layer: 'above traces', // Ensure labels are above the trace
                rotation: 90, // Rotate labels for better readability
                direction: 'clockwise'
            },
            bgcolor: '#ffffff',
            domain: {
                x: [0.1, 0.9], // Add padding on sides for labels
                y: [0.1, 0.9]
            }
        },
        showlegend: false,
        plot_bgcolor: '#ffffff',
        paper_bgcolor: '#ffffff',
        margin: { t: 40, r: 40, b: 40, l: 40 }, // Increased margins for labels
        autosize: true,
        font: {
            family: this.fonts.title.family,
            color: this.colors.primary.slate
        }
    };

    Plotly.newPlot("radarmyDiv2", deathData, deathLayout, this.getChartConfig());
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
                { x: year, y: heart, name: 'Heart Disease', type: 'scatter', mode: 'lines',
                  line: { shape: 'spline', smoothing: 0.5, width: 2, color: '#c62828' } },
                { x: year, y: malignant, name: 'Cancer', type: 'scatter', mode: 'lines',
                  line: { shape: 'spline', smoothing: 0.5, width: 2, color: '#1a237e' } },
                { x: year, y: respiratory, name: 'Respiratory', type: 'scatter', mode: 'lines',
                  line: { shape: 'spline', smoothing: 0.5, width: 2, color: '#1565c0' } },
                { x: year, y: cerebrovascular, name: 'Stroke', type: 'scatter', mode: 'lines',
                  line: { shape: 'spline', smoothing: 0.5, width: 2, color: '#00695c' } },
                { x: year, y: accidents, name: 'Accidents', type: 'scatter', mode: 'lines',
                  line: { shape: 'spline', smoothing: 0.5, width: 2, color: '#ff8f00' } },
                { x: year, y: alzheimer, name: 'Alzheimer', type: 'scatter', mode: 'lines',
                  line: { shape: 'spline', smoothing: 0.5, width: 2, color: '#37474f' } },
                { x: year, y: ddiabetes, name: 'Diabetes', type: 'scatter', mode: 'lines',
                  line: { shape: 'spline', smoothing: 0.5, width: 2, color: '#2e7d32' } },
                { x: year, y: influenza, name: 'Influenza/Pneumonia', type: 'scatter', mode: 'lines',
                  line: { shape: 'spline', smoothing: 0.5, width: 2, color: '#42a5f5' } },
                { x: year, y: nephrosis, name: 'Kidney Disease', type: 'scatter', mode: 'lines',
                  line: { shape: 'spline', smoothing: 0.5, width: 2, color: '#263238' } },
                { x: year, y: suicide, name: 'Suicide', type: 'scatter', mode: 'lines',
                  line: { shape: 'spline', smoothing: 0.5, width: 2, color: '#424242' } }
            ];

            const layout = {
                width: null,
                height: 500,
                xaxis: {
                    title: {
                        text: 'Year',
                        font: {
                            size: this.fonts.axisTitle.size,
                            family: this.fonts.axisTitle.family,
                            color: this.colors.primary.slate,
                            weight: this.fonts.axisTitle.weight
                        }
                    },
                    showgrid: true,
                    gridcolor: 'rgba(0, 0, 0, 0.1)',
                    gridwidth: 1,
                    showline: true,
                    linecolor: '#b0bec5',
                    linewidth: 1,
                    tickfont: {
                        size: this.fonts.tickLabels.size,
                        family: this.fonts.tickLabels.family,
                        color: this.colors.primary.slate
                    },
                    automargin: true,
                    tickmode: 'linear',
                    tick0: 2004,
                    dtick: 1
                },
                yaxis: {
                    title: {
                        text: 'Deaths per 100,000 Population',
                        font: {
                            size: this.fonts.axisTitle.size,
                            family: this.fonts.axisTitle.family,
                            color: this.colors.primary.slate,
                            weight: this.fonts.axisTitle.weight
                        }
                    },
                    showgrid: true,
                    gridcolor: 'rgba(0, 0, 0, 0.1)',
                    gridwidth: 1,
                    showline: true,
                    linecolor: '#b0bec5',
                    linewidth: 1,
                    tickformat: ',',
                    tickfont: {
                        size: this.fonts.tickLabels.size,
                        family: this.fonts.tickLabels.family,
                        color: this.colors.primary.slate
                    },
                    automargin: true
                },
                plot_bgcolor: '#ffffff',
                paper_bgcolor: '#ffffff',
                margin: { t: 0, r: 0, b: 0, l: 0 },
                hovermode: 'closest',
                legend: {
                    orientation: 'h',
                    y: -0.35,
                    x: 0.5,
                    xanchor: 'center',
                    font: {
                        size: this.fonts.legend.size,
                        family: this.fonts.legend.family,
                        color: this.colors.primary.slate
                    },
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    bordercolor: '#b0bec5',
                    borderwidth: 1
                },
                autosize: true,
                font: {
                    family: this.fonts.title.family,
                    color: this.colors.primary.slate
                }
            };

            Plotly.newPlot('line-chart3', traces, layout, this.getChartConfig());
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

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.healthDashboard = new HealthDashboard();
});