// ═══════════════════════════════════════════
// SUSTAINA — Chart Components (Chart.js wrappers)
// ═══════════════════════════════════════════

import Chart from 'chart.js/auto';

const chartInstances = {};

function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
}

// Colors matching design system
const COLORS = {
  green900: '#1a3409',
  green800: '#2d5016',
  green700: '#3a6b1e',
  green600: '#4a8528',
  green500: '#5a9e32',
  green400: '#6bb344',
  green300: '#8ec96e',
  green200: '#b5dd9a',
  green100: '#ddf0cd',
  gold: '#d4a843',
  neutral: '#9e9e93',
  gridLine: '#e0e0d8',
  text: '#5e5e56',
};

// ─── Donut Chart ─── //
export function createDonutChart(canvasId, data) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  // Accessibility
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', `Donut chart showing ${data.map(d => `${d.label}: ${d.value}%`).join(', ')}`);

  chartInstances[canvasId] = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.label),
      datasets: [{
        data: data.map(d => d.value),
        backgroundColor: data.map(d => d.color),
        borderWidth: 0,
        borderRadius: 4,
        spacing: 2,
      }]
    },
    options: {
      cutout: '70%',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#2d2d2a',
          titleFont: { family: 'Inter', size: 13 },
          bodyFont: { family: 'Inter', size: 12 },
          padding: 12,
          cornerRadius: 10,
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`
          }
        }
      },
      animation: {
        animateRotate: true,
        duration: 1200,
        easing: 'easeOutQuart'
      }
    }
  });
}

// ─── Line Chart ─── //
export function createLineChart(canvasId, labels, values, label = 'Emissions') {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const gradient = canvas.getContext('2d').createLinearGradient(0, 0, 0, 250);
  gradient.addColorStop(0, 'rgba(45, 80, 22, 0.15)');
  gradient.addColorStop(1, 'rgba(45, 80, 22, 0)');

  chartInstances[canvasId] = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label,
        data: values,
        borderColor: COLORS.green700,
        backgroundColor: gradient,
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderColor: COLORS.green700,
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Inter', size: 11 }, color: COLORS.text },
          border: { display: false }
        },
        y: {
          grid: { color: COLORS.gridLine, drawBorder: false },
          ticks: { font: { family: 'Inter', size: 11 }, color: COLORS.text },
          border: { display: false },
          beginAtZero: true
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#2d2d2a',
          titleFont: { family: 'Inter', size: 13 },
          bodyFont: { family: 'Inter', size: 12 },
          padding: 12,
          cornerRadius: 10,
          displayColors: false,
          callbacks: {
            label: (ctx) => `${ctx.parsed.y} kg CO₂`
          }
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      }
    }
  });
}

// ─── Bar Chart ─── //
export function createBarChart(canvasId, labels, values, label = 'Emissions') {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  chartInstances[canvasId] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label,
        data: values,
        backgroundColor: values.map((_, i) => {
          const opacity = 0.4 + (i / values.length) * 0.6;
          return `rgba(45, 80, 22, ${opacity})`;
        }),
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 40,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Inter', size: 11 }, color: COLORS.text },
          border: { display: false }
        },
        y: {
          grid: { color: COLORS.gridLine, drawBorder: false },
          ticks: { font: { family: 'Inter', size: 11 }, color: COLORS.text },
          border: { display: false },
          beginAtZero: true
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#2d2d2a',
          titleFont: { family: 'Inter', size: 13 },
          bodyFont: { family: 'Inter', size: 12 },
          padding: 12,
          cornerRadius: 10,
          displayColors: false,
        }
      },
      animation: {
        duration: 800,
        easing: 'easeOutQuart'
      }
    }
  });
}

// Cleanup all charts
export function destroyAllCharts() {
  Object.keys(chartInstances).forEach(destroyChart);
}
rt);
}
