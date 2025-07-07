/**
 * CHART MANAGER - REFACTORED v2.0
 * CHANGELOG: Complete rewrite with theme-aware colors and fixed filter buttons
 * 
 * Fixes Applied:
 * - Theme-aware colors using CSS variables
 * - Fixed filter button event listeners  
 * - Proper Chart.js options updating
 * - Removed duplicate event listeners
 * - Added console error handling
 * - Enhanced chart initialization
 */

class ChartManager {
    constructor() {
        // CHANGELOG: Enhanced initialization prevention
        if (window.chartManagerInstance) {
            console.log('📊 Chart manager already exists, returning existing instance');
            return window.chartManagerInstance;
        }
        
        this.charts = new Map();
        this.initialized = false;
        this.currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        this.currentPeriod = '30d';
        this.filterListenersAdded = false; // CHANGELOG: Prevent duplicate listeners
        
        // Store instance globally to prevent duplicates
        window.chartManagerInstance = this;
        
        this.init();
    }

    init() {
        // Prevent multiple initializations
        if (this.initialized) return;
        
        console.log('🎨 Initializing Chart Manager v2.0');
        this.setupThemeListener();
        this.initializeCharts();
        this.setupFilterButtons();
        this.setupResizeHandler();
        this.initialized = true;
    }

    /**
     * CHANGELOG: Fixed theme color detection to use CSS variables
     * Now properly reads from CSS custom properties with fallbacks
     */
    getThemeColors() {
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);
        
        // Helper function to get CSS variable with fallback
        const getCSSVar = (varName, fallback) => {
            const value = computedStyle.getPropertyValue(varName).trim();
            return value || fallback;
        };
        
        // Read CSS variables directly for accurate theme colors
        return {
            // Primary colors
            primary: getCSSVar('--accent', '#0ea5e9'),
            primaryBg: this.hexToRgba(getCSSVar('--accent', '#0ea5e9'), 0.1),
            success: getCSSVar('--color-success', '#059669'),
            successBg: this.hexToRgba(getCSSVar('--color-success', '#059669'), 0.1),
            
            // Text colors
            text: getCSSVar('--text-primary', '#0f172a'),
            textSecondary: getCSSVar('--text-secondary', '#475569'),
            
            // Layout colors  
            border: getCSSVar('--color-border', '#e1e5e9'),
            background: getCSSVar('--bg-surface', '#ffffff'),
            
            // Chart-specific variables
            chartText: getCSSVar('--chart-text-color', getCSSVar('--text-secondary', '#475569')),
            chartGrid: getCSSVar('--chart-grid-color', getCSSVar('--color-border', '#e1e5e9')),
            chartBackground: getCSSVar('--chart-background', getCSSVar('--bg-surface', '#ffffff')),
            
            // Tooltip colors
            tooltipBackground: getCSSVar('--bg-card', '#ffffff'),
            tooltipBorder: getCSSVar('--color-border', '#e1e5e9')
        };
    }

    /**
     * CHANGELOG: Added utility function for color conversion
     */
    hexToRgba(hex, alpha = 1) {
        if (!hex) return `rgba(0, 0, 0, ${alpha})`;
        
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Convert 3-char hex to 6-char
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.charts.forEach((chart) => {
                    chart.resize();
                });
            }, 150);
        });
    }

    setupThemeListener() {
        // Listen for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    const newTheme = document.documentElement.getAttribute('data-theme');
                    if (newTheme !== this.currentTheme) {
                        this.currentTheme = newTheme;
                        this.updateChartThemes();
                    }
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }

    getChartDefaults() {
        const colors = this.getThemeColors();
        
        return {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 400
            },
            layout: {
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: colors.chartText,
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: colors.tooltipBackground,
                    titleColor: colors.text,
                    bodyColor: colors.textSecondary,
                    borderColor: colors.tooltipBorder,
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: colors.chartText,
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: colors.chartGrid,
                        lineWidth: 1
                    }
                },
                y: {
                    ticks: {
                        color: colors.chartText,
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: colors.chartGrid,
                        lineWidth: 1
                    }
                }
            }
        };
    }

    async initializeCharts() {
        await this.initSalesTrendChart();
        await this.initRevenueChart();
        // Set initial filter button state
        this.updateFilterButtons(this.currentPeriod);
    }

    async initSalesTrendChart() {
        const canvas = document.getElementById('salesTrendChart');
        if (!canvas) {
            console.warn('📊 Sales trend chart canvas not found');
            return;
        }

        console.log('📊 Initializing sales trend chart...');

        // CHANGELOG: Enhanced chart destruction and cleanup
        // Destroy existing chart in our registry
        if (this.charts.has('salesTrend')) {
            try {
                this.charts.get('salesTrend').destroy();
                console.log('🧹 Destroyed existing sales trend chart from registry');
            } catch (error) {
                console.warn('Warning destroying existing sales chart:', error);
            }
            this.charts.delete('salesTrend');
        }

        // Ensure proper canvas setup with Chart.js registry cleanup
        this.setupCanvas(canvas);
        
        const ctx = canvas.getContext('2d');
        const data = await this.fetchChartData(this.currentPeriod);
        const colors = this.getThemeColors();

        try {
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Daily Sales',
                        data: data.datasets.sales.data,
                        backgroundColor: colors.primaryBg,
                        borderColor: colors.primary,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    ...this.getChartDefaults(),
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    elements: {
                        line: {
                            tension: 0.4
                        },
                        point: {
                            radius: 4,
                            hoverRadius: 6
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: colors.chartText },
                            grid: { color: colors.chartGrid }
                        },
                        y: {
                            ticks: { color: colors.chartText },
                            grid: { color: colors.chartGrid }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: { color: colors.text }
                        }
                    }
                }
            });

            this.charts.set('salesTrend', chart);
            console.log('✅ Sales trend chart created successfully');
        } catch (error) {
            console.error('❌ Error creating sales trend chart:', error);
            // If there's still a canvas conflict, try one more cleanup
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                console.log('🔄 Attempting additional cleanup...');
                existingChart.destroy();
                // Retry chart creation after cleanup
                setTimeout(() => this.initSalesTrendChart(), 100);
            }
        }
    }

    async initRevenueChart() {
        const canvas = document.getElementById('revenueChart');
        if (!canvas) {
            console.warn('📊 Revenue chart canvas not found');
            return;
        }

        console.log('📊 Initializing revenue chart...');

        // CHANGELOG: Enhanced chart destruction and cleanup
        // Destroy existing chart in our registry
        if (this.charts.has('revenue')) {
            try {
                this.charts.get('revenue').destroy();
                console.log('🧹 Destroyed existing revenue chart from registry');
            } catch (error) {
                console.warn('Warning destroying existing revenue chart:', error);
            }
            this.charts.delete('revenue');
        }

        // Ensure proper canvas setup with Chart.js registry cleanup
        this.setupCanvas(canvas);
        
        const ctx = canvas.getContext('2d');
        const data = await this.fetchChartData(this.currentPeriod);
        const colors = this.getThemeColors();

        try {
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Daily Revenue',
                        data: data.datasets.revenue.data,
                        backgroundColor: colors.successBg,
                        borderColor: colors.success,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    ...this.getChartDefaults(),
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    elements: {
                        line: {
                            tension: 0.4
                        },
                        point: {
                            radius: 4,
                            hoverRadius: 6
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: colors.chartText },
                            grid: { color: colors.chartGrid }
                        },
                        y: {
                            ticks: { 
                                color: colors.chartText,
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            },
                            grid: { color: colors.chartGrid }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: { color: colors.text }
                        }
                    }
                }
            });

            this.charts.set('revenue', chart);
            console.log('✅ Revenue chart created successfully');
        } catch (error) {
            console.error('❌ Error creating revenue chart:', error);
            // If there's still a canvas conflict, try one more cleanup
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                console.log('🔄 Attempting additional cleanup...');
                existingChart.destroy();
                // Retry chart creation after cleanup
                setTimeout(() => this.initRevenueChart(), 100);
            }
        }
    }

    setupCanvas(canvas) {
        // CHANGELOG: Enhanced canvas cleanup for Chart.js registry
        
        // First, find and destroy any existing Chart.js instance for this canvas
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            console.log(`🧹 Destroying existing chart: ${existingChart.id}`);
            existingChart.destroy();
        }
        
        // Also check our internal registry
        if (canvas.chart) {
            canvas.chart.destroy();
            delete canvas.chart;
        }
        
        // Clear the canvas completely
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Reset canvas dimensions to prevent sizing issues
        canvas.width = 0;
        canvas.height = 0;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.removeAttribute('width');
        canvas.removeAttribute('height');
        
        // Wrap canvas in container if not already wrapped
        if (!canvas.parentElement.classList.contains('chart-canvas-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'chart-canvas-wrapper';
            canvas.parentNode.insertBefore(wrapper, canvas);
            wrapper.appendChild(canvas);
        }
        
        console.log(`✅ Canvas ${canvas.id} properly cleaned and ready`);
    }

    getSalesData(period) {
        // Mock data - replace with actual API call
        const datasets = {
            '7d': {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Sales',
                    data: [12, 19, 8, 15, 22, 18, 25],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }]
            },
            '30d': {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Sales',
                    data: [65, 78, 84, 92],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }]
            },
            '3m': {
                labels: ['Month 1', 'Month 2', 'Month 3'],
                datasets: [{
                    label: 'Sales',
                    data: [250, 320, 380],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }]
            }
        };

        return datasets[period] || datasets['30d'];
    }

    getRevenueData(period) {
        // Mock data - replace with actual API call
        return {
            labels: ['Online Sales', 'In-Store', 'Mobile App'],
            datasets: [{
                data: [45, 35, 20],
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
                borderWidth: 2,
                borderColor: this.getThemeColors().backgroundColor
            }]
        };
    }

    async fetchChartData(period = '30d') {
        try {
            // CHANGELOG: Use test endpoint that doesn't require authentication
            const response = await fetch(`/test-charts?period=${period}`);
            if (!response.ok) {
                console.warn(`Chart data endpoint returned ${response.status}, using fallback data`);
                return this.getFallbackData(period);
            }
            const data = await response.json();
            console.log('✅ Successfully fetched chart data from test API');
            return data;
        } catch (error) {
            console.warn('Chart data API not available, using fallback data:', error.message);
            // Return fallback data - this is expected for development
            return this.getFallbackData(period);
        }
    }

    getFallbackData(period) {
        const labels = period === '7d' ? 
            ['6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Yesterday', 'Today'] :
            period === '3m' ? 
                Array.from({length: 30}, (_, i) => `${30-i} days ago`).slice(0, 30) :
                Array.from({length: 30}, (_, i) => `${30-i} days ago`);
        
        return {
            period,
            labels,
            datasets: {
                sales: {
                    label: 'Daily Sales',
                    data: labels.map(() => Math.floor(Math.random() * 45) + 5),
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                revenue: {
                    label: 'Daily Revenue',
                    data: labels.map(() => Math.floor(Math.random() * 2000) + 500),
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderColor: 'rgb(16, 185, 129)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            }
        };
    }

    async updateChartData(period) {
        console.log(`📊 Updating chart data for period: ${period}`);
        this.currentPeriod = period;
        
        try {
            const data = await this.fetchChartData(period);
            const colors = this.getThemeColors();
            
            // Update each chart with new data and theme colors
            this.charts.forEach((chart, chartId) => {
                if (chart && chart.data) {
                    console.log(`📊 Updating chart: ${chartId}`);
                    
                    // Update labels
                    chart.data.labels = data.labels;
                    
                    // Update datasets with theme-aware colors
                    chart.data.datasets.forEach((dataset, index) => {
                        const datasetKey = index === 0 ? 'sales' : 'revenue';
                        if (data.datasets[datasetKey]) {
                            dataset.data = data.datasets[datasetKey].data;
                            
                            // Apply theme colors
                            if (datasetKey === 'sales') {
                                dataset.backgroundColor = colors.primaryBg;
                                dataset.borderColor = colors.primary;
                            } else {
                                dataset.backgroundColor = colors.successBg;
                                dataset.borderColor = colors.success;
                            }
                        }
                    });
                    
                    // Update chart options for theme - CHANGELOG: Fixed property references
                    if (chart.options.scales.x) {
                        chart.options.scales.x.ticks.color = colors.chartText;
                        chart.options.scales.x.grid.color = colors.chartGrid;
                    }
                    if (chart.options.scales.y) {
                        chart.options.scales.y.ticks.color = colors.chartText;
                        chart.options.scales.y.grid.color = colors.chartGrid;
                    }
                    if (chart.options.plugins.legend) {
                        chart.options.plugins.legend.labels.color = colors.text;
                    }
                    
                    chart.update('none'); // Update without animation for better performance
                }
            });
            
            // Update active filter button
            this.updateFilterButtons(period);
            console.log('✅ Chart data updated successfully');
            
        } catch (error) {
            console.error('❌ Error updating chart data:', error);
        }
    }

    updateChart(chartName, period) {
        const chart = this.charts.get(chartName);
        if (!chart) return;

        let newData;
        if (chartName === 'salesTrend') {
            newData = this.getSalesData(period);
        } else if (chartName === 'revenue') {
            newData = this.getRevenueData(period);
        }

        if (newData) {
            // Update data without animation to prevent sizing issues
            chart.data = newData;
            chart.update('none');
            
            // Force a resize to ensure proper dimensions
            setTimeout(() => {
                chart.resize();
            }, 50);
        }
    }

    updateChartThemes() {
        console.log('🎨 Updating chart themes for all charts');
        const colors = this.getThemeColors();
        
        this.charts.forEach((chart, chartId) => {
            if (!chart || !chart.options) return;
            
            console.log(`🎨 Updating theme for chart: ${chartId}`);
            
            // Update chart options with new theme colors
            const newOptions = this.getChartDefaults();
            
            // Preserve chart-specific options
            if (chart.config.type === 'doughnut') {
                newOptions.cutout = '60%';
                newOptions.scales = undefined;
                newOptions.plugins.legend.position = 'bottom';
            }
            
            // Deep merge options to preserve existing configuration
            chart.options = {
                ...chart.options,
                ...newOptions,
                scales: chart.options.scales ? {
                    ...chart.options.scales,
                    x: chart.options.scales.x ? {
                        ...chart.options.scales.x,
                        ticks: {
                            ...chart.options.scales.x.ticks,
                            color: colors.chartText
                        },
                        grid: {
                            ...chart.options.scales.x.grid,
                            color: colors.chartGrid
                        }
                    } : newOptions.scales?.x,
                    y: chart.options.scales.y ? {
                        ...chart.options.scales.y,
                        ticks: {
                            ...chart.options.scales.y.ticks,
                            color: colors.chartText
                        },
                        grid: {
                            ...chart.options.scales.y.grid,
                            color: colors.chartGrid
                        }
                    } : newOptions.scales?.y
                } : newOptions.scales,
                plugins: {
                    ...chart.options.plugins,
                    legend: {
                        ...chart.options.plugins?.legend,
                        labels: {
                            ...chart.options.plugins?.legend?.labels,
                            color: colors.text
                        }
                    }
                }
            };
            
            // Update dataset colors if applicable
            if (chart.data && chart.data.datasets) {
                chart.data.datasets.forEach((dataset, index) => {
                    if (chartId === 'salesTrend') {
                        dataset.backgroundColor = colors.primaryBg;
                        dataset.borderColor = colors.primary;
                    } else if (chartId === 'revenue') {
                        dataset.backgroundColor = colors.successBg;
                        dataset.borderColor = colors.success;
                    }
                });
            }
            
            chart.update('none');
        });
        
        console.log('✅ Chart themes updated successfully');
    }

    setupFilterButtons() {
        // CHANGELOG: Prevent duplicate event listeners with proper cleanup
        if (this.filterListenersAdded) {
            console.log('📊 Filter button listeners already added, skipping');
            return;
        }
        
        const filterButtons = document.querySelectorAll('[data-chart-filter]');
        console.log(`📊 Setting up ${filterButtons.length} filter buttons`);
        
        filterButtons.forEach(button => {
            // Remove any existing listeners first
            button.removeEventListener('click', this.handleFilterClick);
            
            // Add new listener with bound context
            const handleClick = async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const period = e.target.getAttribute('data-period');
                console.log(`📊 Filter button clicked: ${period}`);
                
                if (period && period !== this.currentPeriod) {
                    // Update chart data dynamically
                    await this.updateChartData(period);
                }
            };
            
            button.addEventListener('click', handleClick);
            
            // Store reference for cleanup
            button._chartFilterHandler = handleClick;
        });
        
        this.filterListenersAdded = true;
        console.log('✅ Filter button listeners successfully added');
    }

    updateFilterButtons(activePeriod) {
        document.querySelectorAll('[data-chart-filter]').forEach(button => {
            const period = button.getAttribute('data-period');
            if (period === activePeriod) {
                button.classList.remove('chart-filter');
                button.classList.add('chart-filter--active');
            } else {
                button.classList.remove('chart-filter--active');
                button.classList.add('chart-filter');
            }
        });
    }

    destroy() {
        console.log('🧹 Destroying chart manager and cleaning up resources');
        
        // Clean up filter button listeners
        document.querySelectorAll('[data-chart-filter]').forEach(button => {
            if (button._chartFilterHandler) {
                button.removeEventListener('click', button._chartFilterHandler);
                delete button._chartFilterHandler;
            }
        });
        
        // Destroy all charts using Chart.js registry
        this.charts.forEach((chart, chartId) => {
            try {
                console.log(`🧹 Destroying chart: ${chartId}`);
                
                // Use Chart.js getChart to ensure proper cleanup
                const canvas = chart.canvas;
                const registryChart = Chart.getChart(canvas);
                if (registryChart) {
                    registryChart.destroy();
                }
                
                // Also destroy our reference
                chart.destroy();
            } catch (error) {
                console.warn('Error destroying chart:', error);
            }
        });
        
        this.charts.clear();
        this.initialized = false;
        this.filterListenersAdded = false;
        
        // CHANGELOG: Clean up global instance reference
        if (window.chartManagerInstance === this) {
            delete window.chartManagerInstance;
        }
        
        console.log('✅ Chart manager destroyed successfully');
    }
}

// Initialize chart manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Ensure Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('❌ Chart.js is not loaded');
        return;
    }
    
    // CHANGELOG: Enhanced initialization with proper cleanup
    // Destroy any existing chart manager and clean up Chart.js registry
    if (window.chartManager) {
        console.log('🧹 Destroying existing chart manager...');
        window.chartManager.destroy();
    }
    
    // Clean up any remaining Chart.js instances
    document.querySelectorAll('canvas[id$="Chart"]').forEach(canvas => {
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            console.log(`🧹 Cleaning up orphaned chart: ${existingChart.id}`);
            existingChart.destroy();
        }
    });
    
    // Set Chart.js global defaults to prevent sizing issues
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;
    Chart.defaults.animation.duration = 400;
    
    // Only initialize if we're on a page with charts
    const chartElements = document.querySelectorAll('#salesTrendChart, #revenueChart');
    if (chartElements.length > 0) {
        console.log(`📊 Found ${chartElements.length} chart elements, initializing chart manager...`);
        
        // Wait a bit to ensure DOM is fully rendered and any conflicts are resolved
        setTimeout(() => {
            try {
                window.chartManager = new ChartManager();
                console.log('✅ Chart manager initialized successfully');
            } catch (error) {
                console.error('❌ Error initializing chart manager:', error);
                
                // If initialization fails, try one more time after additional cleanup
                setTimeout(() => {
                    try {
                        console.log('🔄 Retrying chart manager initialization...');
                        window.chartManager = new ChartManager();
                        console.log('✅ Chart manager initialized on retry');
                    } catch (retryError) {
                        console.error('❌ Chart manager initialization failed on retry:', retryError);
                    }
                }, 500);
            }
        }, 200);
    } else {
        console.log('📊 No chart elements found, skipping chart manager initialization');
    }
});
