/**
 * Chart.js factory — pre-configured chart builders.
 */

const COLORS = {
    primary: '#4c6ef5',
    primaryLight: 'rgba(76, 110, 245, 0.1)',
    accent: '#20c997',
    accentLight: 'rgba(32, 201, 151, 0.1)',
    red: '#e03131',
    redLight: 'rgba(224, 49, 49, 0.1)',
    amber: '#f59f00',
    gray: '#868e96',
    surface: '#f8f9fa',
};

const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                font: { family: 'Inter', size: 12, weight: '500' },
                padding: 16,
                usePointStyle: true,
                pointStyleWidth: 10,
            },
        },
        tooltip: {
            backgroundColor: 'rgba(33, 37, 41, 0.95)',
            titleFont: { family: 'Inter', size: 13, weight: '600' },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 12,
            cornerRadius: 10,
            displayColors: true,
        },
    },
};

/** Create a bar chart (Income vs Expenses). */
export function createBarChart(ctx, labels, incomeData, expenseData) {
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Ingresos',
                    data: incomeData,
                    backgroundColor: COLORS.accent,
                    borderRadius: 8,
                    barPercentage: 0.6,
                },
                {
                    label: 'Gastos',
                    data: expenseData,
                    backgroundColor: COLORS.red,
                    borderRadius: 8,
                    barPercentage: 0.6,
                },
            ],
        },
        options: {
            ...baseOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.04)' },
                    ticks: { font: { family: 'Inter', size: 11 } },
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { family: 'Inter', size: 11 } },
                },
            },
        },
    });
}

/** Create a doughnut chart (property type distribution). */
export function createDoughnutChart(ctx, labels, data) {
    const colors = ['#4c6ef5', '#20c997', '#f59f00', '#e03131', '#845ef7', '#339af0'];
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors.slice(0, data.length),
                borderWidth: 0,
                hoverOffset: 8,
            }],
        },
        options: {
            ...baseOptions,
            cutout: '70%',
            plugins: {
                ...baseOptions.plugins,
                legend: {
                    ...baseOptions.plugins.legend,
                    position: 'bottom',
                },
            },
        },
    });
}

/** Create cash flow line chart (12 months). */
export function createCashFlowChart(ctx, months, income, expenses, net) {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Ingresos Proyectados',
                    data: income,
                    borderColor: COLORS.accent,
                    backgroundColor: COLORS.accentLight,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 2.5,
                },
                {
                    label: 'Gastos Proyectados',
                    data: expenses,
                    borderColor: COLORS.red,
                    backgroundColor: COLORS.redLight,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 2.5,
                },
                {
                    label: 'Balance Neto',
                    data: net,
                    borderColor: COLORS.primary,
                    borderDash: [6, 4],
                    fill: false,
                    tension: 0.4,
                    pointRadius: 3,
                    borderWidth: 2,
                },
            ],
        },
        options: {
            ...baseOptions,
            interaction: { mode: 'index', intersect: false },
            scales: {
                y: {
                    grid: { color: 'rgba(0,0,0,0.04)' },
                    ticks: { font: { family: 'Inter', size: 11 } },
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { family: 'Inter', size: 11 } },
                },
            },
        },
    });
}
