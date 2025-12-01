/////////////////////////////////////////////////////
//    Load and unpack the data                      // 
/////////////////////////////////////////////////////
Plotly.d3.json('/allsearchrecord', function(rows) {
    function unpack(rows, key) {
        return rows.map(function(row) { return row[key]; });
    }
    // create a sum function to sum some varables  after unpaking 
    function sum(input) {

        if (toString.call(input) !== "[object Array]")
            return false;

        var total = 0;
        for (var i = 0; i < input.length; i++) {
            if (isNaN(input[i])) {
                continue;
            }
            total += Number(input[i]);
        }
        return total;
    }


    var data = rows.data

    var allyear = unpack(data, 'year'),
        cancer = unpack(data, 'Cancer'),
        cardiovascular = unpack(data, 'cardiovascular'),
        depression = unpack(data, 'depression'),
        diabetes = unpack(data, 'diabetes'),
        diarrhea = unpack(data, 'diarrhea'),
        obesity = unpack(data, 'obesity'),
        rehab = unpack(data, 'rehab'),
        stroke = unpack(data, 'stroke'),
        vaccine = unpack(data, 'vaccine'),
        city = unpack(data, 'city'),
        state = unpack(data, 'postal'),
        sum_cancer = sum(cancer),
        sum_cardiovascular = sum(cardiovascular),
        sum_depression = sum(depression),
        sum_diabetes = sum(diabetes),
        sum_diarrhea = sum(diarrhea),
        sum_obesity = sum(obesity),
        sum_rehab = sum(rehab),
        sum_stroke = sum(stroke),
        sum_vaccine = sum(vaccine),

        // create an empity list to capture data for the selected city 
        listofCities = [],
        searched_state = [],
        cancer_search = [],
        cardiovascular_search = [],
        depression_search = [],
        diabetes_search = [],
        diarrhea_search = [],
        obesity_search = [],
        rehab_search = [],
        stroke_search = [],
        vaccine_search = [],
        serched_years = [],
        sum_cancer_search = [],
        sum_cardiovascular_search = [],
        sum_depression_search = [],
        sum_diabetes_search = [],
        sum_diarrhea_search = [],
        sum_obesity_search = [],
        sum_rehab_search = [],
        sum_stroke_search = [],
        sum_vaccine_search = [];

    // loop
    for (var i = 0; i < city.length; i++) {
        if (listofCities.indexOf(city[i]) === -1) {
            listofCities.push(city[i]);
        }
    }
    // get city data 
    function getCityData(chosenCity) {
        serched_years = [];
        cancer_search = [];
        cardiovascular_search = [];
        depression_search = [];
        diabetes_search = [];
        diarrhea_search = [];
        obesity_search = [];
        rehab_search = [];
        stroke_search = [];
        vaccine_search = [];
        searched_state = [];
        sum_cancer_search = [];
        sum_cardiovascular_search = [];
        sum_depression_search = [];
        sum_diabetes_search = [];
        sum_diarrhea_search = [];
        sum_obesity_search = [];
        sum_rehab_search = [];
        sum_stroke_search = [];
        sum_vaccine_search = [];
        sum_total_search = [];

        //push the data to the list 

        for (var i = 0; i < city.length; i++) {
            if (city[i] === chosenCity) {
                serched_years.push(allyear[i]);
                cancer_search.push(cancer[i]);
                cardiovascular_search.push(cardiovascular[i]);
                depression_search.push(depression[i]);
                diabetes_search.push(diabetes[i]);
                diarrhea_search.push(diarrhea[i]);
                obesity_search.push(obesity[i]);
                rehab_search.push(rehab[i]);
                stroke_search.push(stroke[i]);
                vaccine_search.push(vaccine[i]);
                searched_state.push(state[i]);
                sum_cancer_search.push(sum_cancer);
                sum_cardiovascular_search.push(sum_cardiovascular);
                sum_depression_search.push(sum_depression);
                sum_diabetes_search.push(sum_diabetes);
                sum_diarrhea_search.push(sum_diarrhea);
                sum_obesity_search.push(sum_obesity);
                sum_rehab_search.push(sum_rehab);
                sum_stroke_search.push(sum_stroke);
                sum_vaccine_search.push(sum_vaccine);
                sum_total_search.push(sum_vaccine);
            }
        }
    };
    // Default city Data
    setBarPlot('Abilene-Sweetwater');

    // make a stack bar plot 
    function setBarPlot(chosenCity) {
        getCityData(chosenCity);
        var Cancer = {
            x: serched_years,
            y: cancer_search,
            name: 'Cancer',
            type: 'bar',
            marker: { color: '#448' }

        };

        var Cardiovascular = {
            x: serched_years,
            y: cardiovascular_search,
            name: 'Cardiovascular',
            type: 'bar',
            marker: { color: '#88C' }

        };

        var Depression = {
            x: serched_years,
            y: depression_search,
            name: 'Depression',
            type: 'bar',
            marker: { color: '#CCF' }

        };

        var Diabetes = {
            x: serched_years,
            y: diabetes_search,
            name: 'Diabetes',
            type: 'bar',
            marker: { color: '#080' }

        };

        var Diarrhea = {
            x: serched_years,
            y: diarrhea_search,
            name: 'Diarrhea',
            type: 'bar',
            marker: { color: '#8c8' }

        };

        var Obesity = {
            x: serched_years,
            y: obesity_search,
            name: 'Obesity',
            type: 'bar',
            marker: { color: '#CFC' }

        };

        var Rehab = {
            x: serched_years,
            y: rehab_search,
            name: 'Rehab',
            type: 'bar',
            marker: { color: '#880' }

        };

        var Stroke = {
            x: serched_years,
            y: stroke_search,
            name: 'Stroke',
            type: 'bar',
            marker: { color: '#CC8' }

        };

        var Vaccine = {
            x: serched_years,
            y: vaccine_search,
            name: 'Vaccine',
            type: 'bar',
            marker: { color: '#FFC' }

        };

        //data 
        var data = [Cancer, Cardiovascular, Depression, Diabetes, Diarrhea, Obesity, Rehab, Stroke, Vaccine];
        // layout 
        var layout = {
            width: 1350,
            height: 700,
            title: 'Total Volume of Searches by year Versus Health Conditions',
            barmode: 'stack',
            type: "column",
            xaxis: {
                title: 'Years',
                showgrid: false,
                zeroline: false
            },
            yaxis: {
                title: 'Searches',
                showline: false
            }
        };
        // plot 
        Plotly.newPlot('comparison-1', data, layout);


        /////////////////////////////////////////////////////
        //    Create a scatter plots                        // 
        /////////////////////////////////////////////////////

        /////////////////////////////////////////////////////
        //   scatter plot one  Diarrhea vs  Diabetes                // 
        /////////////////////////////////////////////////////
        var Diarrhea_c = {
            x: serched_years,
            y: diarrhea_search,
            mode: 'markers',
            type: 'scatter',
            marker: { size: 12 },
            name: 'Diarrhea'

        };

        var Diabetes_c = {
            x: serched_years,
            y: diabetes_search,
            mode: 'markers',
            type: 'scatter',
            marker: { size: 12 },
            name: 'Diabetes'

        };

        var data = [Diarrhea_c, Diabetes_c];

        var layout = {
            title: 'Diarrhea vs. Diabetes',
            width: 500,
            height: 480,

        };

        Plotly.newPlot('scatter1', data, layout);

        /////////////////////////////////////////////////////
        //   scatter plot two   Depression vs  Diabetes     // 
        /////////////////////////////////////////////////////

        var Depression_c = {
            x: serched_years,
            y: depression_search,
            mode: 'markers',
            type: 'scatter',
            marker: { size: 12 },
            name: 'Depression'

        };

        var Diabetes_c = {
            x: serched_years,
            y: diabetes_search,
            mode: 'markers',
            type: 'scatter',
            marker: { size: 12 },
            name: 'Diabetes'

        };

        var data = [Depression_c, Diabetes_c];

        var layout = {
            title: 'Depression vs. Diabetes',
            width: 500,
            height: 480,

        };

        /////////////////////////////////////////////////////
        //   scatter plot three  Diabetes vs Vacine        // 
        /////////////////////////////////////////////////////

        Plotly.newPlot('scatter2', data, layout);
        var Vaccine_c = {
            x: serched_years,
            y: vaccine_search,
            mode: 'markers',
            type: 'scatter',
            marker: { size: 12 },
            name: 'Vaccine'

        };

        var Diabetes_c = {
            x: serched_years,
            y: diabetes_search,
            mode: 'markers',
            type: 'scatter',
            marker: { size: 12 },
            name: 'Diabetes'

        };

        var data = [Vaccine_c, Diabetes_c];

        var layout = {
            title: 'Vaccine vs. Diabetes',
            width: 500,
            height: 480,

        };

        Plotly.newPlot('scatter3', data, layout);

        /////////////////////////////////////////////////////
        //   scatter plot four  Depression vs Vacine        // 
        /////////////////////////////////////////////////////

        var Vaccine_c = {
            x: serched_years,
            y: vaccine_search,
            mode: 'markers',
            type: 'scatter',
            marker: { size: 12 },
            name: 'Vaccine'

        };

        var Depression_c = {
            x: serched_years,
            y: depression_search,
            mode: 'markers',
            type: 'scatter',
            marker: { size: 12 },
            name: 'Depression'

        };

        var data = [Vaccine_c, Depression_c];

        var layout = {
            title: 'Vaccine vs. Depression',
            width: 500,
            height: 480,

        };

        Plotly.newPlot('scatter4', data, layout);

        //  Index he value to create  round pai chart 
        var indexed_cancer = sum_cancer_search[0];
        var indexed_diarrhea = sum_diarrhea_search[0];
        var indexed_cardiovascular = sum_cardiovascular_search[0];
        var indexed_diabetes = sum_diabetes_search[0];
        var indexed_depression = sum_depression_search[0];
        var indexed_obesity = sum_obesity_search[0];
        var indexed_rehab = sum_rehab_search[0];
        var indexed_stroke = sum_stroke_search[0];
        var indexed_vaccine = sum_vaccine_search[0];

        // sum total of all searches 
        sum_total_search = indexed_cancer + indexed_diarrhea + indexed_cardiovascular + indexed_diabetes + indexed_depression + indexed_obesity + indexed_rehab + indexed_stroke + indexed_vaccine;

        /// changed to persentage 
        var persontage_cancer_searched = Number(Math.round((indexed_cancer / sum_total_search * 100) + 'e2') + 'e-2');
        var persontage_diabetes_searched = Number(Math.round((indexed_diabetes / sum_total_search * 100) + 'e2') + 'e-2');
        var persontage_diarrhea_searched = Number(Math.round((indexed_diarrhea / sum_total_search * 100) + 'e2') + 'e-2');
        var persontage_depression_searched = Number(Math.round((indexed_depression / sum_total_search * 100) + 'e2') + 'e-2');
        var persontage_rehab_searched = Number(Math.round((indexed_rehab / sum_total_search * 100) + 'e2') + 'e-2');
        var persontage_stroke_searched = Number(Math.round((indexed_stroke / sum_total_search * 100) + 'e2') + 'e-2');
        var persontage_vaccine_searched = Number(Math.round((indexed_vaccine / sum_total_search * 100) + 'e2') + 'e-2');
        var persontage_cardiovascular_searched = Number(Math.round((indexed_cardiovascular / sum_total_search * 100) + 'e2') + 'e-2');
        var persontage_obesity_searched = Number(Math.round((indexed_obesity / sum_total_search * 100) + 'e2') + 'e-2');

        // plot a choroplethmap for the selected city 
        var data = [{
            type: "choroplethmapbox",
            name: "Searches",
            geojson: "https://raw.githubusercontent.com/python-visualization/folium/master/examples/data/us-states.json",
            locations: searched_state,
            //seating constatnt just to show the place
            z: [100, 100],
            zmin: 0,
            zmax: 100,

            colorbar: { y: 0, yanchor: "bottom", title: { text: "Seaches", side: "right" } },
            colorscale: [
                [0, '#131f0c'],
                [1, '#bdfe88']
            ],
            autocolorscale: false,

        }];

        //layout 
        var layout = {
            scope: "usa",
            mapbox: { style: "dark", center: { lon: -95.712891, lat: 37.090240 }, zoom: 1.7 },
            width: 650,
            height: 650,
            margin: { t: 0, b: 0 },

        }
        var config = { mapboxAccessToken: "pk.eyJ1IjoiZWdhZ2EiLCJhIjoiY2tmOG51MXY4MGR3NjJ5cnE4N3B2NTl0cCJ9.vVCAwSF-oh9ymZ8-pM-nBQ" };

        Plotly.newPlot('IntermapDiv', data, layout, config);

        /**
         * In the chart render event, add icons on top of the circular shapes
         * 
         * for this plot we used Highcharts: Interactive JavaScript charts
         */

        function renderIcons() {

            // Move icon
            if (!this.series[0].icon) {
                this.series[0].icon = this.renderer.path(['M', -8, 0, 'L', 8, 0, 'M', 0, -8, 'L', 8, 0, 0, 8])
                    .attr({
                        stroke: '#303030',
                        'stroke-linecap': 'round',
                        'stroke-linejoin': 'round',
                        'stroke-width': 2,
                        zIndex: 10
                    })
                    .add(this.series[2].group);
            }
            this.series[0].icon.translate(
                this.chartWidth / 2 - 10,
                this.plotHeight / 2 - this.series[0].points[0].shapeArgs.innerR -
                (this.series[0].points[0].shapeArgs.r - this.series[0].points[0].shapeArgs.innerR) / 2
            );

            // icon
            if (!this.series[1].icon) {
                this.series[1].icon = this.renderer.path(
                        ['M', -8, 0, 'L', 8, 0, 'M', 0, -8, 'L', 8, 0, 0, 8,
                            'M', 8, -8, 'L', 16, 0, 8, 8
                        ]
                    )
                    .attr({
                        stroke: '#ffffff',
                        'stroke-linecap': 'round',
                        'stroke-linejoin': 'round',
                        'stroke-width': 2,
                        zIndex: 10
                    })
                    .add(this.series[2].group);
            }
            this.series[1].icon.translate(
                this.chartWidth / 2 - 10,
                this.plotHeight / 2 - this.series[1].points[0].shapeArgs.innerR -
                (this.series[1].points[0].shapeArgs.r - this.series[1].points[0].shapeArgs.innerR) / 2
            );

            // Stand
            if (!this.series[2].icon) {
                this.series[2].icon = this.renderer.path(['M', 0, 8, 'L', 0, -8, 'M', -8, 0, 'L', 0, -8, 8, 0])
                    .attr({
                        stroke: '#303030',
                        'stroke-linecap': 'round',
                        'stroke-linejoin': 'round',
                        'stroke-width': 2,
                        zIndex: 10
                    })
                    .add(this.series[2].group);
            }

            this.series[2].icon.translate(
                this.chartWidth / 2 - 10,
                this.plotHeight / 2 - this.series[2].points[0].shapeArgs.innerR -
                (this.series[2].points[0].shapeArgs.r - this.series[2].points[0].shapeArgs.innerR) / 2
            );
        }

        Highcharts.chart('container', {

            chart: {
                type: 'solidgauge',
                height: '110%',
                events: {
                    render: renderIcons
                }
            },

            title: {
                text: 'Diabetes,Depression & Diarrhea Percentage of Search from the Total ',
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
                    backgroundColor: Highcharts.color(Highcharts.getOptions().colors[0])
                        .setOpacity(0.3)
                        .get(),
                    borderWidth: 0
                }, { // Track for Depression
                    outerRadius: '87%',
                    innerRadius: '63%',
                    backgroundColor: Highcharts.color(Highcharts.getOptions().colors[1])
                        .setOpacity(0.3)
                        .get(),
                    borderWidth: 0
                }, { // Track for Diarrhea
                    outerRadius: '62%',
                    innerRadius: '38%',
                    backgroundColor: Highcharts.color(Highcharts.getOptions().colors[2])
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
                    color: Highcharts.getOptions().colors[0],
                    radius: '112%',
                    innerRadius: '88%',
                    y: persontage_diabetes_searched,
                }]
            }, {
                name: 'Depression',
                data: [{
                    color: Highcharts.getOptions().colors[1],
                    radius: '87%',
                    toFixed: 2,
                    innerRadius: '63%',
                    y: persontage_depression_searched
                }]
            }, {
                name: 'Diarrhea',
                data: [{
                    color: Highcharts.getOptions().colors[2],
                    radius: '62%',
                    innerRadius: '38%',
                    y: persontage_diarrhea_searched
                }]
            }]
        });

    };



    var innerContainer = document.querySelector('[data-num="0"'),
        plotEl = innerContainer.querySelector('.plot'),
        citySelector = innerContainer.querySelector('.citydata');

    function assignOptions(textArray, selector) {
        for (var i = 0; i < textArray.length; i++) {
            var currentOption = document.createElement('option');
            currentOption.text = textArray[i];
            selector.appendChild(currentOption);
        }
    }

    assignOptions(listofCities, citySelector);

    function updateCity() {
        setBarPlot(citySelector.value);
    }

    citySelector.addEventListener('change', updateCity, false);


});