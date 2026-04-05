/**
 * Rent Estimator Page Module (Fase 2)
 */

export async function renderRentEstimator(container, propertyData = {}) {
  // Configuración predeterminada basada en la propiedad actual o fallback
  const state = {
    compra: propertyData.commercial_value || 250000000,
    inversion: 0, // Se asume 0 para propiedades ya establecidas, o manual
    canon: propertyData.estimated_rent || 1500000,
    vacancia: 1, // meses al año
    incremento: 9, // %
    admin: propertyData.administration_fee || 120000,
    mantenimiento: 70000,
    gasto_incremento: 7, // % (inflación/incremento de gastos)
    valorizacion: 5, // % anual
    plazo: 10, // Años de proyección
  };

  const formatCurrency = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  const formatPercent = (val) => new Intl.NumberFormat('es-CO', { style: 'percent', maximumFractionDigits: 1 }).format(val / 100);

  // Template
  container.innerHTML = `
    <div class="max-w-7xl mx-auto space-y-8 animate-fade-in text-surface-900 border border-surface-200 bg-surface-50 p-6 rounded-2xl">
      <!-- Header -->
      <div class="mb-4 text-center">
        <h2 class="text-3xl font-extrabold text-surface-900">Simulador Avanzado de Arrendamiento</h2>
        <p class="text-surface-500 mt-2">Modele múltiples escenarios, valorización inmobiliaria e identifique puntos de equilibrio.</p>
      </div>

      <!-- Controles -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        <!-- Compra -->
        <div class="glass-card p-5 bg-white border-l-4 border-surface-700 shadow-sm rounded-xl">
          <label class="block text-sm font-semibold text-surface-600 mb-1">Precio de Compra</label>
          <div class="text-2xl font-bold text-surface-900 mb-2" id="val-compra">${formatCurrency(state.compra)}</div>
          <input type="range" id="input-compra" min="0" max="2000000000" step="5000000" value="${state.compra}" class="w-full accent-surface-700">
        </div>

        <!-- Inversión -->
        <div class="glass-card p-5 bg-white border-l-4 border-surface-500 shadow-sm rounded-xl">
          <label class="block text-sm font-semibold text-surface-600 mb-1">Inversión en Remodelación</label>
          <div class="text-2xl font-bold text-surface-900 mb-2" id="val-inversion">${formatCurrency(state.inversion)}</div>
          <input type="range" id="input-inversion" min="0" max="500000000" step="1000000" value="${state.inversion}" class="w-full accent-surface-500">
        </div>

        <!-- Valorización -->
        <div class="glass-card p-5 bg-white border-l-4 border-emerald-500 shadow-sm rounded-xl">
          <label class="block text-sm font-semibold text-surface-600 mb-1">Valorización Anual</label>
          <div class="text-2xl font-bold text-surface-900 mb-2" id="val-valorizacion">${state.valorizacion}% / año</div>
          <input type="range" id="input-valorizacion" min="0" max="20" step="0.5" value="${state.valorizacion}" class="w-full accent-emerald-500">
        </div>

        <!-- Plazo -->
        <div class="glass-card p-5 bg-white border-l-4 border-indigo-500 shadow-sm rounded-xl">
          <label class="block text-sm font-semibold text-surface-600 mb-1">Plazo de Proyección</label>
          <div class="text-2xl font-bold text-surface-900 mb-2" id="val-plazo">${state.plazo} años</div>
          <input type="range" id="input-plazo" min="1" max="30" step="1" value="${state.plazo}" class="w-full accent-indigo-500">
        </div>

        <!-- Canon -->
        <div class="glass-card p-5 bg-white border-l-4 border-primary-500 shadow-sm rounded-xl">
          <label class="block text-sm font-semibold text-surface-600 mb-1">Canon mensual inicial</label>
          <div class="text-2xl font-bold text-surface-900 mb-2" id="val-canon">${formatCurrency(state.canon)}</div>
          <input type="range" id="input-canon" min="500000" max="15000000" step="50000" value="${state.canon}" class="w-full accent-primary-600">
        </div>

        <!-- Incremento -->
        <div class="glass-card p-5 bg-white border-l-4 border-amber-500 shadow-sm rounded-xl">
          <label class="block text-sm font-semibold text-surface-600 mb-1">Incremento canon anual</label>
          <div class="flex items-center justify-between mb-2">
             <div class="text-2xl font-bold text-surface-900" id="val-incremento">${state.incremento}%</div>
             <div class="text-sm text-surface-500">Gto. Index: <span id="val-gasto-inc">${state.gasto_incremento}%</span></div>
          </div>
          <input type="range" id="input-incremento" min="0" max="20" step="0.5" value="${state.incremento}" class="w-full accent-amber-500">
        </div>

        <!-- Vacancia -->
        <div class="glass-card p-5 bg-white border-l-4 border-accent-500 shadow-sm rounded-xl">
          <label class="block text-sm font-semibold text-surface-600 mb-1">Vacancia anual estimada</label>
          <div class="text-2xl font-bold text-surface-900 mb-2" id="val-vacancia">${state.vacancia} mes/año</div>
          <input type="range" id="input-vacancia" min="0" max="12" step="1" value="${state.vacancia}" class="w-full accent-accent-500">
        </div>

        <!-- Administración y Mantenimiento combinados -->
        <div class="glass-card p-5 bg-white border-l-4 border-rose-400 shadow-sm rounded-xl space-y-4">
          <div>
              <label class="block text-sm font-semibold text-surface-600 mb-1 flex justify-between">
                <span>Administración</span>
                <span class="font-bold text-surface-900" id="val-admin">${formatCurrency(state.admin)}</span>
              </label>
              <input type="range" id="input-admin" min="0" max="2000000" step="10000" value="${state.admin}" class="w-full accent-rose-400 h-1">
          </div>
          <div>
              <label class="block text-sm font-semibold text-surface-600 mb-1 flex justify-between">
                <span>Mantenimiento</span>
                <span class="font-bold text-surface-900" id="val-mantenimiento">${formatCurrency(state.mantenimiento)}</span>
              </label>
              <input type="range" id="input-mantenimiento" min="0" max="2000000" step="10000" value="${state.mantenimiento}" class="w-full accent-rose-500 h-1">
          </div>
        </div>

      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <div class="p-4 bg-white shadow-sm rounded-xl border border-surface-100 relative overflow-hidden">
          <div class="absolute right-0 top-0 h-full w-2 bg-emerald-400"></div>
          <p class="text-[10px] font-bold text-surface-500 uppercase tracking-wider mb-1">Recup. Efectivo Cte.</p>
          <p class="text-xl md:text-3xl font-extrabold text-surface-900" id="metric-recuperacion">--</p>
          <p class="text-xs text-surface-500 leading-tight">Años (solo flujo neto)</p>
        </div>
        <div class="p-4 bg-white shadow-sm rounded-xl border border-surface-100 relative overflow-hidden">
          <div class="absolute right-0 top-0 h-full w-2 bg-primary-500"></div>
          <p class="text-[10px] font-bold text-surface-500 uppercase tracking-wider mb-1">Ganancia Patrimonial <span id="metric-ano-ganancia-label"></span></p>
          <p class="text-xl md:text-2xl font-extrabold text-primary-600 truncate" id="metric-flujo">--</p>
          <p class="text-xs text-surface-500 leading-tight">Flujo acum. + Valorización</p>
        </div>
        <div class="p-4 bg-white shadow-sm rounded-xl border border-surface-100 relative overflow-hidden">
          <div class="absolute right-0 top-0 h-full w-2 bg-accent-500"></div>
          <p class="text-[10px] font-bold text-surface-500 uppercase tracking-wider mb-1">Rentabilidad Bruta Año 1</p>
          <p class="text-xl md:text-3xl font-extrabold text-accent-600" id="metric-roi">--</p>
          <p class="text-xs text-surface-500 leading-tight">Anual sobre Inv. Inicial</p>
        </div>
        <div class="p-4 bg-white shadow-sm rounded-xl border border-surface-100 relative overflow-hidden">
          <div class="absolute right-0 top-0 h-full w-2 bg-amber-400"></div>
          <p class="text-[10px] font-bold text-surface-500 uppercase tracking-wider mb-1">Valor Predio Proyectado</p>
          <p class="text-xl md:text-2xl font-extrabold text-surface-900 truncate" id="metric-valor-n">--</p>
          <p class="text-xs text-surface-500 leading-tight">Al finalizar el plazo</p>
        </div>
      </div>

      <!-- Chart and Table -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
        <div class="bg-white p-6 shadow-sm rounded-xl flex flex-col justify-center border border-surface-100">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-surface-900 uppercase tracking-wide">Visión Histórica</h3>
                <span class="text-xs px-2 py-1 bg-surface-100 text-surface-600 rounded-lg font-bold">Horizonte: <span id="chart-hz-label"></span> Años</span>
            </div>
            <div class="relative w-full h-[400px]">
                <canvas id="rentChart"></canvas>
            </div>
        </div>
        <div class="bg-white shadow-sm rounded-xl flex flex-col border border-surface-100 overflow-hidden text-sm">
          <div class="p-4 bg-surface-50 border-b border-surface-100">
              <h3 class="text-lg font-bold text-surface-900 uppercase tracking-wide">Detalle del Ejercicio</h3>
          </div>
          <div class="overflow-x-auto max-h-[464px] relative">
            <table class="w-full text-right">
              <thead class="sticky top-0 bg-surface-50 shadow-sm z-10">
                <tr class="border-b border-surface-200 text-surface-500 text-xs">
                  <th class="py-3 px-3 text-center !w-12">Año</th>
                  <th class="py-3 px-3">Canon Mensual</th>
                  <th class="py-3 px-3">Flujo Anual</th>
                  <th class="py-3 px-3">Valor Inmueble</th>
                  <th class="py-3 px-3">Patrimonio Total</th>
                </tr>
              </thead>
              <tbody id="table-body">
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Matriz de Sensibilidad -->
      <div class="mt-8 bg-white p-6 shadow-sm rounded-xl border border-surface-100">
          <h3 class="text-lg font-bold text-surface-900 mb-1 uppercase tracking-wide">Matriz de Sensibilidad de Recuperación</h3>
          <p class="text-sm text-surface-500 mb-4">Muestra la ganancia patrimonial total (Flujo Acumulado + Valorización). Verde indica que la suma generada supera el capital inicialmente invertido.</p>
          
          <div class="overflow-x-auto">
              <table class="w-full border-collapse text-sm text-center">
                  <thead class="bg-surface-50" id="matrix-head">
                      <!-- Generado por JS -->
                  </thead>
                  <tbody id="matrix-body">
                      <!-- Generado por JS -->
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
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: { type: 'linear', display: true, position: 'left', ticks: { callback: (val) => '$' + (val/1000000).toFixed(0) + 'M' } },
        y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, ticks: { callback: (val) => '$' + (val/1000000).toFixed(0) + 'M' } }
      },
      plugins: {
          legend: { position: 'top', labels: { boxWidth: 12 } },
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

  // Función de actualización principal
  function updateData() {
    let currentCanon = state.canon;
    let currentAdminMaint = (state.admin + state.mantenimiento) * 12;
    let initialPropValue = state.compra + state.inversion;
    let currentPropValue = initialPropValue;

    const data = {
      labels: [],
      canons: [],
      ingresos: [],
      gastos: [],
      flujos: [],
      acumuladosFlujo: [], // Solo liquidez de la operación
      valorPredios: [],
      patrimonios: [] // Liquidez acumulada + Apreciación ganada
    };

    let acumuladoFlujoCaja = -state.inversion; // Asumiendo la compra como "canje" de activo y la remodelación como sunk cost en capital. Para ser estrictos con caja: - (compra+inversion).
    let netCashFlowIn = -(state.compra + state.inversion); 

    for (let i = 1; i <= state.plazo; i++) {
        // Ingresos: Canon * (12 - vacancia)
        const ingreso = currentCanon * (12 - state.vacancia);
        const gasto = currentAdminMaint;
        const flujo = ingreso - gasto; // Flujo Neto Año
        
        netCashFlowIn += flujo; 
        currentPropValue = currentPropValue * (1 + state.valorizacion / 100);
        
        const plusvalia = currentPropValue - initialPropValue;
        const gananciaPatrimonial = plusvalia + (netCashFlowIn + initialPropValue); // Equivalent to: CurrentProp + NetCashFlowIn

        data.labels.push(`A${i}`);
        data.canons.push(currentCanon);
        data.ingresos.push(ingreso);
        data.gastos.push(gasto);
        data.flujos.push(flujo);
        data.acumuladosFlujo.push(netCashFlowIn);
        data.valorPredios.push(currentPropValue);
        data.patrimonios.push(netCashFlowIn + currentPropValue); // Patrimonio líquido contable

        // Incrementos para el siguiente año
        currentCanon = currentCanon * (1 + state.incremento / 100);
        currentAdminMaint = currentAdminMaint * (1 + state.gasto_incremento / 100);
    }

    // --- Actualizar UI Métricas Principales ---
    document.getElementById('metric-ano-ganancia-label').innerText = `(Año ${state.plazo})`;
    document.getElementById('chart-hz-label').innerText = state.plazo;
    
    // Recuperación de Caja Cte (Break-Even Cashflow solo operando, sin vender predio)
    // Asumiremos que el capital a recuperar con la renta es solo Inicial
    let recYearCash = data.acumuladosFlujo.findIndex(v => (v + initialPropValue) >= initialPropValue); 
    // ^ v = netCashFlowIn. NetcashFlowIn cruza 0 cuando (Flujos == compra + inversion)
    
    if (recYearCash !== -1) {
        document.getElementById('metric-recuperacion').innerText = recYearCash + 1;
    } else {
        document.getElementById('metric-recuperacion').innerText = `> ${state.plazo}`;
    }

    // Ganancia patrimonial
    // Es el Equity al final del plazo menos la inversión original depositada
    const gananciaTotal = data.patrimonios[state.plazo - 1] - initialPropValue;
    document.getElementById('metric-flujo').innerText = formatCurrency(gananciaTotal);
    document.getElementById('metric-flujo').className = `text-xl md:text-2xl font-extrabold truncate ${gananciaTotal >= 0 ? 'text-primary-600' : 'text-rose-500'}`;
    
    // ROI
    const grossRoi = initialPropValue > 0 ? (data.flujos[0] / initialPropValue) * 100 : 0;
    document.getElementById('metric-roi').innerText = initialPropValue > 0 ? grossRoi.toFixed(2) + '%' : '∞';
    
    document.getElementById('metric-valor-n').innerText = formatCurrency(data.valorPredios[state.plazo - 1]);


    // --- Actualizar Tabla de Detalle ---
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';
    for (let i = 0; i < state.plazo; i++) {
        const tr = document.createElement('tr');
        tr.className = "border-b border-surface-100 hover:bg-surface-100 transition-colors";
        tr.innerHTML = `
            <td class="py-2 px-3 font-bold text-surface-900 text-center">${i + 1}</td>
            <td class="py-2 px-3 text-surface-700">${formatCurrency(data.canons[i])}</td>
            <td class="py-2 px-3 text-emerald-600 font-medium">${formatCurrency(data.flujos[i])}</td>
            <td class="py-2 px-3 text-amber-600 font-medium">${formatCurrency(data.valorPredios[i])}</td>
            <td class="py-2 px-3 font-bold ${data.patrimonios[i] < initialPropValue ? 'text-surface-500' : 'text-primary-600'}">${formatCurrency(data.patrimonios[i])}</td>
        `;
        tbody.appendChild(tr);
    }

    // --- Actualizar Chart JS ---
    chart.data.labels = data.labels;
    chart.data.datasets = [
        {
            type: 'bar',
            label: 'Ingresos Oper.',
            data: data.ingresos,
            backgroundColor: '#38d9a9', // accent-400
            borderRadius: 4,
            yAxisID: 'y'
        },
        {
            type: 'bar',
            label: 'Gastos Oper.',
            data: data.gastos,
            backgroundColor: '#fb923c', // orange-400
            borderRadius: 4,
            yAxisID: 'y'
        },
        {
            type: 'line',
            label: 'Valor Inmueble',
            data: data.valorPredios,
            borderColor: '#f59f00', // amber-500
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.1,
            pointRadius: 0,
            yAxisID: 'y1'
        },
        {
            type: 'line',
            label: 'Patrimonio Acum. (Eq)',
            data: data.patrimonios,
            borderColor: '#4c6ef5', // primary-600
            backgroundColor: '#4c6ef5',
            borderWidth: 3,
            tension: 0.4,
            pointRadius: data.labels.length <= 15 ? 4 : 0,
            pointHoverRadius: 6,
            yAxisID: 'y1'
        }
    ];
    chart.update();

    // Actualizar Matriz
    renderSensibilityMatrix();
  }

  // --- Matriz de Sensibilidad ---
  function renderSensibilityMatrix() {
      // Hitos de años (max 4 o 5 columnas basados en el plazo)
      const hitos = [];
      if (state.plazo >= 5) hitos.push(5);
      if (state.plazo >= 10) hitos.push(10);
      if (state.plazo >= 20) hitos.push(20);
      if (state.plazo >= 30) hitos.push(30);
      // Incluir el plazo actual si no está exacto
      if (!hitos.includes(state.plazo)) {
          hitos.push(state.plazo);
          hitos.sort((a,b)=>a-b);
      }

      // Variaciones de Canon (-20%, -10%, Base, +10%, +20%)
      const vars = [-0.2, -0.1, 0, 0.1, 0.2];
      
      const thead = document.getElementById('matrix-head');
      thead.innerHTML = `<tr>
          <th class="py-3 px-2 border-b border-r border-surface-200">Canon Mensual</th>
          <th class="py-3 px-2 border-b border-surface-200 text-xs text-surface-500 bg-surface-100/50">Variación</th>
          ${hitos.map(h => `<th class="py-3 px-2 border-b border-surface-200 text-primary-900 font-bold">Año ${h}</th>`).join('')}
      </tr>`;

      const tbody = document.getElementById('matrix-body');
      tbody.innerHTML = '';

      let initialPropValue = state.compra + state.inversion;

      vars.forEach(v => {
          let testCanon = state.canon * (1 + v);
          
          let rowHtml = `<td class="py-3 px-2 border-b border-r border-surface-100 font-semibold text-surface-800">${formatCurrency(testCanon)}</td>`;
          let bgColorVar = v === 0 ? 'bg-primary-50 text-primary-700 font-bold' : (v < 0 ? 'text-rose-500' : 'text-emerald-600');
          rowHtml += `<td class="py-3 px-2 border-b border-surface-100 ${bgColorVar} text-xs">${v === 0 ? 'BASE' : (v>0?'+':'')+(v*100)+'%'}</td>`;

          hitos.forEach(h => {
              // Calcular Simulación para 'h' Años
              let runCanon = testCanon;
              let currentAdminMaint = (state.admin + state.mantenimiento) * 12;
              let runPropValue = initialPropValue;
              let runNetCash = -initialPropValue;

              for (let i = 1; i <= h; i++) {
                  let flujo = (runCanon * (12 - state.vacancia)) - currentAdminMaint;
                  runNetCash += flujo;
                  runPropValue = runPropValue * (1 + state.valorizacion / 100);
                  
                  runCanon *= (1 + state.incremento / 100);
                  currentAdminMaint *= (1 + state.gasto_incremento / 100);
              }
              
              let patrimonio = runNetCash + runPropValue;
              let ganancia = patrimonio - initialPropValue;
              
              // Coloración térmica simple (Verde si > 0 ganancia neta o ganancia substancial)
              let cellClass = ganancia >= 0 ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'bg-rose-50 text-rose-600';
              
              rowHtml += `<td class="py-3 px-2 border-b border-surface-100 border-l ${cellClass}">${formatCurrency(ganancia)}</td>`;
          });
          
          const tr = document.createElement('tr');
          tr.className = "hover:bg-surface-50 transition-colors";
          tr.innerHTML = rowHtml;
          tbody.appendChild(tr);
      });
  }

  // Bind Listeners
  const binds = [
      {id: 'input-compra', stateKey: 'compra', valId: 'val-compra', fmt: formatCurrency},
      {id: 'input-inversion', stateKey: 'inversion', valId: 'val-inversion', fmt: formatCurrency},
      {id: 'input-valorizacion', stateKey: 'valorizacion', valId: 'val-valorizacion', fmt: v => v + '% / año'},
      {id: 'input-plazo', stateKey: 'plazo', valId: 'val-plazo', fmt: v => v + ' años'},
      {id: 'input-canon', stateKey: 'canon', valId: 'val-canon', fmt: formatCurrency},
      {id: 'input-admin', stateKey: 'admin', valId: 'val-admin', fmt: formatCurrency},
      {id: 'input-mantenimiento', stateKey: 'mantenimiento', valId: 'val-mantenimiento', fmt: formatCurrency},
      {id: 'input-vacancia', stateKey: 'vacancia', valId: 'val-vacancia', fmt: v => v + ' mes/año'},
      {id: 'input-incremento', stateKey: 'incremento', valId: 'val-incremento', fmt: v => v + '%'}
  ];

  binds.forEach(b => {
      document.getElementById(b.id).addEventListener('input', (e) => {
          state[b.stateKey] = parseFloat(e.target.value);
          document.getElementById(b.valId).innerText = b.fmt(state[b.stateKey]);
          
          if (b.stateKey === 'incremento') {
             // Sincronizar el incremento de gasto un par de puntos por debajo de inflación/incremento de ingresos
             state.gasto_incremento = Math.max(0, state.incremento - 2); 
             document.getElementById('val-gasto-inc').innerText = state.gasto_incremento + '%';
          }

          updateData();
      });
  });

  // Primera renderización
  updateData();
}
