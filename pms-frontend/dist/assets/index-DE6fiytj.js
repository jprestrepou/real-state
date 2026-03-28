(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))i(e);new MutationObserver(e=>{for(const o of e)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&i(l)}).observe(document,{childList:!0,subtree:!0});function s(e){const o={};return e.integrity&&(o.integrity=e.integrity),e.referrerPolicy&&(o.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?o.credentials="include":e.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(e){if(e.ep)return;e.ep=!0;const o=s(e);fetch(e.href,o)}})();const W="https://real-state-xd5o.onrender.com/api/v1";class $e{constructor(){this._accessToken=localStorage.getItem("pms_access_token"),this._refreshToken=localStorage.getItem("pms_refresh_token"),this._onUnauthorized=null}get baseUrl(){return W}onUnauthorized(a){this._onUnauthorized=a}setTokens(a,s){this._accessToken=a,this._refreshToken=s,localStorage.setItem("pms_access_token",a),localStorage.setItem("pms_refresh_token",s)}clearTokens(){this._accessToken=null,this._refreshToken=null,localStorage.removeItem("pms_access_token"),localStorage.removeItem("pms_refresh_token")}isAuthenticated(){return!!this._accessToken}async _fetch(a,s={}){const i={"Content-Type":"application/json",...s.headers};this._accessToken&&(i.Authorization=`Bearer ${this._accessToken}`),s.body instanceof FormData&&delete i["Content-Type"];let e=await fetch(`${W}${a}`,{...s,headers:i});if(e.status===401&&this._refreshToken)if(await this._tryRefresh())i.Authorization=`Bearer ${this._accessToken}`,e=await fetch(`${W}${a}`,{...s,headers:i});else throw this.clearTokens(),this._onUnauthorized&&this._onUnauthorized(),new Error("Sesión expirada. Inicie sesión nuevamente.");if(!e.ok){let o="Error del servidor";try{const l=await e.json();typeof l.detail=="string"?o=l.detail:Array.isArray(l.detail)?o=l.detail.map(d=>d.msg).join(", "):l.detail&&(o=JSON.stringify(l.detail))}catch{o=`Error ${e.status}`}throw new Error(o)}return e.status===204?null:e.json()}async _tryRefresh(){try{const a=await fetch(`${W}/auth/refresh`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refresh_token:this._refreshToken})});if(!a.ok)return!1;const s=await a.json();return this.setTokens(s.access_token,s.refresh_token),!0}catch{return!1}}get(a){return this._fetch(a)}post(a,s){return this._fetch(a,{method:"POST",body:JSON.stringify(s)})}put(a,s){return this._fetch(a,{method:"PUT",body:JSON.stringify(s)})}delete(a){return this._fetch(a,{method:"DELETE"})}upload(a,s){return this._fetch(a,{method:"POST",body:s})}async login(a,s){const i=await this.post("/auth/login",{email:a,password:s});return this.setTokens(i.access_token,i.refresh_token),i}async register(a){return this.post("/auth/register",a)}async getProfile(){return this.get("/auth/me")}}const p=new $e;function m(t,a="info",s=4e3){const i=document.getElementById("toast-container"),e=document.createElement("div");e.className=`toast toast-${a}`,e.textContent=t,i.appendChild(e),setTimeout(()=>{e.style.opacity="0",e.style.transform="translateX(100%)",e.style.transition="all 0.3s ease-in",setTimeout(()=>e.remove(),300)},s)}function y(t,a,{onConfirm:s,confirmText:i="Guardar",showCancel:e=!0,maxWidth:o=""}={}){const l=document.getElementById("modal-container");l.innerHTML=`
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal-content" ${o?`style="max-width: ${o}; width: 100%;"`:""}>
        <div class="flex items-center justify-between p-6 border-b border-surface-100">
          <h3 class="text-lg font-bold text-surface-900">${t}</h3>
          <button id="modal-close" class="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
        <div class="p-6" id="modal-body">
          ${a}
        </div>
        <div class="flex items-center justify-end gap-3 p-6 border-t border-surface-100">
          ${e?'<button id="modal-cancel" class="btn-secondary">Cancelar</button>':""}
          ${s?`<button id="modal-confirm" class="btn-primary">${i}</button>`:""}
        </div>
      </div>
    </div>
  `,window.lucide&&lucide.createIcons();const d=document.getElementById("modal-overlay"),n=document.getElementById("modal-close"),r=document.getElementById("modal-cancel"),u=document.getElementById("modal-confirm"),c=()=>{l.innerHTML=""};return d.addEventListener("click",g=>{g.target===d&&c()}),n==null||n.addEventListener("click",c),r==null||r.addEventListener("click",c),u&&s&&u.addEventListener("click",async()=>{try{await s(),c()}catch(g){m(g.message,"error")}}),{close:c,getBody:()=>document.getElementById("modal-body")}}function Y(){document.getElementById("modal-container").innerHTML=""}function Z(t){if(!t&&t!==0)return"";const a=String(t).replace(/[^\d]/g,"");return a?a.replace(/\B(?=(\d{3})+(?!\d))/g,"."):""}function I(t){const a=typeof t=="string"?t:(t==null?void 0:t.value)||"";return parseFloat(a.replace(/\./g,"").replace(",",".")||"0")}function se(t){t.dataset._currencyBound||(t.dataset._currencyBound="true",t.type="text",t.inputMode="numeric",t.value&&!isNaN(parseFloat(t.value))&&(t.value=Z(Math.round(parseFloat(t.value)))),t.addEventListener("input",a=>{const s=a.target.selectionStart,i=a.target.value.length,e=a.target.value.replace(/[^\d]/g,""),o=Z(e);a.target.value=o;const d=o.length-i,n=Math.max(0,s+d);a.target.setSelectionRange(n,n)}),t.addEventListener("paste",a=>{a.preventDefault();const i=(a.clipboardData||window.clipboardData).getData("text").replace(/[^\d]/g,"");t.value=Z(i),t.dispatchEvent(new Event("input",{bubbles:!0}))}))}const _e=new MutationObserver(t=>{var a,s;for(const i of t)for(const e of i.addedNodes)if(e.nodeType===1){(a=e.matches)!=null&&a.call(e,'.currency-input, [data-currency="true"]')&&se(e);const o=(s=e.querySelectorAll)==null?void 0:s.call(e,'.currency-input, [data-currency="true"]');o!=null&&o.length&&o.forEach(l=>se(l))}});typeof document<"u"&&document.body&&_e.observe(document.body,{childList:!0,subtree:!0});function x(t,a="COP"){return t==null?"—":new Intl.NumberFormat("es-CO",{style:"currency",currency:a,minimumFractionDigits:0,maximumFractionDigits:0}).format(t)}function ie(t){return t==null?"—":Math.abs(t)>=1e6?`$${(t/1e6).toFixed(1)}M`:Math.abs(t)>=1e3?`$${(t/1e3).toFixed(0)}K`:x(t)}function E(t){return t?new Date(t).toLocaleDateString("es-CO",{year:"numeric",month:"short",day:"numeric"}):"—"}function U(t){return t==null?"—":`${Number(t).toFixed(1)}%`}function V(t){return{Disponible:"badge-green",Arrendada:"badge-blue","En Mantenimiento":"badge-amber",Vendida:"badge-gray",Pendiente:"badge-amber","En Progreso":"badge-blue",Completado:"badge-green",Cancelado:"badge-red","Esperando Cotizacion":"badge-amber","Esperando Aprobacion":"badge-indigo","Esperando Factura":"badge-amber",Activo:"badge-green",Borrador:"badge-gray",Finalizado:"badge-gray",Pagado:"badge-green",Vencido:"badge-red"}[t]||"badge-gray"}function Ee(t){return{Verde:"semaphore-green",Amarillo:"semaphore-amber",Rojo:"semaphore-red"}[t]||"semaphore-green"}const D={primary:"#4c6ef5",accent:"#20c997",accentLight:"rgba(32, 201, 151, 0.1)",red:"#e03131",redLight:"rgba(224, 49, 49, 0.1)"},z={responsive:!0,maintainAspectRatio:!1,plugins:{legend:{labels:{font:{family:"Inter",size:12,weight:"500"},padding:16,usePointStyle:!0,pointStyleWidth:10}},tooltip:{backgroundColor:"rgba(33, 37, 41, 0.95)",titleFont:{family:"Inter",size:13,weight:"600"},bodyFont:{family:"Inter",size:12},padding:12,cornerRadius:10,displayColors:!0}}};function Ce(t,a,s,i){return new Chart(t,{type:"bar",data:{labels:a,datasets:[{label:"Ingresos",data:s,backgroundColor:D.accent,borderRadius:8,barPercentage:.6},{label:"Gastos",data:i,backgroundColor:D.red,borderRadius:8,barPercentage:.6}]},options:{...z,scales:{y:{beginAtZero:!0,grid:{color:"rgba(0,0,0,0.04)"},ticks:{font:{family:"Inter",size:11}}},x:{grid:{display:!1},ticks:{font:{family:"Inter",size:11}}}}}})}function Ie(t,a,s){const i=["#4c6ef5","#20c997","#f59f00","#e03131","#845ef7","#339af0"];return new Chart(t,{type:"doughnut",data:{labels:a,datasets:[{data:s,backgroundColor:i.slice(0,s.length),borderWidth:0,hoverOffset:8}]},options:{...z,cutout:"70%",plugins:{...z.plugins,legend:{...z.plugins.legend,position:"bottom"}}}})}function ke(t,a,s,i,e){return new Chart(t,{type:"line",data:{labels:a,datasets:[{label:"Ingresos Proyectados",data:s,borderColor:D.accent,backgroundColor:D.accentLight,fill:!0,tension:.4,pointRadius:4,pointHoverRadius:6,borderWidth:2.5},{label:"Gastos Proyectados",data:i,borderColor:D.red,backgroundColor:D.redLight,fill:!0,tension:.4,pointRadius:4,pointHoverRadius:6,borderWidth:2.5},{label:"Balance Neto",data:e,borderColor:D.primary,borderDash:[6,4],fill:!1,tension:.4,pointRadius:3,borderWidth:2}]},options:{...z,interaction:{mode:"index",intersect:!1},scales:{y:{grid:{color:"rgba(0,0,0,0.04)"},ticks:{font:{family:"Inter",size:11}}},x:{grid:{display:!1},ticks:{font:{family:"Inter",size:11}}}}}})}const Pe={Disponible:"#20c997",Arrendada:"#4c6ef5","En Mantenimiento":"#f59f00",Vendida:"#868e96"};let A=null,G=null;function Te(t,a=[4.711,-74.072],s=12){return A&&A.remove(),A=L.map(t).setView(a,s),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:19}).addTo(A),G=L.markerClusterGroup({maxClusterRadius:50,spiderfyOnMaxZoom:!0,showCoverageOnHover:!1}),A.addLayer(G),A}function Le(t){if(G&&(G.clearLayers(),t.forEach(a=>{const s=Pe[a.status]||"#868e96",i=L.circleMarker([a.latitude,a.longitude],{radius:10,fillColor:s,color:"#fff",weight:2,opacity:1,fillOpacity:.85}),e=`
      <div style="font-family:Inter,sans-serif; min-width:200px;">
        <h3 style="margin:0 0 4px; font-size:14px; font-weight:700; color:#212529;">${a.name}</h3>
        <p style="margin:0 0 2px; font-size:12px; color:#868e96;">${a.property_type} • ${a.city}</p>
        <div style="display:flex; align-items:center; gap:6px; margin-top:8px;">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${s};"></span>
          <span style="font-size:12px; font-weight:600; color:#495057;">${a.status}</span>
        </div>
        ${a.monthly_rent?`<p style="margin:6px 0 0; font-size:13px; font-weight:600; color:#20c997;">Canon: ${x(a.monthly_rent)}</p>`:""}
        <a href="#/properties/${a.id}" style="display:inline-block; margin-top:8px; font-size:12px; color:#4c6ef5; text-decoration:none; font-weight:600;">Ver ficha →</a>
      </div>
    `;i.bindPopup(e),G.addLayer(i)}),t.length>0)){const a=G.getBounds();a.isValid()&&A.fitBounds(a,{padding:[30,30]})}}function je(){A&&setTimeout(()=>A.invalidateSize(),100)}function Ae(t){return t==="high"?{bg:"bg-rose-50",border:"border-rose-200",text:"text-rose-700",dot:"bg-rose-500"}:t==="medium"?{bg:"bg-amber-50",border:"border-amber-200",text:"text-amber-700",dot:"bg-amber-500"}:{bg:"bg-blue-50",border:"border-blue-200",text:"text-blue-700",dot:"bg-blue-400"}}async function Be(t){const[a,s,i,e]=await Promise.all([p.get("/reports/summary"),p.get("/properties/map"),p.get("/reports/cashflow?months=12"),p.get("/reports/upcoming-events?days=30").catch(()=>({events:[]}))]),o=a,l=e.events||[];if(t.innerHTML=`
    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 animate-fade-in">
      <div class="kpi-card kpi-blue">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-surface-500">Total Propiedades</span>
          <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <i data-lucide="home" class="w-5 h-5 text-primary-600"></i>
          </div>
        </div>
        <p class="text-3xl font-bold text-surface-900">${o.total_properties}</p>
      </div>

      <div class="kpi-card kpi-green">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-surface-500">Ocupación</span>
          <div class="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
            <i data-lucide="users" class="w-5 h-5 text-accent-600"></i>
          </div>
        </div>
        <p class="text-3xl font-bold text-surface-900">${U(o.occupancy_rate)}</p>
      </div>

      <div class="kpi-card kpi-green">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-surface-500">Ingresos</span>
          <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <i data-lucide="trending-up" class="w-5 h-5 text-green-600"></i>
          </div>
        </div>
        <p class="text-3xl font-bold text-surface-900">${ie(o.total_income)}</p>
      </div>

      <div class="kpi-card kpi-red">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-surface-500">Gastos</span>
          <div class="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
            <i data-lucide="trending-down" class="w-5 h-5 text-rose-600"></i>
          </div>
        </div>
        <p class="text-3xl font-bold text-surface-900">${ie(o.total_expenses)}</p>
      </div>
    </div>

    <!-- Map + Upcoming Events Row -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
      <div class="xl:col-span-2 glass-card-static p-6 animate-fade-in">
        <h3 class="text-base font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <i data-lucide="map-pin" class="w-5 h-5 text-primary-500"></i>
          Mapa de Propiedades
        </h3>
        <div id="dashboard-map" style="height: 380px; border-radius: 12px;"></div>
      </div>

      <!-- Upcoming Events -->
      <div class="glass-card-static p-6 animate-fade-in flex flex-col">
        <h3 class="text-base font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <i data-lucide="calendar-clock" class="w-5 h-5 text-primary-500"></i>
          Próximos 30 días
          <span class="ml-auto badge ${l.length>0?"badge-red":"badge-gray"} text-xs">${l.length}</span>
        </h3>
        <div class="flex-1 overflow-y-auto space-y-2 max-h-[340px] pr-1">
          ${l.length===0?`
            <div class="flex flex-col items-center justify-center h-32 text-surface-400">
              <i data-lucide="check-circle" class="w-8 h-8 mb-2 text-accent-400"></i>
              <p class="text-sm font-medium">Sin eventos próximos</p>
            </div>
          `:l.map(n=>{const r=Ae(n.severity);return`
            <div class="flex items-start gap-3 p-3 rounded-xl border ${r.bg} ${r.border}">
              <div class="mt-0.5 w-2 h-2 rounded-full ${r.dot} shrink-0 mt-1.5"></div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold ${r.text} truncate">${n.title}</p>
                <p class="text-[10px] text-surface-500 mt-0.5">${n.detail} · ${n.date}</p>
              </div>
              <i data-lucide="${n.icon}" class="w-4 h-4 ${r.text} shrink-0"></i>
            </div>`}).join("")}
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
      <div class="glass-card-static p-6 animate-fade-in">
        <h3 class="text-base font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <i data-lucide="pie-chart" class="w-5 h-5 text-primary-500"></i>
          Distribución por Tipo
        </h3>
        <div style="height: 260px; display: flex; align-items: center; justify-content: center;">
          <canvas id="type-chart"></canvas>
        </div>
      </div>

      <div class="glass-card-static p-6 animate-fade-in">
        <h3 class="text-base font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <i data-lucide="bar-chart-3" class="w-5 h-5 text-primary-500"></i>
          Ingresos vs Gastos
        </h3>
        <div style="height: 260px;">
          <canvas id="income-expense-chart"></canvas>
        </div>
      </div>

      <div class="glass-card-static p-6 animate-fade-in">
        <h3 class="text-base font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <i data-lucide="activity" class="w-5 h-5 text-primary-500"></i>
          Cash Flow (12 meses)
        </h3>
        <div style="height: 260px;">
          <canvas id="cashflow-chart"></canvas>
        </div>
      </div>
    </div>

    <!-- Accounts Summary -->
    <div class="glass-card-static p-6 animate-fade-in">
      <h3 class="text-base font-semibold text-surface-900 mb-4 flex items-center gap-2">
        <i data-lucide="credit-card" class="w-5 h-5 text-primary-500"></i>
        Cuentas Bancarias
      </h3>
      ${o.accounts.length>0?`
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          ${o.accounts.map(n=>`
            <div class="p-4 rounded-xl border border-surface-200 bg-surface-50/50 hover:border-primary-200 transition-colors">
              <p class="text-sm font-medium text-surface-600">${n.account_name}</p>
              <p class="text-sm text-surface-400 mb-2">${n.account_type} · ${n.currency}</p>
              <p class="text-xl font-bold ${n.current_balance>=0?"text-accent-600":"text-rose-600"}">${x(n.current_balance)}</p>
            </div>
          `).join("")}
        </div>
      `:`
        <p class="text-center text-surface-400 py-8">No hay cuentas registradas aún</p>
      `}
    </div>
  `,window.lucide&&lucide.createIcons(),setTimeout(()=>{Te("dashboard-map"),Le(s),je()},100),s.length>0){const n={};s.forEach(c=>{n[c.property_type]=(n[c.property_type]||0)+1});const r=Object.keys(n),u=Object.values(n);Ie(document.getElementById("type-chart"),r,u)}const d=i.months||[];if(d.length>0){const n=d.slice(-6);Ce(document.getElementById("income-expense-chart"),n.map(r=>r.month),n.map(r=>r.income),n.map(r=>r.expenses)),ke(document.getElementById("cashflow-chart"),d.map(r=>r.month),d.map(r=>r.income),d.map(r=>r.expenses),d.map(r=>r.net))}}async function ee(t){const s=(await p.get("/properties?limit=50")).items||[];t.innerHTML=`
    <div class="flex flex-wrap items-center justify-between gap-4 mb-8 animate-fade-in glass-card-static p-4 !rounded-2xl border-white/40 shadow-sm">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm">
          <i data-lucide="filter" class="w-3.5 h-3.5 text-surface-400"></i>
          <select id="filter-status" class="bg-transparent text-sm font-medium focus:outline-none min-w-[140px] appearance-none">
            <option value="">Todos los estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Arrendada">Arrendada</option>
            <option value="En Mantenimiento">En Mantenimiento</option>
            <option value="Vendida">Vendida</option>
          </select>
        </div>
        <div class="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm">
          <i data-lucide="home" class="w-3.5 h-3.5 text-surface-400"></i>
          <select id="filter-type" class="bg-transparent text-sm font-medium focus:outline-none min-w-[140px] appearance-none">
            <option value="">Todos los tipos</option>
            <option value="Apartamento">Apartamento</option>
            <option value="Casa">Casa</option>
            <option value="Local">Local</option>
            <option value="Bodega">Bodega</option>
            <option value="Oficina">Oficina</option>
            <option value="Lote">Lote</option>
          </select>
        </div>
      </div>
      <button id="add-property-btn" class="btn-primary !rounded-xl shadow-lg shadow-primary-500/20 py-2.5 px-5">
        <i data-lucide="plus" class="w-4 h-4"></i>
        Nueva Propiedad
      </button>
    </div>

    <div class="glass-card-static overflow-hidden animate-fade-in">
      <table class="data-table" id="properties-table">
        <thead>
          <tr>
            <th>Propiedad</th>
            <th>Tipo</th>
            <th>Ciudad</th>
            <th>Área m²</th>
            <th>Valor Comercial</th>
            <th>Estado</th>
            <th>Creada</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${s.length>0?s.map(i=>`
            <tr>
              <td>
                <div class="font-semibold text-surface-900">${i.name}</div>
                <div class="text-xs text-surface-400 truncate max-w-[200px]">${i.address}</div>
              </td>
              <td><span class="badge badge-gray">${i.property_type}</span></td>
              <td class="text-surface-600">${i.city}</td>
              <td class="text-surface-600">${i.area_sqm}</td>
              <td class="font-medium">${x(i.commercial_value)}</td>
              <td><span class="badge ${V(i.status)}">${i.status}</span></td>
              <td class="text-surface-500 text-xs">${E(i.created_at)}</td>
              <td>
                  <button class="btn-ghost text-xs py-1 px-2 evaluate-property text-emerald-600 hover:bg-emerald-50" data-id="${i.id}" title="Simular Arriendo (Mercado)">
                    <i data-lucide="bar-chart" class="w-3.5 h-3.5"></i>
                  </button>
                  <button class="btn-ghost text-xs py-1 px-2 view-property" data-id="${i.id}" title="Detalles">
                    <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                  </button>
                  <button class="btn-ghost text-xs py-1 px-2 edit-property" data-id="${i.id}" title="Editar">
                    <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                  </button>
                  <button class="btn-ghost text-xs py-1 px-2 delete-property text-rose-500 hover:bg-rose-50" data-id="${i.id}" title="Eliminar">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join(""):`
            <tr><td colspan="8" class="text-center py-12 text-surface-400">
              <i data-lucide="home" class="w-10 h-10 mx-auto mb-3 text-surface-300"></i>
              <p class="font-medium">No hay propiedades registradas</p>
              <p class="text-sm">Haga clic en "Nueva Propiedad" para empezar</p>
            </td></tr>
          `}
        </tbody>
      </table>
    </div>
  `,window.lucide&&lucide.createIcons(),document.getElementById("add-property-btn").addEventListener("click",()=>oe()),document.getElementById("properties-table").addEventListener("click",async i=>{const e=i.target.closest(".view-property"),o=i.target.closest(".edit-property"),l=i.target.closest(".delete-property"),d=i.target.closest(".evaluate-property");if(e&&X(e.dataset.id),d){const n=d.dataset.id,r=await p.get(`/properties/${n}`);Me(r)}if(o){const n=o.dataset.id,r=await p.get(`/properties/${n}`);oe(r)}if(l){const n=l.dataset.id;if(confirm("¿Está seguro de que desea eliminar esta propiedad? Esta acción la desactivará del sistema."))try{await p.delete(`/properties/${n}`),m("Propiedad eliminada correctamente","success");const r=document.getElementById("page-content");await ee(r)}catch(r){m(r.message,"error")}}}),document.getElementById("filter-status").addEventListener("change",async i=>{const e=i.target.value,o=document.getElementById("filter-type").value;let l="/properties?limit=50";e&&(l+=`&status=${encodeURIComponent(e)}`),o&&(l+=`&property_type=${encodeURIComponent(o)}`);const d=await p.get(l);ne(d.items||[])}),document.getElementById("filter-type").addEventListener("change",async i=>{const e=i.target.value,o=document.getElementById("filter-status").value;let l="/properties?limit=50";o&&(l+=`&status=${encodeURIComponent(o)}`),e&&(l+=`&property_type=${encodeURIComponent(e)}`);const d=await p.get(l);ne(d.items||[])})}function ne(t){const a=document.querySelector("#properties-table tbody");a.innerHTML=t.map(s=>`
    <tr>
      <td>
        <div class="font-semibold text-surface-900">${s.name}</div>
        <div class="text-xs text-surface-400 truncate max-w-[200px]">${s.address}</div>
      </td>
      <td><span class="badge badge-gray">${s.property_type}</span></td>
      <td class="text-surface-600">${s.city}</td>
      <td class="text-surface-600">${s.area_sqm}</td>
      <td class="font-medium">${x(s.commercial_value)}</td>
      <td><span class="badge ${V(s.status)}">${s.status}</span></td>
      <td class="text-surface-500 text-xs">${E(s.created_at)}</td>
        <div class="flex items-center gap-1">
          <button class="btn-ghost text-xs py-1 px-2 evaluate-property text-emerald-600 hover:bg-emerald-50" data-id="${s.id}" title="Simular Arriendo (Mercado)">
            <i data-lucide="bar-chart" class="w-3.5 h-3.5"></i>
          </button>
          <button class="btn-ghost text-xs py-1 px-2 view-property" data-id="${s.id}" title="Detalles">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
          </button>
          <button class="btn-ghost text-xs py-1 px-2 edit-property" data-id="${s.id}" title="Editar">
            <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
          </button>
          <button class="btn-ghost text-xs py-1 px-2 delete-property text-rose-500 hover:bg-rose-50" data-id="${s.id}" title="Eliminar">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join(""),window.lucide&&lucide.createIcons()}function oe(t=null){const a=!!t,s=a?"Editar Propiedad":"Nueva Propiedad",i=`
    <form id="property-form" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Nombre *</label>
          <input class="input" name="name" required value="${(t==null?void 0:t.name)||""}" placeholder="Mi Apartamento Centro" />
        </div>
        <div>
          <label class="label">Tipo *</label>
          <select class="select" name="property_type" required>
            ${["Apartamento","Casa","Local","Bodega","Oficina","Lote"].map(e=>`<option value="${e}" ${(t==null?void 0:t.property_type)===e?"selected":""}>${e}</option>`).join("")}
          </select>
        </div>
      </div>
      <div>
        <label class="label">Dirección *</label>
        <input class="input" name="address" required value="${(t==null?void 0:t.address)||""}" placeholder="Calle 100 #15-20, Bogotá" />
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="label">Ciudad *</label>
          <input class="input" name="city" required value="${(t==null?void 0:t.city)||""}" placeholder="Bogotá" />
        </div>
        <div>
          <label class="label">Estrato</label>
          <select class="select" name="stratum">
            <option value="">No definido</option>
            ${[1,2,3,4,5,6].map(e=>`<option value="${e}" ${(t==null?void 0:t.stratum)==e?"selected":""}>Estrato ${e}</option>`).join("")}
          </select>
        </div>
        <div>
          <label class="label">País</label>
          <input class="input" name="country" value="${(t==null?void 0:t.country)||"Colombia"}" />
        </div>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="label">Latitud *</label>
          <input class="input" name="latitude" type="number" step="any" required value="${(t==null?void 0:t.latitude)||"4.711"}" />
        </div>
        <div>
          <label class="label">Longitud *</label>
          <input class="input" name="longitude" type="number" step="any" required value="${(t==null?void 0:t.longitude)||"-74.072"}" />
        </div>
        <div>
          <label class="label">Área m² *</label>
          <input class="input" name="area_sqm" type="number" step="0.01" required value="${(t==null?void 0:t.area_sqm)||""}" placeholder="85.5" />
        </div>
      </div>
      <div class="grid grid-cols-4 gap-4 p-3 bg-surface-50 rounded-xl border border-surface-100">
        <label class="flex items-center gap-2 text-xs font-medium cursor-pointer">
          <input type="checkbox" name="has_parking" ${t!=null&&t.has_parking?"checked":""} class="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
          Parqueadero
        </label>
        <label class="flex items-center gap-2 text-xs font-medium cursor-pointer">
          <input type="checkbox" name="has_elevator" ${t!=null&&t.has_elevator?"checked":""} class="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
          Ascensor
        </label>
        <label class="flex items-center gap-2 text-xs font-medium cursor-pointer">
          <input type="checkbox" name="has_pool" ${t!=null&&t.has_pool?"checked":""} class="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
          Piscina
        </label>
        <label class="flex items-center gap-2 text-xs font-medium cursor-pointer">
          <input type="checkbox" name="has_gym" ${t!=null&&t.has_gym?"checked":""} class="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
          Gimnasio
        </label>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="label">Habitaciones</label>
          <input class="input" name="bedrooms" type="number" value="${(t==null?void 0:t.bedrooms)??""}" />
        </div>
        <div>
          <label class="label">Baños</label>
          <input class="input" name="bathrooms" type="number" value="${(t==null?void 0:t.bathrooms)??""}" />
        </div>
        <div>
          <label class="label">Valor Comercial</label>
          <input class="input currency-input" name="commercial_value" type="text" value="${(t==null?void 0:t.commercial_value)??""}" placeholder="350.000.000" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Matrícula Inmobiliaria</label>
          <input class="input" name="cadastral_id" value="${(t==null?void 0:t.cadastral_id)||""}" />
        </div>
        <div>
          <label class="label">Estado</label>
          <select class="select" name="status">
            ${["Disponible","Arrendada","En Mantenimiento","Vendida"].map(e=>`<option value="${e}" ${(t==null?void 0:t.status)===e?"selected":""}>${e}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="p-4 bg-primary-50/50 rounded-xl border border-primary-100 space-y-4">
        <h4 class="text-sm font-bold text-primary-700 flex items-center gap-2">
          <i data-lucide="credit-card" class="w-4 h-4"></i> Parámetros de Administración
        </h4>
        <div class="flex items-center gap-2 mb-2">
          <input type="checkbox" name="pays_administration" id="pays_administration" class="w-4 h-4 rounded text-primary-600" ${(t==null?void 0:t.pays_administration)!==!1?"checked":""} />
          <label for="pays_administration" class="text-sm font-medium cursor-pointer">Paga Administración</label>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">Día de Pago (1-31)</label>
            <input class="input" name="administration_day" type="number" min="1" max="31" value="${(t==null?void 0:t.administration_day)||""}" placeholder="5" />
          </div>
          <div>
            <label class="label">Valor Administración</label>
            <input class="input currency-input" name="administration_fee" type="text" value="${(t==null?void 0:t.administration_fee)||""}" placeholder="250.000" />
          </div>
        </div>
        <div>
          <label class="label">Método de Pago</label>
          <input class="input" name="administration_payment_method" value="${(t==null?void 0:t.administration_payment_method)||""}" placeholder="Transferencia Bancaria, Link de Pago, etc." />
        </div>
        <div>
          <label class="label">Cuenta o Link de Pago</label>
          <textarea class="input" name="administration_payment_info" rows="2" placeholder="Número de cuenta o URL de pago...">${(t==null?void 0:t.administration_payment_info)||""}</textarea>
        </div>
      </div>
      <div>
        <label class="label">Notas</label>
        <textarea class="input" name="notes" rows="2" placeholder="Observaciones adicionales...">${(t==null?void 0:t.notes)||""}</textarea>
      </div>
    </form>
  `;y(s,i,{confirmText:a?"Guardar Cambios":"Crear Propiedad",onConfirm:async()=>{const e=document.getElementById("property-form"),o=new FormData(e),l={};o.forEach((n,r)=>{n===""&&r!=="pays_administration"||(["area_sqm","latitude","longitude"].includes(r)?l[r]=parseFloat(n):["commercial_value","administration_fee"].includes(r)?l[r]=I(n):["bedrooms","bathrooms","administration_day","stratum"].includes(r)?l[r]=n?parseInt(n):null:r==="pays_administration"?l[r]=document.getElementById("pays_administration").checked:l[r]=n)}),["has_parking","has_elevator","has_pool","has_gym"].forEach(n=>{const r=document.querySelector(`[name="${n}"]`);r&&(l[n]=r.checked)}),l.hasOwnProperty("pays_administration")||(l.pays_administration=document.getElementById("pays_administration").checked),a?(await p.put(`/properties/${t.id}`,l),m("Propiedad actualizada","success")):(await p.post("/properties",l),m("Propiedad creada","success"));const d=document.getElementById("page-content");await ee(d)}})}async function X(t){const[a,s]=await Promise.all([p.get(`/properties/${t}`),p.get(`/occupants?property_id=${t}`)]),i=e=>e.length?`
      <div class="space-y-3 mt-4">
        ${e.map(o=>`
          <div class="flex items-center justify-between p-3 bg-surface-50 rounded-xl border border-surface-100 animate-fade-in">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                ${o.full_name.charAt(0)}
              </div>
              <div>
                <p class="text-sm font-semibold text-surface-900">${o.full_name} ${o.is_primary?'<span class="badge badge-blue text-[10px] ml-1">Principal</span>':""}</p>
                <p class="text-xs text-surface-500">${o.phone||o.email||"Sin contacto"}</p>
              </div>
            </div>
            <button class="delete-occupant-btn text-rose-400 hover:text-rose-600 p-1" data-id="${o.id}">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        `).join("")}
      </div>
    `:'<p class="text-sm text-surface-400 py-4 text-center">No hay ocupantes registrados.</p>';y(`Detalle: ${a.name}`,`
    <div class="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
      <div class="grid grid-cols-2 gap-4">
        <div class="glass-card-static p-4">
          <h4 class="text-xs font-bold text-surface-400 uppercase mb-3 flex items-center gap-1"><i data-lucide="info" class="w-3 h-3"></i> Información Básica</h4>
          <p class="text-sm"><strong>Dirección:</strong> ${a.address}</p>
          <p class="text-sm"><strong>Tipo:</strong> ${a.property_type}</p>
          <p class="text-sm"><strong>Área:</strong> ${a.area_sqm} m²</p>
          <p class="text-sm"><strong>Estado:</strong> <span class="badge ${V(a.status)}">${a.status}</span></p>
          <hr class="my-3 border-surface-100" />
          <h5 class="text-xs font-bold text-surface-400 uppercase mb-2">Administración</h5>
          <p class="text-sm"><strong>Paga:</strong> ${a.pays_administration?"Sí":"No"}</p>
          ${a.pays_administration?`
            <p class="text-sm"><strong>Valor:</strong> ${x(a.administration_fee)}</p>
            <p class="text-sm"><strong>Día pago:</strong> ${a.administration_day||"No definido"}</p>
            <p class="text-sm"><strong>Método:</strong> ${a.administration_payment_method||"No definido"}</p>
            ${a.administration_payment_info?`
              <p class="text-sm"><strong>Info Pago:</strong> <span class="text-xs break-all text-primary-600">${a.administration_payment_info}</span></p>
            `:""}
          `:""}
        </div>
        <div class="glass-card-static p-4">
          <h4 class="text-xs font-bold text-surface-400 uppercase mb-3 flex items-center gap-1"><i data-lucide="users" class="w-3 h-3"></i> Ocupantes (Viven aquí)</h4>
          <div id="occupants-container">
            ${i(s)}
          </div>
          <button id="add-occupant-btn" class="btn-ghost text-xs w-full mt-4 border-dashed border-2 border-surface-200 hover:border-primary-300">
            <i data-lucide="plus" class="w-3 h-3 mr-1"></i> Agregar Ocupante
          </button>
        </div>
      </div>
    </div>
  `,{showCancel:!0,confirmText:null}),window.lucide&&lucide.createIcons(),document.getElementById("add-occupant-btn").addEventListener("click",()=>{y("Nuevo Ocupante",`
      <form id="occupant-form" class="space-y-4">
        <div><label class="label">Nombre Completo *</label><input class="input" name="full_name" required /></div>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="label">DNI / Cédula</label><input class="input" name="dni" /></div>
          <div><label class="label">Teléfono</label><input class="input" name="phone" /></div>
        </div>
        <div><label class="label">Email</label><input class="input" name="email" type="email" /></div>
        <div class="flex items-center gap-2">
          <input type="checkbox" name="is_primary" id="is_primary" class="w-4 h-4 rounded text-primary-600" />
          <label for="is_primary" class="text-sm cursor-pointer">Es ocupante principal</label>
        </div>
      </form>
    `,{confirmText:"Agregar",onConfirm:async()=>{const e=new FormData(document.getElementById("occupant-form")),o={property_id:t,full_name:e.get("full_name"),dni:e.get("dni")||null,phone:e.get("phone")||null,email:e.get("email")||null,is_primary:document.getElementById("is_primary").checked};await p.post("/occupants",o),m("Ocupante agregado","success"),X(t)}})}),document.querySelectorAll(".delete-occupant-btn").forEach(e=>{e.addEventListener("click",async()=>{confirm("¿Eliminar este ocupante?")&&(await p.delete(`/occupants/${e.dataset.id}`),m("Ocupante eliminado","success"),X(t))})})}function Me(t){const a=t.city||"Bogotá",s=t.stratum||3;y(`Simulación de Rentabilidad - ${t.name}`,`
    <div class="space-y-4">
      <p class="text-sm text-surface-600">Simule el canon de arrendamiento y la rentabilidad esperada basados en promedios del mercado nacional.</p>
      
      <div class="grid grid-cols-2 gap-4 p-4 bg-surface-50 rounded-xl border border-surface-200">
        <div>
          <label class="label text-surface-700">Zona / Ciudad Objetivo</label>
          <select id="val-target-city" class="select bg-white">
            <optgroup label="Antioquia - Valle de Aburrá">
              <option value="Medellín" ${a==="Medellín"?"selected":""}>Medellín</option>
              <option value="Envigado" ${a==="Envigado"?"selected":""}>Envigado</option>
              <option value="Sabaneta" ${a==="Sabaneta"?"selected":""}>Sabaneta</option>
              <option value="Itagüí" ${a==="Itagüí"?"selected":""}>Itagüí</option>
              <option value="Bello" ${a==="Bello"?"selected":""}>Bello</option>
            </optgroup>
            <optgroup label="Antioquia - Valle de San Nicolás">
              <option value="Rionegro" ${a==="Rionegro"?"selected":""}>Rionegro / Llanogrande</option>
              <option value="La Ceja" ${a==="La Ceja"?"selected":""}>La Ceja</option>
              <option value="Marinilla" ${a==="Marinilla"?"selected":""}>Marinilla</option>
              <option value="El Retiro" ${a==="El Retiro"?"selected":""}>El Retiro</option>
            </optgroup>
            <optgroup label="Bogotá y Cundinamarca">
              <option value="Bogotá" ${a==="Bogotá"?"selected":""}>Bogotá D.C.</option>
              <option value="Chía" ${a==="Chía"?"selected":""}>Chía</option>
              <option value="Cajicá" ${a==="Cajicá"?"selected":""}>Cajicá</option>
            </optgroup>
            <optgroup label="Valle del Cauca">
              <option value="Cali" ${a==="Cali"?"selected":""}>Cali</option>
              <option value="Palmira" ${a==="Palmira"?"selected":""}>Palmira</option>
            </optgroup>
            <optgroup label="Costa Caribe">
              <option value="Barranquilla" ${a==="Barranquilla"?"selected":""}>Barranquilla</option>
              <option value="Cartagena" ${a==="Cartagena"?"selected":""}>Cartagena</option>
              <option value="Santa Marta" ${a==="Santa Marta"?"selected":""}>Santa Marta</option>
            </optgroup>
            <optgroup label="Eje Cafetero">
              <option value="Pereira" ${a==="Pereira"?"selected":""}>Pereira</option>
              <option value="Manizales" ${a==="Manizales"?"selected":""}>Manizales</option>
              <option value="Armenia" ${a==="Armenia"?"selected":""}>Armenia</option>
            </optgroup>
          </select>
        </div>
        <div>
          <label class="label text-surface-700">Estrato Objetivo</label>
          <select id="val-target-stratum" class="select bg-white">
            <option value="1" ${s==1?"selected":""}>Estrato 1</option>
            <option value="2" ${s==2?"selected":""}>Estrato 2</option>
            <option value="3" ${s==3?"selected":""}>Estrato 3</option>
            <option value="4" ${s==4?"selected":""}>Estrato 4</option>
            <option value="5" ${s==5?"selected":""}>Estrato 5</option>
            <option value="6" ${s==6?"selected":""}>Estrato 6</option>
          </select>
        </div>
      </div>

      <button id="run-valuation-btn" class="btn-primary w-full shadow-md justify-center">
        <i data-lucide="activity" class="w-4 h-4 mr-2"></i> Procesar Simulación de Mercado
      </button>

      <div id="valuation-results-container" class="hidden mt-6 space-y-4 animate-fade-in">
        <!-- Results will be injected here -->
      </div>
    </div>
  `,{showCancel:!0,confirmText:null}),window.lucide&&lucide.createIcons(),document.getElementById("run-valuation-btn").addEventListener("click",async i=>{const e=i.target.closest("button"),o=document.getElementById("val-target-city").value,l=parseInt(document.getElementById("val-target-stratum").value),d=document.getElementById("valuation-results-container");e.disabled=!0,e.innerHTML='<div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div> Analizando zona...';try{let n=`/properties/${t.id}/valuation?`;const r=new URLSearchParams;o&&o!==t.city&&r.append("target_city",o),isNaN(l)||r.append("target_stratum",l);const u=await p.get(n+r.toString());d.innerHTML=`
        <div class="bg-emerald-50 rounded-xl p-5 border border-emerald-100 flex flex-col items-center justify-center relative overflow-hidden">
          <div class="absolute -right-4 -top-4 opacity-[0.03]"><i data-lucide="trending-up" class="w-32 h-32"></i></div>
          <p class="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Canon Sugerido Mensual</p>
          <h2 class="text-3xl font-black text-emerald-800 drop-shadow-sm">${x(u.estimated_monthly_rent)}</h2>
          <div class="flex items-center gap-2 mt-3 text-sm font-medium text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full shadow-inner">
            <span>${x(u.range_min)}</span>
            <i data-lucide="arrow-right" class="w-3 h-3 text-emerald-500"></i>
            <span>${x(u.range_max)}</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="bg-white p-4 rounded-xl border border-surface-200 text-center shadow-sm">
            <p class="text-xs font-bold text-surface-400 uppercase mb-1">Cap Rate (Rent. Anual)</p>
            <p class="text-lg font-bold text-indigo-600">${u.estimated_cap_rate>0?U(u.estimated_cap_rate):"N/A"}</p>
          </div>
          <div class="bg-white p-4 rounded-xl border border-surface-200 text-center shadow-sm">
            <p class="text-xs font-bold text-surface-400 uppercase mb-1">Confianza del Algoritmo</p>
            <p class="text-lg font-bold text-primary-600">${U(u.confidence_score*100)}</p>
          </div>
        </div>

        <div class="bg-surface-100 text-xs font-medium text-surface-500 p-3 rounded-lg border border-surface-200 flex items-start gap-2">
          <i data-lucide="info" class="w-4 h-4 shrink-0 mt-0.5 opacity-50"></i>
          <span>${u.provider}</span>
        </div>

        <div id="valuation-map" class="h-64 bg-surface-200 rounded-xl border border-surface-300 overflow-hidden relative z-0"></div>
      `,d.classList.remove("hidden"),window.lucide&&lucide.createIcons(),setTimeout(()=>{window._valuationMap&&(window._valuationMap.remove(),window._valuationMap=null);const c=document.getElementById("valuation-map");if(!c)return;const g={Bogotá:[4.6097,-74.0817],Medellín:[6.2442,-75.5812],Cali:[3.4516,-76.532],Barranquilla:[10.9639,-74.7964],Cartagena:[10.3997,-75.5144],"Cartagena de Indias":[10.3997,-75.5144],Bucaramanga:[7.1254,-73.1198],Pereira:[4.8133,-75.6961],Manizales:[5.0689,-75.5174],Armenia:[4.5339,-75.6811],"Santa Marta":[11.2408,-74.199],Cúcuta:[7.8939,-72.5078],Ibagué:[4.4389,-75.2322],Neiva:[2.9273,-75.2819],Villavicencio:[4.142,-73.6266],Envigado:[6.1759,-75.5917],Sabaneta:[6.1515,-75.6151],Itagüí:[6.1729,-75.6083],Bello:[6.3373,-75.5579],"La Ceja":[6.0303,-75.4312],Rionegro:[6.1528,-75.3725],"El Retiro":[6.0583,-75.5033],"Santa Fe de Antioquia":[6.5579,-75.8284]},v=u.city;let f=t.latitude||4.6097,h=t.longitude||-74.0817;if(g[v]&&(f=g[v][0],h=g[v][1]),typeof L>"u"){c.innerHTML='<div class="p-8 text-center text-surface-400">Error: Leaflet.js no cargado.</div>';return}try{const P=L.map("valuation-map").setView([f,h],14);window._valuationMap=P,L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"&copy; OpenStreetMap contributors"}).addTo(P)}catch(P){console.error("Map init fail:",P),c.innerHTML='<div class="p-8 text-center text-error-500">Error al inicializar el mapa.</div>';return}const $=L.divIcon({className:"bg-transparent",html:'<div class="w-5 h-5 bg-primary-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center animate-bounce"><div class="w-1.5 h-1.5 bg-white rounded-full"></div></div>',iconSize:[20,20],iconAnchor:[10,10]});L.marker([f,h],{icon:$}).addTo(map).bindPopup('<div class="font-bold text-sm">Zona Analizada</div><div class="text-xs text-primary-600">Simulación Central</div>').openPopup();const w=L.divIcon({className:"bg-transparent",html:'<div class="w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-md"></div>',iconSize:[14,14],iconAnchor:[7,7]}),C=Math.floor(Math.random()*5)+6;for(let P=0;P<C;P++){const F=(Math.random()-.5)*.025,N=(Math.random()-.5)*.025,M=u.estimated_monthly_rent*(1+(Math.random()-.5)*.2);L.marker([f+F,h+N],{icon:w}).addTo(map).bindPopup(`<div class="font-bold text-xs text-surface-900">Comparable en el área</div>
                        <div class="text-emerald-700 font-semibold text-sm">${x(M)}</div>`)}},100)}catch(n){m(n.message||"Error simulando arriendo","error")}finally{e.disabled=!1,e.innerHTML='<i data-lucide="activity" class="w-4 h-4 mr-2"></i> Procesar Simulación de Mercado',window.lucide&&lucide.createIcons()}})}const me=["Gastos Generales","Gastos Administrativos","Mantenimiento General","Pago de Empleados","Nómina y Personal","Suministros de Oficina","Marketing y Publicidad","Servicios Públicos","Seguros","Impuestos y Tasas","Honorarios Gestión","Otros"],be=["Ingresos por Arriendo","Gastos Mantenimiento","Impuestos y Tasas","Cuotas de Administración","Servicios Públicos","Honorarios Gestión","Seguros","Pago Hipoteca","Otros"];async function B(t){var f,h,$,w,C,P,F,N,M;const[a,s,i]=await Promise.all([p.get("/accounts"),p.get("/transactions?limit=30"),p.get("/properties?limit=100")]),e=a||[],o=s.items||[],l=i.items||[];let d=1,n=!1,r=o.length>=30;t.innerHTML=`
    <div class="flex items-center justify-between mb-6 animate-fade-in">
      <div class="flex items-center gap-3">
        <button id="add-account-btn" class="btn-primary">
          <i data-lucide="plus" class="w-4 h-4"></i> Nueva Cuenta
        </button>
        <button id="add-transaction-btn" class="btn-secondary">
          <i data-lucide="plus-circle" class="w-4 h-4"></i> Transacción
        </button>
        <button id="add-general-expense-btn" class="btn-secondary bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 hover:from-amber-600 hover:to-orange-600">
          <i data-lucide="receipt" class="w-4 h-4"></i> Gasto General
        </button>
        <button id="add-transfer-btn" class="btn-secondary">
          <i data-lucide="arrow-left-right" class="w-4 h-4"></i> Transferencia
        </button>
      </div>
      <div class="flex items-center gap-2">
         <button id="import-csv-btn" class="btn-secondary bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 hover:from-indigo-600 hover:to-purple-600">
          <i data-lucide="upload" class="w-4 h-4"></i> Importar CSV
        </button>
        <input type="file" id="import-csv-input" accept=".csv" class="hidden" />
         <button id="export-csv-btn" class="btn-secondary-outline">
          <i data-lucide="download" class="w-4 h-4"></i> Exportar
        </button>
      </div>
    </div>

    <!-- Main Tabs: Operaciones vs Análisis -->
    <div class="flex space-x-4 border-b border-surface-100 mb-6">
      <button class="tab-btn active" data-tab="operations">Operaciones</button>
      <button class="tab-btn" data-tab="analysis">Análisis</button>
    </div>

    <div id="financial-tabs-content">
      <!-- ══ OPERACIONES TAB ══ -->
      <div id="operations-tab" class="tab-content transition-all duration-300">
        <!-- Accounts Cards (clickable) -->
        <h3 class="text-sm font-bold text-surface-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <i data-lucide="landmark" class="w-4 h-4"></i> Cuentas Bancarias
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          ${e.map(b=>`
            <div class="glass-card p-5 cursor-pointer hover:shadow-card-hover hover:border-primary-200 transition-all group account-card" data-account-id="${b.id}">
              <div class="flex items-center justify-between mb-3">
                <span class="badge ${b.is_active?"badge-green":"badge-gray"}">${b.account_type}</span>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button class="edit-account-btn p-1.5 rounded-lg hover:bg-primary-50 text-surface-400 hover:text-primary-600 transition" data-id="${b.id}" data-name="${b.account_name}" data-bank="${b.bank_name||""}" data-number="${b.account_number||""}" data-balance="${b.current_balance}" title="Editar">
                    <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                  </button>
                  <button class="delete-account-btn p-1.5 rounded-lg hover:bg-rose-50 text-surface-400 hover:text-rose-600 transition" data-id="${b.id}" data-name="${b.account_name}" data-balance="${b.current_balance}" title="Eliminar">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
              <p class="text-sm font-medium text-surface-700 mb-1">${b.account_name}</p>
              ${b.bank_name?`<p class="text-xs text-surface-400 mb-2">${b.bank_name}</p>`:""}
              <p class="text-2xl font-bold ${b.current_balance>=0?"text-accent-600":"text-rose-600"}">
                ${x(b.current_balance)}
              </p>
              <p class="text-[10px] text-primary-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <i data-lucide="bar-chart-2" class="w-3 h-3"></i> Click para ver historial
              </p>
            </div>
          `).join("")}
        </div>

        <!-- Transaction Ledger -->
        <h3 class="text-sm font-bold text-surface-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <i data-lucide="list" class="w-4 h-4"></i> Últimas Transacciones
        </h3>
        <div class="glass-card-static overflow-hidden animate-fade-in">
          <table class="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Propiedad</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Monto</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${o.length>0?o.map(b=>`
                <tr>
                  <td class="text-xs text-surface-500">${E(b.transaction_date)}</td>
                  <td><div class="font-medium text-surface-900 text-sm">${b.description}</div></td>
                  <td><span class="badge badge-gray text-xs">${b.category}</span></td>
                  <td class="text-xs text-surface-500">
                    ${b.property_id?'<span class="badge badge-blue text-xs">Propiedad</span>':'<span class="badge badge-amber text-xs">General</span>'}
                  </td>
                  <td class="text-xs text-surface-500">${b.transaction_type}</td>
                  <td><span class="badge ${!b.status||b.status==="Completada"?"badge-green":b.status==="Pendiente"?"badge-amber":"badge-gray"} text-xs">${b.status||"Completada"}</span></td>
                  <td class="font-semibold ${b.direction==="Debit"?"text-accent-600":"text-rose-600"}">
                    ${b.direction==="Debit"?"+":"-"}${x(b.amount)}
                  </td>
                  <td>
                    <span class="badge ${b.direction==="Debit"?"badge-green":"badge-red"} text-xs">
                      ${b.direction==="Debit"?"Ingreso":"Egreso"}
                    </span>
                    ${b.is_reconciled?'<span class="badge badge-blue text-xs ml-1" title="Conciliada"><i data-lucide="check-check" class="w-3 h-3"></i></span>':""}
                  </td>
                  <td>
                    <div class="flex items-center gap-1">
                      <button class="edit-tx-btn p-1.5 rounded-lg hover:bg-primary-50 text-surface-400 hover:text-primary-600 transition" data-id="${b.id}" data-desc="${b.description}" data-cat="${b.category}" data-amount="${b.amount}" data-type="${b.transaction_type}" data-date="${b.transaction_date}" data-status="${b.status||"Completada"}" title="Editar">
                        <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                      </button>
                      <button class="delete-tx-btn p-1.5 rounded-lg hover:bg-rose-50 text-surface-400 hover:text-rose-600 transition" data-id="${b.id}" data-desc="${b.description}" title="Eliminar">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join(""):`
                <tr><td colspan="8" class="text-center py-12 text-surface-400">No hay transacciones</td></tr>
              `}
            </tbody>
          </table>
          <div id="infinite-scroll-sentinel" class="h-4 w-full"></div>
          <div id="loading-spinner" class="hidden py-4 flex justify-center">
            <div class="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent"></div>
          </div>
        </div>
      </div>

      <!-- ══ ANÁLISIS TAB ══ -->
      <div id="analysis-tab" class="tab-content hidden transition-all duration-300">
        <!-- Performance by Property -->
        <div class="glass-card p-6 mb-8 animate-fade-in shadow-lg border-accent-100 bg-gradient-to-br from-white to-accent-50/30">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 class="font-bold text-surface-900 flex items-center gap-2 text-lg">
                <i data-lucide="bar-chart-3" class="w-6 h-6 text-accent-500"></i>
                Análisis de Desempeño Financiero
              </h3>
              <p class="text-sm text-surface-500">Métricas detalladas por propiedad seleccionada</p>
            </div>
            <select id="performance-property-select" class="select max-w-xs shadow-sm border-surface-200">
              <option value="">Seleccione propiedad...</option>
              ${l.map(b=>`<option value="${b.id}">${b.name}</option>`).join("")}
            </select>
          </div>
          <div id="performance-content" class="min-h-[200px] flex items-center justify-center border-2 border-dashed border-surface-200 rounded-2xl bg-white/50">
            <div class="text-center">
              <i data-lucide="building" class="w-12 h-12 text-surface-200 mx-auto mb-3"></i>
              <p class="text-surface-400 font-medium">Selecciona una propiedad para ver su rendimiento</p>
            </div>
          </div>
        </div>

        <!-- Corporate Reports -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="glass-card p-6" id="balance-sheet-container">
            <h3 class="font-bold mb-4">Balance General</h3>
            <p class="text-surface-400 text-sm">Cargando estado...</p>
          </div>
          <div class="glass-card p-6" id="income-statement-container">
            <h3 class="font-bold mb-4">Estado de Resultados</h3>
            <p class="text-surface-400 text-sm">Cargando estado...</p>
          </div>
        </div>

        <!-- PDF Button -->
        <div class="flex justify-end">
          <button id="generate-pdf-btn" class="btn-primary bg-gradient-to-r from-rose-500 to-pink-500 border-0 hover:from-rose-600 hover:to-pink-600">
            <i data-lucide="file-text" class="w-4 h-4"></i> Generar Informe PDF
          </button>
        </div>
      </div>
    </div>
  `,window.lucide&&lucide.createIcons(),(f=document.getElementById("add-account-btn"))==null||f.addEventListener("click",()=>Se()),(h=document.getElementById("add-transaction-btn"))==null||h.addEventListener("click",()=>re(e,l,!1)),($=document.getElementById("add-general-expense-btn"))==null||$.addEventListener("click",()=>re(e,l,!0)),(w=document.getElementById("add-transfer-btn"))==null||w.addEventListener("click",()=>Fe(e)),(C=document.getElementById("import-csv-btn"))==null||C.addEventListener("click",()=>{var b;return(b=document.getElementById("import-csv-input"))==null?void 0:b.click()}),(P=document.getElementById("import-csv-input"))==null||P.addEventListener("change",async b=>{const k=b.target.files[0];k&&(await Oe(k),b.target.value="")}),(F=document.getElementById("export-csv-btn"))==null||F.addEventListener("click",()=>{window.location.href=`${p.baseUrl}/reports/export`}),document.querySelectorAll(".account-card").forEach(b=>{b.addEventListener("click",k=>{k.target.closest(".edit-account-btn")||k.target.closest(".delete-account-btn")||(window.location.hash=`#/account-detail?id=${b.dataset.accountId}`)})}),document.querySelectorAll(".edit-account-btn").forEach(b=>{b.addEventListener("click",k=>{k.stopPropagation(),De(b.dataset.id,b.dataset.name,b.dataset.bank,b.dataset.number,b.dataset.balance)})}),document.querySelectorAll(".delete-account-btn").forEach(b=>{b.addEventListener("click",k=>{k.stopPropagation(),qe(b.dataset.id,b.dataset.name,parseFloat(b.dataset.balance))})}),document.querySelectorAll(".edit-tx-btn").forEach(b=>{b.addEventListener("click",()=>{le(b.dataset.id,b.dataset.desc,b.dataset.cat,b.dataset.amount,b.dataset.type,b.dataset.date,b.dataset.status)})}),document.querySelectorAll(".delete-tx-btn").forEach(b=>{b.addEventListener("click",()=>de(b.dataset.id,b.dataset.desc))}),(N=document.getElementById("performance-property-select"))==null||N.addEventListener("change",b=>Ne(b.target.value)),(M=document.getElementById("generate-pdf-btn"))==null||M.addEventListener("click",()=>{window.open(`${p.baseUrl}/financial/financial-summary/export/pdf`,"_blank")}),document.querySelectorAll(".tab-btn").forEach(b=>{b.addEventListener("click",()=>{document.querySelectorAll(".tab-btn").forEach(S=>S.classList.remove("active")),document.querySelectorAll(".tab-content").forEach(S=>S.classList.add("hidden")),b.classList.add("active");const k=b.dataset.tab;document.getElementById(`${k}-tab`).classList.remove("hidden"),k==="analysis"&&Re()})});const u=document.getElementById("infinite-scroll-sentinel"),c=document.getElementById("loading-spinner"),g=document.querySelector("#operations-tab tbody"),v=new IntersectionObserver(async b=>{if(b[0].isIntersecting&&r&&!n){n=!0,c.classList.remove("hidden"),d++;try{const S=(await p.get(`/transactions?limit=30&page=${d}`)).items||[];S.length===0?r=!1:(S.forEach(_=>{const R=document.createElement("tr");R.innerHTML=`
              <td class="text-xs text-surface-500">${E(_.transaction_date)}</td>
              <td><div class="font-medium text-surface-900 text-sm">${_.description}</div></td>
              <td><span class="badge badge-gray text-xs">${_.category}</span></td>
              <td class="text-xs text-surface-500">
                ${_.property_id?'<span class="badge badge-blue text-xs">Propiedad</span>':'<span class="badge badge-amber text-xs">General</span>'}
              </td>
              <td class="text-xs text-surface-500">${_.transaction_type}</td>
              <td><span class="badge ${!_.status||_.status==="Completada"?"badge-green":_.status==="Pendiente"?"badge-amber":"badge-gray"} text-xs">${_.status||"Completada"}</span></td>
              <td class="font-semibold ${_.direction==="Debit"?"text-accent-600":"text-rose-600"}">
                ${_.direction==="Debit"?"+":"-"}${x(_.amount)}
              </td>
              <td>
                <span class="badge ${_.direction==="Debit"?"badge-green":"badge-red"} text-xs">
                  ${_.direction==="Debit"?"Ingreso":"Egreso"}
                </span>
              </td>
              <td>
                <div class="flex items-center gap-1">
                  <button class="edit-tx-btn p-1.5 rounded-lg hover:bg-primary-50 text-surface-400 hover:text-primary-600 transition" 
                    data-id="${_.id}" data-desc="${_.description}" data-cat="${_.category}" 
                    data-amount="${_.amount}" data-type="${_.transaction_type}" data-date="${_.transaction_date}" data-status="${_.status||"Completada"}">
                    <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                  </button>
                  <button class="delete-tx-btn p-1.5 rounded-lg hover:bg-rose-50 text-surface-400 hover:text-rose-600 transition" 
                    data-id="${_.id}" data-desc="${_.description}">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </td>
            `,g.appendChild(R),R.querySelector(".edit-tx-btn").addEventListener("click",()=>{const j=R.querySelector(".edit-tx-btn");le(j.dataset.id,j.dataset.desc,j.dataset.cat,j.dataset.amount,j.dataset.type,j.dataset.date,j.dataset.status)}),R.querySelector(".delete-tx-btn").addEventListener("click",()=>{const j=R.querySelector(".delete-tx-btn");de(j.dataset.id,j.dataset.desc)})}),window.lucide&&lucide.createIcons(),S.length<30&&(r=!1))}catch(k){console.error("Error loading more transactions:",k)}finally{n=!1,c.classList.add("hidden")}}},{threshold:.1});u&&v.observe(u)}function Se(){y("Nueva Cuenta Bancaria",`
    <form id="account-form" class="space-y-4">
      <div><label class="label">Nombre *</label><input class="input" name="account_name" required placeholder="Cuenta Corriente" /></div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Tipo *</label>
          <select class="select" name="account_type" required>
            <option value="Corriente">Corriente</option><option value="Ahorros">Ahorros</option>
            <option value="Inversión">Inversión</option><option value="Caja Menor">Caja Menor</option>
          </select>
        </div>
        <div><label class="label">Saldo Inicial</label><input class="input currency-input" name="initial_balance" type="text" value="0" /></div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Banco</label><input class="input" name="bank_name" placeholder="Bancolombia" /></div>
        <div><label class="label">Moneda</label><input class="input" name="currency" value="COP" maxlength="3" /></div>
      </div>
    </form>
  `,{confirmText:"Crear Cuenta",onConfirm:async()=>{const t=new FormData(document.getElementById("account-form")),a={};t.forEach((s,i)=>{i==="initial_balance"?a[i]=I(s)||0:s&&(a[i]=s)}),await p.post("/accounts",a),m("Cuenta creada","success"),await B(document.getElementById("page-content"))}})}function De(t,a,s,i,e){y("Editar Cuenta",`
    <form id="edit-account-form" class="space-y-4">
      <div><label class="label">Nombre *</label><input class="input" name="account_name" value="${a}" required /></div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Banco</label><input class="input" name="bank_name" value="${s}" /></div>
        <div><label class="label">Número de Cuenta</label><input class="input" name="account_number" value="${i}" /></div>
      </div>
      <div>
        <label class="label">Balance Actual (Ajuste Manual)</label>
        <input class="input currency-input" name="current_balance" type="text" value="${e}" />
        <p class="text-[10px] text-amber-600 mt-1">Atención: Modificar el balance manualmente ignorará el saldo calculado por transacciones.</p>
      </div>
    </form>
  `,{confirmText:"Guardar Cambios",onConfirm:async()=>{const o=new FormData(document.getElementById("edit-account-form")),l={};o.forEach((d,n)=>{n==="current_balance"?l[n]=I(d):d&&(l[n]=d)}),await p.put(`/accounts/${t}`,l),m("Cuenta actualizada","success"),await B(document.getElementById("page-content"))}})}function qe(t,a,s){if(s!==0){m(`No se puede eliminar "${a}": tiene saldo de ${x(s)}. Transfiera los fondos primero.`,"error");return}y("Eliminar Cuenta",`
    <div class="text-center py-4">
      <div class="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i data-lucide="alert-triangle" class="w-8 h-8 text-rose-500"></i>
      </div>
      <p class="text-surface-700 font-medium mb-2">¿Eliminar la cuenta "${a}"?</p>
      <p class="text-sm text-surface-400">Esta acción desactivará la cuenta. No será visible pero sus transacciones históricas se conservan.</p>
    </div>
  `,{confirmText:"Eliminar",onConfirm:async()=>{await p.delete(`/accounts/${t}`),m("Cuenta eliminada","success"),await B(document.getElementById("page-content"))}}),window.lucide&&lucide.createIcons()}function re(t,a=[],s=!1){const i=s?"Registrar Gasto General":"Registrar Transacción",e=s?me:be;y(i,`
    <form id="tx-form" class="space-y-4">
      ${s?'<div class="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-2"><div class="flex items-center gap-2 text-amber-700 text-sm font-medium"><i data-lucide="info" class="w-4 h-4"></i> Este gasto no está asociado a ninguna propiedad</div></div>':""}
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Cuenta *</label><select class="select" name="account_id" required>${t.map(u=>`<option value="${u.id}">${u.account_name}</option>`).join("")}</select></div>
        ${s?"":`<div><label class="label">Propiedad *</label><select class="select" name="property_id" required><option value="">Seleccione...</option>${a.map(u=>`<option value="${u.id}">${u.name}</option>`).join("")}</select></div>`}
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Tipo *</label><select class="select" name="transaction_type" required>
          ${s?'<option value="Gasto">Gasto</option>':'<option value="Ingreso">Ingreso</option><option value="Gasto">Gasto</option><option value="Transferencia">Transferencia</option><option value="Interés">Interés</option><option value="Abono">Abono</option><option value="Crédito">Crédito</option><option value="Ajuste">Ajuste</option>'}
        </select></div>
        <div><label class="label">Categoría *</label><select class="select" name="category" required>${e.map(u=>`<option value="${u}">${u}</option>`).join("")}</select></div>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div><label class="label">Monto *</label><input class="input currency-input" name="amount" type="text" required placeholder="1.500.000" /></div>
        <div><label class="label">Fecha *</label><input class="input" name="transaction_date" type="date" required value="${new Date().toISOString().split("T")[0]}" /></div>
        <div><label class="label">Estado *</label><select class="select" name="status" required>
          <option value="Completada">Completada</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Cancelada">Cancelada</option>
        </select></div>
      </div>
      <div><label class="label">Descripción *</label><input class="input" name="description" required placeholder="${s?"Pago servicios oficina":"Pago canon mes de marzo"}" /></div>
    </form>
  `,{confirmText:"Registrar",onConfirm:async()=>{const u=new FormData(document.getElementById("tx-form")),c={},g=u.get("category"),[v,f]=g.includes("|")?g.split("|"):[null,g];u.forEach((h,$)=>{$==="amount"?c[$]=I(h):$==="category"?c[$]=f:h&&(c[$]=h)}),c.budget_category_id=v||null,s&&delete c.property_id,c.transaction_type==="Ingreso"?c.direction="Debit":c.transaction_type==="Gasto"&&(c.direction="Credit"),await p.post("/transactions",c),m(s?"Gasto registrado":"Transacción registrada","success"),await B(document.getElementById("page-content"))}}),window.lucide&&lucide.createIcons();const o=document.getElementById("tx-form"),l=o.querySelector('[name="property_id"]'),d=o.querySelector('[name="transaction_date"]'),n=o.querySelector('[name="category"]'),r=async()=>{const u=s?"GENERAL":l.value,c=d.value;if(!u||!c)return;const[g,v]=c.split("-").map(Number);try{let f=u;if(u==="GENERAL"){const w=(await p.get("/properties?limit=100")).items.find(C=>C.name==="Gastos Generales");w&&(f=w.id)}const h=await p.get(`/budgets?property_id=${f}&year=${g}&month=${v}`);if(h&&h.length>0){let w=h[0].categories.map(C=>`<option value="${C.id}|${C.category_name}">${C.category_name} (Presupuestado)</option>`).join("");w+="<option disabled>──────────</option>",w+=e.map(C=>`<option value="|${C}">${C}</option>`).join(""),n.innerHTML=w}else n.innerHTML=e.map($=>`<option value="|${$}">${$}</option>`).join("")}catch(f){console.warn("Could not fetch budget categories:",f),n.innerHTML=e.map(h=>`<option value="|${h}">${h}</option>`).join("")}};l&&l.addEventListener("change",r),d.addEventListener("change",r),o.querySelector('[name="transaction_type"]').addEventListener("change",r),(s||l&&l.value)&&r()}function le(t,a,s,i,e,o,l){const d=[...new Set([...me,...be])];y("Editar Transacción",`
    <form id="edit-tx-form" class="space-y-4">
      <div><label class="label">Descripción</label><input class="input" name="description" value="${a}" /></div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Categoría</label><select class="select" name="category">${d.map(n=>`<option value="${n}" ${n===s?"selected":""}>${n}</option>`).join("")}</select></div>
        <div><label class="label">Tipo</label><select class="select" name="transaction_type">
          ${["Ingreso","Gasto","Transferencia","Ajuste","Interés","Abono","Crédito"].map(n=>`<option value="${n}" ${n===e?"selected":""}>${n}</option>`).join("")}
        </select></div>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div><label class="label">Monto</label><input class="input currency-input" name="amount" type="text" value="${i}" /></div>
        <div><label class="label">Fecha</label><input class="input" name="transaction_date" type="date" value="${o}" /></div>
        <div><label class="label">Estado</label><select class="select" name="status">
          <option value="Completada" ${!l||l==="Completada"?"selected":""}>Completada</option>
          <option value="Pendiente" ${l==="Pendiente"?"selected":""}>Pendiente</option>
          <option value="Cancelada" ${l==="Cancelada"?"selected":""}>Cancelada</option>
        </select></div>
      </div>
    </form>
  `,{confirmText:"Guardar",onConfirm:async()=>{const n=new FormData(document.getElementById("edit-tx-form")),r={};n.forEach((u,c)=>{c==="amount"?r[c]=I(u):u&&(r[c]=u)}),await p.put(`/transactions/${t}`,r),m("Transacción actualizada","success"),await B(document.getElementById("page-content"))}})}function de(t,a){y("Eliminar Transacción",`
    <div class="text-center py-4">
      <div class="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i data-lucide="alert-triangle" class="w-8 h-8 text-rose-500"></i>
      </div>
      <p class="text-surface-700 font-medium mb-2">¿Eliminar esta transacción?</p>
      <p class="text-sm text-surface-400 italic mb-2">"${a}"</p>
      <p class="text-xs text-rose-500">El saldo de la cuenta será ajustado automáticamente.</p>
    </div>
  `,{confirmText:"Eliminar",onConfirm:async()=>{await p.delete(`/transactions/${t}`),m("Transacción eliminada","success"),await B(document.getElementById("page-content"))}}),window.lucide&&lucide.createIcons()}function Fe(t){y("Transferencia entre Cuentas",`
    <form id="transfer-form" class="space-y-4">
      <div><label class="label">Cuenta Origen *</label><select class="select" name="source_account_id" required>${t.map(a=>`<option value="${a.id}">${a.account_name} (${x(a.current_balance)})</option>`).join("")}</select></div>
      <div><label class="label">Cuenta Destino *</label><select class="select" name="destination_account_id" required>${t.map(a=>`<option value="${a.id}">${a.account_name}</option>`).join("")}</select></div>
      <div><label class="label">Monto *</label><input class="input currency-input" name="amount" type="text" required placeholder="500.000" /></div>
      <div><label class="label">Descripción *</label><input class="input" name="description" required placeholder="Traslado de fondos" /></div>
      <div><label class="label">Fecha *</label><input class="input" name="transaction_date" type="date" required value="${new Date().toISOString().split("T")[0]}" /></div>
    </form>
  `,{confirmText:"Transferir",onConfirm:async()=>{const a=new FormData(document.getElementById("transfer-form")),s={};if(a.forEach((i,e)=>{e==="amount"?s[e]=I(i):s[e]=i}),s.source_account_id===s.destination_account_id){m("Las cuentas deben ser diferentes","error");return}await p.post("/accounts/transfer",s),m("Transferencia completada","success"),await B(document.getElementById("page-content"))}})}async function Ne(t){var l;if(!t)return;const a=document.getElementById("performance-content");a.innerHTML='<div class="flex items-center justify-center py-12"><div class="animate-spin rounded-full h-8 w-8 border-2 border-accent-500 border-t-transparent"></div><p class="ml-3 text-surface-500">Calculando métricas...</p></div>';const s=await p.get(`/properties/${t}/performance`);if(!s)return;const i=s.total_income>0||s.total_expenses>0;a.innerHTML=`
    <div class="animate-fade-in">
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-surface-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center"><i data-lucide="building-2" class="w-5 h-5 text-primary-600"></i></div>
          <div>
            <h4 class="font-bold text-surface-900">${s.property_name}</h4>
            <span class="badge ${s.property_status==="Arrendada"?"badge-green":"badge-blue"} text-xs">${s.property_status||"Sin estado"}</span>
          </div>
        </div>
        <button id="export-prop-perf-pdf" class="btn-secondary-outline text-xs py-1.5" data-id="${t}">
          <i data-lucide="file-down" class="w-4 h-4"></i> Exportar PDF Individual
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm">
          <p class="text-xs font-bold text-surface-400 uppercase mb-2">Ingresos</p>
          <p class="text-2xl font-bold text-accent-600">${x(s.total_income)}</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm">
          <p class="text-xs font-bold text-surface-400 uppercase mb-2">Gastos</p>
          <p class="text-2xl font-bold text-rose-600">${x(s.total_expenses)}</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm">
          <p class="text-xs font-bold text-surface-400 uppercase mb-2">Utilidad</p>
          <p class="text-2xl font-bold ${s.net_profit>=0?"text-primary-600":"text-rose-600"}">${x(s.net_profit)}</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm">
          <p class="text-xs font-bold text-surface-400 uppercase mb-2">ROI</p>
          <p class="text-2xl font-bold text-indigo-600">${s.roi}%</p>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-surface-100">
          <h4 class="text-sm font-bold text-surface-900 mb-4">Flujo Mensual</h4>
          <div class="h-[220px]"><canvas id="property-cashflow-chart"></canvas></div>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h4 class="text-sm font-bold text-surface-900 mb-4">Distribución</h4>
          <div class="h-[200px] flex items-center justify-center"><canvas id="property-mini-chart"></canvas></div>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h4 class="text-sm font-bold text-surface-900 mb-4">Categorías</h4>
          ${i?`
            ${Object.entries(s.income_by_category||{}).map(([d,n])=>`<div class="flex justify-between text-sm mb-1"><span>${d}</span><span class="text-accent-600">+${x(n)}</span></div>`).join("")}
            <div class="border-t border-surface-100 my-3"></div>
            ${Object.entries(s.expense_by_category||{}).map(([d,n])=>`<div class="flex justify-between text-sm mb-1"><span>${d}</span><span class="text-rose-600">-${x(n)}</span></div>`).join("")}
          `:'<p class="text-surface-400 text-center py-4">Sin datos</p>'}
        </div>
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h4 class="text-sm font-bold text-surface-900 mb-4">Últimos Movimientos</h4>
          <div class="overflow-x-auto"><table class="data-table text-xs"><thead><tr><th>Fecha</th><th>Descripción</th><th>Monto</th></tr></thead><tbody>
            ${(s.last_transactions||[]).length>0?s.last_transactions.map(d=>`<tr><td class="text-surface-500">${E(d.transaction_date)}</td><td class="font-medium">${d.description}</td><td class="font-bold ${d.direction==="Debit"?"text-accent-600":"text-rose-600"}">${d.direction==="Debit"?"+":"-"}${x(d.amount)}</td></tr>`).join(""):'<tr><td colspan="3" class="text-center py-4 text-surface-400">Sin movimientos</td></tr>'}
          </tbody></table></div>
        </div>
      </div>
    </div>
  `,window.lucide&&lucide.createIcons(),(l=document.getElementById("export-prop-perf-pdf"))==null||l.addEventListener("click",()=>{window.open(`${p.baseUrl}/financial/properties/${t}/performance/export/pdf`,"_blank")});const e=document.getElementById("property-mini-chart");e&&i&&new Chart(e,{type:"doughnut",data:{labels:["Ingresos","Gastos"],datasets:[{data:[s.total_income,s.total_expenses],backgroundColor:["#20c997","#f03e3e"],borderWidth:0,cutout:"75%"}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}}}});const o=document.getElementById("property-cashflow-chart");if(o&&s.monthly_cashflow){const d=s.monthly_cashflow;new Chart(o,{type:"bar",data:{labels:d.map(n=>n.month),datasets:[{label:"Ingresos",data:d.map(n=>n.income),backgroundColor:"rgba(32,201,151,0.7)",borderRadius:6,barPercentage:.6},{label:"Gastos",data:d.map(n=>n.expenses),backgroundColor:"rgba(240,62,62,0.7)",borderRadius:6,barPercentage:.6}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"top",labels:{usePointStyle:!0,font:{size:10}}}},scales:{y:{beginAtZero:!0,ticks:{font:{size:10},callback:n=>"$"+(n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(0)+"K":n)},grid:{color:"rgba(0,0,0,0.04)"}},x:{ticks:{font:{size:9}},grid:{display:!1}}}}})}}async function Re(){const[t,a]=await Promise.all([p.get("/reports/balance-sheet"),p.get(`/reports/income-statement?start_date=${new Date().getFullYear()}-01-01&end_date=${new Date().toISOString().split("T")[0]}`)]);t&&(document.getElementById("balance-sheet-container").innerHTML=`
      <h3 class="font-bold mb-4 flex items-center justify-between">Balance General <span class="text-xs font-normal text-surface-400">${E(t.date)}</span></h3>
      <div class="space-y-3">
        ${t.accounts.map(s=>`<div class="flex justify-between text-sm py-2 border-b border-surface-50"><span class="text-surface-600">${s.account_name}</span><span class="font-semibold">${x(s.current_balance)}</span></div>`).join("")}
        <div class="flex justify-between text-lg font-bold pt-4 text-primary-600"><span>Total Activos</span><span>${x(t.total_assets)}</span></div>
      </div>
    `),a&&(document.getElementById("income-statement-container").innerHTML=`
      <h3 class="font-bold mb-4">Estado de Resultados (Año Actual)</h3>
      <div class="space-y-4">
        <div><p class="text-xs font-bold text-surface-400 uppercase mb-2">Ingresos</p>${Object.entries(a.income).map(([s,i])=>`<div class="flex justify-between text-sm mb-1"><span>${s}</span><span class="text-accent-600">+${x(i)}</span></div>`).join("")}</div>
        <div><p class="text-xs font-bold text-surface-400 uppercase mb-2">Egresos</p>${Object.entries(a.expenses).map(([s,i])=>`<div class="flex justify-between text-sm mb-1"><span>${s}</span><span class="text-rose-600">-${x(i)}</span></div>`).join("")}</div>
        <div class="border-t border-surface-100 pt-3"><div class="flex justify-between text-lg font-bold ${a.net_income>=0?"text-accent-600":"text-rose-600"}"><span>Utilidad Neta</span><span>${x(a.net_income)}</span></div></div>
      </div>
    `)}async function Oe(t){y("Analizando CSV...",`
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
      <p class="ml-3 text-surface-500">Analizando archivo...</p>
    </div>
  `,{showCancel:!1});let a;try{const r=new FormData;r.append("file",t),a=await p.upload("/transactions/import/analyze",r)}catch(r){m(`Error al analizar: ${r.message}`,"error");return}const{total_rows:s,transfers_skipped:i,new_accounts:e,existing_accounts:o,detected_labels:l,category_mapping:d}=a,n=l.length>0?l.map(r=>`
    <label class="flex items-center gap-3 p-3 rounded-xl border border-surface-100 hover:bg-surface-50 transition cursor-pointer">
      <input type="checkbox" class="import-label-check w-4 h-4 rounded text-indigo-500" value="${r.label}" ${r.suggested_apartment?"checked":""} ${r.already_exists?"checked disabled":""} />
      <div class="flex-1 min-w-0">
        <span class="font-medium text-surface-800 text-sm">${r.label}</span>
        <span class="text-xs text-surface-400 ml-2">(${r.transaction_count} tx)</span>
      </div>
      ${r.already_exists?'<span class="badge badge-green text-xs">Existe</span>':r.suggested_apartment?'<span class="badge badge-blue text-xs">Sugerido</span>':'<span class="badge badge-amber text-xs">General</span>'}
    </label>
  `).join(""):'<p class="text-surface-400 text-sm py-4 text-center">No se detectaron labels</p>';y("Importación de Transacciones",`
    <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-indigo-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-indigo-600">${s}</p><p class="text-xs text-indigo-400">Transacciones</p></div>
        <div class="bg-amber-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-amber-600">${i}</p><p class="text-xs text-amber-400">Omitidas</p></div>
        <div class="bg-purple-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-purple-600">${l.length}</p><p class="text-xs text-purple-400">Labels</p></div>
      </div>
      ${e.length>0?`<div class="bg-blue-50 border border-blue-200 rounded-xl p-4"><p class="text-sm font-bold text-blue-700 mb-2">Cuentas nuevas (${e.length})</p>${e.map(r=>`<div class="flex justify-between text-sm"><span class="text-blue-600">${r.name}</span><span class="text-blue-400">${r.transaction_count} tx</span></div>`).join("")}</div>`:""}
      ${o.length>0?`<div class="bg-green-50 border border-green-200 rounded-xl p-4"><p class="text-sm font-bold text-green-700 mb-2">Cuentas existentes (${o.length})</p>${o.map(r=>`<div class="flex justify-between text-sm"><span class="text-green-600">${r.name}</span><span class="text-green-400">${r.transaction_count} tx</span></div>`).join("")}</div>`:""}
      ${Object.keys(d).length>0?`<details class="bg-surface-50 border border-surface-200 rounded-xl p-4"><summary class="text-sm font-bold text-surface-700 cursor-pointer">Mapeo categorías (${Object.keys(d).length})</summary><div class="mt-3 space-y-1 max-h-40 overflow-y-auto">${Object.entries(d).map(([r,u])=>`<div class="flex justify-between text-xs py-1 border-b border-surface-100"><span>${r}</span><span class="text-indigo-600">→ ${u}</span></div>`).join("")}</div></details>`:""}
      <div>
        <p class="text-sm font-bold text-surface-700 mb-3">¿Cuáles labels son apartamentos?</p>
        <p class="text-xs text-surface-400 mb-3">Los seleccionados se crean como propiedades.</p>
        <div class="space-y-2 max-h-60 overflow-y-auto">${n}</div>
      </div>
    </div>
  `,{confirmText:"Importar Transacciones",onConfirm:async()=>{const r=document.querySelectorAll(".import-label-check:checked"),u=Array.from(r).map(v=>v.value),c=new FormData;c.append("file",t);const g=encodeURIComponent(u.join(","));try{const v=await p.upload(`/transactions/import/confirm?confirmed_labels=${g}`,c);let f=`✅ ${v.imported} transacciones importadas.`;v.accounts_created.length>0&&(f+=` 📁 Cuentas: ${v.accounts_created.join(", ")}`),v.properties_created.length>0&&(f+=` 🏠 Propiedades: ${v.properties_created.join(", ")}`),v.errors.length>0&&(f+=` ⚠️ ${v.errors.length} errores`),m(f,"success"),await B(document.getElementById("page-content"))}catch(v){m(`Error al importar: ${v.message}`,"error")}}}),window.lucide&&lucide.createIcons()}async function fe(t,a){try{const s=await p.get("/financial/invoices");let i=`
      <div class="mb-6 flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-surface-900">Facturación (CxC)</h2>
          <p class="text-surface-500">Gestión de recibos y arriendos pendientes</p>
        </div>
      </div>
      
      <div class="glass-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-50/50 border-b border-surface-200 text-sm font-semibold text-surface-600">
                <th class="p-4">ID Factura</th>
                <th class="p-4">Emisión</th>
                <th class="p-4">Vencimiento</th>
                <th class="p-4 text-right">Monto</th>
                <th class="p-4 text-center">Estado</th>
                <th class="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-100/50">
    `;s.length===0?i+=`
        <tr>
          <td colspan="6" class="p-8 text-center text-surface-500">
            No hay facturas registradas.
          </td>
        </tr>
      `:s.forEach(e=>{let o="";e.status==="Pendiente"?o='<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Pendiente</span>':e.status==="Pagada"?o='<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Pagada</span>':e.status==="Vencida"&&(o='<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">Vencida</span>');const l=e.id.split("-")[0];i+=`
          <tr class="hover:bg-surface-50/30 transition-colors">
            <td class="p-4 font-mono text-xs text-surface-500" title="${e.id}">${l}</td>
            <td class="p-4 text-sm text-surface-900">${E(e.issue_date)}</td>
            <td class="p-4 text-sm text-surface-900">${E(e.due_date)}</td>
            <td class="p-4 text-sm font-medium text-right text-surface-900">${x(e.amount)}</td>
            <td class="p-4 text-center">${o}</td>
            <td class="p-4 text-center">
              ${e.status!=="Pagada"?`
                <button class="btn-secondary py-1 px-3 text-xs pay-invoice-btn" data-id="${e.id}"><i data-lucide="check-circle" class="w-3 h-3 mr-1 inline"></i> Pagar</button>
              `:'<span class="text-surface-400 text-xs text-center block">-</span>'}
            </td>
          </tr>
        `}),i+=`
            </tbody>
          </table>
        </div>
      </div>
    `,t.innerHTML=i,window.lucide&&lucide.createIcons(),t.querySelectorAll(".pay-invoice-btn").forEach(e=>{e.addEventListener("click",async o=>{const l=o.currentTarget.dataset.id;if(confirm("¿Confirma que desea marcar esta factura como pagada manualmente?"))try{await p.post(`/financial/invoices/${l}/pay`),m("Factura registrada como pagada con éxito.","success"),fe(t,a)}catch(d){m(d.message||"Error al pagar la factura","error")}})})}catch(s){t.innerHTML=`<div class="p-8 text-center text-rose-500 shrink-0">Error: ${s.message}</div>`}}async function q(t,a){const i=(await p.get("/maintenance?limit=50")).items||[];t.innerHTML=`
    <div class="flex items-center justify-between mb-6 animate-fade-in">
      <div class="flex items-center gap-3">
        <select id="fm-status" class="select text-sm py-2 w-44">
          <option value="">Todos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Esperando Cotizacion">Esperando Cotización</option>
          <option value="Esperando Aprobacion">Esperando Aprobación</option>
          <option value="En Progreso">En Progreso</option>
          <option value="Esperando Factura">Esperando Factura</option>
          <option value="Completado">Completado</option>
          <option value="Cancelado">Cancelado</option>
        </select>
      </div>
      <button id="add-maint-btn" class="btn-primary"><i data-lucide="plus" class="w-4 h-4"></i> Nueva Orden</button>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-in">
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-amber-500">${i.filter(e=>["Pendiente","Esperando Cotizacion","Esperando Aprobacion"].includes(e.status)).length}</p>
        <p class="text-xs text-surface-500 mt-1">Pendientes / Cot</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-primary-500">${i.filter(e=>e.status==="En Progreso").length}</p>
        <p class="text-xs text-surface-500 mt-1">En Progreso</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-accent-500">${i.filter(e=>e.status==="Completado").length}</p>
        <p class="text-xs text-surface-500 mt-1">Completados</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-rose-500">${x(i.reduce((e,o)=>e+(o.actual_cost||0),0))}</p>
        <p class="text-xs text-surface-500 mt-1">Costo Total</p>
      </div>
    </div>
    <div class="glass-card-static overflow-hidden animate-fade-in mb-8">
      <table class="data-table"><thead><tr>
        <th></th><th>Título</th><th>Tipo</th><th>Prioridad</th><th>Estado</th><th>Costo Est.</th><th>Fecha</th><th></th>
      </tr></thead><tbody>
      ${i.length?i.map(e=>`<tr>
        <td class="w-12">
            ${e.photos&&e.photos.length>0?`<div class="relative group cursor-pointer" onclick="viewPhotos('${e.id}')">
                    <img src="${p.baseUrl.replace("/api/v1","")}/${e.photos[0].photo_path}" class="w-10 h-10 rounded object-cover border border-surface-200" />
                    <span class="absolute -top-2 -right-2 bg-primary-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">${e.photos.length}</span>
                </div>`:'<div class="w-10 h-10 rounded bg-surface-100 flex items-center justify-center text-surface-400"><i data-lucide="image" class="w-5 h-5"></i></div>'}
        </td>
        <td><div class="font-semibold text-sm">${e.title}</div>${e.supplier_name?`<div class="text-xs text-surface-400">${e.supplier_name}</div>`:""}</td>
        <td><span class="badge badge-gray text-xs">${e.maintenance_type}</span></td>
        <td><span class="badge ${e.priority==="Urgente"?"badge-red":e.priority==="Alta"?"badge-amber":"badge-gray"} text-xs">${e.priority}</span></td>
        <td><span class="badge ${V(e.status)} text-xs">${e.status}</span></td>
        <td class="text-sm">${x(e.estimated_cost)}</td>
        <td class="text-xs text-surface-500">${E(e.scheduled_date)}</td>
        <td>
            <div class="flex gap-1 justify-end">
                ${e.quote_file?`<a href="${p.baseUrl.replace("/api/v1","")}/${e.quote_file}" target="_blank" class="btn-ghost text-xs py-1 px-2" title="Ver cotización"><i data-lucide="file-text" class="w-3.5 h-3.5 text-indigo-500"></i></a>`:""}
                ${e.status==="Pendiente"||e.status==="Esperando Cotizacion"?`<button class="btn-ghost text-xs py-1 px-2 quote-btn" data-id="${e.id}" title="Subir Cotización"><i data-lucide="upload-cloud" class="w-3.5 h-3.5 text-amber-500"></i></button>`:""}
                ${e.status==="Esperando Aprobacion"?`<button class="btn-ghost text-xs py-1 px-2 approve-btn" data-id="${e.id}" title="Aprobar Cotización"><i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-500"></i></button>`:""}
                <button class="btn-ghost text-xs py-1 px-2 edit-btn" data-id="${e.id}" title="Editar orden"><i data-lucide="edit-3" class="w-3.5 h-3.5"></i></button>
                ${e.status!=="Completado"&&e.status!=="Cancelado"?`<button class="btn-ghost text-xs py-1 px-2 status-btn" data-id="${e.id}" title="Cambiar estado"><i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></button>`:""}
            </div>
        </td>
      </tr>`).join(""):'<tr><td colspan="7" class="text-center py-12 text-surface-400">No hay órdenes</td></tr>'}
      </tbody></table>
    </div>
    `,window.lucide&&lucide.createIcons(),document.getElementById("add-maint-btn").addEventListener("click",async()=>await Ge()),document.querySelectorAll(".status-btn").forEach(e=>e.addEventListener("click",()=>He(e.dataset.id))),document.querySelectorAll(".edit-btn").forEach(e=>e.addEventListener("click",()=>ze(e.dataset.id))),document.querySelectorAll(".quote-btn").forEach(e=>e.addEventListener("click",()=>Ue(e.dataset.id))),document.querySelectorAll(".approve-btn").forEach(e=>e.addEventListener("click",()=>Ve(e.dataset.id))),document.getElementById("fm-status").addEventListener("change",async e=>{const o=e.target.value;await p.get(`/maintenance?limit=50${o?"&status="+encodeURIComponent(o):""}`),q(t)})}window.viewPhotos=async t=>{const a=await p.get(`/maintenance/${t}`);if(!a.photos||a.photos.length===0)return;const s=p.baseUrl.replace("/api/v1","");y("Evidencia Fotográfica",`
      <div class="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
        ${a.photos.map(i=>`
          <div class="space-y-2">
            <img src="${s}/${i.photo_path}" class="w-full rounded-lg border border-surface-200 cursor-zoom-in" onclick="window.open('${s}/${i.photo_path}', '_blank')" />
            <p class="text-[10px] text-surface-400 text-center">${E(i.uploaded_at)}</p>
          </div>
        `).join("")}
      </div>
    `,{confirmText:"Cerrar"})};async function Ge(){let t='<option value="">Cargando propiedades...</option>';try{const a=await p.get("/properties?limit=100");a.items&&a.items.length>0?t=a.items.map(s=>`<option value="${s.id}">${s.name} (ID: ${s.id.split("-")[0]})</option>`).join(""):t='<option value="">No hay propiedades disponibles</option>'}catch{t='<option value="">Error al cargar propiedades</option>'}y("Nueva Orden",`<form id="mf" class="space-y-4">
    <div><label class="label">Propiedad *</label><select class="select" name="property_id" required>${t}</select></div>
    <div><label class="label">Título *</label><input class="input" name="title" required placeholder="Reparación tubería" /></div>
    <div class="grid grid-cols-2 gap-4">
      <div><label class="label">Tipo *</label><select class="select" name="maintenance_type"><option value="Correctivo">Correctivo</option><option value="Preventivo">Preventivo</option><option value="Mejora">Mejora</option></select></div>
      <div><label class="label">Prioridad</label><select class="select" name="priority"><option value="Media">Media</option><option value="Baja">Baja</option><option value="Alta">Alta</option><option value="Urgente">Urgente</option></select></div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div><label class="label">Costo Est.</label><input class="input currency-input" name="estimated_cost" type="text" /></div>
      <div><label class="label">Fecha</label><input class="input" name="scheduled_date" type="date" /></div>
    </div>
    <div><label class="label">Proveedor</label><input class="input" name="supplier_name" /></div>
    <div><label class="label">Notas</label><textarea class="input" name="notes" rows="2"></textarea></div>
  </form>`,{confirmText:"Crear",onConfirm:async()=>{const a=new FormData(document.getElementById("mf")),s={};a.forEach((i,e)=>{i&&(s[e]=e==="estimated_cost"?I(i):i)}),await p.post("/maintenance",s),m("Orden creada","success"),await q(document.getElementById("page-content"),state)}})}async function ze(t){const a=await p.get(`/maintenance/${t}`);y("Editar Orden",`<form id="ef" class="space-y-4">
    <div><label class="label">Título *</label><input class="input" name="title" required value="${a.title}" /></div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="label">Tipo *</label>
        <select class="select" name="maintenance_type">
            <option value="Correctivo" ${a.maintenance_type==="Correctivo"?"selected":""}>Correctivo</option>
            <option value="Preventivo" ${a.maintenance_type==="Preventivo"?"selected":""}>Preventivo</option>
            <option value="Mejora" ${a.maintenance_type==="Mejora"?"selected":""}>Mejora</option>
        </select>
      </div>
      <div>
        <label class="label">Prioridad</label>
        <select class="select" name="priority">
            <option value="Baja" ${a.priority==="Baja"?"selected":""}>Baja</option>
            <option value="Media" ${a.priority==="Media"?"selected":""}>Media</option>
            <option value="Alta" ${a.priority==="Alta"?"selected":""}>Alta</option>
            <option value="Urgente" ${a.priority==="Urgente"?"selected":""}>Urgente</option>
        </select>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="label">Estado *</label>
        <select class="select" name="status">
            <option value="Pendiente" ${a.status==="Pendiente"?"selected":""}>Pendiente</option>
            <option value="Esperando Cotizacion" ${a.status==="Esperando Cotizacion"?"selected":""}>Esperando Cotización</option>
            <option value="Esperando Aprobacion" ${a.status==="Esperando Aprobacion"?"selected":""}>Esperando Aprobación</option>
            <option value="En Progreso" ${a.status==="En Progreso"?"selected":""}>En Progreso</option>
            <option value="Esperando Factura" ${a.status==="Esperando Factura"?"selected":""}>Esperando Factura</option>
            <option value="Completado" ${a.status==="Completado"?"selected":""}>Completado</option>
            <option value="Cancelado" ${a.status==="Cancelado"?"selected":""}>Cancelado</option>
        </select>
      </div>
      <div><label class="label">Fecha</label><input class="input" name="scheduled_date" type="date" value="${a.scheduled_date||""}" /></div>
    </div>
    <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Costo Est.</label><input class="input currency-input" name="estimated_cost" type="text" value="${a.estimated_cost||""}" /></div>
        <div><label class="label">Costo Real</label><input class="input currency-input" name="actual_cost" type="text" value="${a.actual_cost||""}" /></div>
    </div>
    <div><label class="label">Proveedor</label><input class="input" name="supplier_name" value="${a.supplier_name||""}" /></div>
    <div><label class="label">Notas</label><textarea class="input" name="notes" rows="3">${a.notes||""}</textarea></div>
  </form>`,{confirmText:"Guardar Cambios",onConfirm:async()=>{const s=new FormData(document.getElementById("ef")),i={};s.forEach((e,o)=>{o==="estimated_cost"||o==="actual_cost"?i[o]=e?I(e):null:e&&(i[o]=e)}),await p.put(`/maintenance/${t}`,i),m("Orden actualizada correctamente","success"),await q(document.getElementById("page-content"),state)}})}function He(t){y("Cambiar Estado",`<form id="sf" class="space-y-4">
    <div><label class="label">Estado *</label><select class="select" name="status">
      <option value="Pendiente">Pendiente</option>
      <option value="Esperando Cotizacion">Esperando Cotización</option>
      <option value="Esperando Aprobacion">Esperando Aprobación</option>
      <option value="En Progreso">En Progreso</option>
      <option value="Esperando Factura">Esperando Factura</option>
      <option value="Completado">Completado</option>
      <option value="Cancelado">Cancelado</option></select></div>
    <div><label class="label">Notas</label><textarea class="input" name="notes" rows="2"></textarea></div>
  </form>`,{confirmText:"Actualizar",onConfirm:async()=>{const a=new FormData(document.getElementById("sf")),s={status:a.get("status")};a.get("notes")&&(s.notes=a.get("notes")),await p.put(`/maintenance/${t}/status`,s),m("Estado actualizado","success"),await q(document.getElementById("page-content"),window.appState)}})}function Ue(t){y("Subir Cotización (PDF)",`<form id="qf" class="space-y-4">
    <div><label class="label">Archivo PDF *</label><input class="input" type="file" name="file" accept="application/pdf" required /></div>
    <p class="text-xs text-surface-500">Al subir la cotización la orden pasará a "Esperando Aprobación".</p>
  </form>`,{confirmText:"Subir",onConfirm:async()=>{const a=new FormData(document.getElementById("qf"));if(!a.get("file").name)return m("Selecciona un archivo","warning");await p.upload(`/maintenance/${t}/quote`,a),m("Cotización subida","success"),await q(document.getElementById("page-content"),window.appState)}})}function Ve(t){confirm('¿Aprobar cotización? La orden pasará a "En Progreso" y se notificará al responsable.')&&p.post(`/maintenance/${t}/approve`).then(()=>{m("Cotización aprobada","success"),q(document.getElementById("page-content"))}).catch(a=>m(a.message,"error"))}async function H(t){const[a,s]=await Promise.all([p.get("/contracts?limit=50"),p.get("/properties?limit=100")]),i=a.items||[],e=s.items||[];t.innerHTML=`
    <div class="space-y-6 animate-fade-in">
        <div class="flex border-b border-surface-200 mb-4">
            <button class="tab-btn active px-4 py-2 text-primary-600 border-b-2 border-primary-600 font-medium" data-tab="list">Contratos</button>
            <button class="tab-btn px-4 py-2 text-surface-500 hover:text-surface-700 font-medium" data-tab="tenants">Inquilinos</button>
        </div>
        <div id="contracts-tab-content"><!-- Content --></div>
    </div>
  `;const o=t.querySelector("#contracts-tab-content"),l=t.querySelectorAll(".tab-btn");l.forEach(d=>{d.addEventListener("click",()=>{l.forEach(n=>{n.classList.remove("active","text-primary-600","border-primary-600","border-b-2"),n.classList.add("text-surface-500")}),d.classList.remove("text-surface-500"),d.classList.add("active","text-primary-600","border-primary-600","border-b-2"),d.dataset.tab==="list"?ce(o,i,e,t):Ke(o,i)})}),ce(o,i,e,t)}function ce(t,a,s,i){t.innerHTML=`
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6 animate-fade-in glass-card-static p-4 !rounded-2xl border-white/40 shadow-sm">
      <div class="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm">
        <i data-lucide="filter" class="w-3.5 h-3.5 text-surface-400"></i>
        <select id="fc-status" class="bg-transparent text-sm font-medium focus:outline-none min-w-[140px] appearance-none">
          <option value="">Todos los estados</option>
          <option value="Activo">Activo</option>
          <option value="Borrador">Borrador</option>
          <option value="Firmado">Firmado</option>
          <option value="Finalizado">Finalizado</option>
        </select>
      </div>
      <button id="add-contract-btn" class="btn-primary !rounded-xl shadow-lg shadow-primary-500/20 py-2.5 px-5">
        <i data-lucide="plus" class="w-4 h-4"></i> Nuevo Contrato
      </button>
    </div>
    <div class="glass-card-static overflow-hidden animate-fade-in shadow-sm border-white/40">
      <table class="data-table"><thead><tr>
        <th>Arrendatario</th>
        <th>Propiedad</th>
        <th>Tipo/Canon</th>
        <th>Vigencia</th>
        <th>Estado</th>
        <th class="text-right">Acciones</th>
      </tr></thead><tbody>
      ${a.length?a.map(e=>`<tr>
        <td>
          <div class="font-bold text-surface-900">${e.tenant_name}</div>
          ${e.tenant_telegram_chat_id?`<div class="text-[10px] text-sky-500 font-medium flex items-center gap-0.5"><i data-lucide="bot" class="w-3 h-3"></i> TG:${e.tenant_telegram_chat_id}</div>`:""}
          ${e.tenant_email?`<div class="text-[10px] text-surface-400 font-medium">${e.tenant_email}</div>`:""}
        </td>
        <td>
          <div class="font-bold text-primary-600 text-xs">${e.property_name||"Sin asignar"}</div>
          <div class="text-[10px] text-surface-400 italic truncate max-w-[150px]">${e.property_address||""}</div>
        </td>
        <td>
          <span class="badge badge-gray text-[10px] mr-1">${e.contract_type}</span>
          <div class="font-black text-accent-700 mt-0.5">${x(e.monthly_rent)}</div>
        </td>
        <td class="text-xs text-surface-500 font-medium whitespace-nowrap">
          ${E(e.start_date)} <span class="text-surface-300">→</span> ${E(e.end_date)}
        </td>
        <td><span class="badge ${V(e.status)} text-[10px] font-bold">${e.status}</span></td>
        <td class="text-right"><div class="flex justify-end gap-1">
          ${e.status==="Borrador"||e.status==="Firmado"?`
            <button class="btn-ghost text-xs p-1.5 activate-btn hover:bg-accent-50 rounded-lg group" data-id="${e.id}" title="Activar Contrato">
              <i data-lucide="check-circle" class="w-4 h-4 text-accent-500 group-hover:scale-110 transition-transform"></i>
            </button>`:""}
          ${e.status==="Borrador"&&e.tenant_telegram_chat_id?`
            <button class="btn-ghost text-xs p-1.5 sign-btn hover:bg-sky-50 rounded-lg group" data-id="${e.id}" title="Enviar a Firma por Telegram">
              <i data-lucide="pen-tool" class="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform"></i>
            </button>`:""}
          ${e.tenant_telegram_chat_id?`
            <button class="btn-ghost text-xs p-1.5 tg-send-btn hover:bg-sky-50 rounded-lg group" data-id="${e.id}" title="Enviar PDF por Telegram">
              <i data-lucide="send" class="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform"></i>
            </button>
            <button class="btn-ghost text-xs p-1.5 tg-msg-btn hover:bg-violet-50 rounded-lg group" data-id="${e.id}" data-name="${e.tenant_name}" title="Enviar Mensaje al Arrendatario">
              <i data-lucide="message-circle" class="w-4 h-4 text-violet-500 group-hover:scale-110 transition-transform"></i>
            </button>`:""}
          <button class="btn-ghost text-xs p-1.5 download-btn hover:bg-blue-50 rounded-lg group" data-id="${e.id}" title="Descargar PDF">
            <i data-lucide="download" class="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform"></i>
          </button>
          <button class="btn-ghost text-xs p-1.5 pdf-btn hover:bg-red-50 rounded-lg group" data-id="${e.id}" title="Carta de Terminación">
            <i data-lucide="file-text" class="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform"></i>
          </button>
          <button class="btn-ghost text-xs p-1.5 payments-btn hover:bg-primary-50 rounded-lg group" data-id="${e.id}" title="Cronograma de Pagos">
            <i data-lucide="calendar" class="w-4 h-4 text-primary-500 group-hover:scale-110 transition-transform"></i>
          </button>
        </div></td>
      </tr>`).join(""):'<tr><td colspan="6" class="text-center py-20 text-surface-400 font-medium italic">No hay contratos registrados</td></tr>'}
      </tbody></table>
    </div>`,window.lucide&&lucide.createIcons(),document.getElementById("add-contract-btn").addEventListener("click",()=>We(s,i)),document.querySelectorAll(".activate-btn").forEach(e=>e.addEventListener("click",async()=>{try{await p.post(`/contracts/${e.dataset.id}/activate`,{}),m("Contrato activado y cronograma de pagos generado","success"),await H(i||document.getElementById("page-content"))}catch(o){m(o.message||"Error al activar contrato","error")}})),document.querySelectorAll(".sign-btn").forEach(e=>e.addEventListener("click",async()=>{try{e.querySelector("i").classList.add("animate-spin"),await p.post(`/contracts/${e.dataset.id}/send-signature`,{}),m("📋 Contrato enviado a firma por Telegram","success"),await H(i||document.getElementById("page-content"))}catch(o){m(o.message||"Error al enviar a firma","error")}})),document.querySelectorAll(".tg-send-btn").forEach(e=>e.addEventListener("click",async()=>{var o;try{e.querySelector("i").classList.add("animate-spin"),await p.post(`/contracts/${e.dataset.id}/send-telegram`,{}),m("📨 Contrato enviado por Telegram","success")}catch(l){m(l.message||"Error al enviar por Telegram","error")}finally{(o=e.querySelector("i"))==null||o.classList.remove("animate-spin")}})),document.querySelectorAll(".tg-msg-btn").forEach(e=>e.addEventListener("click",()=>{const o=e.dataset.name;y(`Enviar Mensaje a ${o}`,`
      <form id="tg-msg-form" class="space-y-4">
        <div>
          <label class="label text-sm">Mensaje</label>
          <textarea class="input min-h-[120px] resize-y" name="message" placeholder="Escriba el mensaje informativo para el arrendatario..." required></textarea>
          <p class="text-xs text-surface-400 mt-1">Se enviará vía Telegram al arrendatario.</p>
        </div>
      </form>
    `,{confirmText:"📨 Enviar por Telegram",onConfirm:async()=>{const d=new FormData(document.getElementById("tg-msg-form")).get("message");if(!(d!=null&&d.trim())){m("Escriba un mensaje","error");return}await p.post(`/contracts/${e.dataset.id}/send-message`,{message:d.trim()}),m("✅ Mensaje enviado por Telegram","success")}})})),document.querySelectorAll(".download-btn").forEach(e=>e.addEventListener("click",async()=>{var o,l;try{m("Generando PDF...","info");const d=((l=(o=p.opts)==null?void 0:o.baseUrl)==null?void 0:l.replace("/api/v1",""))||"",n=localStorage.getItem("access_token")||"",r=`${d}/api/v1/contracts/${e.dataset.id}/download`,u=await fetch(r,{headers:{Authorization:`Bearer ${n}`}});if(!u.ok)throw new Error("Error generando PDF");const c=await u.blob(),g=document.createElement("a");g.href=URL.createObjectURL(c),g.download=`contrato_${e.dataset.id.slice(0,8)}.pdf`,g.click(),URL.revokeObjectURL(g.href)}catch(d){m(d.message||"No se pudo descargar el PDF","error")}})),document.querySelectorAll(".pdf-btn").forEach(e=>e.addEventListener("click",()=>{const o=new Date().toISOString().split("T")[0];y("Generar Carta de Terminación",`
        <form id="pdf-form" class="space-y-4">
            <div>
                <label class="label">Motivo</label>
                <input class="input" name="reason" value="Terminación por mutuo acuerdo" required />
            </div>
            <div>
                <label class="label">Fecha de Terminación</label>
                <input class="input" type="date" name="termination_date" value="${o}" required />
            </div>
        </form>
      `,{confirmText:"Generar PDF",onConfirm:async()=>{var r,u;const l=new FormData(document.getElementById("pdf-form")),d=Object.fromEntries(l),n=await p.post(`/contracts/${e.dataset.id}/termination-letter`,d);if(m("PDF Generado","success"),n.pdf_url){const c=((u=(r=p.opts)==null?void 0:r.baseUrl)==null?void 0:u.replace("/api/v1",""))||"";window.open(c+n.pdf_url,"_blank")}}})})),document.querySelectorAll(".payments-btn").forEach(e=>e.addEventListener("click",async()=>{var c;const[o,l]=await Promise.all([p.get(`/contracts/${e.dataset.id}/payments`),p.get("/accounts")]),d=l.items||l||[],n=g=>g==="Pagado"?"badge-green":g==="Vencido"?"badge-red":"badge-yellow";let r=null;y("Cronograma de Pagos",`
      <div class="space-y-4">
        <div id="payments-table-container" class="max-h-80 overflow-y-auto border border-surface-100 rounded-xl">
          <!-- Table rows will be rendered here -->
        </div>

        <div id="payment-receipt-box" class="hidden p-4 bg-primary-50 border border-primary-100 rounded-xl animate-fade-in">
          <h5 class="text-xs font-bold text-primary-900 mb-2 uppercase tracking-tight">Confirmar Recepción de Pago</h5>
          <div class="flex flex-col gap-3">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-bold text-primary-700 mb-1 uppercase">Cuenta de Destino</label>
                <select id="pay-account-id" class="select text-xs py-1.5 w-full">
                  ${d.length?d.map(g=>`<option value="${g.id}">${g.account_name} (${x(g.current_balance)})</option>`).join(""):'<option value="" disabled>No hay cuentas disponibles</option>'}
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-bold text-primary-700 mb-1 uppercase">Monto a Pagar</label>
                <input id="pay-amount" type="text" class="input currency-input text-xs py-1.5 w-full" value="" />
              </div>
            </div>
            <button id="confirm-pay-btn" class="btn-primary w-full py-2">Confirmar Pago</button>
          </div>
        </div>
      </div>
    `,{showCancel:!1});const u=g=>{const v=document.getElementById("payments-table-container");v&&(v.innerHTML=`
        <table class="data-table text-xs">
          <thead class="sticky top-0 bg-white z-10 shadow-sm">
            <tr><th>Fecha</th><th>Monto</th><th>Estado</th><th class="text-right">Acción</th></tr>
          </thead>
          <tbody>
            ${g.map(f=>`
              <tr class="hover:bg-surface-50" id="payment-row-${f.id}">
                <td class="font-medium">${E(f.due_date)}</td>
                <td class="font-black text-accent-700">${x(f.amount)}</td>
                <td><span class="badge ${n(f.status)} text-[10px] uppercase font-bold">${f.status}</span></td>
                <td class="text-right flex items-center justify-end">
                  ${f.status==="Pendiente"?`
                    <button class="btn-primary py-1 px-3 text-[10px] pay-payment-btn"
                      data-pid="${f.id}" data-cid="${e.dataset.id}" data-amount="${f.amount}">
                      PAGAR
                    </button>
                  `:f.status==="Pagado"?'<i data-lucide="check-circle" class="w-4 h-4 text-accent-500"></i>':""}
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `,window.lucide&&lucide.createIcons(),v.querySelectorAll(".pay-payment-btn").forEach(f=>f.addEventListener("click",()=>{r={pid:f.dataset.pid,cid:f.dataset.cid,amount:f.dataset.amount},document.getElementById("payment-receipt-box").classList.remove("hidden"),document.getElementById("pay-amount").value=r.amount,v.querySelectorAll("tr").forEach(h=>h.classList.remove("bg-primary-50")),f.closest("tr").classList.add("bg-primary-50")})))};u(o),(c=document.getElementById("confirm-pay-btn"))==null||c.addEventListener("click",async()=>{if(!r)return;const g=document.getElementById("pay-account-id").value,v=I(document.getElementById("pay-amount").value),f=document.getElementById("confirm-pay-btn");if(!g){m("Seleccione una cuenta","error");return}try{f.disabled=!0,f.innerHTML="Procesando...",await p.post(`/contracts/${r.cid}/payments/${r.pid}/pay?account_id=${g}&amount=${v}`,{}),m("✅ Pago registrado correctamente","success"),document.getElementById("payment-receipt-box").classList.add("hidden");const h=await p.get(`/contracts/${r.cid}/payments`);u(h),H(i||document.getElementById("page-content"))}catch(h){m(h.message||"Error al registrar pago","error")}finally{f.disabled=!1,f.innerHTML="Confirmar Pago"}})}))}function We(t=[],a){const s=new Date().toISOString().split("T")[0];y("Nuevo Contrato",`<form id="cf" class="space-y-4">
    <div>
      <label class="label">Propiedad *</label>
      <select class="select" name="property_id" required>
        <option value="">Seleccione propiedad...</option>
        ${t.map(i=>`<option value="${i.id}">${i.name} (${i.property_type})</option>`).join("")}
      </select>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div><label class="label">Arrendatario *</label><input class="input" name="tenant_name" required /></div>
      <div><label class="label">Email</label><input class="input" name="tenant_email" type="email" /></div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div><label class="label">Teléfono</label><input class="input" name="tenant_phone" /></div>
      <div><label class="label">Documento</label><input class="input" name="tenant_document" /></div>
    </div>
    <div class="p-3 bg-sky-50 border border-sky-200 rounded-xl">
      <label class="label text-sky-700 flex items-center gap-1.5 text-sm">
        <i data-lucide="bot" class="w-4 h-4"></i> Telegram Chat ID
      </label>
      <input class="input font-mono text-sm mt-1" name="tenant_telegram_chat_id" placeholder="Ej: 123456789 (el arrendatario debe enviar /start al bot)" />
      <p class="text-[10px] text-sky-500 mt-1">El arrendatario debe iniciar conversación con el bot y enviar <code>/start</code> para obtener su Chat ID.</p>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div><label class="label">Tipo *</label><select class="select" name="contract_type"><option value="Vivienda">Vivienda</option><option value="Comercial">Comercial</option><option value="Garaje">Garaje</option></select></div>
      <div><label class="label">Canon Mensual *</label><input class="input currency-input" name="monthly_rent" type="text" required /></div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div><label class="label">Inicio *</label><input class="input" name="start_date" type="date" required value="${s}" /></div>
      <div><label class="label">Fin *</label><input class="input" name="end_date" type="date" required /></div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div><label class="label">Depósito</label><input class="input currency-input" name="deposit_amount" type="text" /></div>
      <div><label class="label">Incremento Anual %</label><input class="input" name="annual_increment_pct" type="number" step="0.01" value="5" /></div>
    </div>
  </form>`,{confirmText:"Crear",onConfirm:async()=>{const i=new FormData(document.getElementById("cf")),e={};i.forEach((o,l)=>{o&&(["monthly_rent","deposit_amount"].includes(l)?e[l]=I(o):l==="annual_increment_pct"?e[l]=parseFloat(o):e[l]=o)}),e.auto_renewal=!1,await p.post("/contracts",e),m("Contrato creado en Borrador — use ✓ para activarlo","success"),await H(a||document.getElementById("page-content"))}})}function Ke(t,a){const s={};a.forEach(e=>{s[e.tenant_name]||(s[e.tenant_name]={name:e.tenant_name,email:e.tenant_email,phone:e.tenant_phone,document:e.tenant_document,telegram_chat_id:e.tenant_telegram_chat_id,active_contracts:0,contract_ids:[]}),e.status==="Activo"&&s[e.tenant_name].active_contracts++,s[e.tenant_name].contract_ids.push(e.id)});const i=Object.values(s);t.innerHTML=`
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        ${i.length?i.map(e=>`
            <div class="glass-card-static p-5 flex items-start gap-4">
                <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg shrink-0">
                    ${e.name.charAt(0)}
                </div>
                <div class="min-w-0 flex-1">
                    <h4 class="font-bold text-surface-900 truncate">${e.name}</h4>
                    <p class="text-xs text-surface-500 mt-1"><i data-lucide="mail" class="w-3 h-3 inline mr-1"></i>${e.email||"-"}</p>
                    <p class="text-xs text-surface-500 mt-1"><i data-lucide="phone" class="w-3 h-3 inline mr-1"></i>${e.phone||"-"}</p>
                    <p class="text-xs text-surface-500 mt-1"><i data-lucide="credit-card" class="w-3 h-3 inline mr-1"></i>${e.document||"-"}</p>
                    ${e.telegram_chat_id?`<p class="text-xs text-sky-500 mt-1 font-medium"><i data-lucide="bot" class="w-3 h-3 inline mr-1"></i>TG: ${e.telegram_chat_id}</p>`:""}
                    <div class="mt-3 flex items-center gap-2 flex-wrap">
                        <span class="badge ${e.active_contracts>0?"badge-green":"badge-gray"} text-xs">
                            ${e.active_contracts} Contratos Activos
                        </span>
                        ${e.telegram_chat_id?`
                            <button class="btn-ghost text-xs p-1.5 tenant-msg-btn hover:bg-violet-50 rounded-lg group"
                                data-contract-id="${e.contract_ids[0]}" data-name="${e.name}" title="Enviar Mensaje por Telegram">
                                <i data-lucide="message-circle" class="w-4 h-4 text-violet-500 group-hover:scale-110 transition-transform"></i>
                            </button>
                        `:""}
                    </div>
                </div>
            </div>
        `).join(""):'<div class="col-span-full py-12 text-center text-surface-500">No hay inquilinos registrados.</div>'}
        </div>
    `,window.lucide&&lucide.createIcons(),t.querySelectorAll(".tenant-msg-btn").forEach(e=>e.addEventListener("click",()=>{const o=e.dataset.name,l=e.dataset.contractId;y(`Enviar Mensaje a ${o}`,`
      <form id="tenant-msg-form" class="space-y-4">
        <div>
          <label class="label text-sm">Mensaje</label>
          <textarea class="input min-h-[120px] resize-y" name="message" placeholder="Escriba el mensaje informativo..." required></textarea>
          <p class="text-xs text-surface-400 mt-1">Se enviará vía Telegram al arrendatario.</p>
        </div>
      </form>
    `,{confirmText:"📨 Enviar por Telegram",onConfirm:async()=>{const n=new FormData(document.getElementById("tenant-msg-form")).get("message");if(!(n!=null&&n.trim())){m("Escriba un mensaje","error");return}await p.post(`/contracts/${l}/send-message`,{message:n.trim()}),m("✅ Mensaje enviado por Telegram","success")}})}))}async function Ye(t){t.innerHTML=`
    <div class="flex flex-col gap-6 animate-fade-in">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-surface-900">Gestión de Presupuestos</h3>
        <button id="add-budget-btn" class="btn-primary"><i data-lucide="plus" class="w-4 h-4"></i> Nuevo Presupuesto</button>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-4 p-4 glass-card-static !rounded-2xl border-white/40 shadow-sm">
        <div class="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm flex-1 min-w-[200px]">
          <i data-lucide="home" class="w-3.5 h-3.5 text-surface-400"></i>
          <select id="filter-property" class="bg-transparent text-sm font-medium focus:outline-none w-full appearance-none">
            <option value="">Todas las propiedades</option>
            <option value="GENERAL">Gastos Generales (Distribuible)</option>
          </select>
        </div>
        
        <div class="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm w-32">
          <i data-lucide="calendar" class="w-3.5 h-3.5 text-surface-400"></i>
          <input type="number" id="filter-year" class="bg-transparent text-sm font-medium focus:outline-none w-full" value="${new Date().getFullYear()}" />
        </div>

        <div class="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm w-40">
          <i data-lucide="calendar-days" class="w-3.5 h-3.5 text-surface-400"></i>
          <select id="filter-month" class="bg-transparent text-sm font-medium focus:outline-none w-full appearance-none">
            <option value="">Todos los meses</option>
            ${Array.from({length:12},(u,c)=>`<option value="${c+1}">${new Date(0,c).toLocaleString("es",{month:"long"})}</option>`).join("")}
          </select>
        </div>

        <div class="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm w-44">
          <i data-lucide="activity" class="w-3.5 h-3.5 text-surface-400"></i>
          <select id="filter-status" class="bg-transparent text-sm font-medium focus:outline-none w-full appearance-none">
            <option value="">Cualquier estado</option>
            <option value="Verde">Verde (Saludable)</option>
            <option value="Amarillo">Amarillo (Alerta)</option>
            <option value="Rojo">Rojo (Excedido)</option>
          </select>
        </div>

        <button id="apply-filters" class="btn-primary !rounded-xl shadow-lg shadow-primary-500/10 py-2 px-4 flex items-center gap-2">
          <i data-lucide="search" class="w-4 h-4"></i> Buscar
        </button>
      </div>

      <!-- Table Container -->
      <div id="budgets-table-container" class="glass-card-static overflow-hidden">
        <div class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
        </div>
      </div>
    </div>
  `,window.lucide&&lucide.createIcons();const[a,s]=await Promise.all([p.get("/properties?limit=100"),p.get("/accounts")]),i=a.items||[],e=s||[],o=null,l=document.getElementById("filter-property");i.forEach(u=>{const c=document.createElement("option");c.value=u.id,c.textContent=u.name,l.appendChild(c)});const d=async()=>{const u=document.getElementById("budgets-table-container"),c=document.getElementById("filter-property").value,g=document.getElementById("filter-year").value,v=document.getElementById("filter-month").value,f=document.getElementById("filter-status").value;let h="/budgets?limit=100";c&&(h+=`&property_id=${c}`),g&&(h+=`&year=${g}`),v&&(h+=`&month=${v}`);try{const $=await p.get(h);let w=$;f&&(w=$.filter(C=>C.semaphore===f)),ge(u,w,i,e,o,d)}catch($){u.innerHTML=`<div class="p-8 text-center text-rose-500">Error al cargar presupuestos: ${$.message}</div>`}};document.getElementById("apply-filters").addEventListener("click",d),document.getElementById("add-budget-btn").addEventListener("click",()=>ve(i,e,null,d));const n=document.querySelector(".glass-card-static.flex.flex-wrap"),r=document.createElement("button");r.className="btn-secondary !rounded-xl shadow-sm py-2 px-4 flex items-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 ml-auto",r.innerHTML='<i data-lucide="download" class="w-4 h-4"></i> Exportar a Excel',r.addEventListener("click",()=>{const u=document.getElementById("filter-property").value,c=document.getElementById("filter-year").value;let g=`${p.baseURL}/budgets/export/excel`;const v=new URLSearchParams;u&&v.append("property_id",u==="GENERAL"?"":u),c&&(v.append("start_year",parseInt(c)-2),v.append("end_year",parseInt(c)+2)),[...v].length&&(g+="?"+v.toString());const f=localStorage.getItem("token");fetch(g,{headers:f?{Authorization:`Bearer ${f}`}:{}}).then(async h=>{if(!h.ok)throw new Error("Error limitando exportación");const $=await h.blob(),w=document.createElement("a");w.href=URL.createObjectURL($),w.download=`Presupuestos_${c||"Todos"}.xlsx`,document.body.appendChild(w),w.click(),w.remove(),m("Exportación exitosa","success")}).catch(h=>{m("Error exportando Excel","error"),console.error(h)})}),n.appendChild(r),d()}function ge(t,a,s,i,e,o,l="",d=1){if(!a.length){t.innerHTML='<div class="py-20 text-center text-surface-400">No se encontraron presupuestos con los filtros seleccionados.</div>';return}t.innerHTML=`
    <table class="data-table">
      <thead>
        <tr>
          <th class="sortable cursor-pointer hover:bg-surface-100" data-sort="property">
            Propiedad ${l==="property"?`<i data-lucide="chevron-${d===1?"up":"down"}" class="w-3 h-3 inline ml-1"></i>`:'<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>'}
          </th>
          <th class="sortable cursor-pointer hover:bg-surface-100" data-sort="date">
            Periodo ${l==="date"?`<i data-lucide="chevron-${d===1?"up":"down"}" class="w-3 h-3 inline ml-1"></i>`:'<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>'}
          </th>
          <th class="sortable cursor-pointer hover:bg-surface-100" data-sort="status">
            Estado ${l==="status"?`<i data-lucide="chevron-${d===1?"up":"down"}" class="w-3 h-3 inline ml-1"></i>`:'<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>'}
          </th>
          <th class="sortable cursor-pointer hover:bg-surface-100" data-sort="budget">
            Presupuesto ${l==="budget"?`<i data-lucide="chevron-${d===1?"up":"down"}" class="w-3 h-3 inline ml-1"></i>`:'<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>'}
          </th>
          <th>Ejecutado</th>
          <th class="sortable cursor-pointer hover:bg-surface-100" data-sort="pct">
            % Ejecución ${l==="pct"?`<i data-lucide="chevron-${d===1?"up":"down"}" class="w-3 h-3 inline ml-1"></i>`:'<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>'}
          </th>
          <th class="text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${a.map(n=>{const r=s.find(c=>c.id===n.property_id);return`
          <tr class="hover:bg-surface-50 transition-colors">
            <td>
              <div class="font-semibold text-surface-900">${n.property_id===null?"Gastos Generales":r?r.name:"Unidad Borrada"}</div>
              <div class="text-[10px] text-surface-400 italic">${n.property_id?n.property_id.slice(0,8)+"...":"General"}</div>
            </td>
            <td>
              <div class="flex items-center gap-1">
                <span class="text-sm font-medium text-surface-700">${n.year} - ${new Date(0,n.month-1).toLocaleString("es",{month:"short",year:"numeric"}).toUpperCase()}</span>
                ${n.is_closed?'<i data-lucide="lock" class="w-3 h-3 text-surface-400" title="Presupuesto Cerrado"></i>':""}
              </div>
            </td>
            <td>
              <div class="flex items-center gap-2">
                <span class="semaphore ${Ee(n.semaphore)}"></span>
                <span class="text-xs font-semibold ${n.semaphore==="Verde"?"text-green-600":n.semaphore==="Amarillo"?"text-amber-600":"text-red-600"}">${n.semaphore}</span>
              </div>
            </td>
            <td class="text-sm font-medium text-surface-900">${x(n.total_budget)}</td>
            <td class="text-sm font-medium text-surface-600">${x(n.total_executed)}</td>
            <td class="w-48">
              <div class="flex items-center gap-3">
                <div class="flex-1 bg-surface-100 rounded-full h-1.5 overflow-hidden">
                  <div class="h-full rounded-full ${n.semaphore==="Verde"?"bg-green-500":n.semaphore==="Amarillo"?"bg-amber-500":"bg-red-500"}" 
                    style="width: ${Math.min(n.execution_pct,100)}%"></div>
                </div>
                <span class="text-xs font-bold w-14 text-right">${U(n.execution_pct)}</span>
              </div>
            </td>
            <td>
              <div class="flex justify-end gap-1">
                <a href="#/budget-report?property_id=${n.property_id}&year=${n.year}&month=${n.month}" 
                  class="p-2 rounded-lg hover:bg-primary-50 text-primary-600 transition" title="Ver Reporte Detallado">
                  <i data-lucide="bar-chart-3" class="w-4 h-4"></i>
                </a>
                
                ${n.period_type==="Anual"?`
                <button class="breakdown-btn p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition" 
                  data-id="${n.id}" title="Ver Desglose Mensual">
                  <i data-lucide="calendar-days" class="w-4 h-4"></i>
                </button>
                `:""}
                
                <button class="export-pdf-btn p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition" 
                  data-id="${n.id}" data-ym="${n.year}_${n.month}" title="Exportar PDF de Asamblea">
                  <i data-lucide="file-text" class="w-4 h-4"></i>
                </button>

                <button class="history-btn p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition" 
                  data-id="${n.id}" title="Ver Historial de Cambios">
                  <i data-lucide="history" class="w-4 h-4"></i>
                </button>
                
                ${n.is_closed?"":`
                <button class="close-budget-btn p-2 rounded-lg hover:bg-indigo-50 text-indigo-600 transition" 
                  data-id="${n.id}" title="Cerrar Mes (Congelar Distribución)">
                  <i data-lucide="lock" class="w-4 h-4"></i>
                </button>
                <button class="edit-btn p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition" 
                  data-id="${n.id}" title="Editar">
                  <i data-lucide="edit-3" class="w-4 h-4"></i>
                </button>
                `}
                
                <button class="duplicate-btn p-2 rounded-lg hover:bg-surface-100 text-surface-500 transition" 
                  data-id="${n.id}" title="Duplicar">
                  <i data-lucide="copy" class="w-4 h-4"></i>
                </button>
                
                ${n.is_closed?"":`
                <button class="delete-budget-btn p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition" 
                  data-id="${n.id}" title="Eliminar">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
                `}
              </div>
            </td>
          </tr>
        `}).join("")}
      </tbody>
    </table>
  `,window.lucide&&lucide.createIcons(),t.querySelectorAll("th.sortable").forEach(n=>{n.addEventListener("click",()=>{const r=n.dataset.sort;l===r?d*=-1:(l=r,d=1);const u=[...a].sort((c,g)=>{var h,$;let v,f;return r==="property"?(v=((h=s.find(w=>w.id===c.property_id))==null?void 0:h.name)||"",f=(($=s.find(w=>w.id===g.property_id))==null?void 0:$.name)||""):r==="date"?(v=c.year*100+c.month,f=g.year*100+g.month):r==="status"?(v=c.semaphore,f=g.semaphore):r==="budget"?(v=c.total_budget,f=g.total_budget):r==="pct"&&(v=c.execution_pct,f=g.execution_pct),(v>f?1:-1)*d});ge(t,u,s,i,e,o,r,d)})}),t.querySelectorAll(".edit-btn").forEach(n=>{n.addEventListener("click",async()=>{const r=a.find(u=>u.id===n.dataset.id);ve(s,i,r,o)})}),t.querySelectorAll(".duplicate-btn").forEach(n=>{n.addEventListener("click",()=>{const r=a.find(u=>u.id===n.dataset.id);Je(s,r,o)})}),t.querySelectorAll(".delete-budget-btn").forEach(n=>{n.addEventListener("click",async()=>{y("¿Eliminar Presupuesto?","Esta acción borrará el presupuesto de este periodo y sus categorías.",{confirmText:"Eliminar",onConfirm:async()=>{await p.delete(`/budgets/${n.dataset.id}`),m("Presupuesto eliminado","success"),o()}})})}),t.querySelectorAll(".close-budget-btn").forEach(n=>{n.addEventListener("click",async()=>{y("¿Cerrar y Congelar Presupuesto?","Esta acción calculará y guardará irreversiblemente los porcentajes de distribución de este mes. El presupuesto quedará bloqueado y no podrá ser editado ni eliminado en el futuro.",{confirmText:"Cerrar Presupuesto",onConfirm:async()=>{try{await p.post(`/budgets/${n.dataset.id}/close`),m("Presupuesto cerrado exitosamente","success"),o()}catch(r){m(r.message||"Error al cerrar presupuesto","error")}}})})}),t.querySelectorAll(".export-pdf-btn").forEach(n=>{n.addEventListener("click",async()=>{const r=n.dataset.id,u=n.dataset.ym;m("Generando PDF...","info");try{const c=localStorage.getItem("token"),g=await fetch(`${p.baseURL}/budgets/${r}/export/pdf`,{headers:c?{Authorization:`Bearer ${c}`}:{}});if(!g.ok)throw new Error("Error al generar PDF");const v=await g.blob(),f=document.createElement("a");f.href=URL.createObjectURL(v),f.download=`Presupuesto_${u}.pdf`,document.body.appendChild(f),f.click(),f.remove(),m("PDF generado exitosamente","success")}catch(c){m(c.message||"Error al exportar PDF","error")}})}),t.querySelectorAll(".history-btn").forEach(n=>{n.addEventListener("click",()=>{const r=a.find(u=>u.id===n.dataset.id);Ze(r)})})}function Ze(t){if(!t.revisions||t.revisions.length===0){y("Historial de Cambios",'<p class="text-surface-500 py-4 text-center">No hay revisiones registradas para este presupuesto.</p>',{confirmText:"Cerrar"});return}const a=t.revisions.map(s=>{var i;return`
      <div class="p-4 bg-surface-50 rounded-xl border border-surface-200 mb-3 animate-fade-in">
        <div class="flex justify-between items-start mb-2">
          <div>
            <span class="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-md border border-primary-100">${new Date(s.created_at).toLocaleString()}</span>
          </div>
          <span class="text-xs text-surface-500 italic">Usuario ID: ${((i=s.user_id)==null?void 0:i.slice(0,8))||"Sistema"}</span>
        </div>
        <div class="flex items-center gap-3 text-sm font-medium text-surface-700 my-2">
          <span class="text-surface-500 line-through">${x(s.old_amount)}</span>
          <i data-lucide="arrow-right" class="w-4 h-4 text-surface-400"></i>
          <span class="text-emerald-600">${x(s.new_amount)}</span>
        </div>
        ${s.justification?`<div class="text-xs text-surface-600 bg-white p-2 border border-surface-200 rounded-lg mt-2 font-medium"><b>Justificación:</b> ${s.justification}</div>`:""}
      </div>
    `}).join("");y("Historial de Modificaciones",`
    <div class="max-h-96 overflow-y-auto pr-2">
      ${a}
    </div>
  `,{confirmText:"Cerrar"}),window.lucide&&lucide.createIcons()}function ve(t,a,s=null,i){const e=!!s,o=e?s.year:new Date().getFullYear(),l=e?s.month:new Date().getMonth()+1,d=t.map(c=>`<option value="${c.id}" ${e&&s.property_id===c.id?"selected":""}>${c.name}</option>`).join("");y(e?"Editar Presupuesto":"Nuevo Presupuesto",`
    <form id="bf" class="space-y-4">
      <div class="${e?"pointer-events-none opacity-60":""}">
        <label class="label">Propiedad *</label>
        <select class="select" name="property_id" required>
          <option value="GENERAL" ${e&&b_prop===null?"selected":""}>Gastos Generales (Distribuible)</option>
          ${d}
        </select>
        ${e?'<p class="text-[10px] text-surface-400 mt-1">La propiedad y periodo no se pueden cambiar. Duplique el presupuesto si lo desea en otro lugar.</p>':""}
      </div>
      <div class="grid grid-cols-3 gap-4 items-end ${e?"pointer-events-none opacity-60":""}">
        <div><label class="label">Año *</label><input class="input" name="year" type="number" value="${o}" required /></div>
        <div><label class="label">Mes *</label><input class="input" name="month" type="number" min="1" max="12" value="${l}" required /></div>
        <div id="total-budget-container">
           <label class="label">Presupuesto *</label>
           <input class="input currency-input" name="total_budget" id="total_budget_input" type="text" value="${e?s.total_budget:""}" ${e&&s.auto_calculate_total?"disabled":""} />
        </div>
      </div>
      <div class="flex items-center gap-2 bg-primary-50 p-3 rounded-xl border border-primary-100">
        <input type="checkbox" id="auto_calculate_total" name="auto_calculate_total" class="w-4 h-4 rounded text-primary-600" ${e&&s.auto_calculate_total?"checked":""} />
        <div class="flex-1">
          <label for="auto_calculate_total" class="text-sm font-bold text-primary-900 cursor-pointer">Autocalcular total</label>
          <p class="text-[10px] text-primary-600">El total será la suma de los montos de cada categoría configurada.</p>
        </div>
      </div>

      ${e?"":`
      <div class="flex items-center gap-2 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
        <input type="checkbox" id="is_annual" name="is_annual" class="w-4 h-4 rounded text-indigo-600" />
        <div class="flex-1">
          <label for="is_annual" class="text-sm font-bold text-indigo-900 cursor-pointer">Presupuesto Anualizado</label>
          <p class="text-[10px] text-indigo-600">Se creará un único presupuesto anual con desglose mes a mes.</p>
        </div>
      </div>
      `}
      <div id="cats-container" class="pt-4 border-t border-surface-100">
        <div class="flex items-center justify-between mb-2">
          <label class="label mb-0">Categorías Detalladas</label>
          <button type="button" id="add-cat-btn" class="text-xs text-primary-600 font-bold hover:underline">+ Agregar</button>
        </div>
        <div class="space-y-2 max-h-48 overflow-y-auto pr-2" id="cats-list">
          ${e?s.categories.map(c=>ue(c.category_name,c.budgeted_amount,c.is_distributable,c.account_id,a)).join(""):""}
        </div>
      </div>
      ${e?`
      <div class="bg-amber-50 p-3 rounded-xl border border-amber-100">
        <label class="label text-amber-900">Justificación del Cambio *</label>
        <input class="input bg-white" name="justification" type="text" placeholder="Razón de la modificación (obligatorio si cambia el total)..." />
        <p class="text-[10px] text-amber-700 mt-1">Requerido por auditoría si el monto total cambia.</p>
      </div>
      `:""}
      <div>
      </div>
    </form>
  `,{maxWidth:"800px",confirmText:e?"Guardar Cambios":"Crear Presupuesto",onConfirm:async()=>{var $;const c=document.getElementById("bf"),g=new FormData(c),v=document.getElementById("auto_calculate_total").checked,f=[];c.querySelectorAll(".cat-row").forEach(w=>{var M;const C=w.querySelector('[name="cat_name"]').value,P=I(w.querySelector('[name="cat_amount"]').value),F=w.querySelector('[name="cat_dist"]').checked,N=(M=w.querySelector('[name="cat_account"]'))==null?void 0:M.value;C&&P&&f.push({category_name:C,budgeted_amount:P,is_distributable:F,account_id:N||null})});const h={property_id:g.get("property_id")==="GENERAL"?null:g.get("property_id"),year:parseInt(g.get("year")),month:parseInt(g.get("month")),total_budget:v?0:I(g.get("total_budget"))||0,categories:f,auto_calculate_total:v,notes:g.get("notes"),justification:g.get("justification")||""};e?(await p.put(`/budgets/${s.id}`,h),m("Presupuesto actualizado","success")):(h.is_annual=(($=document.getElementById("is_annual"))==null?void 0:$.checked)||!1,await p.post("/budgets",h),m("Presupuesto creado","success")),i&&i()}});const n=document.getElementById("auto_calculate_total"),r=document.getElementById("total_budget_input");n.addEventListener("change",()=>{r.disabled=n.checked,n.checked&&u()});const u=()=>{if(!n.checked)return;let c=0;document.querySelectorAll(".cat-row").forEach(g=>{c+=I(g.querySelector('[name="cat_amount"]').value||"0")}),r.value=c,r.dispatchEvent(new Event("input",{bubbles:!0}))};document.getElementById("add-cat-btn").addEventListener("click",()=>{const c=document.getElementById("cats-list"),g=document.createElement("div");g.innerHTML=ue("","",!1,null,a);const v=g.firstElementChild;c.appendChild(v),window.lucide&&lucide.createIcons(),v.querySelector('[name="cat_amount"]').addEventListener("input",u)}),document.querySelectorAll('.cat-row [name="cat_amount"]').forEach(c=>{c.addEventListener("input",u)}),window.lucide&&lucide.createIcons()}function ue(t="",a="",s=!1,i=null,e=[]){return`
    <div class="cat-row flex gap-2 items-center animate-fade-in group w-full">
      <input class="input text-sm py-1.5 flex-[4]" name="cat_name" value="${t}" placeholder="Categoría" />
      <input class="input currency-input text-sm py-1.5 flex-[2]" name="cat_amount" type="text" value="${a}" placeholder="$" />
      <select class="select text-xs py-1.5 flex-[3]" name="cat_account">
        <option value="">(Sin Cuenta)</option>
        ${e.map(o=>`<option value="${o.id}" ${i===o.id?"selected":""}>${o.account_name}</option>`).join("")}
      </select>
      <div class="flex items-center gap-1 w-12">
        <input type="checkbox" name="cat_dist" class="w-4 h-4" ${s?"checked":""} />
        <span class="text-[10px] text-surface-400">Dist.</span>
      </div>
      <button type="button" class="p-1.5 text-rose-300 hover:text-rose-600 transition" onclick="this.parentElement.remove(); document.dispatchEvent(new Event('catChange'));">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>
  `}document.addEventListener("catChange",()=>{const t=document.getElementById("auto_calculate_total");if(t&&t.checked){let a=0;document.querySelectorAll(".cat-row").forEach(i=>{a+=I(i.querySelector('[name="cat_amount"]').value||"0")});const s=document.getElementById("total_budget_input");s&&(s.value=a,s.dispatchEvent(new Event("input",{bubbles:!0})))}});function Je(t,a,s){const i=new Date().getFullYear(),e=t.map(o=>`<option value="${o.id}" ${a.property_id===o.id?"selected":""}>${o.name}</option>`).join("");y("Duplicar Periodo",`
    <form id="df" class="space-y-4">
      <div class="bg-indigo-50 p-3 rounded-xl border border-indigo-100 mb-4 flex gap-3 items-center">
        <i data-lucide="copy" class="w-5 h-5 text-indigo-600"></i>
        <p class="text-xs text-indigo-700">Copia este presupuesto a un nuevo mes/año con un ajuste opcional.</p>
      </div>
      
      <div>
        <label class="label">Propiedad Destino *</label>
        <select class="select" name="target_property_id" required>
          <option value="GENERAL" ${a.property_id==="GENERAL"?"selected":""}>Gastos Generales (Distribuible)</option>
          ${e}
        </select>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Año Destino *</label><input class="input" name="target_year" type="number" value="${i}" required /></div>
        <div><label class="label">Mes Destino *</label><input class="input" name="target_month" type="number" min="1" max="12" value="1" required /></div>
      </div>
      <div>
        <label class="label">Incremento Porcentual (%)</label>
        <div class="relative">
          <input class="input pl-8" name="percentage_increase" type="number" step="0.1" value="0" />
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 font-bold">%</span>
        </div>
      </div>
    </form>
  `,{confirmText:"Procesar Duplicación",onConfirm:async()=>{const o=new FormData(document.getElementById("df")),l={target_year:parseInt(o.get("target_year")),target_month:parseInt(o.get("target_month")),target_property_id:o.get("target_property_id"),percentage_increase:parseFloat(o.get("percentage_increase")||0)};await p.post(`/budgets/${a.id}/duplicate`,l),m("Presupuesto duplicado","success"),s&&s()}}),window.lucide&&lucide.createIcons()}async function Qe(t){const a=new URLSearchParams(window.location.hash.split("?")[1]||""),s=a.get("property_id"),i=a.get("year"),e=a.get("month");if(!s||!i||!e){t.innerHTML='<div class="p-12 text-center text-surface-500">Faltan parámetros para el reporte.</div>';return}const o=await p.get(`/budgets/report/${s}?year=${i}&month=${e}`),l=new Set;o.rows.forEach(n=>{Object.keys(n.distribution).forEach(r=>l.add(r))});const d=Array.from(l);t.innerHTML=`
    <div class="mb-6 flex items-center justify-between">
      <a href="#/budgets" class="btn-ghost text-sm"><i data-lucide="arrow-left" class="w-4 h-4 mr-1"></i> Volver</a>
      <div class="text-right">
        <h4 class="font-bold text-surface-900">Periodo: ${e}/${i}</h4>
      </div>
    </div>

    <div class="glass-card overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-surface-50 border-b border-surface-200">
            <th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Categoría</th>
            <th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Presupuestado</th>
            <th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Ejecutado Total</th>
            ${d.map(n=>`<th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">${n.slice(0,8)}...</th>`).join("")}
            <th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Diferencia</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-100">
          ${o.rows.length?o.rows.map(n=>{const r=n.budgeted-n.actual,u=r>=0?"text-green-600":"text-red-600";return`
              <tr class="hover:bg-surface-50/50 transition-colors">
                <td class="p-4 font-medium text-surface-700">
                  <div class="flex flex-col">
                    <span>${n.category}</span>
                    ${n.is_distributable?'<span class="text-[10px] text-primary-500 font-bold uppercase">Distribuible</span>':""}
                  </div>
                </td>
                <td class="p-4 text-surface-600 font-mono text-sm">${x(n.budgeted)}</td>
                <td class="p-4 text-surface-900 font-bold font-mono text-sm">${x(n.actual)}</td>
                ${d.map(c=>`
                  <td class="p-4 text-surface-500 font-mono text-xs">
                    ${n.distribution[c]?x(n.distribution[c]):"--"}
                  </td>
                `).join("")}
                <td class="p-4 font-bold font-mono text-sm ${u}">${x(r)}</td>
              </tr>
            `}).join(""):`<tr><td colspan="${4+d.length}" class="p-8 text-center text-surface-400">Sin datos para este periodo</td></tr>`}
        </tbody>
      </table>
    </div>

    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card-static p-4">
        <p class="text-xs text-surface-400 uppercase font-bold mb-1">Total Presupuesto</p>
        <p class="text-xl font-bold text-surface-900 font-mono">${x(o.rows.reduce((n,r)=>n+r.budgeted,0))}</p>
      </div>
      <div class="glass-card-static p-4">
        <p class="text-xs text-surface-400 uppercase font-bold mb-1">Total Ejecutado</p>
        <p class="text-xl font-bold text-primary-600 font-mono">${x(o.rows.reduce((n,r)=>n+r.actual,0))}</p>
      </div>
       <div class="glass-card-static p-4">
        <p class="text-xs text-surface-400 uppercase font-bold mb-1">Cumpimiento</p>
        <p class="text-xl font-bold text-surface-900 font-mono">
          ${U(o.rows.reduce((n,r)=>n+r.actual,0)/(o.rows.reduce((n,r)=>n+r.budgeted,0)||1)*100)}
        </p>
      </div>
    </div>
  `,window.lucide&&lucide.createIcons()}async function te(t,a){let s=[],i=[],e={items:[]};try{const[u,c,g]=await Promise.all([p.get("/assets").catch(v=>(console.error("Error fetching assets:",v),[])),p.get("/inspections").catch(v=>(console.error("Error fetching inspections:",v),[])),p.get("/properties?limit=100").catch(v=>(console.error("Error fetching properties:",v),{items:[]}))]);s=u||[],i=c||[],e=g||{items:[]}}catch(u){console.error("Unhandled error fetching facility data:",u)}const o=e.items||[];t.innerHTML=`
        <div class="space-y-6 animate-fade-in">
            <!-- Tabs -->
            <div class="flex border-b border-surface-200">
                <button class="tab-btn active" data-tab="assets">Inventario de Activos</button>
                <button class="tab-btn" data-tab="inspections">Inspecciones</button>
                <button class="tab-btn" data-tab="maintenance">Mantenimiento</button>
                <button class="tab-btn" data-tab="providers">Proveedores</button>
            </div>

            <div id="tab-content" class="min-h-[400px]">
                <!-- Content will be rendered here -->
            </div>
        </div>
    `;const l=t.querySelector("#tab-content"),d=t.querySelectorAll(".tab-btn"),n=sessionStorage.getItem("facility_active_tab")||"assets";d.forEach(u=>{u.addEventListener("click",async()=>{d.forEach(c=>c.classList.remove("active")),u.classList.add("active"),sessionStorage.setItem("facility_active_tab",u.dataset.tab),await pe(u.dataset.tab,l,{assets:s,inspections:i,properties:o})})});const r=t.querySelector(`.tab-btn[data-tab="${n}"]`);r&&(d.forEach(u=>u.classList.remove("active")),r.classList.add("active")),await pe(n,l,{assets:s,inspections:i,properties:o})}async function pe(t,a,s){a.innerHTML=`
        <div class="flex items-center justify-center py-20">
            <div class="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    `;try{switch(t){case"assets":Xe(a,s);break;case"inspections":et(a,s);break;case"providers":await tt(a,s);break;case"maintenance":await ae(a,s);break}}catch(i){console.error(`Error rendering tab ${t}:`,i),a.innerHTML=`
            <div class="text-center py-20">
                <i data-lucide="alert-circle" class="w-12 h-12 text-rose-400 mx-auto mb-4"></i>
                <h3 class="text-lg font-semibold text-surface-700 mb-2">No se pudo cargar la información</h3>
                <p class="text-surface-500 text-sm">${i.message}</p>
                <button onclick="window.location.reload()" class="btn-primary btn-sm mt-4">Reintentar</button>
            </div>
        `,window.lucide&&lucide.createIcons()}}function Xe(t,{assets:a,properties:s}){t.innerHTML=`
        <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-semibold text-surface-700">Equipos y Mobiliario</h4>
            <button id="add-asset-btn" class="btn-primary btn-sm px-3 py-1.5"><i data-lucide="plus" class="w-4 h-4"></i> Nuevo Activo</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${a.length?a.map(i=>`
                <div class="glass-card-static p-4 space-y-3">
                    <div class="flex justify-between items-start">
                        <div>
                            <span class="text-[10px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">${i.category}</span>
                            <h5 class="font-bold text-surface-900 mt-1">${i.name}</h5>
                        </div>
                        <span class="badge ${i.status==="Operativo"?"badge-green":"badge-amber"}">${i.status}</span>
                    </div>
                    <div class="text-xs text-surface-500 space-y-1">
                        <p><span class="font-medium">Marca:</span> ${i.brand||"N/A"}</p>
                        <p><span class="font-medium">Modelo:</span> ${i.model||"N/A"}</p>
                        <p><span class="font-medium">Serial:</span> ${i.serial_number||"N/A"}</p>
                    </div>
                    <div class="pt-2 border-t border-surface-100 flex justify-between items-center">
                        <span class="text-[10px] text-surface-400">Propiedad: ${i.property_id.slice(0,8)}</span>
                        <button class="text-primary-600 hover:text-primary-700 text-xs font-semibold">Detalles</button>
                    </div>
                </div>
            `).join(""):'<p class="text-surface-400 text-center py-20 col-span-full">No hay activos registrados.</p>'}
        </div>
    `,document.getElementById("add-asset-btn").addEventListener("click",()=>at(s)),window.lucide&&lucide.createIcons()}function et(t,{inspections:a,properties:s}){t.innerHTML=`
        <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-semibold text-surface-700">Programación de Inspecciones</h4>
            <button id="add-insp-btn" class="btn-primary btn-sm px-3 py-1.5"><i data-lucide="calendar-plus" class="w-4 h-4"></i> Programar</button>
        </div>
        <div class="overflow-x-auto rounded-2xl border border-surface-200">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Inspector</th>
                        <th>Propiedad</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    ${a.length?a.map(i=>`
                        <tr>
                            <td class="font-medium">${i.inspection_type}</td>
                            <td>${E(i.scheduled_date)}</td>
                            <td><span class="badge ${i.status==="Realizada"?"badge-green":i.status==="Cancelada"?"badge-red":"badge-blue"}">${i.status}</span></td>
                            <td>${i.inspector_name||"-"}</td>
                            <td class="text-xs text-surface-500">${i.property_id.slice(0,8)}</td>
                            <td class="text-right">
                                <button class="text-surface-400 hover:text-primary-600"><i data-lucide="more-horizontal" class="w-5 h-5"></i></button>
                            </td>
                        </tr>
                    `).join(""):'<tr><td colspan="6" class="text-center py-10 text-surface-400">No hay inspecciones programadas.</td></tr>'}
                </tbody>
            </table>
        </div>
    `,document.getElementById("add-insp-btn").addEventListener("click",()=>ot(s)),window.lucide&&lucide.createIcons()}async function tt(t){const s=(await p.get("/contacts?contact_type=Proveedor&limit=100")).items||[];t.innerHTML=`
        <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-semibold text-surface-700">Directorio de Proveedores</h4>
            <button id="add-prov-btn" class="btn-primary btn-sm px-3 py-1.5"><i data-lucide="user-plus" class="w-4 h-4"></i> Nuevo Proveedor</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${s.length?s.map(i=>`
                <div class="glass-card-static p-4 flex gap-4 items-center">
                    <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                        ${i.name.charAt(0)}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h5 class="font-bold text-surface-900 truncate">${i.name}</h5>
                        <p class="text-xs text-surface-500 truncate">${i.email||"Sin correo"}</p>
                        <p class="text-xs font-medium text-primary-600 mt-1">${i.phone||"Sin teléfono"}</p>
                    </div>
                </div>
            `).join(""):'<p class="text-surface-400 text-center py-20 col-span-full">No se encontraron proveedores.</p>'}
        </div>
    `,window.lucide&&lucide.createIcons()}function at(t){const a=t.map(s=>`<option value="${s.id}">${s.name}</option>`).join("");y("Nuevo Activo",`
        <form id="af" class="space-y-4">
            <div>
                <label class="label">Propiedad *</label>
                <select class="select" name="property_id" required>${a}</select>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div><label class="label">Nombre *</label><input class="input" name="name" placeholder="Aire Acondicionado" required /></div>
                <div><label class="label">Categoría *</label><input class="input" name="category" placeholder="Climatización" required /></div>
            </div>
            <div class="grid grid-cols-3 gap-4">
                <div><label class="label">Marca</label><input class="input" name="brand" /></div>
                <div><label class="label">Modelo</label><input class="input" name="model" /></div>
                <div><label class="label">Serial</label><input class="input" name="serial_number" /></div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div><label class="label">Fecha Compra</label><input class="input" name="purchase_date" type="date" /></div>
                <div><label class="label">Fin Garantía</label><input class="input" name="warranty_expiry" type="date" /></div>
            </div>
        </form>
    `,{confirmText:"Guardar",onConfirm:async()=>{const s=new FormData(document.getElementById("af")),i=Object.fromEntries(s);await p.post("/assets",i),m("Activo registrado","success"),await te(document.getElementById("page-content"))}})}async function ae(t,{properties:a}){const i=(await p.get("/maintenance?limit=50")).items||[];t.innerHTML=`
    <div class="flex items-center justify-between mb-6 animate-fade-in px-4">
      <div class="flex items-center gap-3">
        <h4 class="text-lg font-semibold text-surface-700">Órdenes de Trabajo</h4>
      </div>
      <button id="add-maint-btn" class="btn-primary btn-sm"><i data-lucide="plus" class="w-4 h-4"></i> Nueva Orden</button>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-in px-4">
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-amber-500">${i.filter(e=>e.status==="Pendiente").length}</p>
        <p class="text-xs text-surface-500 mt-1">Pendientes</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-primary-500">${i.filter(e=>e.status==="En Progreso").length}</p>
        <p class="text-xs text-surface-500 mt-1">En Progreso</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-emerald-500">${i.filter(e=>e.status==="Completado").length}</p>
        <p class="text-xs text-surface-500 mt-1">Completados</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-rose-500">${x(i.reduce((e,o)=>e+(o.actual_cost||0),0))}</p>
        <p class="text-xs text-surface-500 mt-1">Costo Total</p>
      </div>
    </div>
    <div class="glass-card-static overflow-hidden animate-fade-in mx-4">
      <table class="data-table">
        <thead><tr><th></th><th>Título</th><th>Tipo</th><th>Prioridad</th><th>Estado</th><th>Proveedor</th><th>Costo</th><th></th></tr></thead>
        <tbody>
        ${i.length?i.map(e=>{var o;return`<tr>
          <td class="w-12">
            ${e.photos&&e.photos.length>0?`<div class="relative group cursor-pointer" onclick="viewPhotos('${e.id}')">
                <img src="${p.baseUrl.replace("/api/v1","")}/${e.photos[0].photo_path}" class="w-10 h-10 rounded object-cover border border-surface-200" />
                <span class="absolute -top-1 -right-1 bg-primary-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">${e.photos.length}</span>
              </div>`:'<div class="w-10 h-10 rounded bg-surface-100 flex items-center justify-center text-surface-400"><i data-lucide="image" class="w-5 h-5"></i></div>'}
          </td>
          <td><div class="font-semibold text-sm">${e.title}</div><div class="text-[10px] text-surface-400">${E(e.scheduled_date)}</div></td>
          <td><span class="badge badge-gray text-[10px]">${e.maintenance_type}</span></td>
          <td><span class="badge ${e.priority==="Urgente"?"badge-red":e.priority==="Alta"?"badge-amber":"badge-gray"} text-[10px]">${e.priority}</span></td>
          <td><span class="badge ${st(e.status)} text-[10px]">${e.status}</span></td>
          <td class="text-xs">${((o=e.supplier)==null?void 0:o.name)||e.supplier_name||'<span class="text-surface-400">—</span>'}</td>
          <td class="text-sm font-medium">${x(e.actual_cost||e.estimated_cost)}</td>
          <td class="text-right">
             <button class="btn-ghost p-1 edit-maint-btn" data-id="${e.id}"><i data-lucide="edit-3" class="w-4 h-4 text-surface-400"></i></button>
          </td>
        </tr>`}).join(""):'<tr><td colspan="8" class="text-center py-10 text-surface-400">No hay mantenimientos.</td></tr>'}
        </tbody>
      </table>
    </div>
    `,window.lucide&&lucide.createIcons(),document.getElementById("add-maint-btn").addEventListener("click",()=>it(a,t)),document.querySelectorAll(".edit-maint-btn").forEach(e=>e.addEventListener("click",()=>nt(e.dataset.id,a,t)))}function st(t){return{Pendiente:"badge-amber","En Progreso":"badge-primary",Completado:"badge-green",Cancelado:"badge-red"}[t]||"badge-gray"}async function it(t,a){const i=(await p.get("/contacts?contact_type=Proveedor&limit=100")).items||[],e=i.length?i.map(l=>`<option value="${l.id}|${l.name}">${l.name}</option>`).join(""):'<option value="">No hay proveedores</option>',o=t.map(l=>`<option value="${l.id}">${l.name}</option>`).join("");y("Nueva Orden de Mantenimiento",`
        <form id="mf" class="space-y-4">
            <div><label class="label">Propiedad *</label><select class="select" name="property_id" required>${o}</select></div>
            <div><label class="label">Título *</label><input class="input" name="title" required /></div>
            <div class="grid grid-cols-2 gap-4">
                <div><label class="label">Tipo</label><select class="select" name="maintenance_type"><option value="Correctivo">Correctivo</option><option value="Preventivo">Preventivo</option><option value="Mejora">Mejora</option></select></div>
                <div><label class="label">Prioridad</label><select class="select" name="priority"><option value="Media">Media</option><option value="Alta">Alta</option><option value="Urgente">Urgente</option><option value="Baja">Baja</option></select></div>
            </div>
            <div>
                <label class="label">Proveedor Registrado</label>
                <select class="select" id="maint-supplier-select">
                    <option value="">Seleccione proveedor...</option>
                    ${e}
                </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div><label class="label">Costo Estimado</label><input class="input currency-input" type="text" name="estimated_cost" /></div>
                <div><label class="label">Fecha</label><input class="input" type="date" name="scheduled_date" /></div>
            </div>
            <div><label class="label">Notas</label><textarea class="input" name="notes" rows="2"></textarea></div>
        </form>
    `,{confirmText:"Crear",onConfirm:async()=>{const l=new FormData(document.getElementById("mf")),d={};l.forEach((r,u)=>{u==="estimated_cost"?d[u]=r?I(r):void 0:r&&(d[u]=r)});const n=document.getElementById("maint-supplier-select").value;if(n){const[r,u]=n.split("|");d.supplier_id=r,d.supplier_name=u}await p.post("/maintenance",d),m("Orden creada","success"),a&&await ae(a,{properties:t})}})}async function nt(t,a,s){const[i,e]=await Promise.all([p.get(`/maintenance/${t}`),p.get("/contacts?contact_type=Proveedor&limit=100")]),o=e.items||[],l=o.length?o.map(d=>`<option value="${d.id}|${d.name}" ${i.supplier_id===d.id?"selected":""}>${d.name}</option>`).join(""):'<option value="">No hay proveedores</option>';y("Editar Mantenimiento",`
        <form id="e-mf" class="space-y-4">
            <div><label class="label">Título</label><input class="input" name="title" value="${i.title}" /></div>
            <div class="grid grid-cols-2 gap-4">
                <div><label class="label">Estado</label><select class="select" name="status">
                    <option value="Pendiente" ${i.status==="Pendiente"?"selected":""}>Pendiente</option>
                    <option value="En Progreso" ${i.status==="En Progreso"?"selected":""}>En Progreso</option>
                    <option value="Esperando Factura" ${i.status==="Esperando Factura"?"selected":""}>Esperando Factura</option>
                    <option value="Completado" ${i.status==="Completado"?"selected":""}>Completado</option>
                    <option value="Cancelado" ${i.status==="Cancelado"?"selected":""}>Cancelado</option>
                </select></div>
                <div><label class="label">Prioridad</label><select class="select" name="priority">
                    <option value="Baja" ${i.priority==="Baja"?"selected":""}>Baja</option>
                    <option value="Media" ${i.priority==="Media"?"selected":""}>Media</option>
                    <option value="Alta" ${i.priority==="Alta"?"selected":""}>Alta</option>
                    <option value="Urgente" ${i.priority==="Urgente"?"selected":""}>Urgente</option>
                </select></div>
            </div>
            <div>
                <label class="label">Proveedor</label>
                <select class="select" id="e-maint-supplier-select">
                    <option value="">N/A</option>
                    ${l}
                </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div><label class="label">Costo Estimado</label><input class="input currency-input" type="text" name="estimated_cost" value="${i.estimated_cost||""}" /></div>
                <div><label class="label">Costo Real</label><input class="input currency-input" type="text" name="actual_cost" value="${i.actual_cost||""}" /></div>
            </div>
            <div><label class="label">Fecha Programada</label><input class="input" type="date" name="scheduled_date" value="${i.scheduled_date||""}" /></div>
            <div><label class="label">Notas</label><textarea class="input" name="notes" rows="3">${i.notes||""}</textarea></div>
        </form>
    `,{confirmText:"Guardar",onConfirm:async()=>{const d=new FormData(document.getElementById("e-mf")),n={};d.forEach((u,c)=>{c==="estimated_cost"||c==="actual_cost"?n[c]=u?I(u):null:u&&(n[c]=u)});const r=document.getElementById("e-maint-supplier-select").value;if(r){const[u,c]=r.split("|");n.supplier_id=u,n.supplier_name=c}else n.supplier_id=null,n.supplier_name=null;await p.put(`/maintenance/${t}`,n),m("Actualizado","success"),s&&await ae(s,{properties:a})}})}window.viewPhotos=async t=>{const a=await p.get(`/maintenance/${t}`);if(!a.photos||a.photos.length===0)return;const s=p.baseUrl.replace("/api/v1","");y("Evidencia Fotográfica",`
      <div class="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
        ${a.photos.map(i=>`
          <div class="space-y-2">
            <img src="${s}/${i.photo_path}" class="w-full rounded-lg border border-surface-200 cursor-zoom-in" onclick="window.open('${s}/${i.photo_path}', '_blank')" />
            <p class="text-[10px] text-surface-400 text-center">${E(i.uploaded_at)}</p>
          </div>
        `).join("")}
      </div>
    `,{confirmText:"Cerrar"})};function ot(t){const a=t.map(s=>`<option value="${s.id}">${s.name}</option>`).join("");y("Programar Inspección",`
        <form id="if" class="space-y-4">
            <div><label class="label">Propiedad *</label><select class="select" name="property_id" required>${a}</select></div>
            <div class="grid grid-cols-2 gap-4">
                <div><label class="label">Tipo *</label><select class="select" name="inspection_type" required>
                    <option value="Preventiva">Preventiva</option><option value="Entrega">Entrega</option><option value="Recibo">Recibo</option><option value="Rutinaria">Rutinaria</option>
                </select></div>
                <div><label class="label">Fecha Programada *</label><input class="input" name="scheduled_date" type="date" required /></div>
            </div>
            <div><label class="label">Inspector</label><input class="input" name="inspector_name" /></div>
        </form>
    `,{confirmText:"Programar",onConfirm:async()=>{const s=new FormData(document.getElementById("if")),i=Object.fromEntries(s);await p.post("/inspections",i),m("Inspección programada","success"),await te(document.getElementById("page-content"))}})}let J=null,Q=null;async function rt(t){const s=new URLSearchParams(window.location.hash.split("?")[1]).get("id");if(!s){t.innerHTML='<div class="p-8 text-center text-rose-500">Error: No se proporcionó ID de cuenta.</div>';return}t.innerHTML=`
        <div class="flex items-center justify-center py-20">
            <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
        </div>
    `;try{await xe(t,s)}catch(i){t.innerHTML=`<div class="p-8 text-center text-rose-500">Error al cargar datos de la cuenta: ${i.message}</div>`}}async function xe(t,a,s={}){const i=new URLSearchParams;s.date_from&&i.set("date_from",s.date_from),s.date_to&&i.set("date_to",s.date_to),s.tx_type&&i.set("tx_type",s.tx_type),i.set("months",12);const e=await p.get(`/accounts/${a}/history?${i.toString()}`);if(!e)return;const{account:o,monthly_cashflow:l,recent_transactions:d,balance_history:n}=e;t.innerHTML=`
        <div class="flex flex-col gap-6 animate-fade-in">
            <!-- Header & Balance -->
            <div class="flex flex-col md:flex-row gap-6 items-center glass-card-static p-6 border-white/40 shadow-sm relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -translate-y-16 translate-x-16"></div>
                <div class="text-center md:text-left flex-1 z-10">
                    <div class="flex items-center gap-3 mb-2">
                        <a href="#/financials" class="p-2 rounded-xl bg-white/50 hover:bg-white text-surface-400 hover:text-primary-600 transition shadow-sm border border-white/20">
                            <i data-lucide="arrow-left" class="w-4 h-4"></i>
                        </a>
                        <h2 class="text-2xl font-black text-surface-900">${o.account_name}</h2>
                    </div>
                    <p class="text-surface-500 text-sm ml-11">${o.bank_name||"Sin Banco"} • ${o.account_type} • ${o.currency}</p>
                </div>
                <div class="bg-white/80 backdrop-blur-md px-8 py-4 rounded-2xl shadow-xl shadow-primary-500/5 border border-white text-center z-10 group transition-transform hover:scale-105">
                    <p class="text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-1">Saldo Disponible</p>
                    <p class="text-3xl font-black ${o.current_balance>=0?"text-accent-600":"text-rose-600"}">
                        ${x(o.current_balance)}
                    </p>
                </div>
            </div>

            <!-- Filters Row -->
            <div class="flex flex-wrap items-end gap-4 p-5 glass-card-static border-white/40 shadow-sm">
                <div class="flex-1 min-w-[150px]">
                    <label class="block text-[10px] font-bold text-surface-400 uppercase mb-2 tracking-wider ml-1">Desde</label>
                    <div class="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-xl border border-white/20 shadow-sm">
                        <i data-lucide="calendar" class="w-4 h-4 text-surface-400"></i>
                        <input type="date" id="filter-date-from" class="bg-transparent text-sm font-medium focus:outline-none w-full" value="${s.date_from||""}">
                    </div>
                </div>
                <div class="flex-1 min-w-[150px]">
                    <label class="block text-[10px] font-bold text-surface-400 uppercase mb-2 tracking-wider ml-1">Hasta</label>
                    <div class="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-xl border border-white/20 shadow-sm">
                        <i data-lucide="calendar" class="w-4 h-4 text-surface-400"></i>
                        <input type="date" id="filter-date-to" class="bg-transparent text-sm font-medium focus:outline-none w-full" value="${s.date_to||""}">
                    </div>
                </div>
                <div class="flex-1 min-w-[150px]">
                    <label class="block text-[10px] font-bold text-surface-400 uppercase mb-2 tracking-wider ml-1">Tipo de Transacción</label>
                    <div class="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-xl border border-white/20 shadow-sm">
                        <i data-lucide="list-filter" class="w-4 h-4 text-surface-400"></i>
                        <select id="filter-tx-type" class="bg-transparent text-sm font-medium focus:outline-none w-full appearance-none">
                            <option value="">Cualquier tipo</option>
                            <option value="Ingreso" ${s.tx_type==="Ingreso"?"selected":""}>Ingreso</option>
                            <option value="Gasto" ${s.tx_type==="Gasto"?"selected":""}>Gasto</option>
                            <option value="Transferencia" ${s.tx_type==="Transferencia"?"selected":""}>Transferencia</option>
                        </select>
                    </div>
                </div>
                <button id="btn-apply-filters" class="btn-primary !rounded-xl shadow-lg shadow-primary-500/10 py-2.5 px-6 flex items-center gap-2 hover:-translate-y-0.5 transition-transform">
                    <i data-lucide="filter" class="w-4 h-4"></i> Aplicar Filtros
                </button>
            </div>

            <!-- Charts Row -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="glass-card-static p-6 border-white/40 shadow-sm">
                    <h4 class="text-sm font-black text-surface-800 mb-6 flex items-center gap-2">
                        <span class="w-2.5 h-6 bg-primary-500 rounded-full"></span> 
                        Flujo de Caja Mensual (12M)
                    </h4>
                    <div class="h-[280px]"><canvas id="account-history-chart"></canvas></div>
                </div>
                <div class="glass-card-static p-6 border-white/40 shadow-sm">
                    <h4 class="text-sm font-black text-surface-800 mb-6 flex items-center gap-2">
                        <span class="w-2.5 h-6 bg-accent-500 rounded-full"></span> 
                        Evolución Histórica del Saldo
                    </h4>
                    <div class="h-[280px]"><canvas id="account-balance-chart"></canvas></div>
                </div>
            </div>

            <!-- Transactions List -->
            <div class="glass-card-static border-white/40 shadow-sm overflow-hidden mb-10">
                <div class="p-5 border-b border-white/20 bg-white/30 backdrop-blur-sm flex items-center justify-between">
                    <h4 class="text-sm font-black text-surface-800 flex items-center gap-2">
                        <i data-lucide="table-properties" class="w-5 h-5 text-primary-500"></i> 
                        Registro de Movimientos
                    </h4>
                    <span class="badge badge-blue !rounded-full text-[10px] py-1 px-3">
                        ${d.length} registros en periodo
                    </span>
                </div>
                <div class="overflow-x-auto">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th class="!bg-transparent">Fecha</th>
                                <th class="!bg-transparent">Descripción</th>
                                <th class="!bg-transparent">Categoría</th>
                                <th class="!bg-transparent text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${d.length>0?d.map(r=>`
                                <tr class="hover:bg-white/50 transition-colors group">
                                    <td class="text-xs text-surface-400 font-medium italic">${E(r.transaction_date)}</td>
                                    <td>
                                        <div class="font-bold text-surface-900 text-sm group-hover:text-primary-600 transition-colors">${r.description}</div>
                                        <div class="text-[10px] text-surface-400 flex items-center gap-1 mt-0.5">
                                            <i data-lucide="map-pin" class="w-2.5 h-2.5"></i>
                                            ${r.property_name||"Gasto General Corporativo"}
                                        </div>
                                    </td>
                                    <td>
                                        <span class="badge badge-gray !rounded-lg text-[10px] font-semibold">${r.category}</span>
                                    </td>
                                    <td class="text-right font-black text-sm ${r.direction==="Debit"?"text-accent-600":"text-rose-600"}">
                                        <div class="flex items-center justify-end gap-1">
                                            <span>${r.direction==="Debit"?"+":"-"}</span>
                                            <span>${x(r.amount)}</span>
                                        </div>
                                    </td>
                                </tr>
                            `).join(""):`
                                <tr>
                                    <td colspan="4" class="text-center py-20">
                                        <div class="flex flex-col items-center gap-3">
                                            <i data-lucide="ghost" class="w-10 h-10 text-surface-200"></i>
                                            <p class="text-surface-400 font-medium">No se encontraron movimientos con los filtros actuales</p>
                                        </div>
                                    </td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `,window.lucide&&lucide.createIcons(),document.getElementById("btn-apply-filters").addEventListener("click",()=>{const r={date_from:document.getElementById("filter-date-from").value,date_to:document.getElementById("filter-date-to").value,tx_type:document.getElementById("filter-tx-type").value};xe(t,a,r)}),lt(l,n)}function lt(t,a){J&&J.destroy(),Q&&Q.destroy();const s=document.getElementById("account-history-chart");s&&t.length>0&&(J=new Chart(s,{type:"bar",data:{labels:t.map(e=>e.month),datasets:[{label:"Ingresos",data:t.map(e=>e.income),backgroundColor:"#00d084",borderRadius:8,barThickness:15},{label:"Gastos",data:t.map(e=>e.expenses),backgroundColor:"#ff4d4f",borderRadius:8,barThickness:15}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"bottom",labels:{boxWidth:10,usePointStyle:!0,font:{size:11,weight:"600"}}}},scales:{y:{grid:{color:"rgba(0,0,0,0.03)"},ticks:{font:{size:10},callback:e=>"$"+e.toLocaleString()}},x:{grid:{display:!1},ticks:{font:{size:10}}}}}}));const i=document.getElementById("account-balance-chart");i&&a&&a.length>0&&(Q=new Chart(i,{type:"line",data:{labels:a.map(e=>E(e.date)),datasets:[{label:"Saldo",data:a.map(e=>e.balance),borderColor:"#4d7cfe",backgroundColor:"rgba(77, 124, 254, 0.1)",fill:!0,tension:.4,pointRadius:2,pointHoverRadius:6,borderWidth:4,pointBackgroundColor:"#fff",pointBorderWidth:2}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{mode:"index",intersect:!1}},scales:{y:{grid:{color:"rgba(0,0,0,0.03)"},ticks:{font:{size:10},callback:e=>"$"+e.toLocaleString()}},x:{grid:{display:!1},ticks:{font:{size:8},maxRotation:0,autoSkip:!0,maxTicksLimit:12}}}}}))}async function O(t,a){const[s,i,e]=await Promise.all([p.get("/work-groups"),p.get("/properties?limit=100"),p.get("/users?limit=100").catch(()=>({items:[]}))]),o=i.items||[],d=(e.items||[]).filter(n=>n.id);t.innerHTML=`
        <div class="flex justify-between items-center mb-6 animate-fade-in">
            <div>
                <h3 class="text-xl font-bold text-surface-900">Grupos de Trabajo</h3>
                <p class="text-sm text-surface-500">Gestione equipos para mantenimiento e inspecciones</p>
            </div>
            <button id="add-wg-btn" class="btn-primary">
                <i data-lucide="folder-plus" class="w-4 h-4 mr-2"></i> Nuevo Grupo
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            ${s.length?s.map(n=>`
                <div class="glass-card-static p-5 flex flex-col space-y-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-bold text-surface-900 text-lg">${n.name}</h4>
                            <p class="text-xs text-surface-500">${n.description||"Sin descripción"}</p>
                        </div>
                        <span class="badge badge-blue">ID: ${n.id.slice(0,4)}</span>
                    </div>

                    <div class="space-y-2 flex-grow">
                        <div class="flex justify-between text-sm">
                            <span class="text-surface-600 font-medium">Miembros</span>
                            <span class="font-bold text-surface-900">${n.members_count||0}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-surface-600 font-medium">Propiedades Asignadas</span>
                            <span class="font-bold text-surface-900">${n.properties_count||0}</span>
                        </div>
                    </div>

                    <div class="pt-4 border-t border-surface-100 flex flex-col gap-2">
                        <button class="btn-ghost btn-sm w-full font-medium" onclick="window.viewGroupDetails('${n.id}')">
                            <i data-lucide="eye" class="w-4 h-4 mr-1"></i> Ver Detalles
                        </button>
                        <div class="flex gap-2">
                            <button class="btn-secondary btn-sm flex-1" onclick="window.addMemberModal('${n.id}')">
                                <i data-lucide="user-plus" class="w-4 h-4 mr-1"></i> Miembro
                            </button>
                            <button class="btn-secondary btn-sm flex-1" onclick="window.addPropertyModal('${n.id}')">
                                <i data-lucide="home" class="w-4 h-4 mr-1"></i> Propiedad
                            </button>
                        </div>
                    </div>
                </div>
            `).join(""):'<div class="col-span-full py-12 text-center text-surface-500">No hay grupos de trabajo creados.</div>'}
        </div>
    `,document.getElementById("add-wg-btn").addEventListener("click",()=>{y("Nuevo Grupo de Trabajo",`
            <form id="wg-form" class="space-y-4">
                <div>
                    <label class="label">Nombre del Grupo *</label>
                    <input class="input" type="text" name="name" required placeholder="Ej. Equipo Mantenimiento Norte" />
                </div>
                <div>
                    <label class="label">Descripción</label>
                    <textarea class="input" name="description" rows="3" placeholder="Descripción breve del propósito"></textarea>
                </div>
            </form>
        `,{confirmText:"Crear",onConfirm:async()=>{const n=new FormData(document.getElementById("wg-form")),r=Object.fromEntries(n);await p.post("/work-groups",r),m("Grupo creado","success"),O(t,a)}})}),window.addMemberModal=async n=>{const r=d.length?d.map(u=>`<option value="${u.id}">${u.full_name||u.email} (${u.role})</option>`).join(""):'<option value="" disabled>No se encontraron usuarios</option>';y("Añadir Miembro",`
            <form id="wm-form" class="space-y-4">
                <div>
                    <label class="label">Usuario *</label>
                    <select class="select" name="user_id" required>
                        <option value="">Seleccione un usuario...</option>
                        ${r}
                    </select>
                </div>
                <div>
                    <label class="label">Rol en el grupo *</label>
                    <select class="select" name="role">
                        <option value="Admin">Admin</option>
                        <option value="Analista">Analista</option>
                    </select>
                </div>
            </form>
        `,{confirmText:"Añadir",onConfirm:async()=>{const u=new FormData(document.getElementById("wm-form")),c=Object.fromEntries(u);if(!c.user_id)throw m("Seleccione un usuario","error"),new Error("Seleccione un usuario");await p.post(`/work-groups/${n}/members`,c),m("Miembro añadido","success"),O(t,a)}})},window.addPropertyModal=async n=>{const r=o.length?o.map(u=>`<option value="${u.id}">${u.name} (${u.property_type})</option>`).join(""):'<option value="" disabled>No se encontraron propiedades</option>';y("Asignar Propiedad",`
            <form id="wp-form" class="space-y-4">
                <div>
                    <label class="label">Propiedad *</label>
                    <select class="select" name="property_id" required>
                        <option value="">Seleccione una propiedad...</option>
                        ${r}
                    </select>
                </div>
            </form>
        `,{confirmText:"Asignar",onConfirm:async()=>{const u=new FormData(document.getElementById("wp-form")),c=Object.fromEntries(u);if(!c.property_id)throw m("Seleccione una propiedad","error"),new Error("Seleccione una propiedad");await p.post(`/work-groups/${n}/properties`,c),m("Propiedad asignada","success"),O(t,a)}})},window.viewGroupDetails=async n=>{try{const[r,u,c]=await Promise.all([p.get(`/work-groups/${n}`),p.get(`/work-groups/${n}/members`),p.get(`/work-groups/${n}/properties`)]),g=u.length?u.map(f=>{var h,$,w;return`
                <div class="flex justify-between items-center p-2 border-b border-surface-100 last:border-0 hover:bg-surface-50">
                    <div>
                        <p class="font-medium text-sm text-surface-900">${((h=f.user)==null?void 0:h.full_name)||"Desconocido"}</p>
                        <p class="text-[10px] text-surface-500">${(($=f.user)==null?void 0:$.email)||"N/A"}</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="badge ${f.role==="Admin"||f.role==="Super Admin"?"badge-primary":"badge-gray"} text-xs">${f.role}</span>
                        ${f.user_id!==((w=a.user)==null?void 0:w.id)&&f.role!=="Super Admin"?`<button class="text-rose-500 hover:text-rose-700" onclick="window.removeMember('${n}', '${f.user_id}')" title="Eliminar miembro"><i data-lucide="user-minus" class="w-4 h-4"></i></button>`:""}
                    </div>
                </div>
            `}).join(""):'<p class="text-surface-500 text-sm py-2">No hay miembros adicionales.</p>',v=c.length?c.map(f=>`
                <div class="flex justify-between items-center p-2 border-b border-surface-100 last:border-0 hover:bg-surface-50">
                    <div>
                        <p class="font-medium text-sm text-surface-900">${f.name}</p>
                        <p class="text-[10px] text-surface-500">${f.property_type} • ${f.address||""}</p>
                    </div>
                    <button class="text-rose-500 hover:text-rose-700" onclick="window.removeProperty('${n}', '${f.id}')" title="Quitar propiedad"><i data-lucide="unlink" class="w-4 h-4"></i></button>
                </div>
            `).join(""):'<p class="text-surface-500 text-sm py-2">No hay propiedades asignadas.</p>';y(`Detalles: ${r.name}`,`
                <div class="space-y-6">
                    <div>
                        <h4 class="text-sm font-bold text-surface-700 border-b border-surface-200 pb-1 mb-2">Miembros del Equipo</h4>
                        <div class="max-h-48 overflow-y-auto">
                            ${g}
                        </div>
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-surface-700 border-b border-surface-200 pb-1 mb-2">Propiedades Asignadas</h4>
                        <div class="max-h-48 overflow-y-auto">
                            ${v}
                        </div>
                    </div>
                </div>
            `,{cancelText:"Cerrar",confirmText:"Aceptar",onConfirm:()=>Y()}),window.lucide&&lucide.createIcons()}catch(r){console.error(r),m("Error al cargar los detalles","error")}},window.removeMember=async(n,r)=>{if(confirm("¿Está seguro de eliminar este miembro del grupo?"))try{await p.delete(`/work-groups/${n}/members/${r}`),m("Miembro eliminado","success"),Y(),O(t,a),setTimeout(()=>window.viewGroupDetails(n),300)}catch(u){m(u.message||"Error al eliminar","error")}},window.removeProperty=async(n,r)=>{if(confirm("¿Está seguro de deasignar esta propiedad del grupo?"))try{await p.delete(`/work-groups/${n}/properties/${r}`),m("Propiedad deasignada","success"),Y(),O(t,a),setTimeout(()=>window.viewGroupDetails(n),300)}catch(u){m(u.message||"Error al deasignar","error")}},window.lucide&&lucide.createIcons()}async function dt(t,a){const s=await p.get("/audits?limit=50");t.innerHTML=`
        <div class="flex justify-between items-center mb-6 animate-fade-in">
            <div>
                <h3 class="text-xl font-bold text-surface-900">Registro de Auditoría</h3>
                <p class="text-sm text-surface-500">Historial de acciones y eventos del sistema</p>
            </div>
        </div>

        <div class="glass-card-static overflow-hidden animate-fade-in">
            <div class="overflow-x-auto">
                <table class="data-table w-full">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Usuario (ID)</th>
                            <th>Acción</th>
                            <th>Entidad</th>
                            <th>ID Entidad</th>
                            <th>Detalles</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${s.length?s.map(i=>`
                            <tr class="hover:bg-surface-50">
                                <td class="whitespace-nowrap">${E(i.timestamp)}</td>
                                <td class="text-xs text-surface-600 font-mono">${i.user_id?i.user_id.slice(0,8):"Sistema"}</td>
                                <td>
                                    <span class="px-2 py-1 bg-surface-100 text-surface-700 rounded text-xs font-semibold">
                                        ${i.action}
                                    </span>
                                </td>
                                <td class="font-medium text-surface-800">${i.entity_type}</td>
                                <td class="text-xs text-surface-500 font-mono">${i.entity_id||"-"}</td>
                                <td class="text-xs text-surface-500 max-w-xs truncate" title="${i.details||""}">
                                    ${i.details||"-"}
                                </td>
                            </tr>
                        `).join(""):'<tr><td colspan="6" class="text-center py-10 text-surface-500">No hay registros de auditoría.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `,window.lucide&&lucide.createIcons()}async function ct(t){window.FullCalendar||await ut(),t.innerHTML=`
        <div class="animate-fade-in space-y-4">
            <div class="flex items-center justify-between mb-2">
                <div>
                    <h3 class="text-xl font-bold text-surface-900">Calendario</h3>
                    <p class="text-sm text-surface-500">Pagos, vencimientos y mantenimientos programados</p>
                </div>
                <div class="flex items-center gap-3">
                    <span class="flex items-center gap-1.5 text-xs text-surface-500"><span class="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>Urgente</span>
                    <span class="flex items-center gap-1.5 text-xs text-surface-500"><span class="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>Próximo</span>
                    <span class="flex items-center gap-1.5 text-xs text-surface-500"><span class="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block"></span>Programado</span>
                </div>
            </div>
            <div class="glass-card-static p-6 animate-fade-in">
                <div id="pms-calendar" style="min-height: 600px;"></div>
            </div>
        </div>
    `;try{const s=((await p.get("/reports/upcoming-events?days=90")).events||[]).map(e=>({title:e.title,date:e.date,extendedProps:{detail:e.detail,type:e.type,severity:e.severity},backgroundColor:e.severity==="high"?"#f43f5e":e.severity==="medium"?"#f59e0b":"#60a5fa",borderColor:e.severity==="high"?"#e11d48":e.severity==="medium"?"#d97706":"#3b82f6",textColor:"#ffffff"}));new FullCalendar.Calendar(document.getElementById("pms-calendar"),{initialView:"dayGridMonth",locale:"es",height:620,headerToolbar:{left:"prev,next today",center:"title",right:"dayGridMonth,timeGridWeek,listMonth"},buttonText:{today:"Hoy",month:"Mes",week:"Semana",list:"Lista"},events:s,eventClick(e){const{title:o,extendedProps:l}=e.event;m(`${o} — ${l.detail}`,"info")},eventDidMount(e){e.el.title=`${e.event.title}
${e.event.extendedProps.detail}`}}).render()}catch(a){console.error("Calendar error:",a),m("Error cargando eventos del calendario","error")}}function ut(){return new Promise((t,a)=>{if(window.FullCalendar)return t();const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js",s.onload=t,s.onerror=a,document.head.appendChild(s)})}async function pt(t,a){var s,i,e;if(((s=a.user)==null?void 0:s.role)!=="Admin"){t.innerHTML='<div class="p-8 text-center text-surface-500">Acceso denegado. Se requieren permisos de Administrador.</div>';return}t.innerHTML=`
    <div class="max-w-xl mx-auto animate-fade-in cursor-default">
        <!-- Telegram Config -->
        <div class="glass-card-static p-6 border-t-4 border-t-sky-500">
            <div class="flex items-center justify-between gap-3 mb-6">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
                        <i data-lucide="bot" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-surface-900">Telegram Bot</h3>
                        <p class="text-sm text-surface-500">Configuración para notificaciones y alertas</p>
                    </div>
                </div>
                <div id="webhook-status-badge" class="badge badge-gray flex items-center gap-1">
                    <i data-lucide="loader" class="w-3 h-3 animate-spin"></i> Verificando...
                </div>
            </div>

            <form id="telegram-config-form" class="space-y-4">
                <div>
                    <div class="flex justify-between items-center mb-1">
                        <label class="label text-sm mb-0" for="telegram_token">Telegram Bot Token</label>
                        <button type="button" id="btn-edit-token" class="text-xs text-primary-600 hover:text-primary-700 font-medium hidden">
                            <i data-lucide="edit-2" class="w-3 h-3 inline"></i> Editar
                        </button>
                    </div>
                    <input type="password" id="telegram_token" name="TELEGRAM_BOT_TOKEN" class="input font-mono text-sm" placeholder="123456789:ABC...XYZ">
                    <p class="text-xs text-surface-400 mt-1">Paso 1: Pega y guarda el token.</p>
                </div>
                <div>
                    <label class="label text-sm" for="telegram_chat_id">Chat ID (Administrador/Grupo)</label>
                    <input type="text" id="telegram_chat_id" name="TELEGRAM_CHAT_ID" class="input font-mono text-sm" placeholder="-100123456789">
                    <p class="text-xs text-surface-400 mt-1">Requerido para que el Bot sepa dónde enviar las alertas.</p>
                </div>
                <div class="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-surface-100">
                    <button type="button" class="btn-outline flex-1 mt-0" id="btn-activate-webhook">
                        <i data-lucide="link" class="w-4 h-4 mr-2"></i> Paso 2: Activar Webhook
                    </button>
                    <button type="submit" class="btn-primary flex-1 mt-0" id="btn-save-telegram">
                        <i data-lucide="save" class="w-4 h-4 mr-2"></i> Guardar Ajustes
                    </button>
                </div>
            </form>
        </div>

        <!-- Contratos Config -->
        <div class="glass-card-static p-6 border-t-4 border-t-emerald-500 mt-6">
            <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <i data-lucide="percent" class="w-6 h-6"></i>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-surface-900">Finanzas y Contratos</h3>
                    <p class="text-sm text-surface-500">Parámetros globales de indexación automatizada</p>
                </div>
            </div>
            
            <form id="contracts-config-form" class="space-y-4">
                <div>
                    <label class="label text-sm" for="global_inflation_rate">Tasa de Inflación Anual / IPC (%)</label>
                    <input type="number" step="0.0001" id="global_inflation_rate" name="global_inflation_rate" class="input font-mono text-sm" placeholder="Ej: 0.05 para 5%">
                    <p class="text-xs text-surface-400 mt-1">Este valor (ej: 0.05) será utilizado para la indexación y aumento automático del canon en los contratos que cumplen 1 año de vigencia.</p>
                </div>
                <div class="flex justify-end pt-4 border-t border-surface-100">
                    <button type="submit" class="btn-primary" id="btn-save-contracts">
                        <i data-lucide="save" class="w-4 h-4 mr-2"></i> Guardar Ajustes
                    </button>
                </div>
            </form>
        </div>
    </div>
    `,window.lucide&&lucide.createIcons();try{const o=await p.get("/config"),l=document.getElementById("telegram-config-form"),d=document.getElementById("contracts-config-form");o.forEach(c=>{l.elements[c.key]&&(l.elements[c.key].value=c.value),d.elements[c.key]&&(d.elements[c.key].value=c.value)});const n=document.getElementById("webhook-status-badge"),r=document.getElementById("telegram_token"),u=document.getElementById("btn-edit-token");try{const c=await p.get("/telegram/webhook-status");c.ok&&((i=c.result)!=null&&i.url)?(n.className="badge badge-green flex items-center gap-1",n.innerHTML='<i data-lucide="check-circle" class="w-3 h-3"></i> Conectado',r.disabled=!0,u.classList.remove("hidden")):(n.className="badge badge-gray flex items-center gap-1",n.innerHTML='<i data-lucide="x-circle" class="w-3 h-3"></i> Inactivo',r.disabled=!1)}catch{n.className="badge badge-red flex items-center gap-1",n.innerHTML='<i data-lucide="alert-circle" class="w-3 h-3"></i> Error Webhook'}window.lucide&&lucide.createIcons()}catch{m("Error al cargar la configuración","error")}(e=document.getElementById("btn-edit-token"))==null||e.addEventListener("click",()=>{confirm("Si editas el token, deberás volver a activar el webhook. ¿Deseas editarlo?")&&(document.getElementById("telegram_token").disabled=!1,document.getElementById("telegram_token").focus())}),document.getElementById("telegram-config-form").addEventListener("submit",async o=>{o.preventDefault();const l=document.getElementById("btn-save-telegram");l.disabled=!0;const d=o.target.elements.TELEGRAM_BOT_TOKEN.value.trim(),n=o.target.elements.TELEGRAM_CHAT_ID.value.trim();try{await p.post("/config/batch",{TELEGRAM_BOT_TOKEN:d,TELEGRAM_CHAT_ID:n}),m("Ajustes guardados exitosamente","success"),d&&(document.getElementById("telegram_token").disabled=!0,document.getElementById("btn-edit-token").classList.remove("hidden"))}catch(r){m("Error al guardar: "+r.message,"error")}finally{l.disabled=!1}}),document.getElementById("btn-activate-webhook").addEventListener("click",async o=>{const l=o.target.closest("button");l.disabled=!0;try{await p.post("/telegram/register-webhook",{domain:"https://real-state-xd5o.onrender.com"}),m("Webhook activado correctamente","success"),setTimeout(()=>window.location.reload(),1500)}catch(d){m("Error en Webhook: "+d.message,"error")}finally{l.disabled=!1}}),document.getElementById("contracts-config-form").addEventListener("submit",async o=>{o.preventDefault();const l=document.getElementById("btn-save-contracts");l.disabled=!0;const d=o.target.elements.global_inflation_rate.value.trim();try{await p.post("/config/batch",{global_inflation_rate:d}),m("Ajustes de contratos guardados exitosamente","success")}catch(n){m("Error al guardar: "+n.message,"error")}finally{l.disabled=!1}})}async function mt(t,a){try{const i=(await p.get("/contacts?contact_type=Proveedor&limit=100")).items||[];t.innerHTML=`
        <div class="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h2 class="text-2xl font-bold text-surface-900">Directorio de Proveedores</h2>
            <p class="text-surface-500">Gestión de tiempos, cotizaciones y facturas</p>
          </div>
          <button id="add-supplier-btn" class="btn-primary">
            <i data-lucide="plus" class="w-4 h-4 mr-2"></i> Nuevo Proveedor
          </button>
        </div>
        
        <div class="glass-card overflow-hidden animate-fade-in">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-50/50 border-b border-surface-200 text-sm font-semibold text-surface-600">
                <th class="p-4">Proveedor</th>
                <th class="p-4">Especialidad</th>
                <th class="p-4">Contacto</th>
                <th class="p-4">Estado</th>
                <th class="p-4 text-center">Desempeño</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-100/50">
              ${i.length===0?`
                <tr><td colspan="5" class="p-8 text-center text-surface-500">No hay proveedores registrados.</td></tr>
              `:i.map(e=>`
                <tr class="hover:bg-surface-50/30 transition-colors">
                  <td class="p-4">
                    <div class="font-medium text-surface-900">${e.name}</div>
                    <div class="text-xs text-surface-400 font-mono" title="${e.id}">ID: ${e.id.split("-")[0]}</div>
                  </td>
                  <td class="p-4">
                    ${e.specialty?`<span class="badge badge-gray text-xs">${e.specialty}</span>`:'<span class="text-surface-400 text-xs">—</span>'}
                  </td>
                  <td class="p-4 text-sm text-surface-600">
                    ${e.phone||e.email?`
                      ${e.phone?`<div><i data-lucide="phone" class="w-3 h-3 inline mr-1"></i>${e.phone}</div>`:""}
                      ${e.email?`<div><i data-lucide="mail" class="w-3 h-3 inline mr-1"></i>${e.email}</div>`:""}
                    `:'<span class="text-surface-400">—</span>'}
                  </td>
                  <td class="p-4">
                    <span class="badge ${e.is_active?"badge-green":"badge-red"} text-xs">
                        ${e.is_active?"Activo":"Inactivo"}
                    </span>
                  </td>
                  <td class="p-4 text-center">
                    <button class="btn-secondary py-1 px-3 text-xs stats-btn" data-id="${e.id}" data-name="${e.name}">
                        <i data-lucide="bar-chart-2" class="w-3.5 h-3.5 mr-1 inline"></i> Métricas
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        `,window.lucide&&lucide.createIcons(),document.querySelectorAll(".stats-btn").forEach(e=>{e.addEventListener("click",()=>bt(e.dataset.id,e.dataset.name))}),document.getElementById("add-supplier-btn").addEventListener("click",()=>{m("La creación de proveedores se hace desde Agregar Contacto (marcalo como Proveedor)","info")})}catch(s){t.innerHTML=`<div class="p-8 text-center text-rose-500">Error: ${s.message}</div>`}}async function bt(t,a){y("Métricas del Proveedor",`
      <div class="text-center p-8">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto mb-4"></div>
        <p class="text-surface-600">Calculando estadísticas...</p>
      </div>
    `,{confirmText:""});try{const s=await p.get(`/contacts/${t}/supplier-stats`),i=s.average_response_days;let e=i>0?i<1?"Menos de 1 día":`${i.toFixed(1)} días`:"Sin cotizaciones",o=i>0&&i<=2?"text-emerald-500":i>2?"text-amber-500":"text-surface-500";const l=`
          <div class="space-y-6">
            <h3 class="text-lg font-bold text-surface-900 mb-2 border-b border-surface-200 pb-2">${a}</h3>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-surface-50 p-4 rounded-xl border border-surface-200 text-center">
                <i data-lucide="clock" class="w-6 h-6 mx-auto mb-2 ${o}"></i>
                <p class="text-xs text-surface-500 uppercase tracking-widest font-semibold mb-1">Tiempo de Respuesta</p>
                <p class="text-xl font-bold text-surface-900">${e}</p>
              </div>
              
              <div class="bg-surface-50 p-4 rounded-xl border border-surface-200 text-center">
                <i data-lucide="dollar-sign" class="w-6 h-6 mx-auto mb-2 text-primary-500"></i>
                <p class="text-xs text-surface-500 uppercase tracking-widest font-semibold mb-1">Costo Promedio (Trabajo)</p>
                <p class="text-xl font-bold text-surface-900">${x(s.average_cost)}</p>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2">
                <div class="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-center">
                    <p class="text-xs text-blue-600 mb-1">Órdenes Realizadas</p>
                    <p class="text-lg font-bold text-blue-700">${s.completed_orders}</p>
                </div>
                <div class="bg-amber-50/50 p-3 rounded-lg border border-amber-100 text-center">
                    <p class="text-xs text-amber-600 mb-1">Órdenes Totales</p>
                    <p class="text-lg font-bold text-amber-700">${s.total_orders}</p>
                </div>
                <div class="bg-rose-50/50 p-3 rounded-lg border border-rose-100 text-center">
                    <p class="text-xs text-rose-600 mb-1">Deuda Pendiente</p>
                    <p class="text-lg font-bold text-rose-700">${x(s.pending_invoices_amount)}</p>
                </div>
            </div>
            
            <p class="text-xs text-surface-400 mt-4"><i data-lucide="info" class="w-3 h-3 inline mr-1"></i> El tiempo de respuesta se calcula desde el reporte del inquilino hasta la aprobación de la primera cotización PDF.</p>
          </div>
        `;y("Métricas del Proveedor",l,{confirmText:"Cerrar"}),window.lucide&&lucide.createIcons()}catch(s){y("Error",`<p class="text-rose-500">No se pudieron cargar las métricas: ${s.message}</p>`,{confirmText:"Ok"})}}const T={user:null,currentPage:"dashboard"},ft={dashboard:{title:"Dashboard",subtitle:"Vista general de su cartera inmobiliaria",render:Be},properties:{title:"Propiedades",subtitle:"Gestión de su portfolio inmobiliario",render:ee},financials:{title:"Finanzas",subtitle:"Ledger contable y conciliación bancaria",render:B},invoices:{title:"Cuentas por Cobrar",subtitle:"Facturación de arriendos y cobros pendientes",render:fe},maintenance:{title:"Mantenimientos",subtitle:"Órdenes de trabajo y calendario",render:q},contracts:{title:"Contratos",subtitle:"Gestión de arrendamientos",render:H},budgets:{title:"Presupuestos",subtitle:"Control presupuestario y semáforo",render:Ye},"budget-report":{title:"Reporte de Presupuesto",subtitle:"Distribución y cumplimiento detallado",render:Qe},facility:{title:"Facility Management",subtitle:"Gestión de activos e inspecciones",render:te},"account-detail":{title:"Detalle de Cuenta",subtitle:"Historial de movimientos y análisis de saldo",render:rt},"work-groups":{title:"Grupos de Trabajo",subtitle:"Gestión de equipos de mantenimiento",render:O},audits:{title:"Auditoría",subtitle:"Registro de actividades y log del sistema",render:dt},calendar:{title:"Calendario",subtitle:"Eventos y fechas importantes próximas",render:ct},suppliers:{title:"Proveedores",subtitle:"Métricas de desempeño y gestión de cuentas por pagar",render:mt},settings:{title:"Configuración",subtitle:"Ajustes globales y de integraciones",render:pt}};function he(){return(window.location.hash.replace("#/","")||"dashboard").split("?")[0].split("/")[0]}async function ye(t){const a=ft[t];if(!a){window.location.hash="#/dashboard";return}T.currentPage=t,document.getElementById("page-title").textContent=a.title,document.getElementById("page-subtitle").textContent=a.subtitle,document.querySelectorAll(".sidebar-link").forEach(i=>{i.classList.toggle("active",i.dataset.page===t)});const s=document.getElementById("page-content");s.innerHTML='<div class="flex items-center justify-center py-20"><div class="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>';try{await a.render(s,T)}catch(i){console.error(`Error rendering ${t}:`,i),s.innerHTML=`
      <div class="text-center py-20">
        <i data-lucide="alert-circle" class="w-12 h-12 text-rose-400 mx-auto mb-4"></i>
        <h3 class="text-lg font-semibold text-surface-700 mb-2">Error al cargar la página</h3>
        <p class="text-surface-500">${i.message}</p>
      </div>
    `}window.lucide&&lucide.createIcons()}function K(){document.getElementById("auth-screen").classList.remove("hidden"),document.getElementById("app-shell").classList.add("hidden"),window.lucide&&lucide.createIcons()}function we(){document.getElementById("auth-screen").classList.add("hidden"),document.getElementById("app-shell").classList.remove("hidden"),T.user&&(document.getElementById("user-name").textContent=T.user.full_name,document.getElementById("user-role").textContent=T.user.role,document.getElementById("user-avatar").textContent=T.user.full_name.charAt(0).toUpperCase()),window.lucide&&lucide.createIcons(),ye(he())}async function gt(){if(!p.isAuthenticated()){K();return}try{T.user=await p.getProfile(),we()}catch{p.clearTokens(),K()}}function vt(){window.addEventListener("hashchange",()=>{T.user&&ye(he())}),document.getElementById("login-form").addEventListener("submit",async t=>{t.preventDefault();const a=document.getElementById("login-email").value,s=document.getElementById("login-password").value;try{await p.login(a,s),T.user=await p.getProfile(),m(`Bienvenido, ${T.user.full_name}`,"success"),we()}catch(i){m(i.message,"error")}}),document.getElementById("register-form").addEventListener("submit",async t=>{t.preventDefault();const a={full_name:document.getElementById("reg-name").value,email:document.getElementById("reg-email").value,password:document.getElementById("reg-password").value,role:document.getElementById("reg-role").value};try{console.log("Registrando usuario...",a),await p.register(a),m("Cuenta creada. Inicie sesión.","success"),document.getElementById("register-form").classList.add("hidden"),document.getElementById("login-form").classList.remove("hidden"),t.target.reset()}catch(s){console.error("Error en registro:",s),m(s.message,"error")}}),document.getElementById("show-register").addEventListener("click",t=>{t.preventDefault(),document.getElementById("login-form").classList.add("hidden"),document.getElementById("register-form").classList.remove("hidden")}),document.getElementById("show-login").addEventListener("click",t=>{t.preventDefault(),document.getElementById("register-form").classList.add("hidden"),document.getElementById("login-form").classList.remove("hidden")}),document.getElementById("logout-btn").addEventListener("click",()=>{p.clearTokens(),T.user=null,m("Sesión cerrada","info"),K()}),p.onUnauthorized(()=>{T.user=null,K(),m("Sesión expirada","warning")}),gt()}document.addEventListener("DOMContentLoaded",vt);
