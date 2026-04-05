/**
 * Rent Estimator Page Module
 */

export async function renderRentEstimator(container) {
  // Configuración predeterminada
  const state = {
    canon: 1500000,
    inversion: 28000000,
    vacancia: 1, // meses al año
    incremento: 9, // %
    admin: 120000,
    mantenimiento: 70000,
    gasto_incremento: 7, // % (inflación/incremento de gastos)
  };

  const formatCurrency = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  const formatPercent = (val) => new Intl.NumberFormat('es-CO', { style: 'percent', maximumFractionDigits: 1 }).format(val / 100);

  // Template
  container.innerHTML = `
    <div class="max-w-6xl mx-auto space-y-8 animate-fade-in text-surface-900 border border-surface-200 bg-surface-50 p-6 rounded-2xl">
      <!-- Header -->
      <div class="mb-4 text-center">
        <h2 class="text-3xl font-extrabold text-surface-900">Simulador de Arrendamiento</h2>
        <p class="text-surface-500 mt-2">Estime el retorno de inversión y flujo de caja a 5 años</p>
      </div>

      <!-- Controles -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Canon -->
        <div class="glass-card p-5 bg-white border-l-4 border-primary-500 shadow-sm rounded-xl">
          <label class="block text-sm font-semibold text-surface-600 mb-1">Canon mensual inicial</label>
          <div class="text-2xl font-bold text-surface-900 mb-2" id="val-canon">${formatCurrency(state.canon)}</div>
          <input type="range" id="input-canon" min="500000" max="10000000" step="50000" value="${state.canon}" class="w-full accent-primary-600">
        </div>

        <!-- Inversión -->
        <div class="glass-card p-5 bg-white border-l-4 border-surface-500 shadow-sm rounded-xl">
          <label class="block text-sm font-semibold text-surface-600 mb-1">Inversión en terminación</label>
          <div class="text-2xl font-bold text-surface-900 mb-2" id="val-inversion">${formatCurrency(state.inversion)}</div>
          <input type="range" id="input-inversion" min="0" max="100000000" step="1000000" value="${state.inversion}" class="w-full accent-surface-600">
        </div>

        <!-- Administración -->
        <div class="glass-card p-5 bg-white border-l-4 border-rose-400 shadow-sm rounded-xl">
          <label class="block text-sm font-semibold text-surface-600 mb-1">Administración mensual</label>
          <div class="text-2xl font-bold text-surface-900 mb-2" id="val-admin">${formatCurrency(state.admin)}</div>
          <input type="range" id="input-admin" min="0" max="2000000" step="10000" value="${state.admin}" class="w-full accent-rose-400">
        </div>

        <!-- Mantenimiento -->
        <div class="glass-card p-5 bg-white border-l-4 border-rose-500 shadow-sm rounded-xl">
          <label class="block text-sm font-semibold text-surface-600 mb-1">Mantenimiento estimado mensual</label>
          <div class="text-2xl font-bold text-surface-900 mb-2" id="val-mantenimiento">${formatCurrency(state.mantenimiento)}</div>
          <input type="range" id="input-mantenimiento" min="0" max="1000000" step="10000" value="${state.mantenimiento}" class="w-full accent-rose-500">
        </div>

        <!-- Vacancia -->
        <div class="glass-card p-5 bg-white border-l-4 border-accent-500 shadow-sm rounded-xl">
          <label class="block text-sm font-semibold text-surface-600 mb-1">Vacancia anual estimada</label>
          <div class="text-2xl font-bold text-surface-900 mb-2" id="val-vacancia">${state.vacancia} mes / año</div>
          <input type="range" id="input-vacancia" min="0" max="6" step="1" value="${state.vacancia}" class="w-full accent-accent-500">
        </div>

        <!-- Incremento -->
        <div class="glass-card p-5 bg-white border-l-4 border-amber-500 shadow-sm rounded-xl">
          <label class="block text-sm font-semibold text-surface-600 mb-1">Incremento canon anual</label>
          <div class="flex items-center justify-between mb-2">
             <div class="text-2xl font-bold text-surface-900" id="val-incremento">${state.incremento}%</div>
             <div class="text-sm text-surface-500">Gastos: <span id="val-gasto-inc">${state.gasto_incremento}%</span></div>
          </div>
          <input type="range" id="input-incremento" min="0" max="20" step="0.5" value="${state.incremento}" class="w-full accent-amber-500">
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div class="p-4 bg-white shadow-sm rounded-xl">
          <p class="text-xs font-bold text-surface-500 uppercase tracking-wider mb-1">Recuperación inversión</p>
          <p class="text-xl md:text-3xl font-extrabold text-surface-900" id="metric-recuperacion">--</p>
          <p class="text-sm text-surface-500">años</p>
        </div>
        <div class="p-4 bg-white shadow-sm rounded-xl">
          <p class="text-xs font-bold text-surface-500 uppercase tracking-wider mb-1">Flujo neto 5 años</p>
          <p class="text-xl md:text-3xl font-extrabold text-primary-600" id="metric-flujo">--</p>
          <p class="text-sm text-surface-500">COP acumulado</p>
        </div>
        <div class="p-4 bg-white shadow-sm rounded-xl">
          <p class="text-xs font-bold text-surface-500 uppercase tracking-wider mb-1">Rentabilidad año 1</p>
          <p class="text-xl md:text-3xl font-extrabold text-accent-600" id="metric-roi">--</p>
          <p class="text-sm text-surface-500">anual sobre inversión</p>
        </div>
        <div class="p-4 bg-white shadow-sm rounded-xl">
          <p class="text-xs font-bold text-surface-500 uppercase tracking-wider mb-1">Canon año 5</p>
          <p class="text-xl md:text-3xl font-extrabold text-surface-900" id="metric-canon5">--</p>
          <p class="text-sm text-surface-500">COP / mes estimado</p>
        </div>
      </div>

      <!-- Chart and Table -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
        <div class="bg-white p-6 shadow-sm rounded-xl flex flex-col justify-center">
            <h3 class="text-lg font-bold text-surface-900 mb-4 uppercase tracking-wide text-center">Proyección a 5 Años</h3>
            <div class="relative w-full h-[400px]">
                <canvas id="rentChart"></canvas>
            </div>
        </div>
        <div class="bg-white p-6 shadow-sm rounded-xl overflow-x-auto">
          <h3 class="text-lg font-bold text-surface-900 mb-4 uppercase tracking-wide">Detalle Anual</h3>
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-surface-200 text-surface-500">
                <th class="py-2 px-2">Año</th>
                <th class="py-2 px-2">Canon/mes</th>
                <th class="py-2 px-2">Ingresos</th>
                <th class="py-2 px-2">Gastos</th>
                <th class="py-2 px-2">Flujo neto</th>
                <th class="py-2 px-2">Acumulado</th>
              </tr>
            </thead>
            <tbody id="table-body">
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Inicializar Gráfico
  const ctx = document.getElementById('rentChart').getContext('2d');
  const chart = new Chart(ctx, {
    type: 'bar',
    data: { labels: ['Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5'], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: { type: 'linear', display: true, position: 'left', ticks: { callback: (val) => '$' + (val/1000000).toFixed(1) + 'M' } },
        y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, ticks: { callback: (val) => '$' + (val/1000000).toFixed(1) + 'M' } }
      },
      plugins: {
          legend: { position: 'top' },
          tooltip: {
              callbacks: {
                  label: function(context) {
                      let label = context.dataset.label || '';
                      if (label) label += ': ';
                      if (context.parsed.y !== null) {
                          label += formatCurrency(context.parsed.y);
                      }
                      return label;
                  }
              }
          }
      }
    }
  });

  // Función de actualización
  function updateData() {
    let currentCanon = state.canon;
    let currentAdminMaint = (state.admin + state.mantenimiento) * 12;

    const data = {
      years: [],
      canons: [],
      ingresos: [],
      gastos: [],
      flujos: [],
      acumulados: []
    };

    let acumulado = -state.inversion;

    for (let i = 1; i <= 5; i++) {
        // Ingresos: Canon * (12 - vacancia)
        const ingreso = currentCanon * (12 - state.vacancia);
        const gasto = currentAdminMaint;
        const flujo = ingreso - gasto;
        acumulado += flujo;

        data.years.push(i);
        data.canons.push(currentCanon);
        data.ingresos.push(ingreso);
        data.gastos.push(gasto);
        data.flujos.push(flujo);
        data.acumulados.push(acumulado);

        // Incrementos para el siguiente año
        currentCanon = currentCanon * (1 + state.incremento / 100);
        currentAdminMaint = currentAdminMaint * (1 + state.gasto_incremento / 100);
    }

    // Actualizar Tabla
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const tr = document.createElement('tr');
        tr.className = "border-b border-surface-100 hover:bg-surface-50";
        tr.innerHTML = `
            <td class="py-3 px-2 font-bold text-surface-900">${data.years[i]}</td>
            <td class="py-3 px-2 text-surface-700">${formatCurrency(data.canons[i])}</td>
            <td class="py-3 px-2 text-accent-600 font-medium">${formatCurrency(data.ingresos[i])}</td>
            <td class="py-3 px-2 text-rose-500 font-medium">${formatCurrency(data.gastos[i])}</td>
            <td class="py-3 px-2 text-primary-600 font-semibold">${formatCurrency(data.flujos[i])}</td>
            <td class="py-3 px-2 font-bold ${data.acumulados[i] < 0 ? 'text-rose-600' : 'text-accent-600'}">${formatCurrency(data.acumulados[i])}</td>
        `;
        tbody.appendChild(tr);
    }

    // Actualizar Métricas
    // 1. Recuperación
    let recYear = Array.from({length: 5}, (_, i) => i).find(i => data.acumulados[i] >= 0);
    if (recYear !== undefined) {
        // Aproximación lineal para fracción de año
        let prevAcum = recYear === 0 ? -state.inversion : data.acumulados[recYear - 1];
        let currFlujo = data.flujos[recYear];
        let fraction = Math.abs(prevAcum) / currFlujo;
        let years = recYear + fraction;
        document.getElementById('metric-recuperacion').innerText = years.toFixed(1);
    } else {
        document.getElementById('metric-recuperacion').innerText = '> 5';
    }

    document.getElementById('metric-flujo').innerText = formatCurrency(data.acumulados[4] + state.inversion); // Flujo neto generado
    
    let roi = state.inversion > 0 ? (data.flujos[0] / state.inversion) * 100 : 0;
    document.getElementById('metric-roi').innerText = state.inversion > 0 ? roi.toFixed(1) + '%' : '∞';
    document.getElementById('metric-canon5').innerText = formatCurrency(data.canons[4]);

    // Actualizar Chart
    chart.data.datasets = [
        {
            type: 'bar',
            label: 'Ingresos anuales',
            data: data.ingresos,
            backgroundColor: '#38d9a9', // accent-400
            borderRadius: 4,
            yAxisID: 'y'
        },
        {
            type: 'bar',
            label: 'Gastos anuales',
            data: data.gastos,
            backgroundColor: '#fb923c', // orange-400 (como en la imagen) o rose
            borderRadius: 4,
            yAxisID: 'y'
        },
        {
            type: 'line',
            label: 'Flujo neto acumulado',
            data: data.acumulados,
            borderColor: '#4c6ef5', // primary-600
            backgroundColor: '#4c6ef5',
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 6,
            pointHoverRadius: 8,
            yAxisID: 'y1'
        }
    ];
    chart.update();
  }

  // Bind Listeners
  const binds = [
      {id: 'input-canon', stateKey: 'canon', valId: 'val-canon', fmt: formatCurrency},
      {id: 'input-inversion', stateKey: 'inversion', valId: 'val-inversion', fmt: formatCurrency},
      {id: 'input-admin', stateKey: 'admin', valId: 'val-admin', fmt: formatCurrency},
      {id: 'input-mantenimiento', stateKey: 'mantenimiento', valId: 'val-mantenimiento', fmt: formatCurrency},
      {id: 'input-vacancia', stateKey: 'vacancia', valId: 'val-vacancia', fmt: v => v + ' mes / año'},
      {id: 'input-incremento', stateKey: 'incremento', valId: 'val-incremento', fmt: v => v + '%'}
  ];

  binds.forEach(b => {
      document.getElementById(b.id).addEventListener('input', (e) => {
          state[b.stateKey] = parseFloat(e.target.value);
          document.getElementById(b.valId).innerText = b.fmt(state[b.stateKey]);
          
          if (b.stateKey === 'incremento') {
             // Sincronizar el incremento de gasto un par de puntos por debajo de inflación
             state.gasto_incremento = Math.max(0, state.incremento - 2); 
             document.getElementById('val-gasto-inc').innerText = state.gasto_incremento + '%';
          }

          updateData();
      });
  });

  // Primera renderización
  updateData();
}
