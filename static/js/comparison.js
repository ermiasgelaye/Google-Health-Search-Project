// Enhanced Comparison Dashboard with Stats and Download Functionality

class ComparisonDashboard {
    constructor() {
        this.currentCity = 'Abilene-Sweetwater';
        this.statsData = null;
        this.init();
    }

    init() {
        console.log('🚀 Initializing Comparison Dashboard...');
        this.addStatsOverview();
        this.loadData();
        this.setupDownloadButtons();
    }

    addStatsOverview() {
        const statsHTML = `
            <div class="container mt-4 mb-5">
                <h2 class="text-center mb-4">Comparison Insights</h2>
                <div class="stats-overview-container justify-content-center">
                    <div class="stat-card">
                        <h3>200+</h3>
                        <p>Cities Analyzed</p>
                    </div>
                    <div class="stat-card">
                        <h3>9</h3>
                        <p>Health Conditions</p>
                    </div>
                    <div class="stat-card">
                        <h3>14</h3>
                        <p>Years of Data</p>
                    </div>
                    <div class="stat-card">
                        <h3>4</h3>
                        <p>Strong Correlations</p>
                    </div>
                </div>
            </div>
        `;
        
        const jumbotron = document.querySelector('.jumbotron');
        if (jumbotron) {
            jumbotron.insertAdjacentHTML('afterend', statsHTML);
        }
    }

    setupDownloadButtons() {
        // Bar chart download
        document.querySelectorAll('.download-chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chartId = e.target.closest('.plot-container').querySelector('.plot').id;
                const chartName = e.target.dataset.chartName || 'Comparison_Chart';
                this.downloadChart(chartId, chartName);
            });
        });

        // CSV download
        document.querySelectorAll('.download-csv-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const endpoint = e.target.dataset.endpoint;
                const chartName = e.target.dataset.chartName || 'Comparison_Data';
                if (endpoint) {
                    this.downloadCSV(endpoint, chartName);
                }
            });
        });
    }

    downloadChart(chartId, chartName) {
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
            Plotly.downloadImage(chartId, {
                format: 'png',
                filename: cleanName,
                height: 500,
                width: 800,
                scale: 2
            });
        }
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

    loadData() {
        Plotly.d3.json('/allsearchrecord', (rows) => {
            this.statsData = rows.data;
            this.processData();
            this.setupCitySelector();
            this.setBarPlot(this.currentCity);
        });
    }

    processData() {
        // Process data for stats and visualizations
        if (!this.statsData) return;

        // Extract unique cities
        const cities = [...new Set(this.statsData.map(row => row.city))].sort();
        this.cityList = cities;
    }

    setupCitySelector() {
        const citySelector = document.querySelector('.citydata');
        if (citySelector && this.cityList) {
            // Clear existing options
            citySelector.innerHTML = '<option value="">Choose a city...</option>';
            
            // Add city options
            this.cityList.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                citySelector.appendChild(option);
            });

            // Set up change event
            citySelector.addEventListener('change', (e) => {
                this.currentCity = e.target.value;
                this.setBarPlot(this.currentCity);
            });
        }
    }

    setBarPlot(chosenCity) {
        if (!this.statsData) return;

        // Filter data for selected city
        const cityData = this.statsData.filter(row => row.city === chosenCity);
        
        if (cityData.length === 0) return;

        // Process city data
        const serched_years = cityData.map(row => row.year);
        const cancer_search = cityData.map(row => row.Cancer);
        const cardiovascular_search = cityData.map(row => row.cardiovascular);
        const depression_search = cityData.map(row => row.depression);
        const diabetes_search = cityData.map(row => row.diabetes);
        const diarrhea_search = cityData.map(row => row.diarrhea);
        const obesity_search = cityData.map(row => row.obesity);
        const rehab_search = cityData.map(row => row.rehab);
        const stroke_search = cityData.map(row => row.stroke);
        const vaccine_search = cityData.map(row => row.vaccine);
        const searched_state = cityData.map(row => row.postal);

        // Create traces
        const traces = [
            { x: serched_years, y: cancer_search, name: 'Cancer', type: 'bar', marker: { color: '#448' } },
            { x: serched_years, y: cardiovascular_search, name: 'Cardiovascular', type: 'bar', marker: { color: '#88C' } },
            { x: serched_years, y: depression_search, name: 'Depression', type: 'bar', marker: { color: '#CCF' } },
            { x: serched_years, y: diabetes_search, name: 'Diabetes', type: 'bar', marker: { color: '#080' } },
            { x: serched_years, y: diarrhea_search, name: 'Diarrhea', type: 'bar', marker: { color: '#8c8' } },
            { x: serched_years, y: obesity_search, name: 'Obesity', type: 'bar', marker: { color: '#CFC' } },
            { x: serched_years, y: rehab_search, name: 'Rehab', type: 'bar', marker: { color: '#880' } },
            { x: serched_years, y: stroke_search, name: 'Stroke', type: 'bar', marker: { color: '#CC8' } },
            { x: serched_years, y: vaccine_search, name: 'Vaccine', type: 'bar', marker: { color: '#FFC' } }
        ];

        const layout = {
            width: null,
            height: 500,
            title: `Health Search Trends in ${chosenCity}`,
            barmode: 'stack',
            xaxis: {
                title: 'Years',
                showgrid: false,
                zeroline: false
            },
            yaxis: {
                title: 'Search Volume',
                showline: false
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 60, r: 40, b: 80, l: 60 },
            hovermode: 'closest',
            legend: {
                orientation: 'h',
                y: -0.3,
                x: 0.5,
                xanchor: 'center'
            },
            autosize: true
        };

        Plotly.newPlot('comparison-1', traces, layout, this.getChartConfig());

        // Update scatter plots
        this.updateScatterPlots(cityData, serched_years);
        
        // Update map
        this.updateMap(searched_state[0]);
        
        // Update gauge
        this.updateGauge(cityData);
    }

    updateScatterPlots(cityData, years) {
        // Prepare data for scatter plots
        const diabetes_search = cityData.map(row => row.diabetes);
        const diarrhea_search = cityData.map(row => row.diarrhea);
        const depression_search = cityData.map(row => row.depression);
        const vaccine_search = cityData.map(row => row.vaccine);

        // Scatter plot 1: Diarrhea vs Diabetes
        const scatter1 = {
            x: diabetes_search,
            y: diarrhea_search,
            mode: 'markers',
            type: 'scatter',
            marker: { 
                size: 12,
                color: '#2E86AB',
                opacity: 0.7
            },
            name: 'Data Points',
            text: years.map(year => `Year: ${year}`)
        };

        const layout1 = {
            title: 'Diarrhea vs. Diabetes Correlation',
            xaxis: { title: 'Diabetes Searches' },
            yaxis: { title: 'Diarrhea Searches' },
            height: 400,
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 60, r: 40, b: 80, l: 60 }
        };

        Plotly.newPlot('scatter1', [scatter1], layout1, this.getChartConfig());

        // Scatter plot 2: Depression vs Diabetes
        const scatter2 = {
            x: diabetes_search,
            y: depression_search,
            mode: 'markers',
            type: 'scatter',
            marker: { 
                size: 12,
                color: '#E74C3C',
                opacity: 0.7
            },
            name: 'Data Points',
            text: years.map(year => `Year: ${year}`)
        };

        const layout2 = {
            title: 'Depression vs. Diabetes Correlation',
            xaxis: { title: 'Diabetes Searches' },
            yaxis: { title: 'Depression Searches' },
            height: 400,
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 60, r: 40, b: 80, l: 60 }
        };

        Plotly.newPlot('scatter2', [scatter2], layout2, this.getChartConfig());

        // Scatter plot 3: Vaccine vs Diabetes
        const scatter3 = {
            x: diabetes_search,
            y: vaccine_search,
            mode: 'markers',
            type: 'scatter',
            marker: { 
                size: 12,
                color: '#27AE60',
                opacity: 0.7
            },
            name: 'Data Points',
            text: years.map(year => `Year: ${year}`)
        };

        const layout3 = {
            title: 'Vaccine vs. Diabetes Correlation',
            xaxis: { title: 'Diabetes Searches' },
            yaxis: { title: 'Vaccine Searches' },
            height: 400,
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 60, r: 40, b: 80, l: 60 }
        };

        Plotly.newPlot('scatter3', [scatter3], layout3, this.getChartConfig());

        // Scatter plot 4: Depression vs Vaccine
        const scatter4 = {
            x: vaccine_search,
            y: depression_search,
            mode: 'markers',
            type: 'scatter',
            marker: { 
                size: 12,
                color: '#8E44AD',
                opacity: 0.7
            },
            name: 'Data Points',
            text: years.map(year => `Year: ${year}`)
        };

        const layout4 = {
            title: 'Depression vs. Vaccine Correlation',
            xaxis: { title: 'Vaccine Searches' },
            yaxis: { title: 'Depression Searches' },
            height: 400,
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 60, r: 40, b: 80, l: 60 }
        };

        Plotly.newPlot('scatter4', [scatter4], layout4, this.getChartConfig());
    }

    updateMap(stateCode) {
        const mapData = [{
            type: "choroplethmapbox",
            name: "Selected State",
            geojson: "https://raw.githubusercontent.com/python-visualization/folium/master/examples/data/us-states.json",
            locations: [stateCode],
            z: [100],
            zmin: 0,
            zmax: 100,
            colorbar: { 
                y: 0, 
                yanchor: "bottom", 
                title: { 
                    text: "Selected", 
                    side: "right" 
                } 
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
            displaylogo: false
        };

        Plotly.newPlot('IntermapDiv', mapData, layout, config);
    }

    updateGauge(cityData) {
        // Calculate percentages
        const totalSearches = cityData.reduce((sum, row) => {
            return sum + (
                row.Cancer + row.cardiovascular + row.depression + 
                row.diabetes + row.diarrhea + row.obesity + 
                row.rehab + row.stroke + row.vaccine
            );
        }, 0);

        const diabetesSearches = cityData.reduce((sum, row) => sum + row.diabetes, 0);
        const depressionSearches = cityData.reduce((sum, row) => sum + row.depression, 0);
        const diarrheaSearches = cityData.reduce((sum, row) => sum + row.diarrhea, 0);

        const diabetesPercent = totalSearches > 0 ? (diabetesSearches / totalSearches * 100).toFixed(1) : 0;
        const depressionPercent = totalSearches > 0 ? (depressionSearches / totalSearches * 100).toFixed(1) : 0;
        const diarrheaPercent = totalSearches > 0 ? (diarrheaSearches / totalSearches * 100).toFixed(1) : 0;

        // Create gauge chart
        this.createGaugeChart(diabetesPercent, depressionPercent, diarrheaPercent);
    }

    createGaugeChart(diabetesPercent, depressionPercent, diarrheaPercent) {
        Highcharts.chart('container', {
            chart: {
                type: 'solidgauge',
                height: '110%',
                events: {
                    render: function() {
                        // Add render icons function here
                    }
                }
            },

            title: {
                text: 'Strongly Correlated Conditions: Search Percentage',
                style: {
                    fontSize: '18px'
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
            }]
        });
    }

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
                filename: 'comparison_chart',
                height: 500,
                width: 800,
                scale: 2
            }
        };
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    window.comparisonDashboard = new ComparisonDashboard();
});