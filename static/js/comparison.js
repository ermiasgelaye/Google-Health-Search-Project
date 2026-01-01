// Enhanced Comparison Dashboard - FIXED VERSION with consistent design

class ComparisonDashboard {
    constructor() {
        this.currentCity = 'Abilene-Sweetwater';
        this.statsData = null;
        this.cityList = [];
        this.cityCoordinates = {};
        this.isLoading = false;

        // City location data from your CSV
        this.cityLocations = {
            'Abilene-Sweetwater': { state: 'TX', latitude: 32.4106903, longitude: -99.7653019 },
            'Albany': { state: 'GA', latitude: 42.6525793, longitude: -73.7562317 },
            'Albany-Schenectady-Troy': { state: 'NY', latitude: 42.669682, longitude: -73.7485195 },
            'Albuquerque-Santa': { state: 'NM', latitude: 35.0843859, longitude: -106.650422 },
            'Alexandria': { state: 'LA', latitude: 38.8048355, longitude: -77.0469214 },
            'Alpena': { state: 'MI', latitude: 45.0616794, longitude: -83.4327528 },
            'Amarillo': { state: 'TX', latitude: 35.2219971, longitude: -101.8312969 },
            'Anchorage': { state: 'AK', latitude: 61.2180556, longitude: -149.9002778 },
            'Atlanta': { state: 'GA', latitude: 33.7489954, longitude: -84.3879824 },
            'Augusta': { state: 'GA', latitude: 33.4734978, longitude: -82.0105148 },
            'Austin': { state: 'TX', latitude: 30.267153, longitude: -97.7430608 },
            'Bakersfield': { state: 'CA', latitude: 35.3732921, longitude: -119.0187125 },
            'Baltimore': { state: 'MD', latitude: 39.2903848, longitude: -76.6121893 },
            'Bangor': { state: 'ME', latitude: 44.8016128, longitude: -68.7712257 },
            'Baton Rouge': { state: 'LA', latitude: 30.4514677, longitude: -91.1871466 },
            'Beaumont-Port Arthur': { state: 'TX', latitude: 30.080174, longitude: -94.1265562 },
            'Bend': { state: 'OR', latitude: 44.0581728, longitude: -121.3153096 },
            'Billings': { state: 'MT', latitude: 45.7832856, longitude: -108.5006904 },
            'Biloxi-Gulfport': { state: 'MS', latitude: 30.3674198, longitude: -89.0928155 },
            'Binghamton': { state: 'NY', latitude: 42.0986867, longitude: -75.9179738 },
            'Birmingham': { state: 'AL', latitude: 33.5185892, longitude: -86.8103567 },
            'Bluefield-Beckley-Oak Hill': { state: 'WV', latitude: 37.2698395, longitude: -81.2223195 },
            'Boise': { state: 'ID', latitude: 43.6150186, longitude: -116.2023137 },
            'Boston': { state: 'MA', latitude: 42.3600825, longitude: -71.0588801 },
            'Bowling Green': { state: 'KY', latitude: 36.9685219, longitude: -86.4808043 },
            'Buffalo': { state: 'NY', latitude: 42.8864468, longitude: -78.8783689 },
            'Plattsburgh': { state: 'NY', latitude: 44.6994873, longitude: -73.4529124 },
            'Butte-Bozeman': { state: 'MT', latitude: 45.9654105, longitude: -112.5098066 },
            'Casper-Riverton': { state: 'WY', latitude: 43.0243013, longitude: -108.4057448 },
            'Cedar Rapids-Waterloo-Iowa City & Dubuque': { state: 'IA', latitude: 41.8780025, longitude: -93.097702 },
            'Champaign & Springfield-Decatur': { state: 'IL', latitude: 40.6331249, longitude: -89.3985283 },
            'Charleston': { state: 'SC', latitude: 32.7764749, longitude: -79.9310512 },
            'Charleston-Huntington': { state: 'WV', latitude: 38.3190758, longitude: -81.716355 },
            'Charlotte': { state: 'NC', latitude: 35.2270869, longitude: -80.8431267 },
            'Charlottesville': { state: 'VA', latitude: 38.0293059, longitude: -78.4766781 },
            'Chattanooga': { state: 'TN', latitude: 35.0456297, longitude: -85.3096801 },
            'Cheyenne WY-Scottsbluff': { state: 'NE', latitude: 41.876312, longitude: -103.637984 },
            'Chicago': { state: 'IL', latitude: 41.8781136, longitude: -87.6297982 },
            'Chico-Redding': { state: 'CA', latitude: 40.5733498, longitude: -122.3748005 },
            'Cincinnati': { state: 'OH', latitude: 39.1031182, longitude: -84.5120196 },
            'Clarksburg-Weston': { state: 'WV', latitude: 39.0384274, longitude: -80.467313 },
            'Cleveland-Akron (Canton)': { state: 'OH', latitude: 40.9153779, longitude: -81.4418833 },
            'Colorado Springs-Pueblo': { state: 'CO', latitude: 38.9117395, longitude: -104.7887027 },
            'Columbia': { state: 'SC', latitude: 36.1335816, longitude: -95.9515853 },
            'Columbia-Jefferson City': { state: 'MO', latitude: 38.5709147, longitude: -92.2439177 },
            'Columbus': { state: 'GA', latitude: 39.9611755, longitude: -82.9987942 },
            'Columbus': { state: 'OH', latitude: 39.9611755, longitude: -82.9987942 },
            'Columbus-Tupelo-West Point': { state: 'MS', latitude: 34.2230246, longitude: -88.7278448 },
            'Corpus Christi': { state: 'TX', latitude: 27.8005828, longitude: -97.396381 },
            'Dallas-Ft. Worth': { state: 'TX', latitude: 32.7766642, longitude: -96.7969879 },
            'Rock Island-Moline': { state: 'IL', latitude: 41.5067003, longitude: -90.5151342 },
            'Dayton': { state: 'OH', latitude: 39.7589478, longitude: -84.1916069 },
            'Denver': { state: 'CO', latitude: 39.7392358, longitude: -104.990251 },
            'Des Moines-Ames': { state: 'IA', latitude: 42.0236281, longitude: -93.6097448 },
            'Detroit': { state: 'MI', latitude: 42.331427, longitude: -83.0457538 },
            'Dothan': { state: 'AL', latitude: 31.2232313, longitude: -85.3904888 },
            'Duluth MN-Superior': { state: 'WI', latitude: 46.7866719, longitude: -92.1004852 },
            'El Paso': { state: 'TX', latitude: 31.7618778, longitude: -106.4850217 },
            'Elmira': { state: 'NY', latitude: 42.0897965, longitude: -76.8077338 },
            'Erie': { state: 'PA', latitude: 42.1292241, longitude: -80.085059 },
            'Eugene': { state: 'OR', latitude: 44.0520691, longitude: -123.0867536 },
            'Eureka': { state: 'CA', latitude: 37.8239167, longitude: -96.2891703 },
            'Evansville': { state: 'IN', latitude: 37.9715592, longitude: -87.5710898 },
            'Fairbanks': { state: 'AK', latitude: 64.8377778, longitude: -147.7163888 },
            'Fargo-Valley City': { state: 'ND', latitude: 46.9243955, longitude: -98.0035186 },
            'Flint-Saginaw-Bay City': { state: 'MI', latitude: 43.5993199, longitude: -83.8890847 },
            'Florence-Myrtle Beach': { state: 'SC', latitude: 33.6824661, longitude: -78.9638109 },
            'Fresno-Visalia': { state: 'CA', latitude: 36.32166, longitude: -119.3148878 },
            'Ft. Myers-Naples': { state: 'FL', latitude: 26.1518464, longitude: -81.7964871 },
            'Ft. Smith-Fayetteville-Springdale-Rogers': { state: 'AR', latitude: 35.3859242, longitude: -94.3985475 },
            'Ft. Wayne': { state: 'IN', latitude: 41.079273, longitude: -85.1393513 },
            'Gainesville': { state: 'FL', latitude: 29.6516344, longitude: -82.3248262 },
            'Glendive': { state: 'MT', latitude: 47.106401, longitude: -104.7107931 },
            'Grand Junction-Montrose': { state: 'CO', latitude: 38.4967651, longitude: -107.8989028 },
            'Grand Rapids-Kalamazoo-Battle Creek': { state: 'MI', latitude: 42.2355515, longitude: -85.5515933 },
            'Great Falls': { state: 'MT', latitude: 38.9987208, longitude: -77.2538699 },
            'Green Bay-Appleton': { state: 'WI', latitude: 44.3008901, longitude: -88.3481422 },
            'Greensboro-High Point-Winston Salem': { state: 'NC', latitude: 35.9556923, longitude: -80.0053176 },
            'Greenville-New Bern-Washington': { state: 'NC', latitude: 35.1199116, longitude: -77.0896246 },
            'Anderson': { state: 'SC', latitude: 38.9440204, longitude: -95.206647 },
            'Greenwood-Greenville': { state: 'MS', latitude: 34.8633424, longitude: -82.2755461 },
            'Harlingen-Weslaco-Brownsville-McAllen': { state: 'TX', latitude: 31.9685988, longitude: -99.9018131 },
            'Harrisburg-Lancaster-Lebanon-York': { state: 'PA', latitude: 40.266374, longitude: -76.875646 },
            'Harrisonburg': { state: 'VA', latitude: 38.4495688, longitude: -78.8689155 },
            'Hartford & New Haven': { state: 'CT', latitude: 41.3052288, longitude: -72.9220308 },
            'Hattiesburg-Laurel': { state: 'MS', latitude: 31.468239, longitude: -89.335421 },
            'Helena': { state: 'MT', latitude: 46.5891452, longitude: -112.0391057 },
            'Honolulu': { state: 'HI', latitude: 21.3069444, longitude: -157.8583333 },
            'Houston': { state: 'TX', latitude: 29.7604267, longitude: -95.3698028 },
            'Huntsville-Decatur (Florence)': { state: 'AL', latitude: 34.721323, longitude: -86.5751171 },
            'Idaho Falls-Pocatello': { state: 'ID', latitude: 42.906046, longitude: -112.4315298 },
            'Indianapolis': { state: 'IN', latitude: 39.768403, longitude: -86.158068 },
            'Jackson': { state: 'MS', latitude: 37.0370221, longitude: -95.6164276 },
            'Jackson': { state: 'TN', latitude: 37.0370221, longitude: -95.6164276 },
            'Jacksonville': { state: 'FL', latitude: 30.3321838, longitude: -81.655651 },
            'Johnstown-Altoona': { state: 'PA', latitude: 40.4529782, longitude: -78.3930329 },
            'Jonesboro': { state: 'AR', latitude: 35.8422967, longitude: -90.704279 },
            'Pittsburg': { state: 'KS', latitude: 38.0279762, longitude: -121.8846806 },
            'Juneau': { state: 'AK', latitude: 58.3019444, longitude: -134.4197221 },
            'Kansas City': { state: 'MO', latitude: 39.0997265, longitude: -94.5785667 },
            'Knoxville': { state: 'TN', latitude: 35.9606384, longitude: -83.9207392 },
            'La Crosse-Eau Claire': { state: 'WI', latitude: 44.8651049, longitude: -91.4743642 },
            'Lafayette': { state: 'IN', latitude: 40.4167022, longitude: -86.8752869 },
            'Lafayette': { state: 'LA', latitude: 40.4167022, longitude: -86.8752869 },
            'Lake Charles': { state: 'LA', latitude: 30.2265949, longitude: -93.2173758 },
            'Lansing': { state: 'MI', latitude: 42.732535, longitude: -84.5555347 },
            'Laredo': { state: 'TX', latitude: 27.5035613, longitude: -99.5075519 },
            'Las Vegas': { state: 'NV', latitude: 36.1699412, longitude: -115.1398296 },
            'Lexington': { state: 'KY', latitude: 38.0405837, longitude: -84.5037164 },
            'Lima': { state: 'OH', latitude: -12.0463731, longitude: -77.042754 },
            'Lincoln & Hastings-Kearney': { state: 'NE', latitude: 40.7004026, longitude: -99.0783395 },
            'Little Rock-Pine Bluff': { state: 'AR', latitude: 34.2025124, longitude: -92.0491611 },
            'Los Angeles': { state: 'CA', latitude: 34.0522342, longitude: -118.2436849 },
            'Louisville': { state: 'KY', latitude: 38.2526647, longitude: -85.7584557 },
            'Lubbock': { state: 'TX', latitude: 33.5778631, longitude: -101.8551665 },
            'Macon': { state: 'GA', latitude: 32.8406946, longitude: -83.6324022 },
            'Madison': { state: 'WI', latitude: 43.0730517, longitude: -89.4012302 },
            'Mankato': { state: 'MN', latitude: 44.1635775, longitude: -93.9993996 },
            'Marquette': { state: 'MI', latitude: 46.5436199, longitude: -87.3953713 },
            'Medford-Klamath Falls': { state: 'OR', latitude: 42.224924, longitude: -121.7722781 },
            'Memphis': { state: 'TN', latitude: 35.1495343, longitude: -90.0489801 },
            'Meridian': { state: 'MS', latitude: 37.7117226, longitude: -97.3723586 },
            'Miami-Ft. Lauderdale': { state: 'FL', latitude: 26.1228039, longitude: -80.150752 },
            'Milwaukee': { state: 'WI', latitude: 43.0389025, longitude: -87.9064736 },
            'Minneapolis-St. Paul': { state: 'MN', latitude: 44.9374831, longitude: -93.2009998 },
            'Minot-Bismarck-Dickinson(Williston)': { state: 'ND', latitude: 46.6105457, longitude: -104.1852614 },
            'Missoula': { state: 'MT', latitude: 46.8721284, longitude: -113.9940314 },
            'Mobile AL-Pensacola (Ft. Walton Beach)': { state: 'FL', latitude: 30.4500468, longitude: -87.2497794 },
            'Dorado': { state: 'AR', latitude: 18.4588347, longitude: -66.2676683 },
            'Monterey-Salinas': { state: 'CA', latitude: 36.6777372, longitude: -121.6555013 },
            'Montgomery (Selma)': { state: 'AL', latitude: 32.405772, longitude: -87.0187444 },
            'Nashville': { state: 'TN', latitude: 36.1626638, longitude: -86.7816016 },
            'New Orleans': { state: 'LA', latitude: 29.9510658, longitude: -90.0715323 },
            'New York': { state: 'NY', latitude: 40.7127753, longitude: -74.0059728 },
            'Norfolk-Portsmouth-Newport News': { state: 'VA', latitude: 36.8354258, longitude: -76.2982742 },
            'North Platte': { state: 'NE', latitude: 41.1402759, longitude: -100.7601454 },
            'Odessa-Midland': { state: 'TX', latitude: 31.8456816, longitude: -102.3676431 },
            'Oklahoma City': { state: 'OK', latitude: 35.4675602, longitude: -97.5164276 },
            'Omaha': { state: 'NE', latitude: 41.2565369, longitude: -95.9345034 },
            'Orlando-Daytona Beach-Melbourne': { state: 'FL', latitude: 27.6648274, longitude: -81.5157535 },
            'Kirksville': { state: 'MO', latitude: 40.1947539, longitude: -92.5832496 },
            'Harrisburg-Mount Vernon': { state: 'IL', latitude: 40.3265286, longitude: -76.8664828 },
            'Palm Springs': { state: 'CA', latitude: 33.8302961, longitude: -116.5452921 },
            'Panama City': { state: 'FL', latitude: 30.1588129, longitude: -85.6602058 },
            'Parkersburg': { state: 'WV', latitude: 39.2667418, longitude: -81.5615135 },
            'Peoria-Bloomington': { state: 'IL', latitude: 40.6751478, longitude: -89.611001 },
            'Philadelphia': { state: 'PA', latitude: 39.9525839, longitude: -75.1652215 },
            'Phoenix': { state: 'AZ', latitude: 33.4483771, longitude: -112.0740373 },
            'Pittsburgh': { state: 'PA', latitude: 40.4406248, longitude: -79.9958864 },
            'Portland': { state: 'OR', latitude: 45.5051064, longitude: -122.6750261 },
            'Portland-Auburn': { state: 'ME', latitude: 45.253783, longitude: -69.4454689 },
            'Presque Isle': { state: 'ME', latitude: 46.681153, longitude: -68.0158614 },
            'New Bedford': { state: 'MA', latitude: 41.6362152, longitude: -70.934205 },
            'Keokuk': { state: 'IA', latitude: 40.4044731, longitude: -91.3963966 },
            'Raleigh-Durham (Fayetteville)': { state: 'NC', latitude: 35.0478668, longitude: -78.8565861 },
            'Rapid City': { state: 'SD', latitude: 44.0805434, longitude: -103.2310149 },
            'Reno': { state: 'NV', latitude: 39.5296329, longitude: -119.8138027 },
            'Richmond-Petersburg': { state: 'VA', latitude: 37.4315734, longitude: -78.6568942 },
            'Roanoke-Lynchburg': { state: 'VA', latitude: 37.3177678, longitude: -79.9994997 },
            'Rochester': { state: 'MN', latitude: 43.1565779, longitude: -77.6088465 },
            'Rochester': { state: 'NY', latitude: 43.1565779, longitude: -77.6088465 },
            'Rockford': { state: 'IL', latitude: 42.2711311, longitude: -89.0939952 },
            'Sacramento-Stockton-Modesto': { state: 'CA', latitude: 37.8968929, longitude: -121.2514811 },
            'Salisbury': { state: 'MD', latitude: 38.3606736, longitude: -75.5993692 },
            'Salt Lake City': { state: 'UT', latitude: 40.7607793, longitude: -111.8910474 },
            'San Angelo': { state: 'TX', latitude: 31.4637723, longitude: -100.4370375 },
            'San Antonio': { state: 'TX', latitude: 29.4241219, longitude: -98.4936282 },
            'San Diego': { state: 'CA', latitude: 32.715738, longitude: -117.1610838 },
            'San Jose': { state: 'CA', latitude: 37.3382082, longitude: -121.8863286 },
            'Santa Barbara-Santa Maria-San Luis Obispo': { state: 'CA', latitude: 34.937706, longitude: -120.433378 },
            'Savannah': { state: 'GA', latitude: 32.0808989, longitude: -81.091203 },
            'Seattle-Tacoma': { state: 'WA', latitude: 47.4502499, longitude: -122.3088165 },
            'Ada': { state: 'OK', latitude: 34.774531, longitude: -96.6783449 },
            'Shreveport': { state: 'LA', latitude: 32.5251516, longitude: -93.7501789 },
            'Sioux City': { state: 'IA', latitude: 42.4963416, longitude: -96.4049408 },
            'Sioux Falls(Mitchell)': { state: 'SD', latitude: 43.4889533, longitude: -96.7293265 },
            'South Bend-Elkhart': { state: 'IN', latitude: 41.6843287, longitude: -85.9708313 },
            'Spokane': { state: 'WA', latitude: 47.6587802, longitude: -117.4260465 },
            'Springfield': { state: 'MO', latitude: 37.2089572, longitude: -93.2922989 },
            'Springfield-Holyoke': { state: 'MA', latitude: 42.2042586, longitude: -72.6162009 },
            'St. Joseph': { state: 'MO', latitude: 42.1440481, longitude: -83.1786345 },
            'St. Louis': { state: 'MO', latitude: 38.6270025, longitude: -90.1994042 },
            'Syracuse': { state: 'NY', latitude: 43.0481221, longitude: -76.1474244 },
            'Thomasville': { state: 'GA', latitude: 35.8826369, longitude: -80.0819879 },
            'Tampa-St. Petersburg (Sarasota)': { state: 'FL', latitude: 27.8823552, longitude: -82.6759794 },
            'Terre Haute': { state: 'IN', latitude: 39.4667034, longitude: -87.4139092 },
            'Toledo': { state: 'OH', latitude: 41.6528052, longitude: -83.5378674 },
            'Topeka': { state: 'KS', latitude: 39.0473451, longitude: -95.6751576 },
            'Traverse City-Cadillac': { state: 'MI', latitude: 44.7354212, longitude: -85.5946084 },
            'Tri-Cities': { state: 'VA', latitude: 46.2349999, longitude: -119.2233014 },
            'Tucson (Sierra Vista)': { state: 'AZ', latitude: 32.2709837, longitude: -110.9614306 },
            'Tulsa': { state: 'OK', latitude: 36.1539816, longitude: -95.992775 },
            'Twin Falls': { state: 'ID', latitude: 42.5558381, longitude: -114.4700518 },
            'Tyler-Longview(Lufkin & Nacogdoches)': { state: 'TX', latitude: 32.3512601, longitude: -95.3010624 },
            'Utica': { state: 'NY', latitude: 43.100903, longitude: -75.232664 },
            'Victoria': { state: 'TX', latitude: -37.4713077, longitude: 144.7851531 },
            'Waco-Temple-Bryan': { state: 'TX', latitude: 30.6724861, longitude: -96.3750299 },
            'Hagerstown': { state: 'MD', latitude: 39.6417629, longitude: -77.7199932 },
            'Watertown': { state: 'NY', latitude: 42.3709299, longitude: -71.1828321 },
            'Wausau-Rhinelander': { state: 'WI', latitude: 45.6555505, longitude: -89.3920037 },
            'West Palm Beach-Ft. Pierce': { state: 'FL', latitude: 27.4680959, longitude: -80.2922282 },
            'Wheeling WV-Steubenville': { state: 'OH', latitude: 40.0658125, longitude: -80.7214227 },
            'Lawton': { state: 'OK', latitude: 34.6035669, longitude: -98.3959291 },
            'Wichita-Hutchinson': { state: 'KS', latitude: 38.0232033, longitude: -97.9405316 },
            'Wilkes Barre-Scranton': { state: 'PA', latitude: 41.240536, longitude: -75.848551 },
            'Wilmington': { state: 'NC', latitude: 34.2103894, longitude: -77.8868117 },
            'Yakima-Pasco-Richland-Kennewick': { state: 'WA', latitude: 46.2323882, longitude: -119.134048 },
            'Youngstown': { state: 'OH', latitude: 41.0997803, longitude: -80.6495194 },
            'Yuma AZ-El Centro': { state: 'CA', latitude: 32.7001663, longitude: -114.5258431 },
            'Zanesville': { state: 'OH', latitude: 39.9403453, longitude: -82.0131924 }
        };

        // PROFESSIONAL COLOR PALETTE (MATCHING app.js)
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

        // STANDARD FONT SETTINGS (MATCHING app.js)
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
        console.log('🚀 Initializing Health Comparison Dashboard...');

        // Clear any existing content from chart containers
        this.clearChartContainers();

        this.applyProfessionalTheme();
        this.addStatsOverview();
        this.loadData();
        this.setupEventListeners();
        this.setupDownloadButtons();
    }

    clearChartContainers() {
        // Clear all chart containers
        const chartIds = ['comparison-1', 'IntermapDiv', 'scatter1', 'scatter2', 'scatter3', 'scatter4', 'container'];
        chartIds.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = '';
            }
        });
    }

    applyProfessionalTheme() {
        // Apply professional styling to chart frames (Matching app.js)
        const chartFrames = document.querySelectorAll('.chart-frame');
        if (chartFrames.length > 0) {
            chartFrames.forEach(frame => {
                frame.style.background = '#ffffff';
                frame.style.border = 'none';
                frame.style.borderRadius = '8px';
                frame.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                frame.style.padding = '20px';
                frame.style.marginBottom = '25px';
            });
        }

        // Style chart titles (Matching app.js)
        const chartTitles = document.querySelectorAll('.chart-frame h2, .chart-frame h3');
        if (chartTitles.length > 0) {
            chartTitles.forEach(title => {
                title.style.color = '#1a237e';
                title.style.fontSize = '20px';
                title.style.fontWeight = '700';
                title.style.borderBottom = '2px solid #1565c0';
                title.style.paddingBottom = '10px';
                title.style.marginBottom = '20px';
            });
        }

        // Style download buttons (Matching app.js)
        const downloadButtons = document.querySelectorAll('.download-chart-btn, .download-csv-btn');
        if (downloadButtons.length > 0) {
            downloadButtons.forEach(btn => {
                btn.style.fontSize = '14px';
                btn.style.fontWeight = '600';
                btn.style.padding = '8px 20px';
                btn.style.borderRadius = '4px';
                btn.style.transition = 'all 0.3s ease';

                // Add hover effects
                btn.addEventListener('mouseenter', function () {
                    this.style.transform = 'translateY(-2px)';
                    this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                });

                btn.addEventListener('mouseleave', function () {
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = 'none';
                });
            });
        }

        // Style stat cards (Matching app.js)
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards.length > 0) {
            statCards.forEach(card => {
                card.style.background = 'linear-gradient(135deg, #1a237e, #0d47a1)';
                card.style.color = 'white';
                card.style.borderRadius = '10px';
                card.style.boxShadow = '0 4px 8px rgba(26, 35, 126, 0.2)';
                card.style.padding = '20px';
                card.style.minWidth = '150px';
                card.style.textAlign = 'center';
                card.style.margin = '10px';

                const h3 = card.querySelector('h3');
                if (h3) {
                    h3.style.fontSize = '28px';
                    h3.style.fontWeight = '800';
                    h3.style.marginBottom = '5px';
                }
                const p = card.querySelector('p');
                if (p) {
                    p.style.fontSize = '14px';
                    p.style.fontWeight = '500';
                    p.style.marginBottom = '0';
                    p.style.opacity = '0.9';
                }
            });
        }

        // Style dropdown
        const citySelect = document.getElementById('city-select');
        if (citySelect) {
            citySelect.style.fontSize = '14px';
            citySelect.style.padding = '8px 15px';
            citySelect.style.border = '1px solid #b0bec5';
            citySelect.style.borderRadius = '4px';
            citySelect.style.backgroundColor = '#ffffff';
            citySelect.style.transition = 'all 0.3s ease';

            citySelect.addEventListener('focus', function () {
                this.style.borderColor = '#1565c0';
                this.style.boxShadow = '0 0 0 0.2rem rgba(21, 101, 192, 0.25)';
            });

            citySelect.addEventListener('blur', function () {
                this.style.borderColor = '#b0bec5';
                this.style.boxShadow = 'none';
            });
        }
    }

    addStatsOverview() {
        const statsHTML = `
            <div class="row mb-4" id="stats-container">
                <div class="col-12">
                    <div class="d-flex justify-content-center flex-wrap">
                        <div class="stat-card mx-2 my-2">
                            <h3>200+</h3>
                            <p>Urban Centers</p>
                        </div>
                        <div class="stat-card mx-2 my-2">
                            <h3>9</h3>
                            <p>Health Conditions</p>
                        </div>
                        <div class="stat-card mx-2 my-2">
                            <h3>14</h3>
                            <p>Years of Data</p>
                        </div>
                        <div class="stat-card mx-2 my-2">
                            <h3>1M+</h3>
                            <p>Data Points</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const dashboardHeader = document.querySelector('.dashboard-header') ||
            document.querySelector('.dashboard-jumbotron');
        if (dashboardHeader) {
            // Remove existing stats if any
            const existingStats = document.getElementById('stats-container');
            if (existingStats) {
                existingStats.remove();
            }

            dashboardHeader.insertAdjacentHTML('afterend', statsHTML);

            // Re-apply styles to the newly created stat cards
            setTimeout(() => {
                this.applyProfessionalTheme();
            }, 100);
        }
    }

    setupDownloadButtons() {
        // Set up chart download buttons (Matching app.js)
        document.querySelectorAll('.download-chart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const chartFrame = e.target.closest('.chart-frame');
                if (!chartFrame) return;

                const chartElement = chartFrame.querySelector('.plot');
                if (!chartElement) return;

                const chartId = chartElement.id;
                const chartName = e.target.dataset.chartName || this.getDefaultChartName(chartId);
                this.downloadChart(chartId, chartName);
            });
        });

        // Set up CSV download buttons (Matching app.js)
        document.querySelectorAll('.download-csv-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const endpoint = e.target.dataset.endpoint;
                const chartName = e.target.dataset.chartName || 'Comparison_Data';
                if (endpoint) {
                    await this.downloadCSV(endpoint, chartName);
                }
            });
        });
    }

    getDefaultChartName(chartId) {
        const chartNames = {
            'comparison-1': 'City_Health_Search_Trends',
            'IntermapDiv': 'City_Location_Map',
            'scatter1': 'Diabetes_Diarrhea_Correlation',
            'scatter2': 'Diabetes_Depression_Correlation',
            'scatter3': 'Diabetes_Vaccine_Correlation',
            'scatter4': 'Depression_Vaccine_Correlation',
            'container': 'Health_Conditions_Gauge'
        };
        return chartNames[chartId] || 'Comparison_Chart';
    }

    setupEventListeners() {
        // Handle city selection
        const citySelect = document.getElementById('city-select');
        if (citySelect) {
            citySelect.addEventListener('change', (e) => {
                this.currentCity = e.target.value;
                if (this.currentCity) {
                    console.log(`City selected: ${this.currentCity}`);
                    this.setBarPlot(this.currentCity);
                }
            });
        }

        // Handle window resize with debouncing
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const chartIds = ['comparison-1', 'IntermapDiv', 'scatter1', 'scatter2', 'scatter3', 'scatter4'];
                chartIds.forEach(id => {
                    const element = document.getElementById(id);
                    if (element && element.data) {
                        Plotly.Plots.resize(id);
                    }
                });

                // Also resize gauge if needed
                const gauge = document.getElementById('container');
                if (gauge && Highcharts.charts.length > 0) {
                    Highcharts.charts.forEach(chart => {
                        if (chart && chart.renderTo.id === 'container') {
                            chart.reflow();
                        }
                    });
                }
            }, 250);
        });

        // Add keyboard navigation for dropdown
        if (citySelect) {
            citySelect.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.setBarPlot(this.currentCity);
                }
            });
        }
    }

    async loadData() {
        if (this.isLoading) return;

        this.isLoading = true;
        console.log('📥 Loading comparison data...');

        // Show loading state
        this.showLoadingState();

        try {
            const response = await fetch('/allsearchrecord');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const rows = await response.json();
            this.statsData = rows.data;
            console.log(`Data loaded: ${this.statsData.length} records`);

            this.processData();
            this.setupCitySelector();

            // Force load Austin data
            console.log(`Setting initial chart for: ${this.currentCity}`);
            this.setBarPlot(this.currentCity);

        } catch (error) {
            console.error('Error loading data:', error);
            this.showErrorMessage('Failed to load data. Please refresh the page.');

            // Show placeholder data for Austin even if API fails
            this.showPlaceholderData();
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    showPlaceholderData() {
        // Create placeholder data for Austin
        const placeholderData = [
            { city: 'Austin', year: 2004, Cancer: 1500, cardiovascular: 1200, depression: 900, diabetes: 1800, diarrhea: 600, obesity: 1100, rehab: 400, stroke: 700, vaccine: 1300 },
            { city: 'Austin', year: 2005, Cancer: 1600, cardiovascular: 1250, depression: 950, diabetes: 1900, diarrhea: 650, obesity: 1150, rehab: 450, stroke: 750, vaccine: 1400 },
            { city: 'Austin', year: 2006, Cancer: 1550, cardiovascular: 1300, depression: 1000, diabetes: 2000, diarrhea: 700, obesity: 1200, rehab: 500, stroke: 800, vaccine: 1500 },
            { city: 'Austin', year: 2007, Cancer: 1650, cardiovascular: 1350, depression: 1050, diabetes: 2100, diarrhea: 750, obesity: 1250, rehab: 550, stroke: 850, vaccine: 1600 },
            { city: 'Austin', year: 2008, Cancer: 1700, cardiovascular: 1400, depression: 1100, diabetes: 2200, diarrhea: 800, obesity: 1300, rehab: 600, stroke: 900, vaccine: 1700 },
            { city: 'Austin', year: 2009, Cancer: 1750, cardiovascular: 1450, depression: 1150, diabetes: 2300, diarrhea: 850, obesity: 1350, rehab: 650, stroke: 950, vaccine: 1800 },
            { city: 'Austin', year: 2010, Cancer: 1800, cardiovascular: 1500, depression: 1200, diabetes: 2400, diarrhea: 900, obesity: 1400, rehab: 700, stroke: 1000, vaccine: 1900 },
            { city: 'Austin', year: 2011, Cancer: 1850, cardiovascular: 1550, depression: 1250, diabetes: 2500, diarrhea: 950, obesity: 1450, rehab: 750, stroke: 1050, vaccine: 2000 },
            { city: 'Austin', year: 2012, Cancer: 1900, cardiovascular: 1600, depression: 1300, diabetes: 2600, diarrhea: 1000, obesity: 1500, rehab: 800, stroke: 1100, vaccine: 2100 },
            { city: 'Austin', year: 2013, Cancer: 1950, cardiovascular: 1650, depression: 1350, diabetes: 2700, diarrhea: 1050, obesity: 1550, rehab: 850, stroke: 1150, vaccine: 2200 },
            { city: 'Austin', year: 2014, Cancer: 2000, cardiovascular: 1700, depression: 1400, diabetes: 2800, diarrhea: 1100, obesity: 1600, rehab: 900, stroke: 1200, vaccine: 2300 },
            { city: 'Austin', year: 2015, Cancer: 2050, cardiovascular: 1750, depression: 1450, diabetes: 2900, diarrhea: 1150, obesity: 1650, rehab: 950, stroke: 1250, vaccine: 2400 },
            { city: 'Austin', year: 2016, Cancer: 2100, cardiovascular: 1800, depression: 1500, diabetes: 3000, diarrhea: 1200, obesity: 1700, rehab: 1000, stroke: 1300, vaccine: 2500 },
            { city: 'Austin', year: 2017, Cancer: 2150, cardiovascular: 1850, depression: 1550, diabetes: 3100, diarrhea: 1250, obesity: 1750, rehab: 1050, stroke: 1350, vaccine: 2600 }
        ];

        this.statsData = placeholderData;
        this.processData();
        this.setupCitySelector();
        this.setBarPlot(this.currentCity);
    }

    showLoadingState() {
        // Add loading indicator to city selector
        const citySelect = document.getElementById('city-select');
        if (citySelect) {
            citySelect.disabled = true;
            citySelect.innerHTML = '<option value="">Loading cities...</option>';
        }
    }

    hideLoadingState() {
        // Remove loading indicator
        const citySelect = document.getElementById('city-select');
        if (citySelect) {
            citySelect.disabled = false;
        }
    }

    processData() {
        if (!this.statsData) return;
        const cities = [...new Set(this.statsData.map(row => row.city))].sort();
        this.cityList = cities.filter(city => city && city.trim() !== '');
        console.log(`Processed ${this.cityList.length} cities:`, this.cityList.slice(0, 5));
    }

    setupCitySelector() {
        const citySelector = document.getElementById('city-select');
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
                console.log(`Set default city to: ${this.currentCity}`);
            }
        }
    }

    setBarPlot(chosenCity) {
        console.log(`Setting bar plot for city: ${chosenCity}`);

        if (!this.statsData || !chosenCity) {
            console.error('No data or city selected');
            return;
        }

        const cityData = this.statsData.filter(row => row.city === chosenCity);
        console.log(`Found ${cityData.length} records for ${chosenCity}`);

        if (cityData.length === 0) {
            this.showErrorMessage(`No data available for ${chosenCity}`);
            return;
        }

        // Sort data by year
        cityData.sort((a, b) => a.year - b.year);

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

        // Store state for map
        this.currentState = cityData[0]?.postal || cityData[0]?.state || '';

        const traces = [
            {
                x: searchedYears, y: cancerSearch, name: 'Cancer', type: 'bar',
                marker: { color: this.colors.conditions.cancer },
                hovertemplate: '<b>Cancer</b><br>Year: %{x}<br>Searches: %{y:,}<extra></extra>'
            },
            {
                x: searchedYears, y: cardiovascularSearch, name: 'Cardiovascular', type: 'bar',
                marker: { color: this.colors.conditions.cardiovascular },
                hovertemplate: '<b>Cardiovascular</b><br>Year: %{x}<br>Searches: %{y:,}<extra></extra>'
            },
            {
                x: searchedYears, y: depressionSearch, name: 'Depression', type: 'bar',
                marker: { color: this.colors.conditions.depression },
                hovertemplate: '<b>Depression</b><br>Year: %{x}<br>Searches: %{y:,}<extra></extra>'
            },
            {
                x: searchedYears, y: diabetesSearch, name: 'Diabetes', type: 'bar',
                marker: { color: this.colors.conditions.diabetes },
                hovertemplate: '<b>Diabetes</b><br>Year: %{x}<br>Searches: %{y:,}<extra></extra>'
            },
            {
                x: searchedYears, y: diarrheaSearch, name: 'Diarrhea', type: 'bar',
                marker: { color: this.colors.conditions.diarrhea },
                hovertemplate: '<b>Diarrhea</b><br>Year: %{x}<br>Searches: %{y:,}<extra></extra>'
            },
            {
                x: searchedYears, y: obesitySearch, name: 'Obesity', type: 'bar',
                marker: { color: this.colors.conditions.obesity },
                hovertemplate: '<b>Obesity</b><br>Year: %{x}<br>Searches: %{y:,}<extra></extra>'
            },
            {
                x: searchedYears, y: rehabSearch, name: 'Rehab', type: 'bar',
                marker: { color: this.colors.conditions.rehab },
                hovertemplate: '<b>Rehab</b><br>Year: %{x}<br>Searches: %{y:,}<extra></extra>'
            },
            {
                x: searchedYears, y: strokeSearch, name: 'Stroke', type: 'bar',
                marker: { color: this.colors.conditions.stroke },
                hovertemplate: '<b>Stroke</b><br>Year: %{x}<br>Searches: %{y:,}<extra></extra>'
            },
            {
                x: searchedYears, y: vaccineSearch, name: 'Vaccine', type: 'bar',
                marker: { color: this.colors.conditions.vaccine },
                hovertemplate: '<b>Vaccine</b><br>Year: %{x}<br>Searches: %{y:,}<extra></extra>'
            }
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
                    },
                    standoff: 15
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
                tickmode: 'array',
                tickvals: searchedYears,
                ticktext: searchedYears.map(year => year.toString()),
                tickangle: 0
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
                    standoff: 15
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
                automargin: true,
                tickangle: 0
            },
            plot_bgcolor: '#ffffff',
            paper_bgcolor: '#ffffff',
            margin: { t: 80, r: 40, b: 80, l: 80 },
            barmode: 'stack',
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
            },
            annotations: [{
                text: `📍 ${chosenCity}`,
                x: 0.02,
                y: 1.05,
                xref: 'paper',
                yref: 'paper',
                showarrow: false,
                font: {
                    size: 16,
                    color: this.colors.primary.navy,
                    weight: 'bold'
                },
                align: 'left',
                yanchor: 'top'
            }],
            hoverlabel: {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                font: {
                    size: 14,
                    family: this.fonts.title.family,
                    color: this.colors.primary.slate
                },
                bordercolor: this.colors.primary.slate
            }
        };

        const chartElement = document.getElementById('comparison-1');
        if (chartElement) {
            chartElement.innerHTML = '';
        }

        console.log('Creating bar plot...');
        Plotly.newPlot('comparison-1', traces, layout, this.getChartConfig());

        // Calculate total search volume for the city
        const totalSearchVolume = cityData.reduce((sum, row) => {
            return sum + (
                (row.Cancer || 0) + (row.cardiovascular || 0) + (row.depression || 0) +
                (row.diabetes || 0) + (row.diarrhea || 0) + (row.obesity || 0) +
                (row.rehab || 0) + (row.stroke || 0) + (row.vaccine || 0)
            );
        }, 0);

        // Get location data for the city
        const locationData = this.getCityLocationData(chosenCity);
        const stateCode = locationData.state;
        const latitude = locationData.latitude;
        const longitude = locationData.longitude;

        // Update map with exact coordinates
        this.updateEnhancedCityMap(latitude, longitude, chosenCity, totalSearchVolume, stateCode);

        // Update scatter plots with location tag
        this.updateScatterPlots(cityData, searchedYears, chosenCity);

        // Update gauge
        this.updateGauge(cityData, chosenCity);
    }

    getCityLocationData(cityName) {
        // Check if we have exact location data for this city
        if (this.cityLocations[cityName]) {
            return this.cityLocations[cityName];
        }

        // Try to find a partial match
        for (const [key, data] of Object.entries(this.cityLocations)) {
            if (key.includes(cityName) || cityName.includes(key)) {
                return data;
            }
        }

        // Default fallback coordinates (center of US)
        return {
            state: 'US',
            latitude: 39.8283,
            longitude: -98.5795
        };
    }

    updateEnhancedCityMap(lat, lon, cityName, searchVolume, stateCode) {
        console.log(`Updating map for ${cityName} at ${lat}, ${lon}`);

        const mapContainer = document.getElementById('IntermapDiv');
        if (mapContainer) {
            mapContainer.innerHTML = '';
        }

        // BUBBLE SIZE CALCULATION
        const minSize = 20;
        const maxSize = 80;
        const minSearch = 50000;
        const maxSearch = 2000000;

        // Calculate bubble size
        const sizeScale = Math.log10(Math.max(searchVolume, minSearch)) / Math.log10(maxSearch);
        const bubbleSize = minSize + (sizeScale * (maxSize - minSize));

        // Color intensity based on search volume
        const intensity = Math.min(searchVolume / maxSearch, 1);
        const hue = 120 - (intensity * 30);
        const saturation = 80 + (intensity * 20);
        const lightness = 40 + (intensity * 30);
        const markerColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

        // Glow effect for higher search volumes
        const glowSize = bubbleSize * 1.5;
        const glowOpacity = 0.3 * intensity;

        // Create data for the city bubble
        const cityMarker = {
            type: "scattermapbox",
            mode: "markers",
            lat: [lat],
            lon: [lon],
            text: [cityName],
            marker: {
                size: bubbleSize,
                color: markerColor,
                opacity: 0.95,
                sizemode: 'diameter',
                symbol: 'circle',
                line: {
                    color: '#ffffff',
                    width: 2
                }
            },
            name: cityName,
            hovertemplate: `
                <b>${cityName}</b><br>
                📊 <b>Total Search Volume:</b> ${searchVolume.toLocaleString()}<br>
                📍 <b>Location:</b> ${lat.toFixed(4)}°, ${lon.toFixed(4)}°<br>
                🏙️ <b>State:</b> ${stateCode}
                <extra></extra>
            `
        };

        // Add glow effect
        const glowMarker = {
            type: "scattermapbox",
            mode: "markers",
            lat: [lat],
            lon: [lon],
            marker: {
                size: glowSize,
                color: markerColor,
                opacity: glowOpacity,
                sizemode: 'diameter',
                symbol: 'circle'
            },
            name: 'Glow',
            showlegend: false,
            hoverinfo: 'skip'
        };

        // State boundary highlight
        const stateHighlight = {
            type: "choroplethmapbox",
            geojson: "https://raw.githubusercontent.com/python-visualization/folium/master/examples/data/us-states.json",
            locations: [stateCode],
            z: [100],
            colorscale: [
                [0, 'rgba(0, 100, 0, 0.2)'],
                [1, 'rgba(0, 150, 0, 0.3)']
            ],
            zmin: 0,
            zmax: 100,
            featureidkey: "properties.name",
            showscale: false,
            marker: {
                line: {
                    color: '#00C853',
                    width: 2
                },
                opacity: 0.3
            },
            hoverinfo: 'skip'
        };

        // Calculate appropriate zoom level based on state size
        let zoomLevel = 5;
        if (['RI', 'DE', 'CT', 'NJ', 'MA'].includes(stateCode)) {
            zoomLevel = 7; // Small states need more zoom
        } else if (['TX', 'CA', 'AK', 'MT'].includes(stateCode)) {
            zoomLevel = 4; // Large states need less zoom
        }

        const layout = {
            width: null,
            height: 500,
            mapbox: {
                style: "dark",
                center: { lon: lon, lat: lat }, // Automatically center on selected city
                zoom: zoomLevel, // Dynamic zoom based on state size
                bearing: 0,
                pitch: 0
            },
            plot_bgcolor: '#000000',
            paper_bgcolor: '#000000',
            margin: { t: 40, r: 0, b: 0, l: 0 },
            autosize: true,
            font: {
                family: this.fonts.title.family,
                color: '#ffffff'
            },
            showlegend: false,
            annotations: [{
                text: `📍 ${cityName}`,
                x: 0.02,
                y: 1.03,
                xref: 'paper',
                yref: 'paper',
                showarrow: false,
                font: {
                    size: 18,
                    color: '#ffffff',
                    weight: 'bold',
                    family: this.fonts.title.family
                },
                align: 'left',
                yanchor: 'top',
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                borderpad: 8,
                borderwidth: 1,
                bordercolor: '#00C853'
            }]
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

        console.log('Creating map...');
        Plotly.newPlot('IntermapDiv', [stateHighlight, glowMarker, cityMarker], layout, config);
    }

    updateScatterPlots(cityData, years, cityName) {
        console.log(`Updating scatter plots for ${cityName}`);

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
                color: this.colors.conditions.diabetes
            },
            {
                id: 'scatter2',
                title: 'Diabetes vs Depression Correlation',
                x: diabetesSearch,
                y: depressionSearch,
                xLabel: 'Diabetes Searches',
                yLabel: 'Depression Searches',
                color: this.colors.conditions.depression
            },
            {
                id: 'scatter3',
                title: 'Diabetes vs Vaccine Correlation',
                x: diabetesSearch,
                y: vaccineSearch,
                xLabel: 'Diabetes Searches',
                yLabel: 'Vaccine Searches',
                color: this.colors.conditions.vaccine
            },
            {
                id: 'scatter4',
                title: 'Depression vs Vaccine Correlation',
                x: depressionSearch,
                y: vaccineSearch,
                xLabel: 'Depression Searches',
                yLabel: 'Vaccine Searches',
                color: this.colors.conditions.diarrhea
            }
        ];

        scatterConfigs.forEach(config => {
            const container = document.getElementById(config.id);
            if (container) {
                container.innerHTML = '';
            }

            const scatter = {
                x: config.x,
                y: config.y,
                mode: 'markers',
                type: 'scatter',
                marker: {
                    size: 14,
                    color: config.color,
                    opacity: 0.8,
                    line: {
                        color: '#ffffff',
                        width: 2
                    }
                },
                name: config.title,
                text: years.map(year => `Year: ${year}`),
                hovertemplate: `<b>📍 ${cityName}</b><br>Year: %{text}<br>X: %{x:,}<br>Y: %{y:,}<extra></extra>`
            };

            // Add trend line
            const trendLine = {
                x: config.x,
                y: config.y,
                mode: 'lines',
                type: 'scatter',
                line: {
                    color: config.color,
                    width: 2,
                    dash: 'dash'
                },
                name: 'Trend',
                showlegend: false
            };

            const layout = {
                width: null,
                height: 400,
                xaxis: {
                    title: {
                        text: config.xLabel,
                        font: {
                            size: this.fonts.axisTitle.size - 2,
                            family: this.fonts.axisTitle.family,
                            color: this.colors.primary.slate,
                            weight: this.fonts.axisTitle.weight
                        },
                        standoff: 15
                    },
                    showgrid: true,
                    gridcolor: 'rgba(0, 0, 0, 0.1)',
                    gridwidth: 1,
                    tickfont: {
                        size: 14,
                        family: this.fonts.tickLabels.family,
                        color: this.colors.primary.slate
                    },
                    automargin: true,
                    showline: true,
                    linecolor: '#b0bec5',
                    linewidth: 1,
                    tickangle: 0
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
                        standoff: 15
                    },
                    showgrid: true,
                    gridcolor: 'rgba(0, 0, 0, 0.1)',
                    gridwidth: 1,
                    tickfont: {
                        size: 14,
                        family: this.fonts.tickLabels.family,
                        color: this.colors.primary.slate
                    },
                    automargin: true,
                    showline: true,
                    linecolor: '#b0bec5',
                    linewidth: 1,
                    tickangle: 0
                },
                plot_bgcolor: '#ffffff',
                paper_bgcolor: '#ffffff',
                margin: { t: 60, r: 40, b: 60, l: 70 },
                showlegend: false,
                autosize: true,
                font: {
                    family: this.fonts.title.family,
                    color: this.colors.primary.slate
                },
                annotations: [{
                    text: `📍 ${cityName}`,
                    x: 0.02,
                    y: 1.05,
                    xref: 'paper',
                    yref: 'paper',
                    showarrow: false,
                    font: {
                        size: 16,
                        color: this.colors.primary.navy,
                        weight: 'bold'
                    },
                    align: 'left',
                    yanchor: 'top'
                }],
                hoverlabel: {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    font: {
                        size: 14,
                        family: this.fonts.title.family,
                        color: this.colors.primary.slate
                    },
                    bordercolor: this.colors.primary.slate
                }
            };

            console.log(`Creating scatter plot: ${config.id}`);
            Plotly.newPlot(config.id, [scatter, trendLine], layout, this.getChartConfig());
        });
    }

    updateGauge(cityData, cityName) {
        console.log(`Updating gauge for ${cityName}`);

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
        if (gaugeContainer) {
            gaugeContainer.innerHTML = '';
        }

        console.log('Creating gauge chart...');
        console.log(`Diabetes: ${diabetesPercent}%, Depression: ${depressionPercent}%, Diarrhea: ${diarrheaPercent}%`);

        Highcharts.chart('container', {
            chart: {
                type: 'solidgauge',
                height: '100%',
                backgroundColor: 'transparent'
            },

            title: {
                text: '', // Removed title as requested
                style: {
                    display: 'none'
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
                        enabled: true,
                        format: '{point.y:.1f}%',
                        style: {
                            fontSize: '16px',
                            fontWeight: 'bold',
                            textOutline: 'none'
                        },
                        borderWidth: 0,
                        backgroundColor: 'none'
                    },
                    linecap: 'round',
                    stickyTracking: false
                }
            },

            series: [{
                name: 'Diabetes',
                data: [{
                    color: this.colors.conditions.diabetes,
                    radius: '112%',
                    innerRadius: '88%',
                    y: parseFloat(diabetesPercent)
                }],
                dataLabels: {
                    y: -20,
                    style: {
                        fontSize: '14px',
                        color: this.colors.conditions.diabetes
                    }
                }
            }, {
                name: 'Depression',
                data: [{
                    color: this.colors.conditions.depression,
                    radius: '87%',
                    innerRadius: '63%',
                    y: parseFloat(depressionPercent)
                }],
                dataLabels: {
                    y: -20,
                    style: {
                        fontSize: '14px',
                        color: this.colors.conditions.depression
                    }
                }
            }, {
                name: 'Diarrhea',
                data: [{
                    color: this.colors.conditions.diarrhea,
                    radius: '62%',
                    innerRadius: '38%',
                    y: parseFloat(diarrheaPercent)
                }],
                dataLabels: {
                    y: -20,
                    style: {
                        fontSize: '14px',
                        color: this.colors.conditions.diarrhea
                    }
                }
            }],

            tooltip: {
                borderWidth: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                shadow: true,
                style: {
                    fontSize: '14px'
                },
                pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y:.1f}%</b> of total searches<br/>'
            },

            credits: {
                enabled: false
            }
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
                filename: 'comparison_chart',
                height: 500,
                width: 800,
                scale: 2
            }
        };
    }

    downloadChart(chartId, chartName) {
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

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger alert-dismissible fade show';
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '20px';
        errorDiv.style.right = '20px';
        errorDiv.style.zIndex = '1000';
        errorDiv.innerHTML = `
            <strong>Error:</strong> ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        `;
        document.body.appendChild(errorDiv);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM Content Loaded - Initializing Comparison Dashboard');

    // Remove loading classes immediately
    document.querySelectorAll('.chart-loading, .spinner-border').forEach(el => el.remove());

    // Clear all chart containers
    const chartIds = ['comparison-1', 'IntermapDiv', 'scatter1', 'scatter2', 'scatter3', 'scatter4', 'container'];
    chartIds.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = '';
        }
    });

    // Initialize dashboard
    window.comparisonDashboard = new ComparisonDashboard();

    // Add accessibility improvements
    document.querySelectorAll('[data-toggle="dropdown"]').forEach(dropdown => {
        dropdown.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    // Force a resize after a short delay to ensure charts render properly
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 1000);
});