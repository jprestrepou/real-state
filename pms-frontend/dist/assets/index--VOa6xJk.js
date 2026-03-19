(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))t(e);new MutationObserver(e=>{for(const o of e)if(o.type==="childList")for(const d of o.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&t(d)}).observe(document,{childList:!0,subtree:!0});function i(e){const o={};return e.integrity&&(o.integrity=e.integrity),e.referrerPolicy&&(o.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?o.credentials="include":e.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function t(e){if(e.ep)return;e.ep=!0;const o=i(e);fetch(e.href,o)}})();const N="https://real-state-xd5o.onrender.com/api/v1";class xe{constructor(){this._accessToken=localStorage.getItem("pms_access_token"),this._refreshToken=localStorage.getItem("pms_refresh_token"),this._onUnauthorized=null}get baseUrl(){return N}onUnauthorized(s){this._onUnauthorized=s}setTokens(s,i){this._accessToken=s,this._refreshToken=i,localStorage.setItem("pms_access_token",s),localStorage.setItem("pms_refresh_token",i)}clearTokens(){this._accessToken=null,this._refreshToken=null,localStorage.removeItem("pms_access_token"),localStorage.removeItem("pms_refresh_token")}isAuthenticated(){return!!this._accessToken}async _fetch(s,i={}){const t={"Content-Type":"application/json",...i.headers};this._accessToken&&(t.Authorization=`Bearer ${this._accessToken}`),i.body instanceof FormData&&delete t["Content-Type"];let e=await fetch(`${N}${s}`,{...i,headers:t});if(e.status===401&&this._refreshToken)if(await this._tryRefresh())t.Authorization=`Bearer ${this._accessToken}`,e=await fetch(`${N}${s}`,{...i,headers:t});else throw this.clearTokens(),this._onUnauthorized&&this._onUnauthorized(),new Error("Sesión expirada. Inicie sesión nuevamente.");if(!e.ok){let o="Error del servidor";try{const d=await e.json();typeof d.detail=="string"?o=d.detail:Array.isArray(d.detail)?o=d.detail.map(r=>r.msg).join(", "):d.detail&&(o=JSON.stringify(d.detail))}catch{o=`Error ${e.status}`}throw new Error(o)}return e.status===204?null:e.json()}async _tryRefresh(){try{const s=await fetch(`${N}/auth/refresh`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refresh_token:this._refreshToken})});if(!s.ok)return!1;const i=await s.json();return this.setTokens(i.access_token,i.refresh_token),!0}catch{return!1}}get(s){return this._fetch(s)}post(s,i){return this._fetch(s,{method:"POST",body:JSON.stringify(i)})}put(s,i){return this._fetch(s,{method:"PUT",body:JSON.stringify(i)})}delete(s){return this._fetch(s,{method:"DELETE"})}upload(s,i){return this._fetch(s,{method:"POST",body:i})}async login(s,i){const t=await this.post("/auth/login",{email:s,password:i});return this.setTokens(t.access_token,t.refresh_token),t}async register(s){return this.post("/auth/register",s)}async getProfile(){return this.get("/auth/me")}}const p=new xe;function b(a,s="info",i=4e3){const t=document.getElementById("toast-container"),e=document.createElement("div");e.className=`toast toast-${s}`,e.textContent=a,t.appendChild(e),setTimeout(()=>{e.style.opacity="0",e.style.transform="translateX(100%)",e.style.transition="all 0.3s ease-in",setTimeout(()=>e.remove(),300)},i)}function h(a,s,{onConfirm:i,confirmText:t="Guardar",showCancel:e=!0}={}){const o=document.getElementById("modal-container");o.innerHTML=`
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal-content">
        <div class="flex items-center justify-between p-6 border-b border-surface-100">
          <h3 class="text-lg font-bold text-surface-900">${a}</h3>
          <button id="modal-close" class="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
        <div class="p-6" id="modal-body">
          ${s}
        </div>
        <div class="flex items-center justify-end gap-3 p-6 border-t border-surface-100">
          ${e?'<button id="modal-cancel" class="btn-secondary">Cancelar</button>':""}
          ${i?`<button id="modal-confirm" class="btn-primary">${t}</button>`:""}
        </div>
      </div>
    </div>
  `,window.lucide&&lucide.createIcons();const d=document.getElementById("modal-overlay"),r=document.getElementById("modal-close"),l=document.getElementById("modal-cancel"),n=document.getElementById("modal-confirm"),c=()=>{o.innerHTML=""};return d.addEventListener("click",u=>{u.target===d&&c()}),r==null||r.addEventListener("click",c),l==null||l.addEventListener("click",c),n&&i&&n.addEventListener("click",async()=>{try{await i(),c()}catch(u){b(u.message,"error")}}),{close:c,getBody:()=>document.getElementById("modal-body")}}function z(){document.getElementById("modal-container").innerHTML=""}function f(a,s="COP"){return a==null?"—":new Intl.NumberFormat("es-CO",{style:"currency",currency:s,minimumFractionDigits:0,maximumFractionDigits:0}).format(a)}function te(a){return a==null?"—":Math.abs(a)>=1e6?`$${(a/1e6).toFixed(1)}M`:Math.abs(a)>=1e3?`$${(a/1e3).toFixed(0)}K`:f(a)}function _(a){return a?new Date(a).toLocaleDateString("es-CO",{year:"numeric",month:"short",day:"numeric"}):"—"}function Y(a){return a==null?"—":`${Number(a).toFixed(1)}%`}function O(a){return{Disponible:"badge-green",Arrendada:"badge-blue","En Mantenimiento":"badge-amber",Vendida:"badge-gray",Pendiente:"badge-amber","En Progreso":"badge-blue",Completado:"badge-green",Cancelado:"badge-red","Esperando Factura":"badge-amber",Activo:"badge-green",Borrador:"badge-gray",Finalizado:"badge-gray",Pagado:"badge-green",Vencido:"badge-red"}[a]||"badge-gray"}function he(a){return{Verde:"semaphore-green",Amarillo:"semaphore-amber",Rojo:"semaphore-red"}[a]||"semaphore-green"}const S={primary:"#4c6ef5",accent:"#20c997",accentLight:"rgba(32, 201, 151, 0.1)",red:"#e03131",redLight:"rgba(224, 49, 49, 0.1)"},q={responsive:!0,maintainAspectRatio:!1,plugins:{legend:{labels:{font:{family:"Inter",size:12,weight:"500"},padding:16,usePointStyle:!0,pointStyleWidth:10}},tooltip:{backgroundColor:"rgba(33, 37, 41, 0.95)",titleFont:{family:"Inter",size:13,weight:"600"},bodyFont:{family:"Inter",size:12},padding:12,cornerRadius:10,displayColors:!0}}};function ye(a,s,i,t){return new Chart(a,{type:"bar",data:{labels:s,datasets:[{label:"Ingresos",data:i,backgroundColor:S.accent,borderRadius:8,barPercentage:.6},{label:"Gastos",data:t,backgroundColor:S.red,borderRadius:8,barPercentage:.6}]},options:{...q,scales:{y:{beginAtZero:!0,grid:{color:"rgba(0,0,0,0.04)"},ticks:{font:{family:"Inter",size:11}}},x:{grid:{display:!1},ticks:{font:{family:"Inter",size:11}}}}}})}function we(a,s,i){const t=["#4c6ef5","#20c997","#f59f00","#e03131","#845ef7","#339af0"];return new Chart(a,{type:"doughnut",data:{labels:s,datasets:[{data:i,backgroundColor:t.slice(0,i.length),borderWidth:0,hoverOffset:8}]},options:{...q,cutout:"70%",plugins:{...q.plugins,legend:{...q.plugins.legend,position:"bottom"}}}})}function $e(a,s,i,t,e){return new Chart(a,{type:"line",data:{labels:s,datasets:[{label:"Ingresos Proyectados",data:i,borderColor:S.accent,backgroundColor:S.accentLight,fill:!0,tension:.4,pointRadius:4,pointHoverRadius:6,borderWidth:2.5},{label:"Gastos Proyectados",data:t,borderColor:S.red,backgroundColor:S.redLight,fill:!0,tension:.4,pointRadius:4,pointHoverRadius:6,borderWidth:2.5},{label:"Balance Neto",data:e,borderColor:S.primary,borderDash:[6,4],fill:!1,tension:.4,pointRadius:3,borderWidth:2}]},options:{...q,interaction:{mode:"index",intersect:!1},scales:{y:{grid:{color:"rgba(0,0,0,0.04)"},ticks:{font:{family:"Inter",size:11}}},x:{grid:{display:!1},ticks:{font:{family:"Inter",size:11}}}}}})}const _e={Disponible:"#20c997",Arrendada:"#4c6ef5","En Mantenimiento":"#f59f00",Vendida:"#868e96"};let j=null,F=null;function Ee(a,s=[4.711,-74.072],i=12){return j&&j.remove(),j=L.map(a).setView(s,i),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:19}).addTo(j),F=L.markerClusterGroup({maxClusterRadius:50,spiderfyOnMaxZoom:!0,showCoverageOnHover:!1}),j.addLayer(F),j}function Ce(a){if(F&&(F.clearLayers(),a.forEach(s=>{const i=_e[s.status]||"#868e96",t=L.circleMarker([s.latitude,s.longitude],{radius:10,fillColor:i,color:"#fff",weight:2,opacity:1,fillOpacity:.85}),e=`
      <div style="font-family:Inter,sans-serif; min-width:200px;">
        <h3 style="margin:0 0 4px; font-size:14px; font-weight:700; color:#212529;">${s.name}</h3>
        <p style="margin:0 0 2px; font-size:12px; color:#868e96;">${s.property_type} • ${s.city}</p>
        <div style="display:flex; align-items:center; gap:6px; margin-top:8px;">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${i};"></span>
          <span style="font-size:12px; font-weight:600; color:#495057;">${s.status}</span>
        </div>
        ${s.monthly_rent?`<p style="margin:6px 0 0; font-size:13px; font-weight:600; color:#20c997;">Canon: ${f(s.monthly_rent)}</p>`:""}
        <a href="#/properties/${s.id}" style="display:inline-block; margin-top:8px; font-size:12px; color:#4c6ef5; text-decoration:none; font-weight:600;">Ver ficha →</a>
      </div>
    `;t.bindPopup(e),F.addLayer(t)}),a.length>0)){const s=F.getBounds();s.isValid()&&j.fitBounds(s,{padding:[30,30]})}}function Ie(){j&&setTimeout(()=>j.invalidateSize(),100)}function Pe(a){return a==="high"?{bg:"bg-rose-50",border:"border-rose-200",text:"text-rose-700",dot:"bg-rose-500"}:a==="medium"?{bg:"bg-amber-50",border:"border-amber-200",text:"text-amber-700",dot:"bg-amber-500"}:{bg:"bg-blue-50",border:"border-blue-200",text:"text-blue-700",dot:"bg-blue-400"}}async function Te(a){const[s,i,t,e]=await Promise.all([p.get("/reports/summary"),p.get("/properties/map"),p.get("/reports/cashflow?months=12"),p.get("/reports/upcoming-events?days=30").catch(()=>({events:[]}))]),o=s,d=e.events||[];if(a.innerHTML=`
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
        <p class="text-3xl font-bold text-surface-900">${Y(o.occupancy_rate)}</p>
      </div>

      <div class="kpi-card kpi-green">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-surface-500">Ingresos</span>
          <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <i data-lucide="trending-up" class="w-5 h-5 text-green-600"></i>
          </div>
        </div>
        <p class="text-3xl font-bold text-surface-900">${te(o.total_income)}</p>
      </div>

      <div class="kpi-card kpi-red">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-surface-500">Gastos</span>
          <div class="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
            <i data-lucide="trending-down" class="w-5 h-5 text-rose-600"></i>
          </div>
        </div>
        <p class="text-3xl font-bold text-surface-900">${te(o.total_expenses)}</p>
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
          <span class="ml-auto badge ${d.length>0?"badge-red":"badge-gray"} text-xs">${d.length}</span>
        </h3>
        <div class="flex-1 overflow-y-auto space-y-2 max-h-[340px] pr-1">
          ${d.length===0?`
            <div class="flex flex-col items-center justify-center h-32 text-surface-400">
              <i data-lucide="check-circle" class="w-8 h-8 mb-2 text-accent-400"></i>
              <p class="text-sm font-medium">Sin eventos próximos</p>
            </div>
          `:d.map(l=>{const n=Pe(l.severity);return`
            <div class="flex items-start gap-3 p-3 rounded-xl border ${n.bg} ${n.border}">
              <div class="mt-0.5 w-2 h-2 rounded-full ${n.dot} shrink-0 mt-1.5"></div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold ${n.text} truncate">${l.title}</p>
                <p class="text-[10px] text-surface-500 mt-0.5">${l.detail} · ${l.date}</p>
              </div>
              <i data-lucide="${l.icon}" class="w-4 h-4 ${n.text} shrink-0"></i>
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
          ${o.accounts.map(l=>`
            <div class="p-4 rounded-xl border border-surface-200 bg-surface-50/50 hover:border-primary-200 transition-colors">
              <p class="text-sm font-medium text-surface-600">${l.account_name}</p>
              <p class="text-sm text-surface-400 mb-2">${l.account_type} · ${l.currency}</p>
              <p class="text-xl font-bold ${l.current_balance>=0?"text-accent-600":"text-rose-600"}">${f(l.current_balance)}</p>
            </div>
          `).join("")}
        </div>
      `:`
        <p class="text-center text-surface-400 py-8">No hay cuentas registradas aún</p>
      `}
    </div>
  `,window.lucide&&lucide.createIcons(),setTimeout(()=>{Ee("dashboard-map"),Ce(i),Ie()},100),i.length>0){const l={};i.forEach(u=>{l[u.property_type]=(l[u.property_type]||0)+1});const n=Object.keys(l),c=Object.values(l);we(document.getElementById("type-chart"),n,c)}const r=t.months||[];if(r.length>0){const l=r.slice(-6);ye(document.getElementById("income-expense-chart"),l.map(n=>n.month),l.map(n=>n.income),l.map(n=>n.expenses)),$e(document.getElementById("cashflow-chart"),r.map(n=>n.month),r.map(n=>n.income),r.map(n=>n.expenses),r.map(n=>n.net))}}async function K(a){const i=(await p.get("/properties?limit=50")).items||[];a.innerHTML=`
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
          ${i.length>0?i.map(t=>`
            <tr>
              <td>
                <div class="font-semibold text-surface-900">${t.name}</div>
                <div class="text-xs text-surface-400 truncate max-w-[200px]">${t.address}</div>
              </td>
              <td><span class="badge badge-gray">${t.property_type}</span></td>
              <td class="text-surface-600">${t.city}</td>
              <td class="text-surface-600">${t.area_sqm}</td>
              <td class="font-medium">${f(t.commercial_value)}</td>
              <td><span class="badge ${O(t.status)}">${t.status}</span></td>
              <td class="text-surface-500 text-xs">${_(t.created_at)}</td>
              <td>
                <div class="flex items-center gap-1">
                  <button class="btn-ghost text-xs py-1 px-2 view-property" data-id="${t.id}" title="Detalles">
                    <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                  </button>
                  <button class="btn-ghost text-xs py-1 px-2 edit-property" data-id="${t.id}" title="Editar">
                    <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                  </button>
                  <button class="btn-ghost text-xs py-1 px-2 delete-property text-rose-500 hover:bg-rose-50" data-id="${t.id}" title="Eliminar">
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
  `,window.lucide&&lucide.createIcons(),document.getElementById("add-property-btn").addEventListener("click",()=>se()),document.getElementById("properties-table").addEventListener("click",async t=>{const e=t.target.closest(".view-property"),o=t.target.closest(".edit-property"),d=t.target.closest(".delete-property");if(e&&W(e.dataset.id),o){const r=o.dataset.id,l=await p.get(`/properties/${r}`);se(l)}if(d){const r=d.dataset.id;if(confirm("¿Está seguro de que desea eliminar esta propiedad? Esta acción la desactivará del sistema."))try{await p.delete(`/properties/${r}`),b("Propiedad eliminada correctamente","success");const l=document.getElementById("page-content");await K(l)}catch(l){b(l.message,"error")}}}),document.getElementById("filter-status").addEventListener("change",async t=>{const e=t.target.value,o=document.getElementById("filter-type").value;let d="/properties?limit=50";e&&(d+=`&status=${encodeURIComponent(e)}`),o&&(d+=`&property_type=${encodeURIComponent(o)}`);const r=await p.get(d);ae(r.items||[])}),document.getElementById("filter-type").addEventListener("change",async t=>{const e=t.target.value,o=document.getElementById("filter-status").value;let d="/properties?limit=50";o&&(d+=`&status=${encodeURIComponent(o)}`),e&&(d+=`&property_type=${encodeURIComponent(e)}`);const r=await p.get(d);ae(r.items||[])})}function ae(a){const s=document.querySelector("#properties-table tbody");s.innerHTML=a.map(i=>`
    <tr>
      <td>
        <div class="font-semibold text-surface-900">${i.name}</div>
        <div class="text-xs text-surface-400 truncate max-w-[200px]">${i.address}</div>
      </td>
      <td><span class="badge badge-gray">${i.property_type}</span></td>
      <td class="text-surface-600">${i.city}</td>
      <td class="text-surface-600">${i.area_sqm}</td>
      <td class="font-medium">${f(i.commercial_value)}</td>
      <td><span class="badge ${O(i.status)}">${i.status}</span></td>
      <td class="text-surface-500 text-xs">${_(i.created_at)}</td>
      <td>
        <div class="flex items-center gap-1">
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
  `).join(""),window.lucide&&lucide.createIcons()}function se(a=null){const s=!!a,i=s?"Editar Propiedad":"Nueva Propiedad",t=`
    <form id="property-form" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Nombre *</label>
          <input class="input" name="name" required value="${(a==null?void 0:a.name)||""}" placeholder="Mi Apartamento Centro" />
        </div>
        <div>
          <label class="label">Tipo *</label>
          <select class="select" name="property_type" required>
            ${["Apartamento","Casa","Local","Bodega","Oficina","Lote"].map(e=>`<option value="${e}" ${(a==null?void 0:a.property_type)===e?"selected":""}>${e}</option>`).join("")}
          </select>
        </div>
      </div>
      <div>
        <label class="label">Dirección *</label>
        <input class="input" name="address" required value="${(a==null?void 0:a.address)||""}" placeholder="Calle 100 #15-20, Bogotá" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Ciudad *</label>
          <input class="input" name="city" required value="${(a==null?void 0:a.city)||""}" placeholder="Bogotá" />
        </div>
        <div>
          <label class="label">País</label>
          <input class="input" name="country" value="${(a==null?void 0:a.country)||"Colombia"}" />
        </div>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="label">Latitud *</label>
          <input class="input" name="latitude" type="number" step="any" required value="${(a==null?void 0:a.latitude)||"4.711"}" />
        </div>
        <div>
          <label class="label">Longitud *</label>
          <input class="input" name="longitude" type="number" step="any" required value="${(a==null?void 0:a.longitude)||"-74.072"}" />
        </div>
        <div>
          <label class="label">Área m² *</label>
          <input class="input" name="area_sqm" type="number" step="0.01" required value="${(a==null?void 0:a.area_sqm)||""}" placeholder="85.5" />
        </div>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="label">Habitaciones</label>
          <input class="input" name="bedrooms" type="number" value="${(a==null?void 0:a.bedrooms)??""}" />
        </div>
        <div>
          <label class="label">Baños</label>
          <input class="input" name="bathrooms" type="number" value="${(a==null?void 0:a.bathrooms)??""}" />
        </div>
        <div>
          <label class="label">Valor Comercial</label>
          <input class="input" name="commercial_value" type="number" value="${(a==null?void 0:a.commercial_value)??""}" placeholder="350000000" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Matrícula Inmobiliaria</label>
          <input class="input" name="cadastral_id" value="${(a==null?void 0:a.cadastral_id)||""}" />
        </div>
        <div>
          <label class="label">Estado</label>
          <select class="select" name="status">
            ${["Disponible","Arrendada","En Mantenimiento","Vendida"].map(e=>`<option value="${e}" ${(a==null?void 0:a.status)===e?"selected":""}>${e}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="p-4 bg-primary-50/50 rounded-xl border border-primary-100 space-y-4">
        <h4 class="text-sm font-bold text-primary-700 flex items-center gap-2">
          <i data-lucide="credit-card" class="w-4 h-4"></i> Parámetros de Administración
        </h4>
        <div class="flex items-center gap-2 mb-2">
          <input type="checkbox" name="pays_administration" id="pays_administration" class="w-4 h-4 rounded text-primary-600" ${(a==null?void 0:a.pays_administration)!==!1?"checked":""} />
          <label for="pays_administration" class="text-sm font-medium cursor-pointer">Paga Administración</label>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">Día de Pago (1-31)</label>
            <input class="input" name="administration_day" type="number" min="1" max="31" value="${(a==null?void 0:a.administration_day)||""}" placeholder="5" />
          </div>
          <div>
            <label class="label">Valor Administración</label>
            <input class="input" name="administration_fee" type="number" value="${(a==null?void 0:a.administration_fee)||""}" placeholder="250000" />
          </div>
        </div>
        <div>
          <label class="label">Método de Pago</label>
          <input class="input" name="administration_payment_method" value="${(a==null?void 0:a.administration_payment_method)||""}" placeholder="Transferencia Bancaria, Link de Pago, etc." />
        </div>
        <div>
          <label class="label">Cuenta o Link de Pago</label>
          <textarea class="input" name="administration_payment_info" rows="2" placeholder="Número de cuenta o URL de pago...">${(a==null?void 0:a.administration_payment_info)||""}</textarea>
        </div>
      </div>
      <div>
        <label class="label">Notas</label>
        <textarea class="input" name="notes" rows="2" placeholder="Observaciones adicionales...">${(a==null?void 0:a.notes)||""}</textarea>
      </div>
    </form>
  `;h(i,t,{confirmText:s?"Guardar Cambios":"Crear Propiedad",onConfirm:async()=>{const e=document.getElementById("property-form"),o=new FormData(e),d={};o.forEach((l,n)=>{l===""&&n!=="pays_administration"||(["latitude","longitude","area_sqm","commercial_value","administration_fee"].includes(n)?d[n]=parseFloat(l):["bedrooms","bathrooms","administration_day"].includes(n)?d[n]=parseInt(l):n==="pays_administration"?d[n]=document.getElementById("pays_administration").checked:d[n]=l)}),d.hasOwnProperty("pays_administration")||(d.pays_administration=document.getElementById("pays_administration").checked),s?(await p.put(`/properties/${a.id}`,d),b("Propiedad actualizada","success")):(await p.post("/properties",d),b("Propiedad creada","success"));const r=document.getElementById("page-content");await K(r)}})}async function W(a){const[s,i]=await Promise.all([p.get(`/properties/${a}`),p.get(`/occupants?property_id=${a}`)]),t=e=>e.length?`
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
    `:'<p class="text-sm text-surface-400 py-4 text-center">No hay ocupantes registrados.</p>';h(`Detalle: ${s.name}`,`
    <div class="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
      <div class="grid grid-cols-2 gap-4">
        <div class="glass-card-static p-4">
          <h4 class="text-xs font-bold text-surface-400 uppercase mb-3 flex items-center gap-1"><i data-lucide="info" class="w-3 h-3"></i> Información Básica</h4>
          <p class="text-sm"><strong>Dirección:</strong> ${s.address}</p>
          <p class="text-sm"><strong>Tipo:</strong> ${s.property_type}</p>
          <p class="text-sm"><strong>Área:</strong> ${s.area_sqm} m²</p>
          <p class="text-sm"><strong>Estado:</strong> <span class="badge ${O(s.status)}">${s.status}</span></p>
          <hr class="my-3 border-surface-100" />
          <h5 class="text-xs font-bold text-surface-400 uppercase mb-2">Administración</h5>
          <p class="text-sm"><strong>Paga:</strong> ${s.pays_administration?"Sí":"No"}</p>
          ${s.pays_administration?`
            <p class="text-sm"><strong>Valor:</strong> ${f(s.administration_fee)}</p>
            <p class="text-sm"><strong>Día pago:</strong> ${s.administration_day||"No definido"}</p>
            <p class="text-sm"><strong>Método:</strong> ${s.administration_payment_method||"No definido"}</p>
            ${s.administration_payment_info?`
              <p class="text-sm"><strong>Info Pago:</strong> <span class="text-xs break-all text-primary-600">${s.administration_payment_info}</span></p>
            `:""}
          `:""}
        </div>
        <div class="glass-card-static p-4">
          <h4 class="text-xs font-bold text-surface-400 uppercase mb-3 flex items-center gap-1"><i data-lucide="users" class="w-3 h-3"></i> Ocupantes (Viven aquí)</h4>
          <div id="occupants-container">
            ${t(i)}
          </div>
          <button id="add-occupant-btn" class="btn-ghost text-xs w-full mt-4 border-dashed border-2 border-surface-200 hover:border-primary-300">
            <i data-lucide="plus" class="w-3 h-3 mr-1"></i> Agregar Ocupante
          </button>
        </div>
      </div>
    </div>
  `,{showCancel:!0,confirmText:null}),window.lucide&&lucide.createIcons(),document.getElementById("add-occupant-btn").addEventListener("click",()=>{h("Nuevo Ocupante",`
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
    `,{confirmText:"Agregar",onConfirm:async()=>{const e=new FormData(document.getElementById("occupant-form")),o={property_id:a,full_name:e.get("full_name"),dni:e.get("dni")||null,phone:e.get("phone")||null,email:e.get("email")||null,is_primary:document.getElementById("is_primary").checked};await p.post("/occupants",o),b("Ocupante agregado","success"),W(a)}})}),document.querySelectorAll(".delete-occupant-btn").forEach(e=>{e.addEventListener("click",async()=>{confirm("¿Eliminar este ocupante?")&&(await p.delete(`/occupants/${e.dataset.id}`),b("Ocupante eliminado","success"),W(a))})})}const ce=["Gastos Generales","Gastos Administrativos","Mantenimiento General","Pago de Empleados","Nómina y Personal","Suministros de Oficina","Marketing y Publicidad","Servicios Públicos","Seguros","Impuestos y Tasas","Honorarios Gestión","Otros"],pe=["Ingresos por Arriendo","Gastos Mantenimiento","Impuestos y Tasas","Cuotas de Administración","Servicios Públicos","Honorarios Gestión","Seguros","Pago Hipoteca","Otros"];async function B(a){var x,y,w,C,T,I,X,Q,ee;const[s,i,t]=await Promise.all([p.get("/accounts"),p.get("/transactions?limit=30"),p.get("/properties?limit=100")]),e=s||[],o=i.items||[],d=t.items||[];let r=1,l=!1,n=o.length>=30;a.innerHTML=`
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
          ${e.map(m=>`
            <div class="glass-card p-5 cursor-pointer hover:shadow-card-hover hover:border-primary-200 transition-all group account-card" data-account-id="${m.id}">
              <div class="flex items-center justify-between mb-3">
                <span class="badge ${m.is_active?"badge-green":"badge-gray"}">${m.account_type}</span>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button class="edit-account-btn p-1.5 rounded-lg hover:bg-primary-50 text-surface-400 hover:text-primary-600 transition" data-id="${m.id}" data-name="${m.account_name}" data-bank="${m.bank_name||""}" data-number="${m.account_number||""}" title="Editar">
                    <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                  </button>
                  <button class="delete-account-btn p-1.5 rounded-lg hover:bg-rose-50 text-surface-400 hover:text-rose-600 transition" data-id="${m.id}" data-name="${m.account_name}" data-balance="${m.current_balance}" title="Eliminar">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
              <p class="text-sm font-medium text-surface-700 mb-1">${m.account_name}</p>
              ${m.bank_name?`<p class="text-xs text-surface-400 mb-2">${m.bank_name}</p>`:""}
              <p class="text-2xl font-bold ${m.current_balance>=0?"text-accent-600":"text-rose-600"}">
                ${f(m.current_balance)}
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
                <th>Monto</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${o.length>0?o.map(m=>`
                <tr>
                  <td class="text-xs text-surface-500">${_(m.transaction_date)}</td>
                  <td><div class="font-medium text-surface-900 text-sm">${m.description}</div></td>
                  <td><span class="badge badge-gray text-xs">${m.category}</span></td>
                  <td class="text-xs text-surface-500">
                    ${m.property_id?'<span class="badge badge-blue text-xs">Propiedad</span>':'<span class="badge badge-amber text-xs">General</span>'}
                  </td>
                  <td class="text-xs text-surface-500">${m.transaction_type}</td>
                  <td class="font-semibold ${m.direction==="Debit"?"text-accent-600":"text-rose-600"}">
                    ${m.direction==="Debit"?"+":"-"}${f(m.amount)}
                  </td>
                  <td>
                    <span class="badge ${m.direction==="Debit"?"badge-green":"badge-red"} text-xs">
                      ${m.direction==="Debit"?"Ingreso":"Egreso"}
                    </span>
                  </td>
                  <td>
                    <div class="flex items-center gap-1">
                      <button class="edit-tx-btn p-1.5 rounded-lg hover:bg-primary-50 text-surface-400 hover:text-primary-600 transition" data-id="${m.id}" data-desc="${m.description}" data-cat="${m.category}" data-amount="${m.amount}" data-type="${m.transaction_type}" data-date="${m.transaction_date}" title="Editar">
                        <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                      </button>
                      <button class="delete-tx-btn p-1.5 rounded-lg hover:bg-rose-50 text-surface-400 hover:text-rose-600 transition" data-id="${m.id}" data-desc="${m.description}" title="Eliminar">
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
              ${d.map(m=>`<option value="${m.id}">${m.name}</option>`).join("")}
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
  `,window.lucide&&lucide.createIcons(),(x=document.getElementById("add-account-btn"))==null||x.addEventListener("click",()=>ke()),(y=document.getElementById("add-transaction-btn"))==null||y.addEventListener("click",()=>ie(e,d,!1)),(w=document.getElementById("add-general-expense-btn"))==null||w.addEventListener("click",()=>ie(e,d,!0)),(C=document.getElementById("add-transfer-btn"))==null||C.addEventListener("click",()=>Be(e)),(T=document.getElementById("import-csv-btn"))==null||T.addEventListener("click",()=>{var m;return(m=document.getElementById("import-csv-input"))==null?void 0:m.click()}),(I=document.getElementById("import-csv-input"))==null||I.addEventListener("change",async m=>{const E=m.target.files[0];E&&(await De(E),m.target.value="")}),(X=document.getElementById("export-csv-btn"))==null||X.addEventListener("click",()=>{window.location.href=`${p.baseUrl}/reports/export`}),document.querySelectorAll(".account-card").forEach(m=>{m.addEventListener("click",E=>{E.target.closest(".edit-account-btn")||E.target.closest(".delete-account-btn")||(window.location.hash=`#/account-detail?id=${m.dataset.accountId}`)})}),document.querySelectorAll(".edit-account-btn").forEach(m=>{m.addEventListener("click",E=>{E.stopPropagation(),je(m.dataset.id,m.dataset.name,m.dataset.bank,m.dataset.number)})}),document.querySelectorAll(".delete-account-btn").forEach(m=>{m.addEventListener("click",E=>{E.stopPropagation(),Le(m.dataset.id,m.dataset.name,parseFloat(m.dataset.balance))})}),document.querySelectorAll(".edit-tx-btn").forEach(m=>{m.addEventListener("click",()=>{ne(m.dataset.id,m.dataset.desc,m.dataset.cat,m.dataset.amount,m.dataset.type,m.dataset.date)})}),document.querySelectorAll(".delete-tx-btn").forEach(m=>{m.addEventListener("click",()=>oe(m.dataset.id,m.dataset.desc))}),(Q=document.getElementById("performance-property-select"))==null||Q.addEventListener("change",m=>Ae(m.target.value)),(ee=document.getElementById("generate-pdf-btn"))==null||ee.addEventListener("click",()=>Me(e,o)),document.querySelectorAll(".tab-btn").forEach(m=>{m.addEventListener("click",()=>{document.querySelectorAll(".tab-btn").forEach(A=>A.classList.remove("active")),document.querySelectorAll(".tab-content").forEach(A=>A.classList.add("hidden")),m.classList.add("active");const E=m.dataset.tab;document.getElementById(`${E}-tab`).classList.remove("hidden"),E==="analysis"&&Se()})});const c=document.getElementById("infinite-scroll-sentinel"),u=document.getElementById("loading-spinner"),g=document.querySelector("#operations-tab tbody"),v=new IntersectionObserver(async m=>{if(m[0].isIntersecting&&n&&!l){l=!0,u.classList.remove("hidden"),r++;try{const A=(await p.get(`/transactions?limit=30&page=${r}`)).items||[];A.length===0?n=!1:(A.forEach($=>{const M=document.createElement("tr");M.innerHTML=`
              <td class="text-xs text-surface-500">${_($.transaction_date)}</td>
              <td><div class="font-medium text-surface-900 text-sm">${$.description}</div></td>
              <td><span class="badge badge-gray text-xs">${$.category}</span></td>
              <td class="text-xs text-surface-500">
                ${$.property_id?'<span class="badge badge-blue text-xs">Propiedad</span>':'<span class="badge badge-amber text-xs">General</span>'}
              </td>
              <td class="text-xs text-surface-500">${$.transaction_type}</td>
              <td class="font-semibold ${$.direction==="Debit"?"text-accent-600":"text-rose-600"}">
                ${$.direction==="Debit"?"+":"-"}${f($.amount)}
              </td>
              <td>
                <span class="badge ${$.direction==="Debit"?"badge-green":"badge-red"} text-xs">
                  ${$.direction==="Debit"?"Ingreso":"Egreso"}
                </span>
              </td>
              <td>
                <div class="flex items-center gap-1">
                  <button class="edit-tx-btn p-1.5 rounded-lg hover:bg-primary-50 text-surface-400 hover:text-primary-600 transition" 
                    data-id="${$.id}" data-desc="${$.description}" data-cat="${$.category}" 
                    data-amount="${$.amount}" data-type="${$.transaction_type}" data-date="${$.transaction_date}">
                    <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                  </button>
                  <button class="delete-tx-btn p-1.5 rounded-lg hover:bg-rose-50 text-surface-400 hover:text-rose-600 transition" 
                    data-id="${$.id}" data-desc="${$.description}">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </td>
            `,g.appendChild(M),M.querySelector(".edit-tx-btn").addEventListener("click",()=>{const k=M.querySelector(".edit-tx-btn");ne(k.dataset.id,k.dataset.desc,k.dataset.cat,k.dataset.amount,k.dataset.type,k.dataset.date)}),M.querySelector(".delete-tx-btn").addEventListener("click",()=>{const k=M.querySelector(".delete-tx-btn");oe(k.dataset.id,k.dataset.desc)})}),window.lucide&&lucide.createIcons(),A.length<30&&(n=!1))}catch(E){console.error("Error loading more transactions:",E)}finally{l=!1,u.classList.add("hidden")}}},{threshold:.1});c&&v.observe(c)}function ke(){h("Nueva Cuenta Bancaria",`
    <form id="account-form" class="space-y-4">
      <div><label class="label">Nombre *</label><input class="input" name="account_name" required placeholder="Cuenta Corriente" /></div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Tipo *</label>
          <select class="select" name="account_type" required>
            <option value="Corriente">Corriente</option><option value="Ahorros">Ahorros</option>
            <option value="Inversión">Inversión</option><option value="Caja Menor">Caja Menor</option>
          </select>
        </div>
        <div><label class="label">Saldo Inicial</label><input class="input" name="initial_balance" type="number" step="0.01" value="0" /></div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Banco</label><input class="input" name="bank_name" placeholder="Bancolombia" /></div>
        <div><label class="label">Moneda</label><input class="input" name="currency" value="COP" maxlength="3" /></div>
      </div>
    </form>
  `,{confirmText:"Crear Cuenta",onConfirm:async()=>{const a=new FormData(document.getElementById("account-form")),s={};a.forEach((i,t)=>{t==="initial_balance"?s[t]=parseFloat(i)||0:i&&(s[t]=i)}),await p.post("/accounts",s),b("Cuenta creada","success"),await B(document.getElementById("page-content"))}})}function je(a,s,i,t){h("Editar Cuenta",`
    <form id="edit-account-form" class="space-y-4">
      <div><label class="label">Nombre *</label><input class="input" name="account_name" value="${s}" required /></div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Banco</label><input class="input" name="bank_name" value="${i}" /></div>
        <div><label class="label">Número de Cuenta</label><input class="input" name="account_number" value="${t}" /></div>
      </div>
    </form>
  `,{confirmText:"Guardar Cambios",onConfirm:async()=>{const e=new FormData(document.getElementById("edit-account-form")),o={};e.forEach((d,r)=>{d&&(o[r]=d)}),await p.put(`/accounts/${a}`,o),b("Cuenta actualizada","success"),await B(document.getElementById("page-content"))}})}function Le(a,s,i){if(i!==0){b(`No se puede eliminar "${s}": tiene saldo de ${f(i)}. Transfiera los fondos primero.`,"error");return}h("Eliminar Cuenta",`
    <div class="text-center py-4">
      <div class="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i data-lucide="alert-triangle" class="w-8 h-8 text-rose-500"></i>
      </div>
      <p class="text-surface-700 font-medium mb-2">¿Eliminar la cuenta "${s}"?</p>
      <p class="text-sm text-surface-400">Esta acción desactivará la cuenta. No será visible pero sus transacciones históricas se conservan.</p>
    </div>
  `,{confirmText:"Eliminar",onConfirm:async()=>{await p.delete(`/accounts/${a}`),b("Cuenta eliminada","success"),await B(document.getElementById("page-content"))}}),window.lucide&&lucide.createIcons()}function ie(a,s=[],i=!1){const t=i?"Registrar Gasto General":"Registrar Transacción",e=i?ce:pe;h(t,`
    <form id="tx-form" class="space-y-4">
      ${i?'<div class="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-2"><div class="flex items-center gap-2 text-amber-700 text-sm font-medium"><i data-lucide="info" class="w-4 h-4"></i> Este gasto no está asociado a ninguna propiedad</div></div>':""}
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Cuenta *</label><select class="select" name="account_id" required>${a.map(c=>`<option value="${c.id}">${c.account_name}</option>`).join("")}</select></div>
        ${i?"":`<div><label class="label">Propiedad *</label><select class="select" name="property_id" required><option value="">Seleccione...</option>${s.map(c=>`<option value="${c.id}">${c.name}</option>`).join("")}</select></div>`}
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Tipo *</label><select class="select" name="transaction_type" required>
          ${i?'<option value="Gasto">Gasto</option>':'<option value="Ingreso">Ingreso</option><option value="Gasto">Gasto</option><option value="Transferencia">Transferencia</option><option value="Interés">Interés</option><option value="Abono">Abono</option><option value="Crédito">Crédito</option><option value="Ajuste">Ajuste</option>'}
        </select></div>
        <div><label class="label">Categoría *</label><select class="select" name="category" required>${e.map(c=>`<option value="${c}">${c}</option>`).join("")}</select></div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Monto *</label><input class="input" name="amount" type="number" step="0.01" min="0.01" required placeholder="1500000" /></div>
        <div><label class="label">Fecha *</label><input class="input" name="transaction_date" type="date" required value="${new Date().toISOString().split("T")[0]}" /></div>
      </div>
      <div><label class="label">Descripción *</label><input class="input" name="description" required placeholder="${i?"Pago servicios oficina":"Pago canon mes de marzo"}" /></div>
    </form>
  `,{confirmText:"Registrar",onConfirm:async()=>{const c=new FormData(document.getElementById("tx-form")),u={};c.forEach((g,v)=>{v==="amount"?u[v]=parseFloat(g):g&&(u[v]=g)}),i&&delete u.property_id,u.transaction_type==="Ingreso"?u.direction="Debit":u.transaction_type==="Gasto"&&(u.direction="Credit"),await p.post("/transactions",u),b(i?"Gasto registrado":"Transacción registrada","success"),await B(document.getElementById("page-content"))}}),window.lucide&&lucide.createIcons();const o=document.getElementById("tx-form"),d=o.querySelector('[name="property_id"]'),r=o.querySelector('[name="transaction_date"]'),l=o.querySelector('[name="category"]'),n=async()=>{const c=i?"GENERAL":d.value,u=r.value;if(!c||!u)return;const[g,v]=u.split("-").map(Number);try{let x=c;if(c==="GENERAL"){const C=(await p.get("/properties?limit=100")).items.find(T=>T.name==="Gastos Generales");C&&(x=C.id)}const y=await p.get(`/budgets?property_id=${x}&year=${g}&month=${v}`);if(y&&y.length>0){let T=y[0].categories.map(I=>I.category_name).map(I=>`<option value="${I}">${I} (Presupuestado)</option>`).join("");T+="<option disabled>──────────</option>",T+=e.map(I=>`<option value="${I}">${I}</option>`).join(""),l.innerHTML=T}else l.innerHTML=e.map(w=>`<option value="${w}">${w}</option>`).join("")}catch(x){console.warn("Could not fetch budget categories:",x),l.innerHTML=e.map(y=>`<option value="${y}">${y}</option>`).join("")}};d&&d.addEventListener("change",n),r.addEventListener("change",n),o.querySelector('[name="transaction_type"]').addEventListener("change",n),(i||d&&d.value)&&n()}function ne(a,s,i,t,e,o){const d=[...new Set([...ce,...pe])];h("Editar Transacción",`
    <form id="edit-tx-form" class="space-y-4">
      <div><label class="label">Descripción</label><input class="input" name="description" value="${s}" /></div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Categoría</label><select class="select" name="category">${d.map(r=>`<option value="${r}" ${r===i?"selected":""}>${r}</option>`).join("")}</select></div>
        <div><label class="label">Tipo</label><select class="select" name="transaction_type">
          ${["Ingreso","Gasto","Transferencia","Ajuste","Interés","Abono","Crédito"].map(r=>`<option value="${r}" ${r===e?"selected":""}>${r}</option>`).join("")}
        </select></div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Monto</label><input class="input" name="amount" type="number" step="0.01" value="${t}" /></div>
        <div><label class="label">Fecha</label><input class="input" name="transaction_date" type="date" value="${o}" /></div>
      </div>
    </form>
  `,{confirmText:"Guardar",onConfirm:async()=>{const r=new FormData(document.getElementById("edit-tx-form")),l={};r.forEach((n,c)=>{c==="amount"?l[c]=parseFloat(n):n&&(l[c]=n)}),await p.put(`/transactions/${a}`,l),b("Transacción actualizada","success"),await B(document.getElementById("page-content"))}})}function oe(a,s){h("Eliminar Transacción",`
    <div class="text-center py-4">
      <div class="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i data-lucide="alert-triangle" class="w-8 h-8 text-rose-500"></i>
      </div>
      <p class="text-surface-700 font-medium mb-2">¿Eliminar esta transacción?</p>
      <p class="text-sm text-surface-400 italic mb-2">"${s}"</p>
      <p class="text-xs text-rose-500">El saldo de la cuenta será ajustado automáticamente.</p>
    </div>
  `,{confirmText:"Eliminar",onConfirm:async()=>{await p.delete(`/transactions/${a}`),b("Transacción eliminada","success"),await B(document.getElementById("page-content"))}}),window.lucide&&lucide.createIcons()}function Be(a){h("Transferencia entre Cuentas",`
    <form id="transfer-form" class="space-y-4">
      <div><label class="label">Cuenta Origen *</label><select class="select" name="source_account_id" required>${a.map(s=>`<option value="${s.id}">${s.account_name} (${f(s.current_balance)})</option>`).join("")}</select></div>
      <div><label class="label">Cuenta Destino *</label><select class="select" name="destination_account_id" required>${a.map(s=>`<option value="${s.id}">${s.account_name}</option>`).join("")}</select></div>
      <div><label class="label">Monto *</label><input class="input" name="amount" type="number" step="0.01" required placeholder="500000" /></div>
      <div><label class="label">Descripción *</label><input class="input" name="description" required placeholder="Traslado de fondos" /></div>
      <div><label class="label">Fecha *</label><input class="input" name="transaction_date" type="date" required value="${new Date().toISOString().split("T")[0]}" /></div>
    </form>
  `,{confirmText:"Transferir",onConfirm:async()=>{const s=new FormData(document.getElementById("transfer-form")),i={};if(s.forEach((t,e)=>{e==="amount"?i[e]=parseFloat(t):i[e]=t}),i.source_account_id===i.destination_account_id){b("Las cuentas deben ser diferentes","error");return}await p.post("/accounts/transfer",i),b("Transferencia completada","success"),await B(document.getElementById("page-content"))}})}async function Ae(a){if(!a)return;const s=document.getElementById("performance-content");s.innerHTML='<div class="flex items-center justify-center py-12"><div class="animate-spin rounded-full h-8 w-8 border-2 border-accent-500 border-t-transparent"></div><p class="ml-3 text-surface-500">Calculando métricas...</p></div>';const i=await p.get(`/properties/${a}/performance`);if(!i)return;const t=i.total_income>0||i.total_expenses>0;s.innerHTML=`
    <div class="animate-fade-in">
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-surface-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center"><i data-lucide="building-2" class="w-5 h-5 text-primary-600"></i></div>
          <div>
            <h4 class="font-bold text-surface-900">${i.property_name}</h4>
            <span class="badge ${i.property_status==="Arrendada"?"badge-green":"badge-blue"} text-xs">${i.property_status||"Sin estado"}</span>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm">
          <p class="text-xs font-bold text-surface-400 uppercase mb-2">Ingresos</p>
          <p class="text-2xl font-bold text-accent-600">${f(i.total_income)}</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm">
          <p class="text-xs font-bold text-surface-400 uppercase mb-2">Gastos</p>
          <p class="text-2xl font-bold text-rose-600">${f(i.total_expenses)}</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm">
          <p class="text-xs font-bold text-surface-400 uppercase mb-2">Utilidad</p>
          <p class="text-2xl font-bold ${i.net_profit>=0?"text-primary-600":"text-rose-600"}">${f(i.net_profit)}</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm">
          <p class="text-xs font-bold text-surface-400 uppercase mb-2">ROI</p>
          <p class="text-2xl font-bold text-indigo-600">${i.roi}%</p>
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
          ${t?`
            ${Object.entries(i.income_by_category||{}).map(([d,r])=>`<div class="flex justify-between text-sm mb-1"><span>${d}</span><span class="text-accent-600">+${f(r)}</span></div>`).join("")}
            <div class="border-t border-surface-100 my-3"></div>
            ${Object.entries(i.expense_by_category||{}).map(([d,r])=>`<div class="flex justify-between text-sm mb-1"><span>${d}</span><span class="text-rose-600">-${f(r)}</span></div>`).join("")}
          `:'<p class="text-surface-400 text-center py-4">Sin datos</p>'}
        </div>
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h4 class="text-sm font-bold text-surface-900 mb-4">Últimos Movimientos</h4>
          <div class="overflow-x-auto"><table class="data-table text-xs"><thead><tr><th>Fecha</th><th>Descripción</th><th>Monto</th></tr></thead><tbody>
            ${(i.last_transactions||[]).length>0?i.last_transactions.map(d=>`<tr><td class="text-surface-500">${_(d.transaction_date)}</td><td class="font-medium">${d.description}</td><td class="font-bold ${d.direction==="Debit"?"text-accent-600":"text-rose-600"}">${d.direction==="Debit"?"+":"-"}${f(d.amount)}</td></tr>`).join(""):'<tr><td colspan="3" class="text-center py-4 text-surface-400">Sin movimientos</td></tr>'}
          </tbody></table></div>
        </div>
      </div>
    </div>
  `,window.lucide&&lucide.createIcons();const e=document.getElementById("property-mini-chart");e&&t&&new Chart(e,{type:"doughnut",data:{labels:["Ingresos","Gastos"],datasets:[{data:[i.total_income,i.total_expenses],backgroundColor:["#20c997","#f03e3e"],borderWidth:0,cutout:"75%"}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}}}});const o=document.getElementById("property-cashflow-chart");if(o&&i.monthly_cashflow){const d=i.monthly_cashflow;new Chart(o,{type:"bar",data:{labels:d.map(r=>r.month),datasets:[{label:"Ingresos",data:d.map(r=>r.income),backgroundColor:"rgba(32,201,151,0.7)",borderRadius:6,barPercentage:.6},{label:"Gastos",data:d.map(r=>r.expenses),backgroundColor:"rgba(240,62,62,0.7)",borderRadius:6,barPercentage:.6}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"top",labels:{usePointStyle:!0,font:{size:10}}}},scales:{y:{beginAtZero:!0,ticks:{font:{size:10},callback:r=>"$"+(r>=1e6?(r/1e6).toFixed(1)+"M":r>=1e3?(r/1e3).toFixed(0)+"K":r)},grid:{color:"rgba(0,0,0,0.04)"}},x:{ticks:{font:{size:9}},grid:{display:!1}}}}})}}async function Se(){const[a,s]=await Promise.all([p.get("/reports/balance-sheet"),p.get(`/reports/income-statement?start_date=${new Date().getFullYear()}-01-01&end_date=${new Date().toISOString().split("T")[0]}`)]);a&&(document.getElementById("balance-sheet-container").innerHTML=`
      <h3 class="font-bold mb-4 flex items-center justify-between">Balance General <span class="text-xs font-normal text-surface-400">${_(a.date)}</span></h3>
      <div class="space-y-3">
        ${a.accounts.map(i=>`<div class="flex justify-between text-sm py-2 border-b border-surface-50"><span class="text-surface-600">${i.account_name}</span><span class="font-semibold">${f(i.current_balance)}</span></div>`).join("")}
        <div class="flex justify-between text-lg font-bold pt-4 text-primary-600"><span>Total Activos</span><span>${f(a.total_assets)}</span></div>
      </div>
    `),s&&(document.getElementById("income-statement-container").innerHTML=`
      <h3 class="font-bold mb-4">Estado de Resultados (Año Actual)</h3>
      <div class="space-y-4">
        <div><p class="text-xs font-bold text-surface-400 uppercase mb-2">Ingresos</p>${Object.entries(s.income).map(([i,t])=>`<div class="flex justify-between text-sm mb-1"><span>${i}</span><span class="text-accent-600">+${f(t)}</span></div>`).join("")}</div>
        <div><p class="text-xs font-bold text-surface-400 uppercase mb-2">Egresos</p>${Object.entries(s.expenses).map(([i,t])=>`<div class="flex justify-between text-sm mb-1"><span>${i}</span><span class="text-rose-600">-${f(t)}</span></div>`).join("")}</div>
        <div class="border-t border-surface-100 pt-3"><div class="flex justify-between text-lg font-bold ${s.net_income>=0?"text-accent-600":"text-rose-600"}"><span>Utilidad Neta</span><span>${f(s.net_income)}</span></div></div>
      </div>
    `)}async function Me(a,s){const{jsPDF:i}=window.jspdf,t=new i;t.setFillColor(66,99,235),t.rect(0,0,210,35,"F"),t.setTextColor(255),t.setFontSize(20),t.text("PMS — Informe Financiero",14,20),t.setFontSize(10),t.text(`Generado: ${new Date().toLocaleDateString("es-CO")}`,14,28),t.setTextColor(0),t.setFontSize(14),t.text("Cuentas Bancarias",14,45),t.autoTable({startY:50,head:[["Cuenta","Tipo","Banco","Moneda","Saldo"]],body:a.map(n=>[n.account_name,n.account_type,n.bank_name||"-",n.currency,f(n.current_balance)]),theme:"striped",headStyles:{fillColor:[66,99,235]},styles:{fontSize:9}});const e=t.lastAutoTable.finalY+15;t.setFontSize(14),t.text("Últimas Transacciones",14,e),t.autoTable({startY:e+5,head:[["Fecha","Descripción","Categoría","Tipo","Monto"]],body:s.map(n=>[n.transaction_date,n.description.substring(0,40),n.category,n.transaction_type,`${n.direction==="Debit"?"+":"-"}${f(n.amount)}`]),theme:"striped",headStyles:{fillColor:[66,99,235]},styles:{fontSize:8}});const o=s.filter(n=>n.direction==="Debit").reduce((n,c)=>n+c.amount,0),d=s.filter(n=>n.direction==="Credit").reduce((n,c)=>n+c.amount,0),r=t.lastAutoTable.finalY+15;t.setFontSize(12),t.setTextColor(32,201,151),t.text(`Total Ingresos: ${f(o)}`,14,r),t.setTextColor(240,62,62),t.text(`Total Gastos: ${f(d)}`,14,r+8),t.setTextColor(66,99,235),t.text(`Resultado Neto: ${f(o-d)}`,14,r+16);const l=t.internal.getNumberOfPages();for(let n=1;n<=l;n++)t.setPage(n),t.setFontSize(8),t.setTextColor(150),t.text(`PMS — Property Management System | Página ${n} de ${l}`,105,290,{align:"center"});t.save(`informe_financiero_${new Date().toISOString().split("T")[0]}.pdf`),b("PDF generado y descargado","success")}async function De(a){h("Analizando CSV...",`
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
      <p class="ml-3 text-surface-500">Analizando archivo...</p>
    </div>
  `,{showCancel:!1});let s;try{const n=new FormData;n.append("file",a),s=await p.upload("/transactions/import/analyze",n)}catch(n){b(`Error al analizar: ${n.message}`,"error");return}const{total_rows:i,transfers_skipped:t,new_accounts:e,existing_accounts:o,detected_labels:d,category_mapping:r}=s,l=d.length>0?d.map(n=>`
    <label class="flex items-center gap-3 p-3 rounded-xl border border-surface-100 hover:bg-surface-50 transition cursor-pointer">
      <input type="checkbox" class="import-label-check w-4 h-4 rounded text-indigo-500" value="${n.label}" ${n.suggested_apartment?"checked":""} ${n.already_exists?"checked disabled":""} />
      <div class="flex-1 min-w-0">
        <span class="font-medium text-surface-800 text-sm">${n.label}</span>
        <span class="text-xs text-surface-400 ml-2">(${n.transaction_count} tx)</span>
      </div>
      ${n.already_exists?'<span class="badge badge-green text-xs">Existe</span>':n.suggested_apartment?'<span class="badge badge-blue text-xs">Sugerido</span>':'<span class="badge badge-amber text-xs">General</span>'}
    </label>
  `).join(""):'<p class="text-surface-400 text-sm py-4 text-center">No se detectaron labels</p>';h("Importación de Transacciones",`
    <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-indigo-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-indigo-600">${i}</p><p class="text-xs text-indigo-400">Transacciones</p></div>
        <div class="bg-amber-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-amber-600">${t}</p><p class="text-xs text-amber-400">Omitidas</p></div>
        <div class="bg-purple-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-purple-600">${d.length}</p><p class="text-xs text-purple-400">Labels</p></div>
      </div>
      ${e.length>0?`<div class="bg-blue-50 border border-blue-200 rounded-xl p-4"><p class="text-sm font-bold text-blue-700 mb-2">Cuentas nuevas (${e.length})</p>${e.map(n=>`<div class="flex justify-between text-sm"><span class="text-blue-600">${n.name}</span><span class="text-blue-400">${n.transaction_count} tx</span></div>`).join("")}</div>`:""}
      ${o.length>0?`<div class="bg-green-50 border border-green-200 rounded-xl p-4"><p class="text-sm font-bold text-green-700 mb-2">Cuentas existentes (${o.length})</p>${o.map(n=>`<div class="flex justify-between text-sm"><span class="text-green-600">${n.name}</span><span class="text-green-400">${n.transaction_count} tx</span></div>`).join("")}</div>`:""}
      ${Object.keys(r).length>0?`<details class="bg-surface-50 border border-surface-200 rounded-xl p-4"><summary class="text-sm font-bold text-surface-700 cursor-pointer">Mapeo categorías (${Object.keys(r).length})</summary><div class="mt-3 space-y-1 max-h-40 overflow-y-auto">${Object.entries(r).map(([n,c])=>`<div class="flex justify-between text-xs py-1 border-b border-surface-100"><span>${n}</span><span class="text-indigo-600">→ ${c}</span></div>`).join("")}</div></details>`:""}
      <div>
        <p class="text-sm font-bold text-surface-700 mb-3">¿Cuáles labels son apartamentos?</p>
        <p class="text-xs text-surface-400 mb-3">Los seleccionados se crean como propiedades.</p>
        <div class="space-y-2 max-h-60 overflow-y-auto">${l}</div>
      </div>
    </div>
  `,{confirmText:"Importar Transacciones",onConfirm:async()=>{const n=document.querySelectorAll(".import-label-check:checked"),c=Array.from(n).map(v=>v.value),u=new FormData;u.append("file",a);const g=encodeURIComponent(c.join(","));try{const v=await p.upload(`/transactions/import/confirm?confirmed_labels=${g}`,u);let x=`✅ ${v.imported} transacciones importadas.`;v.accounts_created.length>0&&(x+=` 📁 Cuentas: ${v.accounts_created.join(", ")}`),v.properties_created.length>0&&(x+=` 🏠 Propiedades: ${v.properties_created.join(", ")}`),v.errors.length>0&&(x+=` ⚠️ ${v.errors.length} errores`),b(x,"success"),await B(document.getElementById("page-content"))}catch(v){b(`Error al importar: ${v.message}`,"error")}}}),window.lucide&&lucide.createIcons()}async function H(a,s){const t=(await p.get("/maintenance?limit=50")).items||[];a.innerHTML=`
    <div class="flex items-center justify-between mb-6 animate-fade-in">
      <div class="flex items-center gap-3">
        <select id="fm-status" class="select text-sm py-2 w-44">
          <option value="">Todos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En Progreso">En Progreso</option>
          <option value="Completado">Completado</option>
          <option value="Cancelado">Cancelado</option>
        </select>
      </div>
      <button id="add-maint-btn" class="btn-primary"><i data-lucide="plus" class="w-4 h-4"></i> Nueva Orden</button>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-in">
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-amber-500">${t.filter(e=>e.status==="Pendiente").length}</p>
        <p class="text-xs text-surface-500 mt-1">Pendientes</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-primary-500">${t.filter(e=>e.status==="En Progreso").length}</p>
        <p class="text-xs text-surface-500 mt-1">En Progreso</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-accent-500">${t.filter(e=>e.status==="Completado").length}</p>
        <p class="text-xs text-surface-500 mt-1">Completados</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-rose-500">${f(t.reduce((e,o)=>e+(o.actual_cost||0),0))}</p>
        <p class="text-xs text-surface-500 mt-1">Costo Total</p>
      </div>
    </div>
    <div class="glass-card-static overflow-hidden animate-fade-in mb-8">
      <table class="data-table"><thead><tr>
        <th></th><th>Título</th><th>Tipo</th><th>Prioridad</th><th>Estado</th><th>Costo Est.</th><th>Fecha</th><th></th>
      </tr></thead><tbody>
      ${t.length?t.map(e=>`<tr>
        <td class="w-12">
            ${e.photos&&e.photos.length>0?`<div class="relative group cursor-pointer" onclick="viewPhotos('${e.id}')">
                    <img src="${p.baseUrl.replace("/api/v1","")}/${e.photos[0].photo_path}" class="w-10 h-10 rounded object-cover border border-surface-200" />
                    <span class="absolute -top-2 -right-2 bg-primary-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">${e.photos.length}</span>
                </div>`:'<div class="w-10 h-10 rounded bg-surface-100 flex items-center justify-center text-surface-400"><i data-lucide="image" class="w-5 h-5"></i></div>'}
        </td>
        <td><div class="font-semibold text-sm">${e.title}</div>${e.supplier_name?`<div class="text-xs text-surface-400">${e.supplier_name}</div>`:""}</td>
        <td><span class="badge badge-gray text-xs">${e.maintenance_type}</span></td>
        <td><span class="badge ${e.priority==="Urgente"?"badge-red":e.priority==="Alta"?"badge-amber":"badge-gray"} text-xs">${e.priority}</span></td>
        <td><span class="badge ${O(e.status)} text-xs">${e.status}</span></td>
        <td class="text-sm">${f(e.estimated_cost)}</td>
        <td class="text-xs text-surface-500">${_(e.scheduled_date)}</td>
        <td>
            <div class="flex gap-1 justify-end">
                <button class="btn-ghost text-xs py-1 px-2 edit-btn" data-id="${e.id}" title="Editar orden"><i data-lucide="edit-3" class="w-3.5 h-3.5"></i></button>
                ${e.status!=="Completado"&&e.status!=="Cancelado"?`<button class="btn-ghost text-xs py-1 px-2 status-btn" data-id="${e.id}" title="Cambiar estado"><i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></button>`:""}
            </div>
        </td>
      </tr>`).join(""):'<tr><td colspan="7" class="text-center py-12 text-surface-400">No hay órdenes</td></tr>'}
      </tbody></table>
    </div>
    `,window.lucide&&lucide.createIcons(),document.getElementById("add-maint-btn").addEventListener("click",async()=>await Fe()),document.querySelectorAll(".status-btn").forEach(e=>e.addEventListener("click",()=>Oe(e.dataset.id))),document.querySelectorAll(".edit-btn").forEach(e=>e.addEventListener("click",()=>qe(e.dataset.id)))}window.viewPhotos=async a=>{const s=await p.get(`/maintenance/${a}`);if(!s.photos||s.photos.length===0)return;const i=p.baseUrl.replace("/api/v1","");h("Evidencia Fotográfica",`
      <div class="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
        ${s.photos.map(t=>`
          <div class="space-y-2">
            <img src="${i}/${t.photo_path}" class="w-full rounded-lg border border-surface-200 cursor-zoom-in" onclick="window.open('${i}/${t.photo_path}', '_blank')" />
            <p class="text-[10px] text-surface-400 text-center">${_(t.uploaded_at)}</p>
          </div>
        `).join("")}
      </div>
    `,{confirmText:"Cerrar"})};async function Fe(){let a='<option value="">Cargando propiedades...</option>';try{const s=await p.get("/properties?limit=100");s.items&&s.items.length>0?a=s.items.map(i=>`<option value="${i.id}">${i.name} (ID: ${i.id.split("-")[0]})</option>`).join(""):a='<option value="">No hay propiedades disponibles</option>'}catch{a='<option value="">Error al cargar propiedades</option>'}h("Nueva Orden",`<form id="mf" class="space-y-4">
    <div><label class="label">Propiedad *</label><select class="select" name="property_id" required>${a}</select></div>
    <div><label class="label">Título *</label><input class="input" name="title" required placeholder="Reparación tubería" /></div>
    <div class="grid grid-cols-2 gap-4">
      <div><label class="label">Tipo *</label><select class="select" name="maintenance_type"><option value="Correctivo">Correctivo</option><option value="Preventivo">Preventivo</option><option value="Mejora">Mejora</option></select></div>
      <div><label class="label">Prioridad</label><select class="select" name="priority"><option value="Media">Media</option><option value="Baja">Baja</option><option value="Alta">Alta</option><option value="Urgente">Urgente</option></select></div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div><label class="label">Costo Est.</label><input class="input" name="estimated_cost" type="number" step="0.01" /></div>
      <div><label class="label">Fecha</label><input class="input" name="scheduled_date" type="date" /></div>
    </div>
    <div><label class="label">Proveedor</label><input class="input" name="supplier_name" /></div>
    <div><label class="label">Notas</label><textarea class="input" name="notes" rows="2"></textarea></div>
  </form>`,{confirmText:"Crear",onConfirm:async()=>{const s=new FormData(document.getElementById("mf")),i={};s.forEach((t,e)=>{t&&(i[e]=e==="estimated_cost"?parseFloat(t):t)}),await p.post("/maintenance",i),b("Orden creada","success"),await H(document.getElementById("page-content"),state)}})}async function qe(a){const s=await p.get(`/maintenance/${a}`);h("Editar Orden",`<form id="ef" class="space-y-4">
    <div><label class="label">Título *</label><input class="input" name="title" required value="${s.title}" /></div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="label">Tipo *</label>
        <select class="select" name="maintenance_type">
            <option value="Correctivo" ${s.maintenance_type==="Correctivo"?"selected":""}>Correctivo</option>
            <option value="Preventivo" ${s.maintenance_type==="Preventivo"?"selected":""}>Preventivo</option>
            <option value="Mejora" ${s.maintenance_type==="Mejora"?"selected":""}>Mejora</option>
        </select>
      </div>
      <div>
        <label class="label">Prioridad</label>
        <select class="select" name="priority">
            <option value="Baja" ${s.priority==="Baja"?"selected":""}>Baja</option>
            <option value="Media" ${s.priority==="Media"?"selected":""}>Media</option>
            <option value="Alta" ${s.priority==="Alta"?"selected":""}>Alta</option>
            <option value="Urgente" ${s.priority==="Urgente"?"selected":""}>Urgente</option>
        </select>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="label">Estado *</label>
        <select class="select" name="status">
            <option value="Pendiente" ${s.status==="Pendiente"?"selected":""}>Pendiente</option>
            <option value="En Progreso" ${s.status==="En Progreso"?"selected":""}>En Progreso</option>
            <option value="Esperando Factura" ${s.status==="Esperando Factura"?"selected":""}>Esperando Factura</option>
            <option value="Completado" ${s.status==="Completado"?"selected":""}>Completado</option>
            <option value="Cancelado" ${s.status==="Cancelado"?"selected":""}>Cancelado</option>
        </select>
      </div>
      <div><label class="label">Fecha</label><input class="input" name="scheduled_date" type="date" value="${s.scheduled_date||""}" /></div>
    </div>
    <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Costo Est.</label><input class="input" name="estimated_cost" type="number" step="0.01" value="${s.estimated_cost||""}" /></div>
        <div><label class="label">Costo Real</label><input class="input" name="actual_cost" type="number" step="0.01" value="${s.actual_cost||""}" /></div>
    </div>
    <div><label class="label">Proveedor</label><input class="input" name="supplier_name" value="${s.supplier_name||""}" /></div>
    <div><label class="label">Notas</label><textarea class="input" name="notes" rows="3">${s.notes||""}</textarea></div>
  </form>`,{confirmText:"Guardar Cambios",onConfirm:async()=>{const i=new FormData(document.getElementById("ef")),t={};i.forEach((e,o)=>{o==="estimated_cost"||o==="actual_cost"?t[o]=e?parseFloat(e):null:e&&(t[o]=e)}),await p.put(`/maintenance/${a}`,t),b("Orden actualizada correctamente","success"),await H(document.getElementById("page-content"),state)}})}function Oe(a){h("Cambiar Estado",`<form id="sf" class="space-y-4">
    <div><label class="label">Estado *</label><select class="select" name="status">
      <option value="Pendiente">Pendiente</option><option value="En Progreso">En Progreso</option>
      <option value="Esperando Factura">Esperando Factura</option><option value="Completado">Completado</option>
      <option value="Cancelado">Cancelado</option></select></div>
    <div><label class="label">Notas</label><textarea class="input" name="notes" rows="2"></textarea></div>
  </form>`,{confirmText:"Actualizar",onConfirm:async()=>{const s=new FormData(document.getElementById("sf")),i={status:s.get("status")};s.get("notes")&&(i.notes=s.get("notes")),await p.put(`/maintenance/${a}/status`,i),b("Estado actualizado","success"),await H(document.getElementById("page-content"),state)}})}async function G(a){const[s,i]=await Promise.all([p.get("/contracts?limit=50"),p.get("/properties?limit=100")]),t=s.items||[],e=i.items||[];a.innerHTML=`
    <div class="space-y-6 animate-fade-in">
        <div class="flex border-b border-surface-200 mb-4">
            <button class="tab-btn active px-4 py-2 text-primary-600 border-b-2 border-primary-600 font-medium" data-tab="list">Contratos</button>
            <button class="tab-btn px-4 py-2 text-surface-500 hover:text-surface-700 font-medium" data-tab="tenants">Inquilinos</button>
        </div>
        <div id="contracts-tab-content"><!-- Content --></div>
    </div>
  `;const o=a.querySelector("#contracts-tab-content"),d=a.querySelectorAll(".tab-btn");d.forEach(r=>{r.addEventListener("click",()=>{d.forEach(l=>{l.classList.remove("active","text-primary-600","border-primary-600","border-b-2"),l.classList.add("text-surface-500")}),r.classList.remove("text-surface-500"),r.classList.add("active","text-primary-600","border-primary-600","border-b-2"),r.dataset.tab==="list"?re(o,t,e,a):Ge(o,t)})}),re(o,t,e,a)}function re(a,s,i,t){a.innerHTML=`
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
      ${s.length?s.map(e=>`<tr>
        <td>
          <div class="font-bold text-surface-900">${e.tenant_name}</div>
          ${e.tenant_email?`<div class="text-[10px] text-surface-400 font-medium">${e.tenant_email}</div>`:""}
        </td>
        <td>
          <div class="font-bold text-primary-600 text-xs">${e.property_name||"Sin asignar"}</div>
          <div class="text-[10px] text-surface-400 italic truncate max-w-[150px]">${e.property_address||""}</div>
        </td>
        <td>
          <span class="badge badge-gray text-[10px] mr-1">${e.contract_type}</span>
          <div class="font-black text-accent-700 mt-0.5">${f(e.monthly_rent)}</div>
        </td>
        <td class="text-xs text-surface-500 font-medium whitespace-nowrap">
          ${_(e.start_date)} <span class="text-surface-300">→</span> ${_(e.end_date)}
        </td>
        <td><span class="badge ${O(e.status)} text-[10px] font-bold">${e.status}</span></td>
        <td class="text-right"><div class="flex justify-end gap-1">
          ${e.status==="Borrador"||e.status==="Firmado"?`
            <button class="btn-ghost text-xs p-1.5 activate-btn hover:bg-accent-50 rounded-lg group" data-id="${e.id}" title="Activar Contrato">
              <i data-lucide="check-circle" class="w-4 h-4 text-accent-500 group-hover:scale-110 transition-transform"></i>
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
    </div>`,window.lucide&&lucide.createIcons(),document.getElementById("add-contract-btn").addEventListener("click",()=>Ne(i,t)),document.querySelectorAll(".activate-btn").forEach(e=>e.addEventListener("click",async()=>{try{await p.post(`/contracts/${e.dataset.id}/activate`,{}),b("Contrato activado y cronograma de pagos generado","success"),await G(t||document.getElementById("page-content"))}catch(o){b(o.message||"Error al activar contrato","error")}})),document.querySelectorAll(".download-btn").forEach(e=>e.addEventListener("click",async()=>{var o,d;try{b("Generando PDF...","info");const r=((d=(o=p.opts)==null?void 0:o.baseUrl)==null?void 0:d.replace("/api/v1",""))||"",l=localStorage.getItem("access_token")||"",n=`${r}/api/v1/contracts/${e.dataset.id}/download`,c=await fetch(n,{headers:{Authorization:`Bearer ${l}`}});if(!c.ok)throw new Error("Error generando PDF");const u=await c.blob(),g=document.createElement("a");g.href=URL.createObjectURL(u),g.download=`contrato_${e.dataset.id.slice(0,8)}.pdf`,g.click(),URL.revokeObjectURL(g.href)}catch(r){b(r.message||"No se pudo descargar el PDF","error")}})),document.querySelectorAll(".pdf-btn").forEach(e=>e.addEventListener("click",()=>{const o=new Date().toISOString().split("T")[0];h("Generar Carta de Terminación",`
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
      `,{confirmText:"Generar PDF",onConfirm:async()=>{var n,c;const d=new FormData(document.getElementById("pdf-form")),r=Object.fromEntries(d),l=await p.post(`/contracts/${e.dataset.id}/termination-letter`,r);if(b("PDF Generado","success"),l.pdf_url){const u=((c=(n=p.opts)==null?void 0:n.baseUrl)==null?void 0:c.replace("/api/v1",""))||"";window.open(u+l.pdf_url,"_blank")}}})})),document.querySelectorAll(".payments-btn").forEach(e=>e.addEventListener("click",async()=>{var c;const[o,d]=await Promise.all([p.get(`/contracts/${e.dataset.id}/payments`),p.get("/accounts")]),r=d.items||d||[],l=u=>u==="Pagado"?"badge-green":u==="Vencido"?"badge-red":"badge-yellow";let n=null;h("Cronograma de Pagos",`
      <div class="space-y-4">
        <div class="max-h-80 overflow-y-auto border border-surface-100 rounded-xl">
          <table class="data-table text-xs">
            <thead class="sticky top-0 bg-white z-10 shadow-sm">
              <tr><th>Fecha</th><th>Monto</th><th>Estado</th><th class="text-right">Acción</th></tr>
            </thead>
            <tbody>
              ${o.map(u=>`
                <tr class="hover:bg-surface-50">
                  <td class="font-medium">${_(u.due_date)}</td>
                  <td class="font-black text-accent-700">${f(u.amount)}</td>
                  <td><span class="badge ${l(u.status)} text-[10px] uppercase font-bold">${u.status}</span></td>
                  <td class="text-right">
                    ${u.status==="Pendiente"?`
                      <button class="btn-primary py-1 px-3 text-[10px] pay-payment-btn"
                        data-pid="${u.id}" data-cid="${e.dataset.id}" data-amount="${u.amount}">
                        PAGAR
                      </button>
                    `:u.status==="Pagado"?'<i data-lucide="check-circle" class="w-4 h-4 text-accent-500 ml-auto inline-block"></i>':""}
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div id="payment-receipt-box" class="hidden p-4 bg-primary-50 border border-primary-100 rounded-xl animate-fade-in">
          <h5 class="text-xs font-bold text-primary-900 mb-2 uppercase tracking-tight">Confirmar Recepción de Pago</h5>
          <div class="flex flex-col gap-3">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-bold text-primary-700 mb-1 uppercase">Cuenta de Destino</label>
                <select id="pay-account-id" class="select text-xs py-1.5 w-full">
                  ${r.length?r.map(u=>`<option value="${u.id}">${u.account_name} (${f(u.current_balance)})</option>`).join(""):'<option value="" disabled>No hay cuentas disponibles</option>'}
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-bold text-primary-700 mb-1 uppercase">Monto a Pagar</label>
                <input id="pay-amount" type="number" step="0.01" class="input text-xs py-1.5 w-full" value="" />
              </div>
            </div>
            <button id="confirm-pay-btn" class="btn-primary w-full py-2">Confirmar Pago</button>
          </div>
        </div>
      </div>
    `,{showCancel:!1}),window.lucide&&lucide.createIcons(),document.querySelectorAll(".pay-payment-btn").forEach(u=>u.addEventListener("click",()=>{n={pid:u.dataset.pid,cid:u.dataset.cid,amount:u.dataset.amount},document.getElementById("payment-receipt-box").classList.remove("hidden"),document.getElementById("pay-amount").value=n.amount,document.querySelectorAll(".pay-payment-btn").forEach(g=>g.closest("tr").classList.remove("bg-primary-50")),u.closest("tr").classList.add("bg-primary-50")})),(c=document.getElementById("confirm-pay-btn"))==null||c.addEventListener("click",async()=>{if(!n)return;const u=document.getElementById("pay-account-id").value,g=document.getElementById("pay-amount").value;if(!u){b("Seleccione una cuenta","error");return}try{await p.post(`/contracts/${n.cid}/payments/${n.pid}/pay?account_id=${u}&amount=${g}`,{}),b("✅ Pago registrado — transacción bancaria creada","success"),await G(t||document.getElementById("page-content"))}catch(v){b(v.message||"Error al registrar pago","error")}})}))}function Ne(a=[],s){const i=new Date().toISOString().split("T")[0];h("Nuevo Contrato",`<form id="cf" class="space-y-4">
    <div>
      <label class="label">Propiedad *</label>
      <select class="select" name="property_id" required>
        <option value="">Seleccione propiedad...</option>
        ${a.map(t=>`<option value="${t.id}">${t.name} (${t.property_type})</option>`).join("")}
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
    <div class="grid grid-cols-2 gap-4">
      <div><label class="label">Tipo *</label><select class="select" name="contract_type"><option value="Vivienda">Vivienda</option><option value="Comercial">Comercial</option><option value="Garaje">Garaje</option></select></div>
      <div><label class="label">Canon Mensual *</label><input class="input" name="monthly_rent" type="number" step="0.01" required /></div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div><label class="label">Inicio *</label><input class="input" name="start_date" type="date" required value="${i}" /></div>
      <div><label class="label">Fin *</label><input class="input" name="end_date" type="date" required /></div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div><label class="label">Depósito</label><input class="input" name="deposit_amount" type="number" step="0.01" /></div>
      <div><label class="label">Incremento Anual %</label><input class="input" name="annual_increment_pct" type="number" step="0.01" value="5" /></div>
    </div>
  </form>`,{confirmText:"Crear",onConfirm:async()=>{const t=new FormData(document.getElementById("cf")),e={};t.forEach((o,d)=>{o&&(e[d]=["monthly_rent","deposit_amount","annual_increment_pct"].includes(d)?parseFloat(o):o)}),e.auto_renewal=!1,await p.post("/contracts",e),b("Contrato creado en Borrador — use ✓ para activarlo","success"),await G(s||document.getElementById("page-content"))}})}function Ge(a,s){const i={};s.forEach(e=>{i[e.tenant_name]||(i[e.tenant_name]={name:e.tenant_name,email:e.tenant_email,phone:e.tenant_phone,document:e.tenant_document,active_contracts:0}),e.status==="Activo"&&i[e.tenant_name].active_contracts++});const t=Object.values(i);a.innerHTML=`
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        ${t.length?t.map(e=>`
            <div class="glass-card-static p-5 flex items-start gap-4">
                <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg shrink-0">
                    ${e.name.charAt(0)}
                </div>
                <div class="min-w-0 flex-1">
                    <h4 class="font-bold text-surface-900 truncate">${e.name}</h4>
                    <p class="text-xs text-surface-500 mt-1"><i data-lucide="mail" class="w-3 h-3 inline mr-1"></i>${e.email||"-"}</p>
                    <p class="text-xs text-surface-500 mt-1"><i data-lucide="phone" class="w-3 h-3 inline mr-1"></i>${e.phone||"-"}</p>
                    <p class="text-xs text-surface-500 mt-1"><i data-lucide="credit-card" class="w-3 h-3 inline mr-1"></i>${e.document||"-"}</p>
                    <div class="mt-3">
                        <span class="badge ${e.active_contracts>0?"badge-green":"badge-gray"} text-xs">
                            ${e.active_contracts} Contratos Activos
                        </span>
                    </div>
                </div>
            </div>
        `).join(""):'<div class="col-span-full py-12 text-center text-surface-500">No hay inquilinos registrados.</div>'}
        </div>
    `,window.lucide&&lucide.createIcons()}async function Re(a){a.innerHTML=`
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
            ${Array.from({length:12},(d,r)=>`<option value="${r+1}">${new Date(0,r).toLocaleString("es",{month:"long"})}</option>`).join("")}
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
  `,window.lucide&&lucide.createIcons();const[s,i]=await Promise.all([p.get("/properties?limit=100"),p.get("/properties?limit=1").then(d=>{var r;return((r=d.items.find(l=>l.name==="Gastos Generales"))==null?void 0:r.id)||"GENERAL"})]),t=s.items||[],e=document.getElementById("filter-property");t.filter(d=>d.id!==i).forEach(d=>{const r=document.createElement("option");r.value=d.id,r.textContent=d.name,e.appendChild(r)});const o=async()=>{const d=document.getElementById("budgets-table-container"),r=document.getElementById("filter-property").value,l=document.getElementById("filter-year").value,n=document.getElementById("filter-month").value,c=document.getElementById("filter-status").value;let u="/budgets?limit=100";r&&(u+=`&property_id=${r}`),l&&(u+=`&year=${l}`),n&&(u+=`&month=${n}`);try{const g=await p.get(u);let v=g;c&&(v=g.filter(x=>x.semaphore===c)),ue(d,v,t,i,o)}catch(g){d.innerHTML=`<div class="p-8 text-center text-rose-500">Error al cargar presupuestos: ${g.message}</div>`}};document.getElementById("apply-filters").addEventListener("click",o),document.getElementById("add-budget-btn").addEventListener("click",()=>me(t,null,o)),o()}function ue(a,s,i,t,e,o="",d=1){if(!s.length){a.innerHTML='<div class="py-20 text-center text-surface-400">No se encontraron presupuestos con los filtros seleccionados.</div>';return}a.innerHTML=`
    <table class="data-table">
      <thead>
        <tr>
          <th class="sortable cursor-pointer hover:bg-surface-100" data-sort="property">
            Propiedad ${o==="property"?`<i data-lucide="chevron-${d===1?"up":"down"}" class="w-3 h-3 inline ml-1"></i>`:'<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>'}
          </th>
          <th class="sortable cursor-pointer hover:bg-surface-100" data-sort="date">
            Periodo ${o==="date"?`<i data-lucide="chevron-${d===1?"up":"down"}" class="w-3 h-3 inline ml-1"></i>`:'<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>'}
          </th>
          <th class="sortable cursor-pointer hover:bg-surface-100" data-sort="status">
            Estado ${o==="status"?`<i data-lucide="chevron-${d===1?"up":"down"}" class="w-3 h-3 inline ml-1"></i>`:'<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>'}
          </th>
          <th class="sortable cursor-pointer hover:bg-surface-100" data-sort="budget">
            Presupuesto ${o==="budget"?`<i data-lucide="chevron-${d===1?"up":"down"}" class="w-3 h-3 inline ml-1"></i>`:'<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>'}
          </th>
          <th>Ejecutado</th>
          <th class="sortable cursor-pointer hover:bg-surface-100" data-sort="pct">
            % Ejecución ${o==="pct"?`<i data-lucide="chevron-${d===1?"up":"down"}" class="w-3 h-3 inline ml-1"></i>`:'<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>'}
          </th>
          <th class="text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${s.map(r=>{const l=i.find(c=>c.id===r.property_id);return`
          <tr class="hover:bg-surface-50 transition-colors">
            <td>
              <div class="font-semibold text-surface-900">${r.property_id===t?"Gastos Generales":l?l.name:"Unidad Borrada"}</div>
              <div class="text-[10px] text-surface-400 italic">${r.property_id.slice(0,8)}...</div>
            </td>
            <td>
              <span class="text-sm font-medium text-surface-700">${r.year} - ${new Date(0,r.month-1).toLocaleString("es",{month:"short",year:"numeric"}).toUpperCase()}</span>
            </td>
            <td>
              <div class="flex items-center gap-2">
                <span class="semaphore ${he(r.semaphore)}"></span>
                <span class="text-xs font-semibold ${r.semaphore==="Verde"?"text-green-600":r.semaphore==="Amarillo"?"text-amber-600":"text-red-600"}">${r.semaphore}</span>
              </div>
            </td>
            <td class="text-sm font-medium text-surface-900">${f(r.total_budget)}</td>
            <td class="text-sm font-medium text-surface-600">${f(r.total_executed)}</td>
            <td class="w-48">
              <div class="flex items-center gap-3">
                <div class="flex-1 bg-surface-100 rounded-full h-1.5 overflow-hidden">
                  <div class="h-full rounded-full ${r.semaphore==="Verde"?"bg-green-500":r.semaphore==="Amarillo"?"bg-amber-500":"bg-red-500"}" 
                    style="width: ${Math.min(r.execution_pct,100)}%"></div>
                </div>
                <span class="text-xs font-bold w-10">${Y(r.execution_pct)}</span>
              </div>
            </td>
            <td>
              <div class="flex justify-end gap-2">
                <a href="#/budget-report?property_id=${r.property_id}&year=${r.year}&month=${r.month}" 
                  class="p-2 rounded-lg hover:bg-primary-50 text-primary-600 transition" title="Ver Reporte Detallado">
                  <i data-lucide="bar-chart-3" class="w-4 h-4"></i>
                </a>
                <button class="edit-btn p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition" 
                  data-id="${r.id}" title="Editar">
                  <i data-lucide="edit-3" class="w-4 h-4"></i>
                </button>
                <button class="duplicate-btn p-2 rounded-lg hover:bg-surface-100 text-surface-500 transition" 
                  data-id="${r.id}" title="Duplicar">
                  <i data-lucide="copy" class="w-4 h-4"></i>
                </button>
                <button class="delete-budget-btn p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition" 
                  data-id="${r.id}" title="Eliminar">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </td>
          </tr>
        `}).join("")}
      </tbody>
    </table>
  `,window.lucide&&lucide.createIcons(),a.querySelectorAll("th.sortable").forEach(r=>{r.addEventListener("click",()=>{const l=r.dataset.sort;o===l?d*=-1:(o=l,d=1);const n=[...s].sort((c,u)=>{var x,y;let g,v;return l==="property"?(g=((x=i.find(w=>w.id===c.property_id))==null?void 0:x.name)||"",v=((y=i.find(w=>w.id===u.property_id))==null?void 0:y.name)||""):l==="date"?(g=c.year*100+c.month,v=u.year*100+u.month):l==="status"?(g=c.semaphore,v=u.semaphore):l==="budget"?(g=c.total_budget,v=u.total_budget):l==="pct"&&(g=c.execution_pct,v=u.execution_pct),(g>v?1:-1)*d});ue(a,n,i,t,e,l,d)})}),a.querySelectorAll(".edit-btn").forEach(r=>{r.addEventListener("click",async()=>{const l=s.find(n=>n.id===r.dataset.id);me(i,l,e)})}),a.querySelectorAll(".duplicate-btn").forEach(r=>{r.addEventListener("click",()=>{const l=s.find(n=>n.id===r.dataset.id);He(i,l,e)})}),a.querySelectorAll(".delete-budget-btn").forEach(r=>{r.addEventListener("click",async()=>{h("¿Eliminar Presupuesto?","Esta acción borrará el presupuesto de este periodo y sus categorías.",{confirmText:"Eliminar",onConfirm:async()=>{await p.delete(`/budgets/${r.dataset.id}`),b("Presupuesto eliminado","success"),e()}})})})}function me(a,s=null,i){const t=!!s,e=t?s.year:new Date().getFullYear(),o=t?s.month:new Date().getMonth()+1,d=a.map(c=>`<option value="${c.id}" ${t&&s.property_id===c.id?"selected":""}>${c.name}</option>`).join("");h(t?"Editar Presupuesto":"Nuevo Presupuesto",`
    <form id="bf" class="space-y-4">
      <div class="${t?"pointer-events-none opacity-60":""}">
        <label class="label">Propiedad *</label>
        <select class="select" name="property_id" required>
          <option value="GENERAL" ${t&&s.property_id==="GENERAL"?"selected":""}>Gastos Generales (Distribuible)</option>
          ${d}
        </select>
        ${t?'<p class="text-[10px] text-surface-400 mt-1">La propiedad y periodo no se pueden cambiar. Duplique el presupuesto si lo desea en otro lugar.</p>':""}
      </div>
      <div class="grid grid-cols-3 gap-4 items-end ${t?"pointer-events-none opacity-60":""}">
        <div><label class="label">Año *</label><input class="input" name="year" type="number" value="${e}" required /></div>
        <div><label class="label">Mes *</label><input class="input" name="month" type="number" min="1" max="12" value="${o}" required /></div>
        <div id="total-budget-container">
           <label class="label">Presupuesto *</label>
           <input class="input" name="total_budget" id="total_budget_input" type="number" step="0.01" value="${t?s.total_budget:""}" ${t&&s.auto_calculate_total?"disabled":""} />
        </div>
      </div>
      <div class="flex items-center gap-2 bg-primary-50 p-3 rounded-xl border border-primary-100">
        <input type="checkbox" id="auto_calculate_total" name="auto_calculate_total" class="w-4 h-4 rounded text-primary-600" ${t&&s.auto_calculate_total?"checked":""} />
        <div class="flex-1">
          <label for="auto_calculate_total" class="text-sm font-bold text-primary-900 cursor-pointer">Autocalcular total</label>
          <p class="text-[10px] text-primary-600">El total será la suma de los montos de cada categoría configurada.</p>
        </div>
      </div>

      ${t?"":`
      <div class="flex items-center gap-2 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
        <input type="checkbox" id="is_annual" name="is_annual" class="w-4 h-4 rounded text-indigo-600" />
        <div class="flex-1">
          <label for="is_annual" class="text-sm font-bold text-indigo-900 cursor-pointer">Presupuesto Anualizado</label>
          <p class="text-[10px] text-indigo-600">Se crearán 12 presupuestos (uno por mes) dividiendo los montos.</p>
        </div>
      </div>
      `}
      <div id="cats-container" class="pt-4 border-t border-surface-100">
        <div class="flex items-center justify-between mb-2">
          <label class="label mb-0">Categorías Detalladas</label>
          <button type="button" id="add-cat-btn" class="text-xs text-primary-600 font-bold hover:underline">+ Agregar</button>
        </div>
        <div class="space-y-2 max-h-48 overflow-y-auto pr-2" id="cats-list">
          ${t?s.categories.map(c=>le(c.category_name,c.budgeted_amount,c.is_distributable)).join(""):""}
        </div>
      </div>
      <div>
        <label class="label">Notas</label>
        <textarea class="textarea text-sm" name="notes" placeholder="Opcional...">${t&&s.notes||""}</textarea>
      </div>
    </form>
  `,{confirmText:t?"Guardar Cambios":"Crear Presupuesto",onConfirm:async()=>{var y;const c=document.getElementById("bf"),u=new FormData(c),g=document.getElementById("auto_calculate_total").checked,v=[];c.querySelectorAll(".cat-row").forEach(w=>{const C=w.querySelector('[name="cat_name"]').value,T=w.querySelector('[name="cat_amount"]').value,I=w.querySelector('[name="cat_dist"]').checked;C&&T&&v.push({category_name:C,budgeted_amount:parseFloat(T),is_distributable:I})});const x={property_id:u.get("property_id"),year:parseInt(u.get("year")),month:parseInt(u.get("month")),total_budget:g?0:parseFloat(u.get("total_budget"))||0,categories:v,auto_calculate_total:g,notes:u.get("notes")};t?(await p.put(`/budgets/${s.id}`,x),b("Presupuesto actualizado","success")):(x.is_annual=((y=document.getElementById("is_annual"))==null?void 0:y.checked)||!1,await p.post("/budgets",x),b("Presupuesto creado","success")),i&&i()}});const r=document.getElementById("auto_calculate_total"),l=document.getElementById("total_budget_input");r.addEventListener("change",()=>{l.disabled=r.checked,r.checked&&n()});const n=()=>{if(!r.checked)return;let c=0;document.querySelectorAll(".cat-row").forEach(u=>{c+=parseFloat(u.querySelector('[name="cat_amount"]').value||0)}),l.value=c};document.getElementById("add-cat-btn").addEventListener("click",()=>{const c=document.getElementById("cats-list"),u=document.createElement("div");u.innerHTML=le();const g=u.firstElementChild;c.appendChild(g),window.lucide&&lucide.createIcons(),g.querySelector('[name="cat_amount"]').addEventListener("input",n)}),document.querySelectorAll('.cat-row [name="cat_amount"]').forEach(c=>{c.addEventListener("input",n)}),window.lucide&&lucide.createIcons()}function le(a="",s="",i=!1){return`
    <div class="cat-row flex gap-2 items-center animate-fade-in group">
      <input class="input text-sm py-1.5 flex-1" name="cat_name" value="${a}" placeholder="Ej: Mantenimiento" />
      <input class="input text-sm py-1.5 w-40" name="cat_amount" type="number" step="0.01" value="${s}" placeholder="$" />
      <div class="flex items-center gap-1">
        <input type="checkbox" name="cat_dist" class="w-4 h-4" ${i?"checked":""} />
        <span class="text-[10px] text-surface-400">Dist.</span>
      </div>
      <button type="button" class="p-1.5 text-rose-300 hover:text-rose-600 transition" onclick="this.parentElement.remove(); document.dispatchEvent(new Event('catChange'));">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>
  `}document.addEventListener("catChange",()=>{const a=document.getElementById("auto_calculate_total");if(a&&a.checked){let s=0;document.querySelectorAll(".cat-row").forEach(t=>{s+=parseFloat(t.querySelector('[name="cat_amount"]').value||0)});const i=document.getElementById("total_budget_input");i&&(i.value=s)}});function He(a,s,i){const t=new Date().getFullYear(),e=a.map(o=>`<option value="${o.id}" ${s.property_id===o.id?"selected":""}>${o.name}</option>`).join("");h("Duplicar Periodo",`
    <form id="df" class="space-y-4">
      <div class="bg-indigo-50 p-3 rounded-xl border border-indigo-100 mb-4 flex gap-3 items-center">
        <i data-lucide="copy" class="w-5 h-5 text-indigo-600"></i>
        <p class="text-xs text-indigo-700">Copia este presupuesto a un nuevo mes/año con un ajuste opcional.</p>
      </div>
      
      <div>
        <label class="label">Propiedad Destino *</label>
        <select class="select" name="target_property_id" required>
          <option value="GENERAL" ${s.property_id==="GENERAL"?"selected":""}>Gastos Generales (Distribuible)</option>
          ${e}
        </select>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Año Destino *</label><input class="input" name="target_year" type="number" value="${t}" required /></div>
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
  `,{confirmText:"Procesar Duplicación",onConfirm:async()=>{const o=new FormData(document.getElementById("df")),d={target_year:parseInt(o.get("target_year")),target_month:parseInt(o.get("target_month")),target_property_id:o.get("target_property_id"),percentage_increase:parseFloat(o.get("percentage_increase")||0)};await p.post(`/budgets/${s.id}/duplicate`,d),b("Presupuesto duplicado","success"),i&&i()}}),window.lucide&&lucide.createIcons()}async function ze(a){const s=new URLSearchParams(window.location.hash.split("?")[1]||""),i=s.get("property_id"),t=s.get("year"),e=s.get("month");if(!i||!t||!e){a.innerHTML='<div class="p-12 text-center text-surface-500">Faltan parámetros para el reporte.</div>';return}const o=await p.get(`/budgets/report/${i}?year=${t}&month=${e}`),d=new Set;o.rows.forEach(l=>{Object.keys(l.distribution).forEach(n=>d.add(n))});const r=Array.from(d);a.innerHTML=`
    <div class="mb-6 flex items-center justify-between">
      <a href="#/budgets" class="btn-ghost text-sm"><i data-lucide="arrow-left" class="w-4 h-4 mr-1"></i> Volver</a>
      <div class="text-right">
        <h4 class="font-bold text-surface-900">Periodo: ${e}/${t}</h4>
      </div>
    </div>

    <div class="glass-card overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-surface-50 border-b border-surface-200">
            <th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Categoría</th>
            <th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Presupuestado</th>
            <th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Ejecutado Total</th>
            ${r.map(l=>`<th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">${l.slice(0,8)}...</th>`).join("")}
            <th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Diferencia</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-100">
          ${o.rows.length?o.rows.map(l=>{const n=l.budgeted-l.actual,c=n>=0?"text-green-600":"text-red-600";return`
              <tr class="hover:bg-surface-50/50 transition-colors">
                <td class="p-4 font-medium text-surface-700">
                  <div class="flex flex-col">
                    <span>${l.category}</span>
                    ${l.is_distributable?'<span class="text-[10px] text-primary-500 font-bold uppercase">Distribuible</span>':""}
                  </div>
                </td>
                <td class="p-4 text-surface-600 font-mono text-sm">${f(l.budgeted)}</td>
                <td class="p-4 text-surface-900 font-bold font-mono text-sm">${f(l.actual)}</td>
                ${r.map(u=>`
                  <td class="p-4 text-surface-500 font-mono text-xs">
                    ${l.distribution[u]?f(l.distribution[u]):"--"}
                  </td>
                `).join("")}
                <td class="p-4 font-bold font-mono text-sm ${c}">${f(n)}</td>
              </tr>
            `}).join(""):`<tr><td colspan="${4+r.length}" class="p-8 text-center text-surface-400">Sin datos para este periodo</td></tr>`}
        </tbody>
      </table>
    </div>

    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card-static p-4">
        <p class="text-xs text-surface-400 uppercase font-bold mb-1">Total Presupuesto</p>
        <p class="text-xl font-bold text-surface-900 font-mono">${f(o.rows.reduce((l,n)=>l+n.budgeted,0))}</p>
      </div>
      <div class="glass-card-static p-4">
        <p class="text-xs text-surface-400 uppercase font-bold mb-1">Total Ejecutado</p>
        <p class="text-xl font-bold text-primary-600 font-mono">${f(o.rows.reduce((l,n)=>l+n.actual,0))}</p>
      </div>
       <div class="glass-card-static p-4">
        <p class="text-xs text-surface-400 uppercase font-bold mb-1">Cumpimiento</p>
        <p class="text-xl font-bold text-surface-900 font-mono">
          ${Y(o.rows.reduce((l,n)=>l+n.actual,0)/(o.rows.reduce((l,n)=>l+n.budgeted,0)||1)*100)}
        </p>
      </div>
    </div>
  `,window.lucide&&lucide.createIcons()}async function Z(a,s){let i=[],t=[],e={items:[]};try{const[c,u,g]=await Promise.all([p.get("/assets").catch(v=>(console.error("Error fetching assets:",v),[])),p.get("/inspections").catch(v=>(console.error("Error fetching inspections:",v),[])),p.get("/properties?limit=100").catch(v=>(console.error("Error fetching properties:",v),{items:[]}))]);i=c||[],t=u||[],e=g||{items:[]}}catch(c){console.error("Unhandled error fetching facility data:",c)}const o=e.items||[];a.innerHTML=`
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
    `;const d=a.querySelector("#tab-content"),r=a.querySelectorAll(".tab-btn"),l=sessionStorage.getItem("facility_active_tab")||"assets";r.forEach(c=>{c.addEventListener("click",async()=>{r.forEach(u=>u.classList.remove("active")),c.classList.add("active"),sessionStorage.setItem("facility_active_tab",c.dataset.tab),await de(c.dataset.tab,d,{assets:i,inspections:t,properties:o})})});const n=a.querySelector(`.tab-btn[data-tab="${l}"]`);n&&(r.forEach(c=>c.classList.remove("active")),n.classList.add("active")),await de(l,d,{assets:i,inspections:t,properties:o})}async function de(a,s,i){s.innerHTML=`
        <div class="flex items-center justify-center py-20">
            <div class="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    `;try{switch(a){case"assets":Ue(s,i);break;case"inspections":Ve(s,i);break;case"providers":await We(s,i);break;case"maintenance":await J(s,i);break}}catch(t){console.error(`Error rendering tab ${a}:`,t),s.innerHTML=`
            <div class="text-center py-20">
                <i data-lucide="alert-circle" class="w-12 h-12 text-rose-400 mx-auto mb-4"></i>
                <h3 class="text-lg font-semibold text-surface-700 mb-2">No se pudo cargar la información</h3>
                <p class="text-surface-500 text-sm">${t.message}</p>
                <button onclick="window.location.reload()" class="btn-primary btn-sm mt-4">Reintentar</button>
            </div>
        `,window.lucide&&lucide.createIcons()}}function Ue(a,{assets:s,properties:i}){a.innerHTML=`
        <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-semibold text-surface-700">Equipos y Mobiliario</h4>
            <button id="add-asset-btn" class="btn-primary btn-sm px-3 py-1.5"><i data-lucide="plus" class="w-4 h-4"></i> Nuevo Activo</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${s.length?s.map(t=>`
                <div class="glass-card-static p-4 space-y-3">
                    <div class="flex justify-between items-start">
                        <div>
                            <span class="text-[10px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">${t.category}</span>
                            <h5 class="font-bold text-surface-900 mt-1">${t.name}</h5>
                        </div>
                        <span class="badge ${t.status==="Operativo"?"badge-green":"badge-amber"}">${t.status}</span>
                    </div>
                    <div class="text-xs text-surface-500 space-y-1">
                        <p><span class="font-medium">Marca:</span> ${t.brand||"N/A"}</p>
                        <p><span class="font-medium">Modelo:</span> ${t.model||"N/A"}</p>
                        <p><span class="font-medium">Serial:</span> ${t.serial_number||"N/A"}</p>
                    </div>
                    <div class="pt-2 border-t border-surface-100 flex justify-between items-center">
                        <span class="text-[10px] text-surface-400">Propiedad: ${t.property_id.slice(0,8)}</span>
                        <button class="text-primary-600 hover:text-primary-700 text-xs font-semibold">Detalles</button>
                    </div>
                </div>
            `).join(""):'<p class="text-surface-400 text-center py-20 col-span-full">No hay activos registrados.</p>'}
        </div>
    `,document.getElementById("add-asset-btn").addEventListener("click",()=>Ye(i)),window.lucide&&lucide.createIcons()}function Ve(a,{inspections:s,properties:i}){a.innerHTML=`
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
                    ${s.length?s.map(t=>`
                        <tr>
                            <td class="font-medium">${t.inspection_type}</td>
                            <td>${_(t.scheduled_date)}</td>
                            <td><span class="badge ${t.status==="Realizada"?"badge-green":t.status==="Cancelada"?"badge-red":"badge-blue"}">${t.status}</span></td>
                            <td>${t.inspector_name||"-"}</td>
                            <td class="text-xs text-surface-500">${t.property_id.slice(0,8)}</td>
                            <td class="text-right">
                                <button class="text-surface-400 hover:text-primary-600"><i data-lucide="more-horizontal" class="w-5 h-5"></i></button>
                            </td>
                        </tr>
                    `).join(""):'<tr><td colspan="6" class="text-center py-10 text-surface-400">No hay inspecciones programadas.</td></tr>'}
                </tbody>
            </table>
        </div>
    `,document.getElementById("add-insp-btn").addEventListener("click",()=>Xe(i)),window.lucide&&lucide.createIcons()}async function We(a){const i=(await p.get("/contacts?contact_type=Proveedor&limit=100")).items||[];a.innerHTML=`
        <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-semibold text-surface-700">Directorio de Proveedores</h4>
            <button id="add-prov-btn" class="btn-primary btn-sm px-3 py-1.5"><i data-lucide="user-plus" class="w-4 h-4"></i> Nuevo Proveedor</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${i.length?i.map(t=>`
                <div class="glass-card-static p-4 flex gap-4 items-center">
                    <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                        ${t.name.charAt(0)}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h5 class="font-bold text-surface-900 truncate">${t.name}</h5>
                        <p class="text-xs text-surface-500 truncate">${t.email||"Sin correo"}</p>
                        <p class="text-xs font-medium text-primary-600 mt-1">${t.phone||"Sin teléfono"}</p>
                    </div>
                </div>
            `).join(""):'<p class="text-surface-400 text-center py-20 col-span-full">No se encontraron proveedores.</p>'}
        </div>
    `,window.lucide&&lucide.createIcons()}function Ye(a){const s=a.map(i=>`<option value="${i.id}">${i.name}</option>`).join("");h("Nuevo Activo",`
        <form id="af" class="space-y-4">
            <div>
                <label class="label">Propiedad *</label>
                <select class="select" name="property_id" required>${s}</select>
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
    `,{confirmText:"Guardar",onConfirm:async()=>{const i=new FormData(document.getElementById("af")),t=Object.fromEntries(i);await p.post("/assets",t),b("Activo registrado","success"),await Z(document.getElementById("page-content"))}})}async function J(a,{properties:s}){const t=(await p.get("/maintenance?limit=50")).items||[];a.innerHTML=`
    <div class="flex items-center justify-between mb-6 animate-fade-in px-4">
      <div class="flex items-center gap-3">
        <h4 class="text-lg font-semibold text-surface-700">Órdenes de Trabajo</h4>
      </div>
      <button id="add-maint-btn" class="btn-primary btn-sm"><i data-lucide="plus" class="w-4 h-4"></i> Nueva Orden</button>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-in px-4">
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-amber-500">${t.filter(e=>e.status==="Pendiente").length}</p>
        <p class="text-xs text-surface-500 mt-1">Pendientes</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-primary-500">${t.filter(e=>e.status==="En Progreso").length}</p>
        <p class="text-xs text-surface-500 mt-1">En Progreso</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-emerald-500">${t.filter(e=>e.status==="Completado").length}</p>
        <p class="text-xs text-surface-500 mt-1">Completados</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-rose-500">${f(t.reduce((e,o)=>e+(o.actual_cost||0),0))}</p>
        <p class="text-xs text-surface-500 mt-1">Costo Total</p>
      </div>
    </div>
    <div class="glass-card-static overflow-hidden animate-fade-in mx-4">
      <table class="data-table">
        <thead><tr><th></th><th>Título</th><th>Tipo</th><th>Prioridad</th><th>Estado</th><th>Proveedor</th><th>Costo</th><th></th></tr></thead>
        <tbody>
        ${t.length?t.map(e=>{var o;return`<tr>
          <td class="w-12">
            ${e.photos&&e.photos.length>0?`<div class="relative group cursor-pointer" onclick="viewPhotos('${e.id}')">
                <img src="${p.baseUrl.replace("/api/v1","")}/${e.photos[0].photo_path}" class="w-10 h-10 rounded object-cover border border-surface-200" />
                <span class="absolute -top-1 -right-1 bg-primary-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">${e.photos.length}</span>
              </div>`:'<div class="w-10 h-10 rounded bg-surface-100 flex items-center justify-center text-surface-400"><i data-lucide="image" class="w-5 h-5"></i></div>'}
          </td>
          <td><div class="font-semibold text-sm">${e.title}</div><div class="text-[10px] text-surface-400">${_(e.scheduled_date)}</div></td>
          <td><span class="badge badge-gray text-[10px]">${e.maintenance_type}</span></td>
          <td><span class="badge ${e.priority==="Urgente"?"badge-red":e.priority==="Alta"?"badge-amber":"badge-gray"} text-[10px]">${e.priority}</span></td>
          <td><span class="badge ${Ke(e.status)} text-[10px]">${e.status}</span></td>
          <td class="text-xs">${((o=e.supplier)==null?void 0:o.name)||e.supplier_name||'<span class="text-surface-400">—</span>'}</td>
          <td class="text-sm font-medium">${f(e.actual_cost||e.estimated_cost)}</td>
          <td class="text-right">
             <button class="btn-ghost p-1 edit-maint-btn" data-id="${e.id}"><i data-lucide="edit-3" class="w-4 h-4 text-surface-400"></i></button>
          </td>
        </tr>`}).join(""):'<tr><td colspan="8" class="text-center py-10 text-surface-400">No hay mantenimientos.</td></tr>'}
        </tbody>
      </table>
    </div>
    `,window.lucide&&lucide.createIcons(),document.getElementById("add-maint-btn").addEventListener("click",()=>Ze(s,a)),document.querySelectorAll(".edit-maint-btn").forEach(e=>e.addEventListener("click",()=>Je(e.dataset.id,s,a)))}function Ke(a){return{Pendiente:"badge-amber","En Progreso":"badge-primary",Completado:"badge-green",Cancelado:"badge-red"}[a]||"badge-gray"}async function Ze(a,s){const t=(await p.get("/contacts?contact_type=Proveedor&limit=100")).items||[],e=t.length?t.map(d=>`<option value="${d.id}|${d.name}">${d.name}</option>`).join(""):'<option value="">No hay proveedores</option>',o=a.map(d=>`<option value="${d.id}">${d.name}</option>`).join("");h("Nueva Orden de Mantenimiento",`
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
                <div><label class="label">Costo Estimado</label><input class="input" type="number" name="estimated_cost" step="0.01" /></div>
                <div><label class="label">Fecha</label><input class="input" type="date" name="scheduled_date" /></div>
            </div>
            <div><label class="label">Notas</label><textarea class="input" name="notes" rows="2"></textarea></div>
        </form>
    `,{confirmText:"Crear",onConfirm:async()=>{const d=new FormData(document.getElementById("mf")),r={};d.forEach((n,c)=>{c==="estimated_cost"?r[c]=n?parseFloat(n):void 0:n&&(r[c]=n)});const l=document.getElementById("maint-supplier-select").value;if(l){const[n,c]=l.split("|");r.supplier_id=n,r.supplier_name=c}await p.post("/maintenance",r),b("Orden creada","success"),s&&await J(s,{properties:a})}})}async function Je(a,s,i){const[t,e]=await Promise.all([p.get(`/maintenance/${a}`),p.get("/contacts?contact_type=Proveedor&limit=100")]),o=e.items||[],d=o.length?o.map(r=>`<option value="${r.id}|${r.name}" ${t.supplier_id===r.id?"selected":""}>${r.name}</option>`).join(""):'<option value="">No hay proveedores</option>';h("Editar Mantenimiento",`
        <form id="e-mf" class="space-y-4">
            <div><label class="label">Título</label><input class="input" name="title" value="${t.title}" /></div>
            <div class="grid grid-cols-2 gap-4">
                <div><label class="label">Estado</label><select class="select" name="status">
                    <option value="Pendiente" ${t.status==="Pendiente"?"selected":""}>Pendiente</option>
                    <option value="En Progreso" ${t.status==="En Progreso"?"selected":""}>En Progreso</option>
                    <option value="Esperando Factura" ${t.status==="Esperando Factura"?"selected":""}>Esperando Factura</option>
                    <option value="Completado" ${t.status==="Completado"?"selected":""}>Completado</option>
                    <option value="Cancelado" ${t.status==="Cancelado"?"selected":""}>Cancelado</option>
                </select></div>
                <div><label class="label">Prioridad</label><select class="select" name="priority">
                    <option value="Baja" ${t.priority==="Baja"?"selected":""}>Baja</option>
                    <option value="Media" ${t.priority==="Media"?"selected":""}>Media</option>
                    <option value="Alta" ${t.priority==="Alta"?"selected":""}>Alta</option>
                    <option value="Urgente" ${t.priority==="Urgente"?"selected":""}>Urgente</option>
                </select></div>
            </div>
            <div>
                <label class="label">Proveedor</label>
                <select class="select" id="e-maint-supplier-select">
                    <option value="">N/A</option>
                    ${d}
                </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div><label class="label">Costo Estimado</label><input class="input" type="number" name="estimated_cost" step="0.01" value="${t.estimated_cost||""}" /></div>
                <div><label class="label">Costo Real</label><input class="input" type="number" name="actual_cost" step="0.01" value="${t.actual_cost||""}" /></div>
            </div>
            <div><label class="label">Fecha Programada</label><input class="input" type="date" name="scheduled_date" value="${t.scheduled_date||""}" /></div>
            <div><label class="label">Notas</label><textarea class="input" name="notes" rows="3">${t.notes||""}</textarea></div>
        </form>
    `,{confirmText:"Guardar",onConfirm:async()=>{const r=new FormData(document.getElementById("e-mf")),l={};r.forEach((c,u)=>{u==="estimated_cost"||u==="actual_cost"?l[u]=c?parseFloat(c):null:c&&(l[u]=c)});const n=document.getElementById("e-maint-supplier-select").value;if(n){const[c,u]=n.split("|");l.supplier_id=c,l.supplier_name=u}else l.supplier_id=null,l.supplier_name=null;await p.put(`/maintenance/${a}`,l),b("Actualizado","success"),i&&await J(i,{properties:s})}})}window.viewPhotos=async a=>{const s=await p.get(`/maintenance/${a}`);if(!s.photos||s.photos.length===0)return;const i=p.baseUrl.replace("/api/v1","");h("Evidencia Fotográfica",`
      <div class="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
        ${s.photos.map(t=>`
          <div class="space-y-2">
            <img src="${i}/${t.photo_path}" class="w-full rounded-lg border border-surface-200 cursor-zoom-in" onclick="window.open('${i}/${t.photo_path}', '_blank')" />
            <p class="text-[10px] text-surface-400 text-center">${_(t.uploaded_at)}</p>
          </div>
        `).join("")}
      </div>
    `,{confirmText:"Cerrar"})};function Xe(a){const s=a.map(i=>`<option value="${i.id}">${i.name}</option>`).join("");h("Programar Inspección",`
        <form id="if" class="space-y-4">
            <div><label class="label">Propiedad *</label><select class="select" name="property_id" required>${s}</select></div>
            <div class="grid grid-cols-2 gap-4">
                <div><label class="label">Tipo *</label><select class="select" name="inspection_type" required>
                    <option value="Preventiva">Preventiva</option><option value="Entrega">Entrega</option><option value="Recibo">Recibo</option><option value="Rutinaria">Rutinaria</option>
                </select></div>
                <div><label class="label">Fecha Programada *</label><input class="input" name="scheduled_date" type="date" required /></div>
            </div>
            <div><label class="label">Inspector</label><input class="input" name="inspector_name" /></div>
        </form>
    `,{confirmText:"Programar",onConfirm:async()=>{const i=new FormData(document.getElementById("if")),t=Object.fromEntries(i);await p.post("/inspections",t),b("Inspección programada","success"),await Z(document.getElementById("page-content"))}})}let U=null,V=null;async function Qe(a){const i=new URLSearchParams(window.location.hash.split("?")[1]).get("id");if(!i){a.innerHTML='<div class="p-8 text-center text-rose-500">Error: No se proporcionó ID de cuenta.</div>';return}a.innerHTML=`
        <div class="flex items-center justify-center py-20">
            <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
        </div>
    `;try{await be(a,i)}catch(t){a.innerHTML=`<div class="p-8 text-center text-rose-500">Error al cargar datos de la cuenta: ${t.message}</div>`}}async function be(a,s,i={}){const t=new URLSearchParams;i.date_from&&t.set("date_from",i.date_from),i.date_to&&t.set("date_to",i.date_to),i.tx_type&&t.set("tx_type",i.tx_type),t.set("months",12);const e=await p.get(`/accounts/${s}/history?${t.toString()}`);if(!e)return;const{account:o,monthly_cashflow:d,recent_transactions:r,balance_history:l}=e;a.innerHTML=`
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
                        ${f(o.current_balance)}
                    </p>
                </div>
            </div>

            <!-- Filters Row -->
            <div class="flex flex-wrap items-end gap-4 p-5 glass-card-static border-white/40 shadow-sm">
                <div class="flex-1 min-w-[150px]">
                    <label class="block text-[10px] font-bold text-surface-400 uppercase mb-2 tracking-wider ml-1">Desde</label>
                    <div class="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-xl border border-white/20 shadow-sm">
                        <i data-lucide="calendar" class="w-4 h-4 text-surface-400"></i>
                        <input type="date" id="filter-date-from" class="bg-transparent text-sm font-medium focus:outline-none w-full" value="${i.date_from||""}">
                    </div>
                </div>
                <div class="flex-1 min-w-[150px]">
                    <label class="block text-[10px] font-bold text-surface-400 uppercase mb-2 tracking-wider ml-1">Hasta</label>
                    <div class="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-xl border border-white/20 shadow-sm">
                        <i data-lucide="calendar" class="w-4 h-4 text-surface-400"></i>
                        <input type="date" id="filter-date-to" class="bg-transparent text-sm font-medium focus:outline-none w-full" value="${i.date_to||""}">
                    </div>
                </div>
                <div class="flex-1 min-w-[150px]">
                    <label class="block text-[10px] font-bold text-surface-400 uppercase mb-2 tracking-wider ml-1">Tipo de Transacción</label>
                    <div class="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-xl border border-white/20 shadow-sm">
                        <i data-lucide="list-filter" class="w-4 h-4 text-surface-400"></i>
                        <select id="filter-tx-type" class="bg-transparent text-sm font-medium focus:outline-none w-full appearance-none">
                            <option value="">Cualquier tipo</option>
                            <option value="Ingreso" ${i.tx_type==="Ingreso"?"selected":""}>Ingreso</option>
                            <option value="Gasto" ${i.tx_type==="Gasto"?"selected":""}>Gasto</option>
                            <option value="Transferencia" ${i.tx_type==="Transferencia"?"selected":""}>Transferencia</option>
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
                        ${r.length} registros en periodo
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
                            ${r.length>0?r.map(n=>`
                                <tr class="hover:bg-white/50 transition-colors group">
                                    <td class="text-xs text-surface-400 font-medium italic">${_(n.transaction_date)}</td>
                                    <td>
                                        <div class="font-bold text-surface-900 text-sm group-hover:text-primary-600 transition-colors">${n.description}</div>
                                        <div class="text-[10px] text-surface-400 flex items-center gap-1 mt-0.5">
                                            <i data-lucide="map-pin" class="w-2.5 h-2.5"></i>
                                            ${n.property_name||"Gasto General Corporativo"}
                                        </div>
                                    </td>
                                    <td>
                                        <span class="badge badge-gray !rounded-lg text-[10px] font-semibold">${n.category}</span>
                                    </td>
                                    <td class="text-right font-black text-sm ${n.direction==="Debit"?"text-accent-600":"text-rose-600"}">
                                        <div class="flex items-center justify-end gap-1">
                                            <span>${n.direction==="Debit"?"+":"-"}</span>
                                            <span>${f(n.amount)}</span>
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
    `,window.lucide&&lucide.createIcons(),document.getElementById("btn-apply-filters").addEventListener("click",()=>{const n={date_from:document.getElementById("filter-date-from").value,date_to:document.getElementById("filter-date-to").value,tx_type:document.getElementById("filter-tx-type").value};be(a,s,n)}),et(d,l)}function et(a,s){U&&U.destroy(),V&&V.destroy();const i=document.getElementById("account-history-chart");i&&a.length>0&&(U=new Chart(i,{type:"bar",data:{labels:a.map(e=>e.month),datasets:[{label:"Ingresos",data:a.map(e=>e.income),backgroundColor:"#00d084",borderRadius:8,barThickness:15},{label:"Gastos",data:a.map(e=>e.expenses),backgroundColor:"#ff4d4f",borderRadius:8,barThickness:15}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"bottom",labels:{boxWidth:10,usePointStyle:!0,font:{size:11,weight:"600"}}}},scales:{y:{grid:{color:"rgba(0,0,0,0.03)"},ticks:{font:{size:10},callback:e=>"$"+e.toLocaleString()}},x:{grid:{display:!1},ticks:{font:{size:10}}}}}}));const t=document.getElementById("account-balance-chart");t&&s&&s.length>0&&(V=new Chart(t,{type:"line",data:{labels:s.map(e=>_(e.date)),datasets:[{label:"Saldo",data:s.map(e=>e.balance),borderColor:"#4d7cfe",backgroundColor:"rgba(77, 124, 254, 0.1)",fill:!0,tension:.4,pointRadius:2,pointHoverRadius:6,borderWidth:4,pointBackgroundColor:"#fff",pointBorderWidth:2}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{mode:"index",intersect:!1}},scales:{y:{grid:{color:"rgba(0,0,0,0.03)"},ticks:{font:{size:10},callback:e=>"$"+e.toLocaleString()}},x:{grid:{display:!1},ticks:{font:{size:8},maxRotation:0,autoSkip:!0,maxTicksLimit:12}}}}}))}async function D(a,s){const[i,t,e]=await Promise.all([p.get("/work-groups"),p.get("/properties?limit=100"),p.get("/users?limit=100").catch(()=>({items:[]}))]),o=t.items||[],r=(e.items||[]).filter(l=>l.id);a.innerHTML=`
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
            ${i.length?i.map(l=>`
                <div class="glass-card-static p-5 flex flex-col space-y-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-bold text-surface-900 text-lg">${l.name}</h4>
                            <p class="text-xs text-surface-500">${l.description||"Sin descripción"}</p>
                        </div>
                        <span class="badge badge-blue">ID: ${l.id.slice(0,4)}</span>
                    </div>

                    <div class="space-y-2 flex-grow">
                        <div class="flex justify-between text-sm">
                            <span class="text-surface-600 font-medium">Miembros</span>
                            <span class="font-bold text-surface-900">${l.members_count||0}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-surface-600 font-medium">Propiedades Asignadas</span>
                            <span class="font-bold text-surface-900">${l.properties_count||0}</span>
                        </div>
                    </div>

                    <div class="pt-4 border-t border-surface-100 flex flex-col gap-2">
                        <button class="btn-ghost btn-sm w-full font-medium" onclick="window.viewGroupDetails('${l.id}')">
                            <i data-lucide="eye" class="w-4 h-4 mr-1"></i> Ver Detalles
                        </button>
                        <div class="flex gap-2">
                            <button class="btn-secondary btn-sm flex-1" onclick="window.addMemberModal('${l.id}')">
                                <i data-lucide="user-plus" class="w-4 h-4 mr-1"></i> Miembro
                            </button>
                            <button class="btn-secondary btn-sm flex-1" onclick="window.addPropertyModal('${l.id}')">
                                <i data-lucide="home" class="w-4 h-4 mr-1"></i> Propiedad
                            </button>
                        </div>
                    </div>
                </div>
            `).join(""):'<div class="col-span-full py-12 text-center text-surface-500">No hay grupos de trabajo creados.</div>'}
        </div>
    `,document.getElementById("add-wg-btn").addEventListener("click",()=>{h("Nuevo Grupo de Trabajo",`
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
        `,{confirmText:"Crear",onConfirm:async()=>{const l=new FormData(document.getElementById("wg-form")),n=Object.fromEntries(l);await p.post("/work-groups",n),b("Grupo creado","success"),D(a,s)}})}),window.addMemberModal=async l=>{const n=r.length?r.map(c=>`<option value="${c.id}">${c.full_name||c.email} (${c.role})</option>`).join(""):'<option value="" disabled>No se encontraron usuarios</option>';h("Añadir Miembro",`
            <form id="wm-form" class="space-y-4">
                <div>
                    <label class="label">Usuario *</label>
                    <select class="select" name="user_id" required>
                        <option value="">Seleccione un usuario...</option>
                        ${n}
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
        `,{confirmText:"Añadir",onConfirm:async()=>{const c=new FormData(document.getElementById("wm-form")),u=Object.fromEntries(c);if(!u.user_id)throw b("Seleccione un usuario","error"),new Error("Seleccione un usuario");await p.post(`/work-groups/${l}/members`,u),b("Miembro añadido","success"),D(a,s)}})},window.addPropertyModal=async l=>{const n=o.length?o.map(c=>`<option value="${c.id}">${c.name} (${c.property_type})</option>`).join(""):'<option value="" disabled>No se encontraron propiedades</option>';h("Asignar Propiedad",`
            <form id="wp-form" class="space-y-4">
                <div>
                    <label class="label">Propiedad *</label>
                    <select class="select" name="property_id" required>
                        <option value="">Seleccione una propiedad...</option>
                        ${n}
                    </select>
                </div>
            </form>
        `,{confirmText:"Asignar",onConfirm:async()=>{const c=new FormData(document.getElementById("wp-form")),u=Object.fromEntries(c);if(!u.property_id)throw b("Seleccione una propiedad","error"),new Error("Seleccione una propiedad");await p.post(`/work-groups/${l}/properties`,u),b("Propiedad asignada","success"),D(a,s)}})},window.viewGroupDetails=async l=>{try{const[n,c,u]=await Promise.all([p.get(`/work-groups/${l}`),p.get(`/work-groups/${l}/members`),p.get(`/work-groups/${l}/properties`)]),g=c.length?c.map(x=>{var y,w,C;return`
                <div class="flex justify-between items-center p-2 border-b border-surface-100 last:border-0 hover:bg-surface-50">
                    <div>
                        <p class="font-medium text-sm text-surface-900">${((y=x.user)==null?void 0:y.full_name)||"Desconocido"}</p>
                        <p class="text-[10px] text-surface-500">${((w=x.user)==null?void 0:w.email)||"N/A"}</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="badge ${x.role==="Admin"||x.role==="Super Admin"?"badge-primary":"badge-gray"} text-xs">${x.role}</span>
                        ${x.user_id!==((C=s.user)==null?void 0:C.id)&&x.role!=="Super Admin"?`<button class="text-rose-500 hover:text-rose-700" onclick="window.removeMember('${l}', '${x.user_id}')" title="Eliminar miembro"><i data-lucide="user-minus" class="w-4 h-4"></i></button>`:""}
                    </div>
                </div>
            `}).join(""):'<p class="text-surface-500 text-sm py-2">No hay miembros adicionales.</p>',v=u.length?u.map(x=>`
                <div class="flex justify-between items-center p-2 border-b border-surface-100 last:border-0 hover:bg-surface-50">
                    <div>
                        <p class="font-medium text-sm text-surface-900">${x.name}</p>
                        <p class="text-[10px] text-surface-500">${x.property_type} • ${x.address||""}</p>
                    </div>
                    <button class="text-rose-500 hover:text-rose-700" onclick="window.removeProperty('${l}', '${x.id}')" title="Quitar propiedad"><i data-lucide="unlink" class="w-4 h-4"></i></button>
                </div>
            `).join(""):'<p class="text-surface-500 text-sm py-2">No hay propiedades asignadas.</p>';h(`Detalles: ${n.name}`,`
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
            `,{cancelText:"Cerrar",confirmText:"Aceptar",onConfirm:()=>z()}),window.lucide&&lucide.createIcons()}catch(n){console.error(n),b("Error al cargar los detalles","error")}},window.removeMember=async(l,n)=>{if(confirm("¿Está seguro de eliminar este miembro del grupo?"))try{await p.delete(`/work-groups/${l}/members/${n}`),b("Miembro eliminado","success"),z(),D(a,s),setTimeout(()=>window.viewGroupDetails(l),300)}catch(c){b(c.message||"Error al eliminar","error")}},window.removeProperty=async(l,n)=>{if(confirm("¿Está seguro de deasignar esta propiedad del grupo?"))try{await p.delete(`/work-groups/${l}/properties/${n}`),b("Propiedad deasignada","success"),z(),D(a,s),setTimeout(()=>window.viewGroupDetails(l),300)}catch(c){b(c.message||"Error al deasignar","error")}},window.lucide&&lucide.createIcons()}async function tt(a,s){const i=await p.get("/audits?limit=50");a.innerHTML=`
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
                        ${i.length?i.map(t=>`
                            <tr class="hover:bg-surface-50">
                                <td class="whitespace-nowrap">${_(t.timestamp)}</td>
                                <td class="text-xs text-surface-600 font-mono">${t.user_id?t.user_id.slice(0,8):"Sistema"}</td>
                                <td>
                                    <span class="px-2 py-1 bg-surface-100 text-surface-700 rounded text-xs font-semibold">
                                        ${t.action}
                                    </span>
                                </td>
                                <td class="font-medium text-surface-800">${t.entity_type}</td>
                                <td class="text-xs text-surface-500 font-mono">${t.entity_id||"-"}</td>
                                <td class="text-xs text-surface-500 max-w-xs truncate" title="${t.details||""}">
                                    ${t.details||"-"}
                                </td>
                            </tr>
                        `).join(""):'<tr><td colspan="6" class="text-center py-10 text-surface-500">No hay registros de auditoría.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `,window.lucide&&lucide.createIcons()}async function at(a){window.FullCalendar||await st(),a.innerHTML=`
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
    `;try{const i=((await p.get("/reports/upcoming-events?days=90")).events||[]).map(e=>({title:e.title,date:e.date,extendedProps:{detail:e.detail,type:e.type,severity:e.severity},backgroundColor:e.severity==="high"?"#f43f5e":e.severity==="medium"?"#f59e0b":"#60a5fa",borderColor:e.severity==="high"?"#e11d48":e.severity==="medium"?"#d97706":"#3b82f6",textColor:"#ffffff"}));new FullCalendar.Calendar(document.getElementById("pms-calendar"),{initialView:"dayGridMonth",locale:"es",height:620,headerToolbar:{left:"prev,next today",center:"title",right:"dayGridMonth,timeGridWeek,listMonth"},buttonText:{today:"Hoy",month:"Mes",week:"Semana",list:"Lista"},events:i,eventClick(e){const{title:o,extendedProps:d}=e.event;b(`${o} — ${d.detail}`,"info")},eventDidMount(e){e.el.title=`${e.event.title}
${e.event.extendedProps.detail}`}}).render()}catch(s){console.error("Calendar error:",s),b("Error cargando eventos del calendario","error")}}function st(){return new Promise((a,s)=>{if(window.FullCalendar)return a();const i=document.createElement("script");i.src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js",i.onload=a,i.onerror=s,document.head.appendChild(i)})}async function it(a,s){var i;if(((i=s.user)==null?void 0:i.role)!=="Admin"){a.innerHTML='<div class="p-8 text-center text-surface-500">Acceso denegado. Se requieren permisos de Administrador.</div>';return}a.innerHTML=`
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in cursor-default">
        <!-- Telegram Config -->
        <div class="glass-card-static p-6 border-t-4 border-t-sky-500">
            <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
                    <i data-lucide="bot" class="w-6 h-6"></i>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-surface-900">Telegram Bot</h3>
                    <p class="text-sm text-surface-500">Configuración para notificaciones y recepción de reportes</p>
                </div>
            </div>

            <form id="telegram-config-form" class="space-y-4">
                <div>
                    <label class="label text-sm" for="telegram_token">Telegram Bot Token (obtenido de @BotFather)</label>
                    <input type="password" id="telegram_token" name="TELEGRAM_BOT_TOKEN" class="input font-mono text-sm" placeholder="123456789:ABC...XYZ">
                    <p class="text-xs text-surface-400 mt-1">Paso 1: Pega y guarda el token.</p>
                </div>
                <div class="flex justify-end gap-3 pt-4 border-t border-surface-100">
                    <button type="button" class="btn-outline flex-1" id="btn-activate-webhook">
                        <i data-lucide="link" class="w-4 h-4 mr-2"></i> Paso 2: Activar Webhook
                    </button>
                    <button type="submit" class="btn-primary flex-1" id="btn-save-telegram">
                        <i data-lucide="save" class="w-4 h-4 mr-2"></i> Guardar Token
                    </button>
                </div>
            </form>
        </div>

        <!-- Email Config -->
        <div class="glass-card-static p-6 border-t-4 border-t-accent-500">
            <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center text-accent-600">
                    <i data-lucide="mail" class="w-6 h-6"></i>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-surface-900">Servidor de Correo (SMTP)</h3>
                    <p class="text-sm text-surface-500">Configuración para envíos de correo del sistema</p>
                </div>
            </div>

            <form id="email-config-form" class="space-y-4">
                <div class="grid grid-cols-3 gap-4">
                    <div class="col-span-2">
                        <label class="label text-sm" for="smtp_host">SMTP Host</label>
                        <input type="text" id="smtp_host" name="SMTP_HOST" class="input text-sm" placeholder="smtp.ejemplo.com">
                    </div>
                    <div>
                        <label class="label text-sm" for="smtp_port">Puerto</label>
                        <input type="number" id="smtp_port" name="SMTP_PORT" class="input text-sm" placeholder="587">
                    </div>
                </div>
                <div>
                    <label class="label text-sm" for="smtp_user">Usuario SMTP</label>
                    <input type="text" id="smtp_user" name="SMTP_USER" class="input text-sm">
                </div>
                <div>
                    <label class="label text-sm" for="smtp_pass">Contraseña SMTP</label>
                    <input type="password" id="smtp_pass" name="SMTP_PASS" class="input text-sm">
                </div>
                <div class="flex justify-end pt-4 border-t border-surface-100">
                    <button type="submit" class="btn-primary" id="btn-save-email">
                        <i data-lucide="save" class="w-4 h-4 mr-2"></i> Guardar Correo
                    </button>
                </div>
            </form>
        </div>
    </div>
    `,window.lucide&&lucide.createIcons();try{const t=await p.get("/config"),e=document.getElementById("telegram-config-form"),o=document.getElementById("email-config-form");t.forEach(d=>{e.elements[d.key]&&(e.elements[d.key].value=d.value),o.elements[d.key]&&(o.elements[d.key].value=d.value)})}catch{b("Error al cargar la configuración","error")}document.getElementById("telegram-config-form").addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("btn-save-telegram");e.disabled=!0;const o=t.target.elements.TELEGRAM_BOT_TOKEN.value.trim();try{await p.post("/config/batch",{TELEGRAM_BOT_TOKEN:o}),b("Token guardado exitosamente","success")}catch(d){b("Error al guardar: "+d.message,"error")}finally{e.disabled=!1}}),document.getElementById("email-config-form").addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("btn-save-email");e.disabled=!0;const o={SMTP_HOST:t.target.elements.SMTP_HOST.value.trim(),SMTP_PORT:t.target.elements.SMTP_PORT.value.trim(),SMTP_USER:t.target.elements.SMTP_USER.value.trim(),SMTP_PASS:t.target.elements.SMTP_PASS.value.trim()};try{await p.post("/config/batch",o),b("Configuración SMTP guardada","success")}catch(d){b("Error al guardar: "+d.message,"error")}finally{e.disabled=!1}}),document.getElementById("btn-activate-webhook").addEventListener("click",async t=>{const e=t.target.closest("button");e.disabled=!0;try{await p.post("/telegram/register-webhook",{domain:"https://real-state-xd5o.onrender.com"}),b("Webhook activado correctamente","success")}catch(o){b("Error en Webhook: "+o.message,"error")}finally{e.disabled=!1}})}const P={user:null,currentPage:"dashboard"},nt={dashboard:{title:"Dashboard",subtitle:"Vista general de su cartera inmobiliaria",render:Te},properties:{title:"Propiedades",subtitle:"Gestión de su portfolio inmobiliario",render:K},financials:{title:"Finanzas",subtitle:"Ledger contable y conciliación bancaria",render:B},maintenance:{title:"Mantenimientos",subtitle:"Órdenes de trabajo y calendario",render:H},contracts:{title:"Contratos",subtitle:"Gestión de arrendamientos",render:G},budgets:{title:"Presupuestos",subtitle:"Control presupuestario y semáforo",render:Re},"budget-report":{title:"Reporte de Presupuesto",subtitle:"Distribución y cumplimiento detallado",render:ze},facility:{title:"Facility Management",subtitle:"Gestión de activos e inspecciones",render:Z},"account-detail":{title:"Detalle de Cuenta",subtitle:"Historial de movimientos y análisis de saldo",render:Qe},"work-groups":{title:"Grupos de Trabajo",subtitle:"Gestión de equipos de mantenimiento",render:D},audits:{title:"Auditoría",subtitle:"Registro de actividades y log del sistema",render:tt},calendar:{title:"Calendario",subtitle:"Eventos y fechas importantes próximas",render:at},settings:{title:"Configuración",subtitle:"Ajustes globales y de integraciones",render:it}};function fe(){return(window.location.hash.replace("#/","")||"dashboard").split("?")[0].split("/")[0]}async function ve(a){const s=nt[a];if(!s){window.location.hash="#/dashboard";return}P.currentPage=a,document.getElementById("page-title").textContent=s.title,document.getElementById("page-subtitle").textContent=s.subtitle,document.querySelectorAll(".sidebar-link").forEach(t=>{t.classList.toggle("active",t.dataset.page===a)});const i=document.getElementById("page-content");i.innerHTML='<div class="flex items-center justify-center py-20"><div class="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>';try{await s.render(i,P)}catch(t){console.error(`Error rendering ${a}:`,t),i.innerHTML=`
      <div class="text-center py-20">
        <i data-lucide="alert-circle" class="w-12 h-12 text-rose-400 mx-auto mb-4"></i>
        <h3 class="text-lg font-semibold text-surface-700 mb-2">Error al cargar la página</h3>
        <p class="text-surface-500">${t.message}</p>
      </div>
    `}window.lucide&&lucide.createIcons()}function R(){document.getElementById("auth-screen").classList.remove("hidden"),document.getElementById("app-shell").classList.add("hidden"),window.lucide&&lucide.createIcons()}function ge(){document.getElementById("auth-screen").classList.add("hidden"),document.getElementById("app-shell").classList.remove("hidden"),P.user&&(document.getElementById("user-name").textContent=P.user.full_name,document.getElementById("user-role").textContent=P.user.role,document.getElementById("user-avatar").textContent=P.user.full_name.charAt(0).toUpperCase()),window.lucide&&lucide.createIcons(),ve(fe())}async function ot(){if(!p.isAuthenticated()){R();return}try{P.user=await p.getProfile(),ge()}catch{p.clearTokens(),R()}}function rt(){window.addEventListener("hashchange",()=>{P.user&&ve(fe())}),document.getElementById("login-form").addEventListener("submit",async a=>{a.preventDefault();const s=document.getElementById("login-email").value,i=document.getElementById("login-password").value;try{await p.login(s,i),P.user=await p.getProfile(),b(`Bienvenido, ${P.user.full_name}`,"success"),ge()}catch(t){b(t.message,"error")}}),document.getElementById("register-form").addEventListener("submit",async a=>{a.preventDefault();const s={full_name:document.getElementById("reg-name").value,email:document.getElementById("reg-email").value,password:document.getElementById("reg-password").value,role:document.getElementById("reg-role").value};try{console.log("Registrando usuario...",s),await p.register(s),b("Cuenta creada. Inicie sesión.","success"),document.getElementById("register-form").classList.add("hidden"),document.getElementById("login-form").classList.remove("hidden"),a.target.reset()}catch(i){console.error("Error en registro:",i),b(i.message,"error")}}),document.getElementById("show-register").addEventListener("click",a=>{a.preventDefault(),document.getElementById("login-form").classList.add("hidden"),document.getElementById("register-form").classList.remove("hidden")}),document.getElementById("show-login").addEventListener("click",a=>{a.preventDefault(),document.getElementById("register-form").classList.add("hidden"),document.getElementById("login-form").classList.remove("hidden")}),document.getElementById("logout-btn").addEventListener("click",()=>{p.clearTokens(),P.user=null,b("Sesión cerrada","info"),R()}),p.onUnauthorized(()=>{P.user=null,R(),b("Sesión expirada","warning")}),ot()}document.addEventListener("DOMContentLoaded",rt);
