// API Base URL for Netlify Functions
const API_BASE = '/.netlify/functions';

// Map old endpoints to new function endpoints
const ENDPOINTS = {
    'searchbyyear': '/searchbyyear',
    'searchyearandcondition': '/searchyearandcondition',
    'searchbystate': '/searchbystate',
    'searchbycity': '/searchbycity',
    'bystateandyear': '/bystateandyear',
    'casesleadingdeath': '/casesleadingdeath',
    'allsearchrecord': '/allsearchrecord',
    'location': '/location',
    'conditions': '/conditions',
    'mostsserached': '/mostsserached',
    'totalcondition': '/totalcondition'
};

async function fetchData(endpointName) {
    try {
        const response = await fetch(`${API_BASE}${ENDPOINTS[endpointName]}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.error || 'Unknown error');
        }
    } catch (error) {
        console.error(`Error fetching ${endpointName}:`, error);
        throw error;
    }
}

// Usage in your existing code:
async function loadDashboardData() {
    const yearData = await fetchData('searchbyyear');
    const stateData = await fetchData('searchbystate');
    // ... use data for charts
}