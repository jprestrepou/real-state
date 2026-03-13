(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const l of n)if(l.type==="childList")for(const r of l.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function e(n){const l={};return n.integrity&&(l.integrity=n.integrity),n.referrerPolicy&&(l.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?l.credentials="include":n.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function a(n){if(n.ep)return;n.ep=!0;const l=e(n);fetch(n.href,l)}})();const N="https://real-state-xd5o.onrender.com/api/v1";class ge{constructor(){this._accessToken=localStorage.getItem("pms_access_token"),this._refreshToken=localStorage.getItem("pms_refresh_token"),this._onUnauthorized=null}onUnauthorized(s){this._onUnauthorized=s}setTokens(s,e){this._accessToken=s,this._refreshToken=e,localStorage.setItem("pms_access_token",s),localStorage.setItem("pms_refresh_token",e)}clearTokens(){this._accessToken=null,this._refreshToken=null,localStorage.removeItem("pms_access_token"),localStorage.removeItem("pms_refresh_token")}isAuthenticated(){return!!this._accessToken}async _fetch(s,e={}){const a={"Content-Type":"application/json",...e.headers};this._accessToken&&(a.Authorization=`Bearer ${this._accessToken}`),e.body instanceof FormData&&delete a["Content-Type"];let n=await fetch(`${N}${s}`,{...e,headers:a});if(n.status===401&&this._refreshToken)if(await this._tryRefresh())a.Authorization=`Bearer ${this._accessToken}`,n=await fetch(`${N}${s}`,{...e,headers:a});else throw this.clearTokens(),this._onUnauthorized&&this._onUnauthorized(),new Error("Sesión expirada. Inicie sesión nuevamente.");if(!n.ok){let l="Error del servidor";try{const r=await n.json();typeof r.detail=="string"?l=r.detail:Array.isArray(r.detail)?l=r.detail.map(o=>o.msg).join(", "):r.detail&&(l=JSON.stringify(r.detail))}catch{l=`Error ${n.status}`}throw new Error(l)}return n.status===204?null:n.json()}async _tryRefresh(){try{const s=await fetch(`${N}/auth/refresh`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refresh_token:this._refreshToken})});if(!s.ok)return!1;const e=await s.json();return this.setTokens(e.access_token,e.refresh_token),!0}catch{return!1}}get(s){return this._fetch(s)}post(s,e){return this._fetch(s,{method:"POST",body:JSON.stringify(e)})}put(s,e){return this._fetch(s,{method:"PUT",body:JSON.stringify(e)})}delete(s){return this._fetch(s,{method:"DELETE"})}upload(s,e){return this._fetch(s,{method:"POST",body:e})}async login(s,e){const a=await this.post("/auth/login",{email:s,password:e});return this.setTokens(a.access_token,a.refresh_token),a}async register(s){return this.post("/auth/register",s)}async getProfile(){return this.get("/auth/me")}}const u=new ge;function b(t,s="info",e=4e3){const a=document.getElementById("toast-container"),n=document.createElement("div");n.className=`toast toast-${s}`,n.textContent=t,a.appendChild(n),setTimeout(()=>{n.style.opacity="0",n.style.transform="translateX(100%)",n.style.transition="all 0.3s ease-in",setTimeout(()=>n.remove(),300)},e)}function x(t,s,{onConfirm:e,confirmText:a="Guardar",showCancel:n=!0}={}){const l=document.getElementById("modal-container");l.innerHTML=`
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal-content">
        <div class="flex items-center justify-between p-6 border-b border-surface-100">
          <h3 class="text-lg font-bold text-surface-900">${t}</h3>
          <button id="modal-close" class="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
        <div class="p-6" id="modal-body">
          ${s}
        </div>
        <div class="flex items-center justify-end gap-3 p-6 border-t border-surface-100">
          ${n?'<button id="modal-cancel" class="btn-secondary">Cancelar</button>':""}
          ${e?`<button id="modal-confirm" class="btn-primary">${a}</button>`:""}
        </div>
      </div>
    </div>
  `,window.lucide&&lucide.createIcons();const r=document.getElementById("modal-overlay"),o=document.getElementById("modal-close"),d=document.getElementById("modal-cancel"),i=document.getElementById("modal-confirm"),c=()=>{l.innerHTML=""};return r.addEventListener("click",p=>{p.target===r&&c()}),o==null||o.addEventListener("click",c),d==null||d.addEventListener("click",c),i&&e&&i.addEventListener("click",async()=>{try{await e(),c()}catch(p){b(p.message,"error")}}),{close:c,getBody:()=>document.getElementById("modal-body")}}function f(t,s="COP"){return t==null?"—":new Intl.NumberFormat("es-CO",{style:"currency",currency:s,minimumFractionDigits:0,maximumFractionDigits:0}).format(t)}function X(t){return t==null?"—":Math.abs(t)>=1e6?`$${(t/1e6).toFixed(1)}M`:Math.abs(t)>=1e3?`$${(t/1e3).toFixed(0)}K`:f(t)}function E(t){return t?new Date(t).toLocaleDateString("es-CO",{year:"numeric",month:"short",day:"numeric"}):"—"}function V(t){return t==null?"—":`${Number(t).toFixed(1)}%`}function F(t){return{Disponible:"badge-green",Arrendada:"badge-blue","En Mantenimiento":"badge-amber",Vendida:"badge-gray",Pendiente:"badge-amber","En Progreso":"badge-blue",Completado:"badge-green",Cancelado:"badge-red","Esperando Factura":"badge-amber",Activo:"badge-green",Borrador:"badge-gray",Finalizado:"badge-gray",Pagado:"badge-green",Vencido:"badge-red"}[t]||"badge-gray"}function ve(t){return{Verde:"semaphore-green",Amarillo:"semaphore-amber",Rojo:"semaphore-red"}[t]||"semaphore-green"}const S={primary:"#4c6ef5",accent:"#20c997",accentLight:"rgba(32, 201, 151, 0.1)",red:"#e03131",redLight:"rgba(224, 49, 49, 0.1)"},q={responsive:!0,maintainAspectRatio:!1,plugins:{legend:{labels:{font:{family:"Inter",size:12,weight:"500"},padding:16,usePointStyle:!0,pointStyleWidth:10}},tooltip:{backgroundColor:"rgba(33, 37, 41, 0.95)",titleFont:{family:"Inter",size:13,weight:"600"},bodyFont:{family:"Inter",size:12},padding:12,cornerRadius:10,displayColors:!0}}};function xe(t,s,e,a){return new Chart(t,{type:"bar",data:{labels:s,datasets:[{label:"Ingresos",data:e,backgroundColor:S.accent,borderRadius:8,barPercentage:.6},{label:"Gastos",data:a,backgroundColor:S.red,borderRadius:8,barPercentage:.6}]},options:{...q,scales:{y:{beginAtZero:!0,grid:{color:"rgba(0,0,0,0.04)"},ticks:{font:{family:"Inter",size:11}}},x:{grid:{display:!1},ticks:{font:{family:"Inter",size:11}}}}}})}function he(t,s,e){const a=["#4c6ef5","#20c997","#f59f00","#e03131","#845ef7","#339af0"];return new Chart(t,{type:"doughnut",data:{labels:s,datasets:[{data:e,backgroundColor:a.slice(0,e.length),borderWidth:0,hoverOffset:8}]},options:{...q,cutout:"70%",plugins:{...q.plugins,legend:{...q.plugins.legend,position:"bottom"}}}})}function ye(t,s,e,a,n){return new Chart(t,{type:"line",data:{labels:s,datasets:[{label:"Ingresos Proyectados",data:e,borderColor:S.accent,backgroundColor:S.accentLight,fill:!0,tension:.4,pointRadius:4,pointHoverRadius:6,borderWidth:2.5},{label:"Gastos Proyectados",data:a,borderColor:S.red,backgroundColor:S.redLight,fill:!0,tension:.4,pointRadius:4,pointHoverRadius:6,borderWidth:2.5},{label:"Balance Neto",data:n,borderColor:S.primary,borderDash:[6,4],fill:!1,tension:.4,pointRadius:3,borderWidth:2}]},options:{...q,interaction:{mode:"index",intersect:!1},scales:{y:{grid:{color:"rgba(0,0,0,0.04)"},ticks:{font:{family:"Inter",size:11}}},x:{grid:{display:!1},ticks:{font:{family:"Inter",size:11}}}}}})}const we={Disponible:"#20c997",Arrendada:"#4c6ef5","En Mantenimiento":"#f59f00",Vendida:"#868e96"};let j=null,M=null;function $e(t,s=[4.711,-74.072],e=12){return j&&j.remove(),j=L.map(t).setView(s,e),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:19}).addTo(j),M=L.markerClusterGroup({maxClusterRadius:50,spiderfyOnMaxZoom:!0,showCoverageOnHover:!1}),j.addLayer(M),j}function _e(t){if(M&&(M.clearLayers(),t.forEach(s=>{const e=we[s.status]||"#868e96",a=L.circleMarker([s.latitude,s.longitude],{radius:10,fillColor:e,color:"#fff",weight:2,opacity:1,fillOpacity:.85}),n=`
      <div style="font-family:Inter,sans-serif; min-width:200px;">
        <h3 style="margin:0 0 4px; font-size:14px; font-weight:700; color:#212529;">${s.name}</h3>
        <p style="margin:0 0 2px; font-size:12px; color:#868e96;">${s.property_type} • ${s.city}</p>
        <div style="display:flex; align-items:center; gap:6px; margin-top:8px;">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${e};"></span>
          <span style="font-size:12px; font-weight:600; color:#495057;">${s.status}</span>
        </div>
        ${s.monthly_rent?`<p style="margin:6px 0 0; font-size:13px; font-weight:600; color:#20c997;">Canon: ${f(s.monthly_rent)}</p>`:""}
        <a href="#/properties/${s.id}" style="display:inline-block; margin-top:8px; font-size:12px; color:#4c6ef5; text-decoration:none; font-weight:600;">Ver ficha →</a>
      </div>
    `;a.bindPopup(n),M.addLayer(a)}),t.length>0)){const s=M.getBounds();s.isValid()&&j.fitBounds(s,{padding:[30,30]})}}function Ee(){j&&setTimeout(()=>j.invalidateSize(),100)}function Ce(t){return t==="high"?{bg:"bg-rose-50",border:"border-rose-200",text:"text-rose-700",dot:"bg-rose-500"}:t==="medium"?{bg:"bg-amber-50",border:"border-amber-200",text:"text-amber-700",dot:"bg-amber-500"}:{bg:"bg-blue-50",border:"border-blue-200",text:"text-blue-700",dot:"bg-blue-400"}}async function Ie(t){const[s,e,a,n]=await Promise.all([u.get("/reports/summary"),u.get("/properties/map"),u.get("/reports/cashflow?months=12"),u.get("/reports/upcoming-events?days=30").catch(()=>({events:[]}))]),l=s,r=n.events||[];if(t.innerHTML=`
    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 animate-fade-in">
      <div class="kpi-card kpi-blue">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-surface-500">Total Propiedades</span>
          <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <i data-lucide="home" class="w-5 h-5 text-primary-600"></i>
          </div>
        </div>
        <p class="text-3xl font-bold text-surface-900">${l.total_properties}</p>
      </div>

      <div class="kpi-card kpi-green">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-surface-500">Ocupación</span>
          <div class="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
            <i data-lucide="users" class="w-5 h-5 text-accent-600"></i>
          </div>
        </div>
        <p class="text-3xl font-bold text-surface-900">${V(l.occupancy_rate)}</p>
      </div>

      <div class="kpi-card kpi-green">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-surface-500">Ingresos</span>
          <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <i data-lucide="trending-up" class="w-5 h-5 text-green-600"></i>
          </div>
        </div>
        <p class="text-3xl font-bold text-surface-900">${X(l.total_income)}</p>
      </div>

      <div class="kpi-card kpi-red">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-surface-500">Gastos</span>
          <div class="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
            <i data-lucide="trending-down" class="w-5 h-5 text-rose-600"></i>
          </div>
        </div>
        <p class="text-3xl font-bold text-surface-900">${X(l.total_expenses)}</p>
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
          <span class="ml-auto badge ${r.length>0?"badge-red":"badge-gray"} text-xs">${r.length}</span>
        </h3>
        <div class="flex-1 overflow-y-auto space-y-2 max-h-[340px] pr-1">
          ${r.length===0?`
            <div class="flex flex-col items-center justify-center h-32 text-surface-400">
              <i data-lucide="check-circle" class="w-8 h-8 mb-2 text-accent-400"></i>
              <p class="text-sm font-medium">Sin eventos próximos</p>
            </div>
          `:r.map(d=>{const i=Ce(d.severity);return`
            <div class="flex items-start gap-3 p-3 rounded-xl border ${i.bg} ${i.border}">
              <div class="mt-0.5 w-2 h-2 rounded-full ${i.dot} shrink-0 mt-1.5"></div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold ${i.text} truncate">${d.title}</p>
                <p class="text-[10px] text-surface-500 mt-0.5">${d.detail} · ${d.date}</p>
              </div>
              <i data-lucide="${d.icon}" class="w-4 h-4 ${i.text} shrink-0"></i>
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
      ${l.accounts.length>0?`
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          ${l.accounts.map(d=>`
            <div class="p-4 rounded-xl border border-surface-200 bg-surface-50/50 hover:border-primary-200 transition-colors">
              <p class="text-sm font-medium text-surface-600">${d.account_name}</p>
              <p class="text-sm text-surface-400 mb-2">${d.account_type} · ${d.currency}</p>
              <p class="text-xl font-bold ${d.current_balance>=0?"text-accent-600":"text-rose-600"}">${f(d.current_balance)}</p>
            </div>
          `).join("")}
        </div>
      `:`
        <p class="text-center text-surface-400 py-8">No hay cuentas registradas aún</p>
      `}
    </div>
  `,window.lucide&&lucide.createIcons(),setTimeout(()=>{$e("dashboard-map"),_e(e),Ee()},100),e.length>0){const d={};e.forEach(p=>{d[p.property_type]=(d[p.property_type]||0)+1});const i=Object.keys(d),c=Object.values(d);he(document.getElementById("type-chart"),i,c)}const o=a.months||[];if(o.length>0){const d=o.slice(-6);xe(document.getElementById("income-expense-chart"),d.map(i=>i.month),d.map(i=>i.income),d.map(i=>i.expenses)),ye(document.getElementById("cashflow-chart"),o.map(i=>i.month),o.map(i=>i.income),o.map(i=>i.expenses),o.map(i=>i.net))}}async function W(t){const e=(await u.get("/properties?limit=50")).items||[];t.innerHTML=`
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
          ${e.length>0?e.map(a=>`
            <tr>
              <td>
                <div class="font-semibold text-surface-900">${a.name}</div>
                <div class="text-xs text-surface-400 truncate max-w-[200px]">${a.address}</div>
              </td>
              <td><span class="badge badge-gray">${a.property_type}</span></td>
              <td class="text-surface-600">${a.city}</td>
              <td class="text-surface-600">${a.area_sqm}</td>
              <td class="font-medium">${f(a.commercial_value)}</td>
              <td><span class="badge ${F(a.status)}">${a.status}</span></td>
              <td class="text-surface-500 text-xs">${E(a.created_at)}</td>
              <td>
                <div class="flex items-center gap-1">
                  <button class="btn-ghost text-xs py-1 px-2 view-property" data-id="${a.id}" title="Detalles">
                    <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                  </button>
                  <button class="btn-ghost text-xs py-1 px-2 edit-property" data-id="${a.id}" title="Editar">
                    <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                  </button>
                  <button class="btn-ghost text-xs py-1 px-2 delete-property text-rose-500 hover:bg-rose-50" data-id="${a.id}" title="Eliminar">
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
  `,window.lucide&&lucide.createIcons(),document.getElementById("add-property-btn").addEventListener("click",()=>te()),document.getElementById("properties-table").addEventListener("click",async a=>{const n=a.target.closest(".view-property"),l=a.target.closest(".edit-property"),r=a.target.closest(".delete-property");if(n&&U(n.dataset.id),l){const o=l.dataset.id,d=await u.get(`/properties/${o}`);te(d)}if(r){const o=r.dataset.id;if(confirm("¿Está seguro de que desea eliminar esta propiedad? Esta acción la desactivará del sistema."))try{await u.delete(`/properties/${o}`),b("Propiedad eliminada correctamente","success");const d=document.getElementById("page-content");await W(d)}catch(d){b(d.message,"error")}}}),document.getElementById("filter-status").addEventListener("change",async a=>{const n=a.target.value,l=document.getElementById("filter-type").value;let r="/properties?limit=50";n&&(r+=`&status=${encodeURIComponent(n)}`),l&&(r+=`&property_type=${encodeURIComponent(l)}`);const o=await u.get(r);ee(o.items||[])}),document.getElementById("filter-type").addEventListener("change",async a=>{const n=a.target.value,l=document.getElementById("filter-status").value;let r="/properties?limit=50";l&&(r+=`&status=${encodeURIComponent(l)}`),n&&(r+=`&property_type=${encodeURIComponent(n)}`);const o=await u.get(r);ee(o.items||[])})}function ee(t){const s=document.querySelector("#properties-table tbody");s.innerHTML=t.map(e=>`
    <tr>
      <td>
        <div class="font-semibold text-surface-900">${e.name}</div>
        <div class="text-xs text-surface-400 truncate max-w-[200px]">${e.address}</div>
      </td>
      <td><span class="badge badge-gray">${e.property_type}</span></td>
      <td class="text-surface-600">${e.city}</td>
      <td class="text-surface-600">${e.area_sqm}</td>
      <td class="font-medium">${f(e.commercial_value)}</td>
      <td><span class="badge ${F(e.status)}">${e.status}</span></td>
      <td class="text-surface-500 text-xs">${E(e.created_at)}</td>
      <td>
        <div class="flex items-center gap-1">
          <button class="btn-ghost text-xs py-1 px-2 view-property" data-id="${e.id}" title="Detalles">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
          </button>
          <button class="btn-ghost text-xs py-1 px-2 edit-property" data-id="${e.id}" title="Editar">
            <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
          </button>
          <button class="btn-ghost text-xs py-1 px-2 delete-property text-rose-500 hover:bg-rose-50" data-id="${e.id}" title="Eliminar">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join(""),window.lucide&&lucide.createIcons()}function te(t=null){const s=!!t,e=s?"Editar Propiedad":"Nueva Propiedad",a=`
    <form id="property-form" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Nombre *</label>
          <input class="input" name="name" required value="${(t==null?void 0:t.name)||""}" placeholder="Mi Apartamento Centro" />
        </div>
        <div>
          <label class="label">Tipo *</label>
          <select class="select" name="property_type" required>
            ${["Apartamento","Casa","Local","Bodega","Oficina","Lote"].map(n=>`<option value="${n}" ${(t==null?void 0:t.property_type)===n?"selected":""}>${n}</option>`).join("")}
          </select>
        </div>
      </div>
      <div>
        <label class="label">Dirección *</label>
        <input class="input" name="address" required value="${(t==null?void 0:t.address)||""}" placeholder="Calle 100 #15-20, Bogotá" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Ciudad *</label>
          <input class="input" name="city" required value="${(t==null?void 0:t.city)||""}" placeholder="Bogotá" />
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
          <input class="input" name="commercial_value" type="number" value="${(t==null?void 0:t.commercial_value)??""}" placeholder="350000000" />
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
            ${["Disponible","Arrendada","En Mantenimiento","Vendida"].map(n=>`<option value="${n}" ${(t==null?void 0:t.status)===n?"selected":""}>${n}</option>`).join("")}
          </select>
        </div>
      </div>
      <div>
        <label class="label">Notas</label>
        <textarea class="input" name="notes" rows="2" placeholder="Observaciones adicionales...">${(t==null?void 0:t.notes)||""}</textarea>
      </div>
    </form>
  `;x(e,a,{confirmText:s?"Guardar Cambios":"Crear Propiedad",onConfirm:async()=>{const n=document.getElementById("property-form"),l=new FormData(n),r={};l.forEach((d,i)=>{d!==""&&(["latitude","longitude","area_sqm","commercial_value"].includes(i)?r[i]=parseFloat(d):["bedrooms","bathrooms"].includes(i)?r[i]=parseInt(d):r[i]=d)}),s?(await u.put(`/properties/${t.id}`,r),b("Propiedad actualizada","success")):(await u.post("/properties",r),b("Propiedad creada","success"));const o=document.getElementById("page-content");await W(o)}})}async function U(t){const[s,e]=await Promise.all([u.get(`/properties/${t}`),u.get(`/occupants?property_id=${t}`)]),a=n=>n.length?`
      <div class="space-y-3 mt-4">
        ${n.map(l=>`
          <div class="flex items-center justify-between p-3 bg-surface-50 rounded-xl border border-surface-100 animate-fade-in">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                ${l.full_name.charAt(0)}
              </div>
              <div>
                <p class="text-sm font-semibold text-surface-900">${l.full_name} ${l.is_primary?'<span class="badge badge-blue text-[10px] ml-1">Principal</span>':""}</p>
                <p class="text-xs text-surface-500">${l.phone||l.email||"Sin contacto"}</p>
              </div>
            </div>
            <button class="delete-occupant-btn text-rose-400 hover:text-rose-600 p-1" data-id="${l.id}">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        `).join("")}
      </div>
    `:'<p class="text-sm text-surface-400 py-4 text-center">No hay ocupantes registrados.</p>';x(`Detalle: ${s.name}`,`
    <div class="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
      <div class="grid grid-cols-2 gap-4">
        <div class="glass-card-static p-4">
          <h4 class="text-xs font-bold text-surface-400 uppercase mb-3 flex items-center gap-1"><i data-lucide="info" class="w-3 h-3"></i> Información Básica</h4>
          <p class="text-sm"><strong>Dirección:</strong> ${s.address}</p>
          <p class="text-sm"><strong>Tipo:</strong> ${s.property_type}</p>
          <p class="text-sm"><strong>Área:</strong> ${s.area_sqm} m²</p>
          <p class="text-sm"><strong>Estado:</strong> <span class="badge ${F(s.status)}">${s.status}</span></p>
        </div>
        <div class="glass-card-static p-4">
          <h4 class="text-xs font-bold text-surface-400 uppercase mb-3 flex items-center gap-1"><i data-lucide="users" class="w-3 h-3"></i> Ocupantes (Viven aquí)</h4>
          <div id="occupants-container">
            ${a(e)}
          </div>
          <button id="add-occupant-btn" class="btn-ghost text-xs w-full mt-4 border-dashed border-2 border-surface-200 hover:border-primary-300">
            <i data-lucide="plus" class="w-3 h-3 mr-1"></i> Agregar Ocupante
          </button>
        </div>
      </div>
    </div>
  `,{showCancel:!0,confirmText:null}),window.lucide&&lucide.createIcons(),document.getElementById("add-occupant-btn").addEventListener("click",()=>{x("Nuevo Ocupante",`
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
    `,{confirmText:"Agregar",onConfirm:async()=>{const n=new FormData(document.getElementById("occupant-form")),l={property_id:t,full_name:n.get("full_name"),dni:n.get("dni")||null,phone:n.get("phone")||null,email:n.get("email")||null,is_primary:document.getElementById("is_primary").checked};await u.post("/occupants",l),b("Ocupante agregado","success"),U(t)}})}),document.querySelectorAll(".delete-occupant-btn").forEach(n=>{n.addEventListener("click",async()=>{confirm("¿Eliminar este ocupante?")&&(await u.delete(`/occupants/${n.dataset.id}`),b("Ocupante eliminado","success"),U(t))})})}const le=["Gastos Generales","Gastos Administrativos","Mantenimiento General","Pago de Empleados","Nómina y Personal","Suministros de Oficina","Marketing y Publicidad","Servicios Públicos","Seguros","Impuestos y Tasas","Honorarios Gestión","Otros"],de=["Ingresos por Arriendo","Gastos Mantenimiento","Impuestos y Tasas","Cuotas de Administración","Servicios Públicos","Honorarios Gestión","Seguros","Pago Hipoteca","Otros"];async function B(t){var h,w,$,T,k,C,J,Z,Q;const[s,e,a]=await Promise.all([u.get("/accounts"),u.get("/transactions?limit=30"),u.get("/properties?limit=100")]),n=s||[],l=e.items||[],r=a.items||[];let o=1,d=!1,i=l.length>=30;t.innerHTML=`
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
          ${n.map(m=>`
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
              ${l.length>0?l.map(m=>`
                <tr>
                  <td class="text-xs text-surface-500">${E(m.transaction_date)}</td>
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
              ${r.map(m=>`<option value="${m.id}">${m.name}</option>`).join("")}
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
  `,window.lucide&&lucide.createIcons(),(h=document.getElementById("add-account-btn"))==null||h.addEventListener("click",()=>ke()),(w=document.getElementById("add-transaction-btn"))==null||w.addEventListener("click",()=>ae(n,r,!1)),($=document.getElementById("add-general-expense-btn"))==null||$.addEventListener("click",()=>ae(n,r,!0)),(T=document.getElementById("add-transfer-btn"))==null||T.addEventListener("click",()=>Pe(n)),(k=document.getElementById("import-csv-btn"))==null||k.addEventListener("click",()=>{var m;return(m=document.getElementById("import-csv-input"))==null?void 0:m.click()}),(C=document.getElementById("import-csv-input"))==null||C.addEventListener("change",async m=>{const _=m.target.files[0];_&&(await Se(_),m.target.value="")}),(J=document.getElementById("export-csv-btn"))==null||J.addEventListener("click",()=>{window.location.href=`${u.baseUrl}/reports/export`}),document.querySelectorAll(".account-card").forEach(m=>{m.addEventListener("click",_=>{_.target.closest(".edit-account-btn")||_.target.closest(".delete-account-btn")||(window.location.hash=`#/account-detail?id=${m.dataset.accountId}`)})}),document.querySelectorAll(".edit-account-btn").forEach(m=>{m.addEventListener("click",_=>{_.stopPropagation(),Te(m.dataset.id,m.dataset.name,m.dataset.bank,m.dataset.number)})}),document.querySelectorAll(".delete-account-btn").forEach(m=>{m.addEventListener("click",_=>{_.stopPropagation(),Le(m.dataset.id,m.dataset.name,parseFloat(m.dataset.balance))})}),document.querySelectorAll(".edit-tx-btn").forEach(m=>{m.addEventListener("click",()=>{se(m.dataset.id,m.dataset.desc,m.dataset.cat,m.dataset.amount,m.dataset.type,m.dataset.date)})}),document.querySelectorAll(".delete-tx-btn").forEach(m=>{m.addEventListener("click",()=>ne(m.dataset.id,m.dataset.desc))}),(Z=document.getElementById("performance-property-select"))==null||Z.addEventListener("change",m=>je(m.target.value)),(Q=document.getElementById("generate-pdf-btn"))==null||Q.addEventListener("click",()=>Ae(n,l)),document.querySelectorAll(".tab-btn").forEach(m=>{m.addEventListener("click",()=>{document.querySelectorAll(".tab-btn").forEach(A=>A.classList.remove("active")),document.querySelectorAll(".tab-content").forEach(A=>A.classList.add("hidden")),m.classList.add("active");const _=m.dataset.tab;document.getElementById(`${_}-tab`).classList.remove("hidden"),_==="analysis"&&Be()})});const c=document.getElementById("infinite-scroll-sentinel"),p=document.getElementById("loading-spinner"),g=document.querySelector("#operations-tab tbody"),v=new IntersectionObserver(async m=>{if(m[0].isIntersecting&&i&&!d){d=!0,p.classList.remove("hidden"),o++;try{const A=(await u.get(`/transactions?limit=30&page=${o}`)).items||[];A.length===0?i=!1:(A.forEach(y=>{const D=document.createElement("tr");D.innerHTML=`
              <td class="text-xs text-surface-500">${E(y.transaction_date)}</td>
              <td><div class="font-medium text-surface-900 text-sm">${y.description}</div></td>
              <td><span class="badge badge-gray text-xs">${y.category}</span></td>
              <td class="text-xs text-surface-500">
                ${y.property_id?'<span class="badge badge-blue text-xs">Propiedad</span>':'<span class="badge badge-amber text-xs">General</span>'}
              </td>
              <td class="text-xs text-surface-500">${y.transaction_type}</td>
              <td class="font-semibold ${y.direction==="Debit"?"text-accent-600":"text-rose-600"}">
                ${y.direction==="Debit"?"+":"-"}${f(y.amount)}
              </td>
              <td>
                <span class="badge ${y.direction==="Debit"?"badge-green":"badge-red"} text-xs">
                  ${y.direction==="Debit"?"Ingreso":"Egreso"}
                </span>
              </td>
              <td>
                <div class="flex items-center gap-1">
                  <button class="edit-tx-btn p-1.5 rounded-lg hover:bg-primary-50 text-surface-400 hover:text-primary-600 transition" 
                    data-id="${y.id}" data-desc="${y.description}" data-cat="${y.category}" 
                    data-amount="${y.amount}" data-type="${y.transaction_type}" data-date="${y.transaction_date}">
                    <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                  </button>
                  <button class="delete-tx-btn p-1.5 rounded-lg hover:bg-rose-50 text-surface-400 hover:text-rose-600 transition" 
                    data-id="${y.id}" data-desc="${y.description}">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </td>
            `,g.appendChild(D),D.querySelector(".edit-tx-btn").addEventListener("click",()=>{const P=D.querySelector(".edit-tx-btn");se(P.dataset.id,P.dataset.desc,P.dataset.cat,P.dataset.amount,P.dataset.type,P.dataset.date)}),D.querySelector(".delete-tx-btn").addEventListener("click",()=>{const P=D.querySelector(".delete-tx-btn");ne(P.dataset.id,P.dataset.desc)})}),window.lucide&&lucide.createIcons(),A.length<30&&(i=!1))}catch(_){console.error("Error loading more transactions:",_)}finally{d=!1,p.classList.add("hidden")}}},{threshold:.1});c&&v.observe(c)}function ke(){x("Nueva Cuenta Bancaria",`
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
  `,{confirmText:"Crear Cuenta",onConfirm:async()=>{const t=new FormData(document.getElementById("account-form")),s={};t.forEach((e,a)=>{a==="initial_balance"?s[a]=parseFloat(e)||0:e&&(s[a]=e)}),await u.post("/accounts",s),b("Cuenta creada","success"),await B(document.getElementById("page-content"))}})}function Te(t,s,e,a){x("Editar Cuenta",`
    <form id="edit-account-form" class="space-y-4">
      <div><label class="label">Nombre *</label><input class="input" name="account_name" value="${s}" required /></div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Banco</label><input class="input" name="bank_name" value="${e}" /></div>
        <div><label class="label">Número de Cuenta</label><input class="input" name="account_number" value="${a}" /></div>
      </div>
    </form>
  `,{confirmText:"Guardar Cambios",onConfirm:async()=>{const n=new FormData(document.getElementById("edit-account-form")),l={};n.forEach((r,o)=>{r&&(l[o]=r)}),await u.put(`/accounts/${t}`,l),b("Cuenta actualizada","success"),await B(document.getElementById("page-content"))}})}function Le(t,s,e){if(e!==0){b(`No se puede eliminar "${s}": tiene saldo de ${f(e)}. Transfiera los fondos primero.`,"error");return}x("Eliminar Cuenta",`
    <div class="text-center py-4">
      <div class="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i data-lucide="alert-triangle" class="w-8 h-8 text-rose-500"></i>
      </div>
      <p class="text-surface-700 font-medium mb-2">¿Eliminar la cuenta "${s}"?</p>
      <p class="text-sm text-surface-400">Esta acción desactivará la cuenta. No será visible pero sus transacciones históricas se conservan.</p>
    </div>
  `,{confirmText:"Eliminar",onConfirm:async()=>{await u.delete(`/accounts/${t}`),b("Cuenta eliminada","success"),await B(document.getElementById("page-content"))}}),window.lucide&&lucide.createIcons()}function ae(t,s=[],e=!1){const a=e?"Registrar Gasto General":"Registrar Transacción",n=e?le:de;x(a,`
    <form id="tx-form" class="space-y-4">
      ${e?'<div class="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-2"><div class="flex items-center gap-2 text-amber-700 text-sm font-medium"><i data-lucide="info" class="w-4 h-4"></i> Este gasto no está asociado a ninguna propiedad</div></div>':""}
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Cuenta *</label><select class="select" name="account_id" required>${t.map(c=>`<option value="${c.id}">${c.account_name}</option>`).join("")}</select></div>
        ${e?"":`<div><label class="label">Propiedad *</label><select class="select" name="property_id" required><option value="">Seleccione...</option>${s.map(c=>`<option value="${c.id}">${c.name}</option>`).join("")}</select></div>`}
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Tipo *</label><select class="select" name="transaction_type" required>
          ${e?'<option value="Gasto">Gasto</option>':'<option value="Ingreso">Ingreso</option><option value="Gasto">Gasto</option><option value="Transferencia">Transferencia</option><option value="Interés">Interés</option><option value="Abono">Abono</option><option value="Crédito">Crédito</option><option value="Ajuste">Ajuste</option>'}
        </select></div>
        <div><label class="label">Categoría *</label><select class="select" name="category" required>${n.map(c=>`<option value="${c}">${c}</option>`).join("")}</select></div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Monto *</label><input class="input" name="amount" type="number" step="0.01" min="0.01" required placeholder="1500000" /></div>
        <div><label class="label">Fecha *</label><input class="input" name="transaction_date" type="date" required value="${new Date().toISOString().split("T")[0]}" /></div>
      </div>
      <div><label class="label">Descripción *</label><input class="input" name="description" required placeholder="${e?"Pago servicios oficina":"Pago canon mes de marzo"}" /></div>
    </form>
  `,{confirmText:"Registrar",onConfirm:async()=>{const c=new FormData(document.getElementById("tx-form")),p={};c.forEach((g,v)=>{v==="amount"?p[v]=parseFloat(g):g&&(p[v]=g)}),e&&delete p.property_id,p.transaction_type==="Ingreso"?p.direction="Debit":p.transaction_type==="Gasto"&&(p.direction="Credit"),await u.post("/transactions",p),b(e?"Gasto registrado":"Transacción registrada","success"),await B(document.getElementById("page-content"))}}),window.lucide&&lucide.createIcons();const l=document.getElementById("tx-form"),r=l.querySelector('[name="property_id"]'),o=l.querySelector('[name="transaction_date"]'),d=l.querySelector('[name="category"]'),i=async()=>{const c=e?"GENERAL":r.value,p=o.value;if(!c||!p)return;const[g,v]=p.split("-").map(Number);try{let h=c;if(c==="GENERAL"){const T=(await u.get("/properties?limit=100")).items.find(k=>k.name==="Gastos Generales");T&&(h=T.id)}const w=await u.get(`/budgets?property_id=${h}&year=${g}&month=${v}`);if(w&&w.length>0){let k=w[0].categories.map(C=>C.category_name).map(C=>`<option value="${C}">${C} (Presupuestado)</option>`).join("");k+="<option disabled>──────────</option>",k+=n.map(C=>`<option value="${C}">${C}</option>`).join(""),d.innerHTML=k}else d.innerHTML=n.map($=>`<option value="${$}">${$}</option>`).join("")}catch(h){console.warn("Could not fetch budget categories:",h),d.innerHTML=n.map(w=>`<option value="${w}">${w}</option>`).join("")}};r&&r.addEventListener("change",i),o.addEventListener("change",i),l.querySelector('[name="transaction_type"]').addEventListener("change",i),(e||r&&r.value)&&i()}function se(t,s,e,a,n,l){const r=[...new Set([...le,...de])];x("Editar Transacción",`
    <form id="edit-tx-form" class="space-y-4">
      <div><label class="label">Descripción</label><input class="input" name="description" value="${s}" /></div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Categoría</label><select class="select" name="category">${r.map(o=>`<option value="${o}" ${o===e?"selected":""}>${o}</option>`).join("")}</select></div>
        <div><label class="label">Tipo</label><select class="select" name="transaction_type">
          ${["Ingreso","Gasto","Transferencia","Ajuste","Interés","Abono","Crédito"].map(o=>`<option value="${o}" ${o===n?"selected":""}>${o}</option>`).join("")}
        </select></div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Monto</label><input class="input" name="amount" type="number" step="0.01" value="${a}" /></div>
        <div><label class="label">Fecha</label><input class="input" name="transaction_date" type="date" value="${l}" /></div>
      </div>
    </form>
  `,{confirmText:"Guardar",onConfirm:async()=>{const o=new FormData(document.getElementById("edit-tx-form")),d={};o.forEach((i,c)=>{c==="amount"?d[c]=parseFloat(i):i&&(d[c]=i)}),await u.put(`/transactions/${t}`,d),b("Transacción actualizada","success"),await B(document.getElementById("page-content"))}})}function ne(t,s){x("Eliminar Transacción",`
    <div class="text-center py-4">
      <div class="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i data-lucide="alert-triangle" class="w-8 h-8 text-rose-500"></i>
      </div>
      <p class="text-surface-700 font-medium mb-2">¿Eliminar esta transacción?</p>
      <p class="text-sm text-surface-400 italic mb-2">"${s}"</p>
      <p class="text-xs text-rose-500">El saldo de la cuenta será ajustado automáticamente.</p>
    </div>
  `,{confirmText:"Eliminar",onConfirm:async()=>{await u.delete(`/transactions/${t}`),b("Transacción eliminada","success"),await B(document.getElementById("page-content"))}}),window.lucide&&lucide.createIcons()}function Pe(t){x("Transferencia entre Cuentas",`
    <form id="transfer-form" class="space-y-4">
      <div><label class="label">Cuenta Origen *</label><select class="select" name="source_account_id" required>${t.map(s=>`<option value="${s.id}">${s.account_name} (${f(s.current_balance)})</option>`).join("")}</select></div>
      <div><label class="label">Cuenta Destino *</label><select class="select" name="destination_account_id" required>${t.map(s=>`<option value="${s.id}">${s.account_name}</option>`).join("")}</select></div>
      <div><label class="label">Monto *</label><input class="input" name="amount" type="number" step="0.01" required placeholder="500000" /></div>
      <div><label class="label">Descripción *</label><input class="input" name="description" required placeholder="Traslado de fondos" /></div>
      <div><label class="label">Fecha *</label><input class="input" name="transaction_date" type="date" required value="${new Date().toISOString().split("T")[0]}" /></div>
    </form>
  `,{confirmText:"Transferir",onConfirm:async()=>{const s=new FormData(document.getElementById("transfer-form")),e={};if(s.forEach((a,n)=>{n==="amount"?e[n]=parseFloat(a):e[n]=a}),e.source_account_id===e.destination_account_id){b("Las cuentas deben ser diferentes","error");return}await u.post("/accounts/transfer",e),b("Transferencia completada","success"),await B(document.getElementById("page-content"))}})}async function je(t){if(!t)return;const s=document.getElementById("performance-content");s.innerHTML='<div class="flex items-center justify-center py-12"><div class="animate-spin rounded-full h-8 w-8 border-2 border-accent-500 border-t-transparent"></div><p class="ml-3 text-surface-500">Calculando métricas...</p></div>';const e=await u.get(`/properties/${t}/performance`);if(!e)return;const a=e.total_income>0||e.total_expenses>0;s.innerHTML=`
    <div class="animate-fade-in">
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-surface-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center"><i data-lucide="building-2" class="w-5 h-5 text-primary-600"></i></div>
          <div>
            <h4 class="font-bold text-surface-900">${e.property_name}</h4>
            <span class="badge ${e.property_status==="Arrendada"?"badge-green":"badge-blue"} text-xs">${e.property_status||"Sin estado"}</span>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm">
          <p class="text-xs font-bold text-surface-400 uppercase mb-2">Ingresos</p>
          <p class="text-2xl font-bold text-accent-600">${f(e.total_income)}</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm">
          <p class="text-xs font-bold text-surface-400 uppercase mb-2">Gastos</p>
          <p class="text-2xl font-bold text-rose-600">${f(e.total_expenses)}</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm">
          <p class="text-xs font-bold text-surface-400 uppercase mb-2">Utilidad</p>
          <p class="text-2xl font-bold ${e.net_profit>=0?"text-primary-600":"text-rose-600"}">${f(e.net_profit)}</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm">
          <p class="text-xs font-bold text-surface-400 uppercase mb-2">ROI</p>
          <p class="text-2xl font-bold text-indigo-600">${e.roi}%</p>
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
          ${a?`
            ${Object.entries(e.income_by_category||{}).map(([r,o])=>`<div class="flex justify-between text-sm mb-1"><span>${r}</span><span class="text-accent-600">+${f(o)}</span></div>`).join("")}
            <div class="border-t border-surface-100 my-3"></div>
            ${Object.entries(e.expense_by_category||{}).map(([r,o])=>`<div class="flex justify-between text-sm mb-1"><span>${r}</span><span class="text-rose-600">-${f(o)}</span></div>`).join("")}
          `:'<p class="text-surface-400 text-center py-4">Sin datos</p>'}
        </div>
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h4 class="text-sm font-bold text-surface-900 mb-4">Últimos Movimientos</h4>
          <div class="overflow-x-auto"><table class="data-table text-xs"><thead><tr><th>Fecha</th><th>Descripción</th><th>Monto</th></tr></thead><tbody>
            ${(e.last_transactions||[]).length>0?e.last_transactions.map(r=>`<tr><td class="text-surface-500">${E(r.transaction_date)}</td><td class="font-medium">${r.description}</td><td class="font-bold ${r.direction==="Debit"?"text-accent-600":"text-rose-600"}">${r.direction==="Debit"?"+":"-"}${f(r.amount)}</td></tr>`).join(""):'<tr><td colspan="3" class="text-center py-4 text-surface-400">Sin movimientos</td></tr>'}
          </tbody></table></div>
        </div>
      </div>
    </div>
  `,window.lucide&&lucide.createIcons();const n=document.getElementById("property-mini-chart");n&&a&&new Chart(n,{type:"doughnut",data:{labels:["Ingresos","Gastos"],datasets:[{data:[e.total_income,e.total_expenses],backgroundColor:["#20c997","#f03e3e"],borderWidth:0,cutout:"75%"}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}}}});const l=document.getElementById("property-cashflow-chart");if(l&&e.monthly_cashflow){const r=e.monthly_cashflow;new Chart(l,{type:"bar",data:{labels:r.map(o=>o.month),datasets:[{label:"Ingresos",data:r.map(o=>o.income),backgroundColor:"rgba(32,201,151,0.7)",borderRadius:6,barPercentage:.6},{label:"Gastos",data:r.map(o=>o.expenses),backgroundColor:"rgba(240,62,62,0.7)",borderRadius:6,barPercentage:.6}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"top",labels:{usePointStyle:!0,font:{size:10}}}},scales:{y:{beginAtZero:!0,ticks:{font:{size:10},callback:o=>"$"+(o>=1e6?(o/1e6).toFixed(1)+"M":o>=1e3?(o/1e3).toFixed(0)+"K":o)},grid:{color:"rgba(0,0,0,0.04)"}},x:{ticks:{font:{size:9}},grid:{display:!1}}}}})}}async function Be(){const[t,s]=await Promise.all([u.get("/reports/balance-sheet"),u.get(`/reports/income-statement?start_date=${new Date().getFullYear()}-01-01&end_date=${new Date().toISOString().split("T")[0]}`)]);t&&(document.getElementById("balance-sheet-container").innerHTML=`
      <h3 class="font-bold mb-4 flex items-center justify-between">Balance General <span class="text-xs font-normal text-surface-400">${E(t.date)}</span></h3>
      <div class="space-y-3">
        ${t.accounts.map(e=>`<div class="flex justify-between text-sm py-2 border-b border-surface-50"><span class="text-surface-600">${e.account_name}</span><span class="font-semibold">${f(e.current_balance)}</span></div>`).join("")}
        <div class="flex justify-between text-lg font-bold pt-4 text-primary-600"><span>Total Activos</span><span>${f(t.total_assets)}</span></div>
      </div>
    `),s&&(document.getElementById("income-statement-container").innerHTML=`
      <h3 class="font-bold mb-4">Estado de Resultados (Año Actual)</h3>
      <div class="space-y-4">
        <div><p class="text-xs font-bold text-surface-400 uppercase mb-2">Ingresos</p>${Object.entries(s.income).map(([e,a])=>`<div class="flex justify-between text-sm mb-1"><span>${e}</span><span class="text-accent-600">+${f(a)}</span></div>`).join("")}</div>
        <div><p class="text-xs font-bold text-surface-400 uppercase mb-2">Egresos</p>${Object.entries(s.expenses).map(([e,a])=>`<div class="flex justify-between text-sm mb-1"><span>${e}</span><span class="text-rose-600">-${f(a)}</span></div>`).join("")}</div>
        <div class="border-t border-surface-100 pt-3"><div class="flex justify-between text-lg font-bold ${s.net_income>=0?"text-accent-600":"text-rose-600"}"><span>Utilidad Neta</span><span>${f(s.net_income)}</span></div></div>
      </div>
    `)}async function Ae(t,s){const{jsPDF:e}=window.jspdf,a=new e;a.setFillColor(66,99,235),a.rect(0,0,210,35,"F"),a.setTextColor(255),a.setFontSize(20),a.text("PMS — Informe Financiero",14,20),a.setFontSize(10),a.text(`Generado: ${new Date().toLocaleDateString("es-CO")}`,14,28),a.setTextColor(0),a.setFontSize(14),a.text("Cuentas Bancarias",14,45),a.autoTable({startY:50,head:[["Cuenta","Tipo","Banco","Moneda","Saldo"]],body:t.map(i=>[i.account_name,i.account_type,i.bank_name||"-",i.currency,f(i.current_balance)]),theme:"striped",headStyles:{fillColor:[66,99,235]},styles:{fontSize:9}});const n=a.lastAutoTable.finalY+15;a.setFontSize(14),a.text("Últimas Transacciones",14,n),a.autoTable({startY:n+5,head:[["Fecha","Descripción","Categoría","Tipo","Monto"]],body:s.map(i=>[i.transaction_date,i.description.substring(0,40),i.category,i.transaction_type,`${i.direction==="Debit"?"+":"-"}${f(i.amount)}`]),theme:"striped",headStyles:{fillColor:[66,99,235]},styles:{fontSize:8}});const l=s.filter(i=>i.direction==="Debit").reduce((i,c)=>i+c.amount,0),r=s.filter(i=>i.direction==="Credit").reduce((i,c)=>i+c.amount,0),o=a.lastAutoTable.finalY+15;a.setFontSize(12),a.setTextColor(32,201,151),a.text(`Total Ingresos: ${f(l)}`,14,o),a.setTextColor(240,62,62),a.text(`Total Gastos: ${f(r)}`,14,o+8),a.setTextColor(66,99,235),a.text(`Resultado Neto: ${f(l-r)}`,14,o+16);const d=a.internal.getNumberOfPages();for(let i=1;i<=d;i++)a.setPage(i),a.setFontSize(8),a.setTextColor(150),a.text(`PMS — Property Management System | Página ${i} de ${d}`,105,290,{align:"center"});a.save(`informe_financiero_${new Date().toISOString().split("T")[0]}.pdf`),b("PDF generado y descargado","success")}async function Se(t){x("Analizando CSV...",`
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
      <p class="ml-3 text-surface-500">Analizando archivo...</p>
    </div>
  `,{showCancel:!1});let s;try{const i=new FormData;i.append("file",t),s=await u.upload("/transactions/import/analyze",i)}catch(i){b(`Error al analizar: ${i.message}`,"error");return}const{total_rows:e,transfers_skipped:a,new_accounts:n,existing_accounts:l,detected_labels:r,category_mapping:o}=s,d=r.length>0?r.map(i=>`
    <label class="flex items-center gap-3 p-3 rounded-xl border border-surface-100 hover:bg-surface-50 transition cursor-pointer">
      <input type="checkbox" class="import-label-check w-4 h-4 rounded text-indigo-500" value="${i.label}" ${i.suggested_apartment?"checked":""} ${i.already_exists?"checked disabled":""} />
      <div class="flex-1 min-w-0">
        <span class="font-medium text-surface-800 text-sm">${i.label}</span>
        <span class="text-xs text-surface-400 ml-2">(${i.transaction_count} tx)</span>
      </div>
      ${i.already_exists?'<span class="badge badge-green text-xs">Existe</span>':i.suggested_apartment?'<span class="badge badge-blue text-xs">Sugerido</span>':'<span class="badge badge-amber text-xs">General</span>'}
    </label>
  `).join(""):'<p class="text-surface-400 text-sm py-4 text-center">No se detectaron labels</p>';x("Importación de Transacciones",`
    <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-indigo-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-indigo-600">${e}</p><p class="text-xs text-indigo-400">Transacciones</p></div>
        <div class="bg-amber-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-amber-600">${a}</p><p class="text-xs text-amber-400">Omitidas</p></div>
        <div class="bg-purple-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-purple-600">${r.length}</p><p class="text-xs text-purple-400">Labels</p></div>
      </div>
      ${n.length>0?`<div class="bg-blue-50 border border-blue-200 rounded-xl p-4"><p class="text-sm font-bold text-blue-700 mb-2">Cuentas nuevas (${n.length})</p>${n.map(i=>`<div class="flex justify-between text-sm"><span class="text-blue-600">${i.name}</span><span class="text-blue-400">${i.transaction_count} tx</span></div>`).join("")}</div>`:""}
      ${l.length>0?`<div class="bg-green-50 border border-green-200 rounded-xl p-4"><p class="text-sm font-bold text-green-700 mb-2">Cuentas existentes (${l.length})</p>${l.map(i=>`<div class="flex justify-between text-sm"><span class="text-green-600">${i.name}</span><span class="text-green-400">${i.transaction_count} tx</span></div>`).join("")}</div>`:""}
      ${Object.keys(o).length>0?`<details class="bg-surface-50 border border-surface-200 rounded-xl p-4"><summary class="text-sm font-bold text-surface-700 cursor-pointer">Mapeo categorías (${Object.keys(o).length})</summary><div class="mt-3 space-y-1 max-h-40 overflow-y-auto">${Object.entries(o).map(([i,c])=>`<div class="flex justify-between text-xs py-1 border-b border-surface-100"><span>${i}</span><span class="text-indigo-600">→ ${c}</span></div>`).join("")}</div></details>`:""}
      <div>
        <p class="text-sm font-bold text-surface-700 mb-3">¿Cuáles labels son apartamentos?</p>
        <p class="text-xs text-surface-400 mb-3">Los seleccionados se crean como propiedades.</p>
        <div class="space-y-2 max-h-60 overflow-y-auto">${d}</div>
      </div>
    </div>
  `,{confirmText:"Importar Transacciones",onConfirm:async()=>{const i=document.querySelectorAll(".import-label-check:checked"),c=Array.from(i).map(v=>v.value),p=new FormData;p.append("file",t);const g=encodeURIComponent(c.join(","));try{const v=await u.upload(`/transactions/import/confirm?confirmed_labels=${g}`,p);let h=`✅ ${v.imported} transacciones importadas.`;v.accounts_created.length>0&&(h+=` 📁 Cuentas: ${v.accounts_created.join(", ")}`),v.properties_created.length>0&&(h+=` 🏠 Propiedades: ${v.properties_created.join(", ")}`),v.errors.length>0&&(h+=` ⚠️ ${v.errors.length} errores`),b(h,"success"),await B(document.getElementById("page-content"))}catch(v){b(`Error al importar: ${v.message}`,"error")}}}),window.lucide&&lucide.createIcons()}async function K(t,s){var n,l;const a=(await u.get("/maintenance?limit=50")).items||[];if(t.innerHTML=`
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
        <p class="text-2xl font-bold text-amber-500">${a.filter(r=>r.status==="Pendiente").length}</p>
        <p class="text-xs text-surface-500 mt-1">Pendientes</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-primary-500">${a.filter(r=>r.status==="En Progreso").length}</p>
        <p class="text-xs text-surface-500 mt-1">En Progreso</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-accent-500">${a.filter(r=>r.status==="Completado").length}</p>
        <p class="text-xs text-surface-500 mt-1">Completados</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-rose-500">${f(a.reduce((r,o)=>r+(o.actual_cost||0),0))}</p>
        <p class="text-xs text-surface-500 mt-1">Costo Total</p>
      </div>
    </div>
    <div class="glass-card-static overflow-hidden animate-fade-in mb-8">
      <table class="data-table"><thead><tr>
        <th>Título</th><th>Tipo</th><th>Prioridad</th><th>Estado</th><th>Costo Est.</th><th>Fecha</th><th></th>
      </tr></thead><tbody>
      ${a.length?a.map(r=>`<tr>
        <td><div class="font-semibold text-sm">${r.title}</div>${r.supplier_name?`<div class="text-xs text-surface-400">${r.supplier_name}</div>`:""}</td>
        <td><span class="badge badge-gray text-xs">${r.maintenance_type}</span></td>
        <td><span class="badge ${r.priority==="Urgente"?"badge-red":r.priority==="Alta"?"badge-amber":"badge-gray"} text-xs">${r.priority}</span></td>
        <td><span class="badge ${F(r.status)} text-xs">${r.status}</span></td>
        <td class="text-sm">${f(r.estimated_cost)}</td>
        <td class="text-xs text-surface-500">${E(r.scheduled_date)}</td>
        <td>${r.status!=="Completado"&&r.status!=="Cancelado"?`<button class="btn-ghost text-xs py-1 px-2 status-btn" data-id="${r.id}"><i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></button>`:""}</td>
      </tr>`).join(""):'<tr><td colspan="7" class="text-center py-12 text-surface-400">No hay órdenes</td></tr>'}
      </tbody></table>
    </div>
    
    ${((n=s.user)==null?void 0:n.role)==="Admin"?`
    <div class="glass-card p-6 border-t-4 border-t-sky-500 animate-fade-in">
        <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
                <i data-lucide="bot" class="w-5 h-5"></i>
            </div>
            <div>
                <h3 class="text-lg font-bold text-surface-900">Integración Bot de Telegram</h3>
                <p class="text-sm text-surface-500">Configura tu token para recibir reportes automáticos en esta pantalla.</p>
            </div>
        </div>

        <form id="telegram-config-form" class="space-y-4">
            <div class="flex gap-4 items-end">
                <div class="flex-1">
                    <label class="label text-sm" for="telegram_token">Telegram Bot Token (obtenido de @BotFather)</label>
                    <input type="text" id="telegram_token" name="TELEGRAM_BOT_TOKEN" class="input font-mono text-sm" placeholder="123456789:ABCdefGHIjklmnoPQR_stuVwxyz12345">
                </div>
                <button type="button" class="btn-outline" id="btn-activate-webhook">
                    <i data-lucide="link" class="w-4 h-4 mr-2"></i> Activar Webhook
                </button>
                <button type="submit" class="btn-primary" id="btn-save-telegram">Guardar Token</button>
            </div>
            <p class="text-xs text-surface-400">Paso 1: Pega y guarda el token. Paso 2: Haz clic en Activar Webhook (esto enlazará la app con Telegram temporalmente en local o permanentemente en producción).</p>
        </form>
    </div>
    `:""}
    `,window.lucide&&lucide.createIcons(),document.getElementById("add-maint-btn").addEventListener("click",()=>De()),document.querySelectorAll(".status-btn").forEach(r=>r.addEventListener("click",()=>Me(r.dataset.id))),((l=s.user)==null?void 0:l.role)==="Admin"){const r=document.getElementById("telegram-config-form");try{const d=(await u.get("/config")).find(i=>i.key==="TELEGRAM_BOT_TOKEN");d&&r&&(r.elements.TELEGRAM_BOT_TOKEN.value=d.value)}catch{}r&&(r.addEventListener("submit",async o=>{o.preventDefault();const d=document.getElementById("btn-save-telegram");d.disabled=!0;const i=o.target.elements.TELEGRAM_BOT_TOKEN.value.trim();try{await u.post("/config/batch",{TELEGRAM_BOT_TOKEN:i}),b("Token guardado exitosamente.","success")}catch(c){b("Error al guardar: "+c.message,"error")}finally{d.disabled=!1}}),document.getElementById("btn-activate-webhook").addEventListener("click",async o=>{const d=o.target.closest("button");d.disabled=!0;try{const i=window.location.origin;await u.post("/telegram/register-webhook",{domain:i}),b("Webhook de Telegram enlazado correctamente con este dominio.","success")}catch(i){b("Error en Webhook: "+i.message,"error")}finally{d.disabled=!1}}))}}function De(){x("Nueva Orden",`<form id="mf" class="space-y-4">
    <div><label class="label">Propiedad ID *</label><input class="input" name="property_id" required /></div>
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
  </form>`,{confirmText:"Crear",onConfirm:async()=>{const t=new FormData(document.getElementById("mf")),s={};t.forEach((e,a)=>{e&&(s[a]=a==="estimated_cost"?parseFloat(e):e)}),await u.post("/maintenance",s),b("Orden creada","success"),await K(document.getElementById("page-content"))}})}function Me(t){x("Cambiar Estado",`<form id="sf" class="space-y-4">
    <div><label class="label">Estado *</label><select class="select" name="status">
      <option value="Pendiente">Pendiente</option><option value="En Progreso">En Progreso</option>
      <option value="Esperando Factura">Esperando Factura</option><option value="Completado">Completado</option>
      <option value="Cancelado">Cancelado</option></select></div>
    <div><label class="label">Notas</label><textarea class="input" name="notes" rows="2"></textarea></div>
  </form>`,{confirmText:"Actualizar",onConfirm:async()=>{const s=new FormData(document.getElementById("sf")),e={status:s.get("status")};s.get("notes")&&(e.notes=s.get("notes")),await u.put(`/maintenance/${t}/status`,e),b("Estado actualizado","success"),await K(document.getElementById("page-content"))}})}async function G(t){const[s,e]=await Promise.all([u.get("/contracts?limit=50"),u.get("/properties?limit=100")]),a=s.items||[],n=e.items||[];t.innerHTML=`
    <div class="space-y-6 animate-fade-in">
        <div class="flex border-b border-surface-200 mb-4">
            <button class="tab-btn active px-4 py-2 text-primary-600 border-b-2 border-primary-600 font-medium" data-tab="list">Contratos</button>
            <button class="tab-btn px-4 py-2 text-surface-500 hover:text-surface-700 font-medium" data-tab="tenants">Inquilinos</button>
        </div>
        <div id="contracts-tab-content"><!-- Content --></div>
    </div>
  `;const l=t.querySelector("#contracts-tab-content"),r=t.querySelectorAll(".tab-btn");r.forEach(o=>{o.addEventListener("click",()=>{r.forEach(d=>{d.classList.remove("active","text-primary-600","border-primary-600","border-b-2"),d.classList.add("text-surface-500")}),o.classList.remove("text-surface-500"),o.classList.add("active","text-primary-600","border-primary-600","border-b-2"),o.dataset.tab==="list"?ie(l,a,n,t):Fe(l,a)})}),ie(l,a,n,t)}function ie(t,s,e,a){t.innerHTML=`
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
      ${s.length?s.map(n=>`<tr>
        <td>
          <div class="font-bold text-surface-900">${n.tenant_name}</div>
          ${n.tenant_email?`<div class="text-[10px] text-surface-400 font-medium">${n.tenant_email}</div>`:""}
        </td>
        <td>
          <div class="font-bold text-primary-600 text-xs">${n.property_name||"Sin asignar"}</div>
          <div class="text-[10px] text-surface-400 italic truncate max-w-[150px]">${n.property_address||""}</div>
        </td>
        <td>
          <span class="badge badge-gray text-[10px] mr-1">${n.contract_type}</span>
          <div class="font-black text-accent-700 mt-0.5">${f(n.monthly_rent)}</div>
        </td>
        <td class="text-xs text-surface-500 font-medium whitespace-nowrap">
          ${E(n.start_date)} <span class="text-surface-300">→</span> ${E(n.end_date)}
        </td>
        <td><span class="badge ${F(n.status)} text-[10px] font-bold">${n.status}</span></td>
        <td class="text-right"><div class="flex justify-end gap-1">
          ${n.status==="Borrador"||n.status==="Firmado"?`
            <button class="btn-ghost text-xs p-1.5 activate-btn hover:bg-accent-50 rounded-lg group" data-id="${n.id}" title="Activar Contrato">
              <i data-lucide="check-circle" class="w-4 h-4 text-accent-500 group-hover:scale-110 transition-transform"></i>
            </button>`:""}
          <button class="btn-ghost text-xs p-1.5 download-btn hover:bg-blue-50 rounded-lg group" data-id="${n.id}" title="Descargar PDF">
            <i data-lucide="download" class="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform"></i>
          </button>
          <button class="btn-ghost text-xs p-1.5 pdf-btn hover:bg-red-50 rounded-lg group" data-id="${n.id}" title="Carta de Terminación">
            <i data-lucide="file-text" class="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform"></i>
          </button>
          <button class="btn-ghost text-xs p-1.5 payments-btn hover:bg-primary-50 rounded-lg group" data-id="${n.id}" title="Cronograma de Pagos">
            <i data-lucide="calendar" class="w-4 h-4 text-primary-500 group-hover:scale-110 transition-transform"></i>
          </button>
        </div></td>
      </tr>`).join(""):'<tr><td colspan="6" class="text-center py-20 text-surface-400 font-medium italic">No hay contratos registrados</td></tr>'}
      </tbody></table>
    </div>`,window.lucide&&lucide.createIcons(),document.getElementById("add-contract-btn").addEventListener("click",()=>qe(e,a)),document.querySelectorAll(".activate-btn").forEach(n=>n.addEventListener("click",async()=>{try{await u.post(`/contracts/${n.dataset.id}/activate`,{}),b("Contrato activado y cronograma de pagos generado","success"),await G(a||document.getElementById("page-content"))}catch(l){b(l.message||"Error al activar contrato","error")}})),document.querySelectorAll(".download-btn").forEach(n=>n.addEventListener("click",async()=>{var l,r;try{b("Generando PDF...","info");const o=((r=(l=u.opts)==null?void 0:l.baseUrl)==null?void 0:r.replace("/api/v1",""))||"",d=localStorage.getItem("access_token")||"",i=`${o}/api/v1/contracts/${n.dataset.id}/download`,c=await fetch(i,{headers:{Authorization:`Bearer ${d}`}});if(!c.ok)throw new Error("Error generando PDF");const p=await c.blob(),g=document.createElement("a");g.href=URL.createObjectURL(p),g.download=`contrato_${n.dataset.id.slice(0,8)}.pdf`,g.click(),URL.revokeObjectURL(g.href)}catch(o){b(o.message||"No se pudo descargar el PDF","error")}})),document.querySelectorAll(".pdf-btn").forEach(n=>n.addEventListener("click",()=>{const l=new Date().toISOString().split("T")[0];x("Generar Carta de Terminación",`
        <form id="pdf-form" class="space-y-4">
            <div>
                <label class="label">Motivo</label>
                <input class="input" name="reason" value="Terminación por mutuo acuerdo" required />
            </div>
            <div>
                <label class="label">Fecha de Terminación</label>
                <input class="input" type="date" name="termination_date" value="${l}" required />
            </div>
        </form>
      `,{confirmText:"Generar PDF",onConfirm:async()=>{var i,c;const r=new FormData(document.getElementById("pdf-form")),o=Object.fromEntries(r),d=await u.post(`/contracts/${n.dataset.id}/termination-letter`,o);if(b("PDF Generado","success"),d.pdf_url){const p=((c=(i=u.opts)==null?void 0:i.baseUrl)==null?void 0:c.replace("/api/v1",""))||"";window.open(p+d.pdf_url,"_blank")}}})})),document.querySelectorAll(".payments-btn").forEach(n=>n.addEventListener("click",async()=>{var c;const[l,r]=await Promise.all([u.get(`/contracts/${n.dataset.id}/payments`),u.get("/accounts")]),o=r.items||r||[],d=p=>p==="Pagado"?"badge-green":p==="Vencido"?"badge-red":"badge-yellow";x("Cronograma de Pagos",`
      <div class="space-y-4">
        <div class="max-h-80 overflow-y-auto border border-surface-100 rounded-xl">
          <table class="data-table text-xs">
            <thead class="sticky top-0 bg-white z-10 shadow-sm">
              <tr><th>Fecha</th><th>Monto</th><th>Estado</th><th class="text-right">Acción</th></tr>
            </thead>
            <tbody>
              ${l.map(p=>`
                <tr class="hover:bg-surface-50">
                  <td class="font-medium">${E(p.due_date)}</td>
                  <td class="font-black text-accent-700">${f(p.amount)}</td>
                  <td><span class="badge ${d(p.status)} text-[10px] uppercase font-bold">${p.status}</span></td>
                  <td class="text-right">
                    ${p.status==="Pendiente"?`
                      <button class="btn-primary py-1 px-3 text-[10px] pay-payment-btn"
                        data-pid="${p.id}" data-cid="${n.dataset.id}" data-amount="${p.amount}">
                        PAGAR
                      </button>
                    `:p.status==="Pagado"?'<i data-lucide="check-circle" class="w-4 h-4 text-accent-500 ml-auto inline-block"></i>':""}
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div id="payment-receipt-box" class="hidden p-4 bg-primary-50 border border-primary-100 rounded-xl animate-fade-in">
          <h5 class="text-xs font-bold text-primary-900 mb-2 uppercase tracking-tight">Confirmar Recepción de Pago</h5>
          <div class="flex flex-col gap-3">
            <div>
              <label class="block text-[10px] font-bold text-primary-700 mb-1 uppercase">Cuenta de Destino</label>
              <select id="pay-account-id" class="select text-xs py-1.5 w-full">
                ${o.length?o.map(p=>`<option value="${p.id}">${p.account_name} (${f(p.current_balance)})</option>`).join(""):'<option value="" disabled>No hay cuentas disponibles</option>'}
              </select>
            </div>
            <button id="confirm-pay-btn" class="btn-primary w-full py-2">Confirmar Pago</button>
          </div>
        </div>
      </div>
    `,{showCancel:!1}),window.lucide&&lucide.createIcons();let i=null;document.querySelectorAll(".pay-payment-btn").forEach(p=>p.addEventListener("click",()=>{i={pid:p.dataset.pid,cid:p.dataset.cid},document.getElementById("payment-receipt-box").classList.remove("hidden"),document.querySelectorAll(".pay-payment-btn").forEach(g=>g.closest("tr").classList.remove("bg-primary-50")),p.closest("tr").classList.add("bg-primary-50")})),(c=document.getElementById("confirm-pay-btn"))==null||c.addEventListener("click",async()=>{if(!i)return;const p=document.getElementById("pay-account-id").value;if(!p){b("Seleccione una cuenta","error");return}try{await u.post(`/contracts/${i.cid}/payments/${i.pid}/pay?account_id=${p}`,{}),b("✅ Pago registrado — transacción bancaria creada","success"),await G(a||document.getElementById("page-content"))}catch(g){b(g.message||"Error al registrar pago","error")}})}))}function qe(t=[],s){const e=new Date().toISOString().split("T")[0];x("Nuevo Contrato",`<form id="cf" class="space-y-4">
    <div>
      <label class="label">Propiedad *</label>
      <select class="select" name="property_id" required>
        <option value="">Seleccione propiedad...</option>
        ${t.map(a=>`<option value="${a.id}">${a.name} (${a.property_type})</option>`).join("")}
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
      <div><label class="label">Inicio *</label><input class="input" name="start_date" type="date" required value="${e}" /></div>
      <div><label class="label">Fin *</label><input class="input" name="end_date" type="date" required /></div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div><label class="label">Depósito</label><input class="input" name="deposit_amount" type="number" step="0.01" /></div>
      <div><label class="label">Incremento Anual %</label><input class="input" name="annual_increment_pct" type="number" step="0.01" value="5" /></div>
    </div>
  </form>`,{confirmText:"Crear",onConfirm:async()=>{const a=new FormData(document.getElementById("cf")),n={};a.forEach((l,r)=>{l&&(n[r]=["monthly_rent","deposit_amount","annual_increment_pct"].includes(r)?parseFloat(l):l)}),n.auto_renewal=!1,await u.post("/contracts",n),b("Contrato creado en Borrador — use ✓ para activarlo","success"),await G(s||document.getElementById("page-content"))}})}function Fe(t,s){const e={};s.forEach(n=>{e[n.tenant_name]||(e[n.tenant_name]={name:n.tenant_name,email:n.tenant_email,phone:n.tenant_phone,document:n.tenant_document,active_contracts:0}),n.status==="Activo"&&e[n.tenant_name].active_contracts++});const a=Object.values(e);t.innerHTML=`
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        ${a.length?a.map(n=>`
            <div class="glass-card-static p-5 flex items-start gap-4">
                <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg shrink-0">
                    ${n.name.charAt(0)}
                </div>
                <div class="min-w-0 flex-1">
                    <h4 class="font-bold text-surface-900 truncate">${n.name}</h4>
                    <p class="text-xs text-surface-500 mt-1"><i data-lucide="mail" class="w-3 h-3 inline mr-1"></i>${n.email||"-"}</p>
                    <p class="text-xs text-surface-500 mt-1"><i data-lucide="phone" class="w-3 h-3 inline mr-1"></i>${n.phone||"-"}</p>
                    <p class="text-xs text-surface-500 mt-1"><i data-lucide="credit-card" class="w-3 h-3 inline mr-1"></i>${n.document||"-"}</p>
                    <div class="mt-3">
                        <span class="badge ${n.active_contracts>0?"badge-green":"badge-gray"} text-xs">
                            ${n.active_contracts} Contratos Activos
                        </span>
                    </div>
                </div>
            </div>
        `).join(""):'<div class="col-span-full py-12 text-center text-surface-500">No hay inquilinos registrados.</div>'}
        </div>
    `,window.lucide&&lucide.createIcons()}async function Oe(t){t.innerHTML=`
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
            ${Array.from({length:12},(r,o)=>`<option value="${o+1}">${new Date(0,o).toLocaleString("es",{month:"long"})}</option>`).join("")}
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
  `,window.lucide&&lucide.createIcons();const[s,e]=await Promise.all([u.get("/properties?limit=100"),u.get("/properties?limit=1").then(r=>{var o;return((o=r.items.find(d=>d.name==="Gastos Generales"))==null?void 0:o.id)||"GENERAL"})]),a=s.items||[],n=document.getElementById("filter-property");a.filter(r=>r.id!==e).forEach(r=>{const o=document.createElement("option");o.value=r.id,o.textContent=r.name,n.appendChild(o)});const l=async()=>{const r=document.getElementById("budgets-table-container"),o=document.getElementById("filter-property").value,d=document.getElementById("filter-year").value,i=document.getElementById("filter-month").value,c=document.getElementById("filter-status").value;let p="/budgets?limit=100";o&&(p+=`&property_id=${o}`),d&&(p+=`&year=${d}`),i&&(p+=`&month=${i}`);try{const g=await u.get(p);let v=g;c&&(v=g.filter(h=>h.semaphore===c)),ce(r,v,a,e,l)}catch(g){r.innerHTML=`<div class="p-8 text-center text-rose-500">Error al cargar presupuestos: ${g.message}</div>`}};document.getElementById("apply-filters").addEventListener("click",l),document.getElementById("add-budget-btn").addEventListener("click",()=>ue(a,null,l)),l()}function ce(t,s,e,a,n,l="",r=1){if(!s.length){t.innerHTML='<div class="py-20 text-center text-surface-400">No se encontraron presupuestos con los filtros seleccionados.</div>';return}t.innerHTML=`
    <table class="data-table">
      <thead>
        <tr>
          <th class="sortable cursor-pointer hover:bg-surface-100" data-sort="property">
            Propiedad ${l==="property"?`<i data-lucide="chevron-${r===1?"up":"down"}" class="w-3 h-3 inline ml-1"></i>`:'<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>'}
          </th>
          <th class="sortable cursor-pointer hover:bg-surface-100" data-sort="date">
            Periodo ${l==="date"?`<i data-lucide="chevron-${r===1?"up":"down"}" class="w-3 h-3 inline ml-1"></i>`:'<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>'}
          </th>
          <th class="sortable cursor-pointer hover:bg-surface-100" data-sort="status">
            Estado ${l==="status"?`<i data-lucide="chevron-${r===1?"up":"down"}" class="w-3 h-3 inline ml-1"></i>`:'<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>'}
          </th>
          <th class="sortable cursor-pointer hover:bg-surface-100" data-sort="budget">
            Presupuesto ${l==="budget"?`<i data-lucide="chevron-${r===1?"up":"down"}" class="w-3 h-3 inline ml-1"></i>`:'<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>'}
          </th>
          <th>Ejecutado</th>
          <th class="sortable cursor-pointer hover:bg-surface-100" data-sort="pct">
            % Ejecución ${l==="pct"?`<i data-lucide="chevron-${r===1?"up":"down"}" class="w-3 h-3 inline ml-1"></i>`:'<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>'}
          </th>
          <th class="text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${s.map(o=>{const d=e.find(c=>c.id===o.property_id);return`
          <tr class="hover:bg-surface-50 transition-colors">
            <td>
              <div class="font-semibold text-surface-900">${o.property_id===a?"Gastos Generales":d?d.name:"Unidad Borrada"}</div>
              <div class="text-[10px] text-surface-400 italic">${o.property_id.slice(0,8)}...</div>
            </td>
            <td>
              <span class="text-sm font-medium text-surface-700">${o.year} - ${new Date(0,o.month-1).toLocaleString("es",{month:"short",year:"numeric"}).toUpperCase()}</span>
            </td>
            <td>
              <div class="flex items-center gap-2">
                <span class="semaphore ${ve(o.semaphore)}"></span>
                <span class="text-xs font-semibold ${o.semaphore==="Verde"?"text-green-600":o.semaphore==="Amarillo"?"text-amber-600":"text-red-600"}">${o.semaphore}</span>
              </div>
            </td>
            <td class="text-sm font-medium text-surface-900">${f(o.total_budget)}</td>
            <td class="text-sm font-medium text-surface-600">${f(o.total_executed)}</td>
            <td class="w-48">
              <div class="flex items-center gap-3">
                <div class="flex-1 bg-surface-100 rounded-full h-1.5 overflow-hidden">
                  <div class="h-full rounded-full ${o.semaphore==="Verde"?"bg-green-500":o.semaphore==="Amarillo"?"bg-amber-500":"bg-red-500"}" 
                    style="width: ${Math.min(o.execution_pct,100)}%"></div>
                </div>
                <span class="text-xs font-bold w-10">${V(o.execution_pct)}</span>
              </div>
            </td>
            <td>
              <div class="flex justify-end gap-2">
                <a href="#/budget-report?property_id=${o.property_id}&year=${o.year}&month=${o.month}" 
                  class="p-2 rounded-lg hover:bg-primary-50 text-primary-600 transition" title="Ver Reporte Detallado">
                  <i data-lucide="bar-chart-3" class="w-4 h-4"></i>
                </a>
                <button class="edit-btn p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition" 
                  data-id="${o.id}" title="Editar">
                  <i data-lucide="edit-3" class="w-4 h-4"></i>
                </button>
                <button class="duplicate-btn p-2 rounded-lg hover:bg-surface-100 text-surface-500 transition" 
                  data-id="${o.id}" title="Duplicar">
                  <i data-lucide="copy" class="w-4 h-4"></i>
                </button>
                <button class="delete-budget-btn p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition" 
                  data-id="${o.id}" title="Eliminar">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </td>
          </tr>
        `}).join("")}
      </tbody>
    </table>
  `,window.lucide&&lucide.createIcons(),t.querySelectorAll("th.sortable").forEach(o=>{o.addEventListener("click",()=>{const d=o.dataset.sort;l===d?r*=-1:(l=d,r=1);const i=[...s].sort((c,p)=>{var h,w;let g,v;return d==="property"?(g=((h=e.find($=>$.id===c.property_id))==null?void 0:h.name)||"",v=((w=e.find($=>$.id===p.property_id))==null?void 0:w.name)||""):d==="date"?(g=c.year*100+c.month,v=p.year*100+p.month):d==="status"?(g=c.semaphore,v=p.semaphore):d==="budget"?(g=c.total_budget,v=p.total_budget):d==="pct"&&(g=c.execution_pct,v=p.execution_pct),(g>v?1:-1)*r});ce(t,i,e,a,n,d,r)})}),t.querySelectorAll(".edit-btn").forEach(o=>{o.addEventListener("click",async()=>{const d=s.find(i=>i.id===o.dataset.id);ue(e,d,n)})}),t.querySelectorAll(".duplicate-btn").forEach(o=>{o.addEventListener("click",()=>{const d=s.find(i=>i.id===o.dataset.id);Ge(e,d,n)})}),t.querySelectorAll(".delete-budget-btn").forEach(o=>{o.addEventListener("click",async()=>{x("¿Eliminar Presupuesto?","Esta acción borrará el presupuesto de este periodo y sus categorías.",{confirmText:"Eliminar",onConfirm:async()=>{await u.delete(`/budgets/${o.dataset.id}`),b("Presupuesto eliminado","success"),n()}})})})}function ue(t,s=null,e){const a=!!s,n=a?s.year:new Date().getFullYear(),l=a?s.month:new Date().getMonth()+1,r=t.map(c=>`<option value="${c.id}" ${a&&s.property_id===c.id?"selected":""}>${c.name}</option>`).join("");x(a?"Editar Presupuesto":"Nuevo Presupuesto",`
    <form id="bf" class="space-y-4">
      <div class="${a?"pointer-events-none opacity-60":""}">
        <label class="label">Propiedad *</label>
        <select class="select" name="property_id" required>
          <option value="GENERAL" ${a&&s.property_id==="GENERAL"?"selected":""}>Gastos Generales (Distribuible)</option>
          ${r}
        </select>
        ${a?'<p class="text-[10px] text-surface-400 mt-1">La propiedad y periodo no se pueden cambiar. Duplique el presupuesto si lo desea en otro lugar.</p>':""}
      </div>
      <div class="grid grid-cols-3 gap-4 items-end ${a?"pointer-events-none opacity-60":""}">
        <div><label class="label">Año *</label><input class="input" name="year" type="number" value="${n}" required /></div>
        <div><label class="label">Mes *</label><input class="input" name="month" type="number" min="1" max="12" value="${l}" required /></div>
        <div id="total-budget-container">
           <label class="label">Presupuesto *</label>
           <input class="input" name="total_budget" id="total_budget_input" type="number" step="0.01" value="${a?s.total_budget:""}" ${a&&s.auto_calculate_total?"disabled":""} />
        </div>
      </div>
      <div class="flex items-center gap-2 bg-primary-50 p-3 rounded-xl border border-primary-100">
        <input type="checkbox" id="auto_calculate_total" name="auto_calculate_total" class="w-4 h-4 rounded text-primary-600" ${a&&s.auto_calculate_total?"checked":""} />
        <div class="flex-1">
          <label for="auto_calculate_total" class="text-sm font-bold text-primary-900 cursor-pointer">Autocalcular total</label>
          <p class="text-[10px] text-primary-600">El total será la suma de los montos de cada categoría configurada.</p>
        </div>
      </div>

      ${a?"":`
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
          ${a?s.categories.map(c=>oe(c.category_name,c.budgeted_amount,c.is_distributable)).join(""):""}
        </div>
      </div>
      <div>
        <label class="label">Notas</label>
        <textarea class="textarea text-sm" name="notes" placeholder="Opcional...">${a&&s.notes||""}</textarea>
      </div>
    </form>
  `,{confirmText:a?"Guardar Cambios":"Crear Presupuesto",onConfirm:async()=>{var w;const c=document.getElementById("bf"),p=new FormData(c),g=document.getElementById("auto_calculate_total").checked,v=[];c.querySelectorAll(".cat-row").forEach($=>{const T=$.querySelector('[name="cat_name"]').value,k=$.querySelector('[name="cat_amount"]').value,C=$.querySelector('[name="cat_dist"]').checked;T&&k&&v.push({category_name:T,budgeted_amount:parseFloat(k),is_distributable:C})});const h={property_id:p.get("property_id"),year:parseInt(p.get("year")),month:parseInt(p.get("month")),total_budget:g?0:parseFloat(p.get("total_budget"))||0,categories:v,auto_calculate_total:g,notes:p.get("notes")};a?(await u.put(`/budgets/${s.id}`,h),b("Presupuesto actualizado","success")):(h.is_annual=((w=document.getElementById("is_annual"))==null?void 0:w.checked)||!1,await u.post("/budgets",h),b("Presupuesto creado","success")),e&&e()}});const o=document.getElementById("auto_calculate_total"),d=document.getElementById("total_budget_input");o.addEventListener("change",()=>{d.disabled=o.checked,o.checked&&i()});const i=()=>{if(!o.checked)return;let c=0;document.querySelectorAll(".cat-row").forEach(p=>{c+=parseFloat(p.querySelector('[name="cat_amount"]').value||0)}),d.value=c};document.getElementById("add-cat-btn").addEventListener("click",()=>{const c=document.getElementById("cats-list"),p=document.createElement("div");p.innerHTML=oe();const g=p.firstElementChild;c.appendChild(g),window.lucide&&lucide.createIcons(),g.querySelector('[name="cat_amount"]').addEventListener("input",i)}),document.querySelectorAll('.cat-row [name="cat_amount"]').forEach(c=>{c.addEventListener("input",i)}),window.lucide&&lucide.createIcons()}function oe(t="",s="",e=!1){return`
    <div class="cat-row flex gap-2 items-center animate-fade-in group">
      <input class="input text-sm py-1.5 flex-1" name="cat_name" value="${t}" placeholder="Ej: Mantenimiento" />
      <input class="input text-sm py-1.5 w-40" name="cat_amount" type="number" step="0.01" value="${s}" placeholder="$" />
      <div class="flex items-center gap-1">
        <input type="checkbox" name="cat_dist" class="w-4 h-4" ${e?"checked":""} />
        <span class="text-[10px] text-surface-400">Dist.</span>
      </div>
      <button type="button" class="p-1.5 text-rose-300 hover:text-rose-600 transition" onclick="this.parentElement.remove(); document.dispatchEvent(new Event('catChange'));">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>
  `}document.addEventListener("catChange",()=>{const t=document.getElementById("auto_calculate_total");if(t&&t.checked){let s=0;document.querySelectorAll(".cat-row").forEach(a=>{s+=parseFloat(a.querySelector('[name="cat_amount"]').value||0)});const e=document.getElementById("total_budget_input");e&&(e.value=s)}});function Ge(t,s,e){const a=new Date().getFullYear(),n=t.map(l=>`<option value="${l.id}" ${s.property_id===l.id?"selected":""}>${l.name}</option>`).join("");x("Duplicar Periodo",`
    <form id="df" class="space-y-4">
      <div class="bg-indigo-50 p-3 rounded-xl border border-indigo-100 mb-4 flex gap-3 items-center">
        <i data-lucide="copy" class="w-5 h-5 text-indigo-600"></i>
        <p class="text-xs text-indigo-700">Copia este presupuesto a un nuevo mes/año con un ajuste opcional.</p>
      </div>
      
      <div>
        <label class="label">Propiedad Destino *</label>
        <select class="select" name="target_property_id" required>
          <option value="GENERAL" ${s.property_id==="GENERAL"?"selected":""}>Gastos Generales (Distribuible)</option>
          ${n}
        </select>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Año Destino *</label><input class="input" name="target_year" type="number" value="${a}" required /></div>
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
  `,{confirmText:"Procesar Duplicación",onConfirm:async()=>{const l=new FormData(document.getElementById("df")),r={target_year:parseInt(l.get("target_year")),target_month:parseInt(l.get("target_month")),target_property_id:l.get("target_property_id"),percentage_increase:parseFloat(l.get("percentage_increase")||0)};await u.post(`/budgets/${s.id}/duplicate`,r),b("Presupuesto duplicado","success"),e&&e()}}),window.lucide&&lucide.createIcons()}async function Re(t){const s=new URLSearchParams(window.location.hash.split("?")[1]||""),e=s.get("property_id"),a=s.get("year"),n=s.get("month");if(!e||!a||!n){t.innerHTML='<div class="p-12 text-center text-surface-500">Faltan parámetros para el reporte.</div>';return}const l=await u.get(`/budgets/report/${e}?year=${a}&month=${n}`),r=new Set;l.rows.forEach(d=>{Object.keys(d.distribution).forEach(i=>r.add(i))});const o=Array.from(r);t.innerHTML=`
    <div class="mb-6 flex items-center justify-between">
      <a href="#/budgets" class="btn-ghost text-sm"><i data-lucide="arrow-left" class="w-4 h-4 mr-1"></i> Volver</a>
      <div class="text-right">
        <h4 class="font-bold text-surface-900">Periodo: ${n}/${a}</h4>
      </div>
    </div>

    <div class="glass-card overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-surface-50 border-b border-surface-200">
            <th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Categoría</th>
            <th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Presupuestado</th>
            <th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Ejecutado Total</th>
            ${o.map(d=>`<th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">${d.slice(0,8)}...</th>`).join("")}
            <th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Diferencia</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-100">
          ${l.rows.length?l.rows.map(d=>{const i=d.budgeted-d.actual,c=i>=0?"text-green-600":"text-red-600";return`
              <tr class="hover:bg-surface-50/50 transition-colors">
                <td class="p-4 font-medium text-surface-700">
                  <div class="flex flex-col">
                    <span>${d.category}</span>
                    ${d.is_distributable?'<span class="text-[10px] text-primary-500 font-bold uppercase">Distribuible</span>':""}
                  </div>
                </td>
                <td class="p-4 text-surface-600 font-mono text-sm">${f(d.budgeted)}</td>
                <td class="p-4 text-surface-900 font-bold font-mono text-sm">${f(d.actual)}</td>
                ${o.map(p=>`
                  <td class="p-4 text-surface-500 font-mono text-xs">
                    ${d.distribution[p]?f(d.distribution[p]):"--"}
                  </td>
                `).join("")}
                <td class="p-4 font-bold font-mono text-sm ${c}">${f(i)}</td>
              </tr>
            `}).join(""):`<tr><td colspan="${4+o.length}" class="p-8 text-center text-surface-400">Sin datos para este periodo</td></tr>`}
        </tbody>
      </table>
    </div>

    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card-static p-4">
        <p class="text-xs text-surface-400 uppercase font-bold mb-1">Total Presupuesto</p>
        <p class="text-xl font-bold text-surface-900 font-mono">${f(l.rows.reduce((d,i)=>d+i.budgeted,0))}</p>
      </div>
      <div class="glass-card-static p-4">
        <p class="text-xs text-surface-400 uppercase font-bold mb-1">Total Ejecutado</p>
        <p class="text-xl font-bold text-primary-600 font-mono">${f(l.rows.reduce((d,i)=>d+i.actual,0))}</p>
      </div>
       <div class="glass-card-static p-4">
        <p class="text-xs text-surface-400 uppercase font-bold mb-1">Cumpimiento</p>
        <p class="text-xl font-bold text-surface-900 font-mono">
          ${V(l.rows.reduce((d,i)=>d+i.actual,0)/(l.rows.reduce((d,i)=>d+i.budgeted,0)||1)*100)}
        </p>
      </div>
    </div>
  `,window.lucide&&lucide.createIcons()}async function Y(t,s){const[e,a,n]=await Promise.all([u.get("/assets"),u.get("/inspections"),u.get("/properties?limit=100")]),l=n.items||[];t.innerHTML=`
        <div class="space-y-6 animate-fade-in">
            <!-- Tabs -->
            <div class="flex border-b border-surface-200">
                <button class="tab-btn active" data-tab="assets">Inventario de Activos</button>
                <button class="tab-btn" data-tab="inspections">Inspecciones</button>
                <button class="tab-btn" data-tab="providers">Proveedores</button>
            </div>

            <div id="tab-content" class="min-h-[400px]">
                <!-- Content will be rendered here -->
            </div>
        </div>
    `;const r=t.querySelector("#tab-content"),o=t.querySelectorAll(".tab-btn");o.forEach(d=>{d.addEventListener("click",()=>{o.forEach(i=>i.classList.remove("active")),d.classList.add("active"),re(d.dataset.tab,r,{assets:e,inspections:a,properties:l})})}),re("assets",r,{assets:e,inspections:a,properties:l})}async function re(t,s,e){switch(t){case"assets":Ne(s,e);break;case"inspections":ze(s,e);break;case"providers":He(s);break}}function Ne(t,{assets:s,properties:e}){t.innerHTML=`
        <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-semibold text-surface-700">Equipos y Mobiliario</h4>
            <button id="add-asset-btn" class="btn-primary btn-sm px-3 py-1.5"><i data-lucide="plus" class="w-4 h-4"></i> Nuevo Activo</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${s.length?s.map(a=>`
                <div class="glass-card-static p-4 space-y-3">
                    <div class="flex justify-between items-start">
                        <div>
                            <span class="text-[10px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">${a.category}</span>
                            <h5 class="font-bold text-surface-900 mt-1">${a.name}</h5>
                        </div>
                        <span class="badge ${a.status==="Operativo"?"badge-green":"badge-amber"}">${a.status}</span>
                    </div>
                    <div class="text-xs text-surface-500 space-y-1">
                        <p><span class="font-medium">Marca:</span> ${a.brand||"N/A"}</p>
                        <p><span class="font-medium">Modelo:</span> ${a.model||"N/A"}</p>
                        <p><span class="font-medium">Serial:</span> ${a.serial_number||"N/A"}</p>
                    </div>
                    <div class="pt-2 border-t border-surface-100 flex justify-between items-center">
                        <span class="text-[10px] text-surface-400">Propiedad: ${a.property_id.slice(0,8)}</span>
                        <button class="text-primary-600 hover:text-primary-700 text-xs font-semibold">Detalles</button>
                    </div>
                </div>
            `).join(""):'<p class="text-surface-400 text-center py-20 col-span-full">No hay activos registrados.</p>'}
        </div>
    `,document.getElementById("add-asset-btn").addEventListener("click",()=>Ue(e)),window.lucide&&lucide.createIcons()}function ze(t,{inspections:s,properties:e}){t.innerHTML=`
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
                    ${s.length?s.map(a=>`
                        <tr>
                            <td class="font-medium">${a.inspection_type}</td>
                            <td>${E(a.scheduled_date)}</td>
                            <td><span class="badge ${a.status==="Realizada"?"badge-green":a.status==="Cancelada"?"badge-red":"badge-blue"}">${a.status}</span></td>
                            <td>${a.inspector_name||"-"}</td>
                            <td class="text-xs text-surface-500">${a.property_id.slice(0,8)}</td>
                            <td class="text-right">
                                <button class="text-surface-400 hover:text-primary-600"><i data-lucide="more-horizontal" class="w-5 h-5"></i></button>
                            </td>
                        </tr>
                    `).join(""):'<tr><td colspan="6" class="text-center py-10 text-surface-400">No hay inspecciones programadas.</td></tr>'}
                </tbody>
            </table>
        </div>
    `,document.getElementById("add-insp-btn").addEventListener("click",()=>Ve(e)),window.lucide&&lucide.createIcons()}async function He(t){const s=await u.get("/contacts?type=Proveedor");t.innerHTML=`
        <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-semibold text-surface-700">Directorio de Proveedores</h4>
            <button id="add-prov-btn" class="btn-primary btn-sm px-3 py-1.5"><i data-lucide="user-plus" class="w-4 h-4"></i> Nuevo Proveedor</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${s.length?s.map(e=>`
                <div class="glass-card-static p-4 flex gap-4 items-center">
                    <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                        ${e.name.charAt(0)}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h5 class="font-bold text-surface-900 truncate">${e.name}</h5>
                        <p class="text-xs text-surface-500 truncate">${e.email||"Sin correo"}</p>
                        <p class="text-xs font-medium text-primary-600 mt-1">${e.phone||"Sin teléfono"}</p>
                    </div>
                </div>
            `).join(""):'<p class="text-surface-400 text-center py-20 col-span-full">No se encontraron proveedores.</p>'}
        </div>
    `,window.lucide&&lucide.createIcons()}function Ue(t){const s=t.map(e=>`<option value="${e.id}">${e.name}</option>`).join("");x("Nuevo Activo",`
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
    `,{confirmText:"Guardar",onConfirm:async()=>{const e=new FormData(document.getElementById("af")),a=Object.fromEntries(e);await u.post("/assets",a),b("Activo registrado","success"),await Y(document.getElementById("page-content"))}})}function Ve(t){const s=t.map(e=>`<option value="${e.id}">${e.name}</option>`).join("");x("Programar Inspección",`
        <form id="if" class="space-y-4">
            <div>
                <label class="label">Propiedad *</label>
                <select class="select" name="property_id" required>${s}</select>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="label">Tipo *</label>
                    <select class="select" name="inspection_type" required>
                        <option value="Preventiva">Preventiva</option>
                        <option value="Entrega">Entrega</option>
                        <option value="Recibo">Recibo</option>
                        <option value="Rutinaria">Rutinaria</option>
                    </select>
                </div>
                <div><label class="label">Fecha Programada *</label><input class="input" name="scheduled_date" type="date" required /></div>
            </div>
            <div>
                <label class="label">Inspector</label>
                <input class="input" name="inspector_name" placeholder="Nombre del inspector" />
            </div>
        </form>
    `,{confirmText:"Programar",onConfirm:async()=>{const e=new FormData(document.getElementById("if")),a=Object.fromEntries(e);await u.post("/inspections",a),b("Inspección programada","success"),await Y(document.getElementById("page-content"))}})}let z=null,H=null;async function We(t){const e=new URLSearchParams(window.location.hash.split("?")[1]).get("id");if(!e){t.innerHTML='<div class="p-8 text-center text-rose-500">Error: No se proporcionó ID de cuenta.</div>';return}t.innerHTML=`
        <div class="flex items-center justify-center py-20">
            <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
        </div>
    `;try{await pe(t,e)}catch(a){t.innerHTML=`<div class="p-8 text-center text-rose-500">Error al cargar datos de la cuenta: ${a.message}</div>`}}async function pe(t,s,e={}){const a=new URLSearchParams;e.date_from&&a.set("date_from",e.date_from),e.date_to&&a.set("date_to",e.date_to),e.tx_type&&a.set("tx_type",e.tx_type),a.set("months",12);const n=await u.get(`/accounts/${s}/history?${a.toString()}`);if(!n)return;const{account:l,monthly_cashflow:r,recent_transactions:o,balance_history:d}=n;t.innerHTML=`
        <div class="flex flex-col gap-6 animate-fade-in">
            <!-- Header & Balance -->
            <div class="flex flex-col md:flex-row gap-6 items-center glass-card-static p-6 border-white/40 shadow-sm relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -translate-y-16 translate-x-16"></div>
                <div class="text-center md:text-left flex-1 z-10">
                    <div class="flex items-center gap-3 mb-2">
                        <a href="#/financials" class="p-2 rounded-xl bg-white/50 hover:bg-white text-surface-400 hover:text-primary-600 transition shadow-sm border border-white/20">
                            <i data-lucide="arrow-left" class="w-4 h-4"></i>
                        </a>
                        <h2 class="text-2xl font-black text-surface-900">${l.account_name}</h2>
                    </div>
                    <p class="text-surface-500 text-sm ml-11">${l.bank_name||"Sin Banco"} • ${l.account_type} • ${l.currency}</p>
                </div>
                <div class="bg-white/80 backdrop-blur-md px-8 py-4 rounded-2xl shadow-xl shadow-primary-500/5 border border-white text-center z-10 group transition-transform hover:scale-105">
                    <p class="text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-1">Saldo Disponible</p>
                    <p class="text-3xl font-black ${l.current_balance>=0?"text-accent-600":"text-rose-600"}">
                        ${f(l.current_balance)}
                    </p>
                </div>
            </div>

            <!-- Filters Row -->
            <div class="flex flex-wrap items-end gap-4 p-5 glass-card-static border-white/40 shadow-sm">
                <div class="flex-1 min-w-[150px]">
                    <label class="block text-[10px] font-bold text-surface-400 uppercase mb-2 tracking-wider ml-1">Desde</label>
                    <div class="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-xl border border-white/20 shadow-sm">
                        <i data-lucide="calendar" class="w-4 h-4 text-surface-400"></i>
                        <input type="date" id="filter-date-from" class="bg-transparent text-sm font-medium focus:outline-none w-full" value="${e.date_from||""}">
                    </div>
                </div>
                <div class="flex-1 min-w-[150px]">
                    <label class="block text-[10px] font-bold text-surface-400 uppercase mb-2 tracking-wider ml-1">Hasta</label>
                    <div class="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-xl border border-white/20 shadow-sm">
                        <i data-lucide="calendar" class="w-4 h-4 text-surface-400"></i>
                        <input type="date" id="filter-date-to" class="bg-transparent text-sm font-medium focus:outline-none w-full" value="${e.date_to||""}">
                    </div>
                </div>
                <div class="flex-1 min-w-[150px]">
                    <label class="block text-[10px] font-bold text-surface-400 uppercase mb-2 tracking-wider ml-1">Tipo de Transacción</label>
                    <div class="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-xl border border-white/20 shadow-sm">
                        <i data-lucide="list-filter" class="w-4 h-4 text-surface-400"></i>
                        <select id="filter-tx-type" class="bg-transparent text-sm font-medium focus:outline-none w-full appearance-none">
                            <option value="">Cualquier tipo</option>
                            <option value="Ingreso" ${e.tx_type==="Ingreso"?"selected":""}>Ingreso</option>
                            <option value="Gasto" ${e.tx_type==="Gasto"?"selected":""}>Gasto</option>
                            <option value="Transferencia" ${e.tx_type==="Transferencia"?"selected":""}>Transferencia</option>
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
                        ${o.length} registros en periodo
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
                            ${o.length>0?o.map(i=>`
                                <tr class="hover:bg-white/50 transition-colors group">
                                    <td class="text-xs text-surface-400 font-medium italic">${E(i.transaction_date)}</td>
                                    <td>
                                        <div class="font-bold text-surface-900 text-sm group-hover:text-primary-600 transition-colors">${i.description}</div>
                                        <div class="text-[10px] text-surface-400 flex items-center gap-1 mt-0.5">
                                            <i data-lucide="map-pin" class="w-2.5 h-2.5"></i>
                                            ${i.property_name||"Gasto General Corporativo"}
                                        </div>
                                    </td>
                                    <td>
                                        <span class="badge badge-gray !rounded-lg text-[10px] font-semibold">${i.category}</span>
                                    </td>
                                    <td class="text-right font-black text-sm ${i.direction==="Debit"?"text-accent-600":"text-rose-600"}">
                                        <div class="flex items-center justify-end gap-1">
                                            <span>${i.direction==="Debit"?"+":"-"}</span>
                                            <span>${f(i.amount)}</span>
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
    `,window.lucide&&lucide.createIcons(),document.getElementById("btn-apply-filters").addEventListener("click",()=>{const i={date_from:document.getElementById("filter-date-from").value,date_to:document.getElementById("filter-date-to").value,tx_type:document.getElementById("filter-tx-type").value};pe(t,s,i)}),Ke(r,d)}function Ke(t,s){z&&z.destroy(),H&&H.destroy();const e=document.getElementById("account-history-chart");e&&t.length>0&&(z=new Chart(e,{type:"bar",data:{labels:t.map(n=>n.month),datasets:[{label:"Ingresos",data:t.map(n=>n.income),backgroundColor:"#00d084",borderRadius:8,barThickness:15},{label:"Gastos",data:t.map(n=>n.expenses),backgroundColor:"#ff4d4f",borderRadius:8,barThickness:15}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"bottom",labels:{boxWidth:10,usePointStyle:!0,font:{size:11,weight:"600"}}}},scales:{y:{grid:{color:"rgba(0,0,0,0.03)"},ticks:{font:{size:10},callback:n=>"$"+n.toLocaleString()}},x:{grid:{display:!1},ticks:{font:{size:10}}}}}}));const a=document.getElementById("account-balance-chart");a&&s&&s.length>0&&(H=new Chart(a,{type:"line",data:{labels:s.map(n=>E(n.date)),datasets:[{label:"Saldo",data:s.map(n=>n.balance),borderColor:"#4d7cfe",backgroundColor:"rgba(77, 124, 254, 0.1)",fill:!0,tension:.4,pointRadius:2,pointHoverRadius:6,borderWidth:4,pointBackgroundColor:"#fff",pointBorderWidth:2}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{mode:"index",intersect:!1}},scales:{y:{grid:{color:"rgba(0,0,0,0.03)"},ticks:{font:{size:10},callback:n=>"$"+n.toLocaleString()}},x:{grid:{display:!1},ticks:{font:{size:8},maxRotation:0,autoSkip:!0,maxTicksLimit:12}}}}}))}async function O(t,s){const[e,a,n]=await Promise.all([u.get("/work-groups"),u.get("/properties?limit=100"),u.get("/users?limit=100").catch(()=>({items:[]}))]),l=a.items||[],r=n.items||[];t.innerHTML=`
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
            ${e.length?e.map(o=>{var d,i;return`
                <div class="glass-card-static p-5 flex flex-col space-y-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-bold text-surface-900 text-lg">${o.name}</h4>
                            <p class="text-xs text-surface-500">${o.description||"Sin descripción"}</p>
                        </div>
                        <span class="badge badge-blue">ID: ${o.id.slice(0,4)}</span>
                    </div>

                    <div class="space-y-2 flex-grow">
                        <div class="flex justify-between text-sm">
                            <span class="text-surface-600 font-medium">Miembros</span>
                            <span class="font-bold text-surface-900">${((d=o.members)==null?void 0:d.length)||0}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-surface-600 font-medium">Propiedades Asignadas</span>
                            <span class="font-bold text-surface-900">${((i=o.assigned_properties)==null?void 0:i.length)||0}</span>
                        </div>
                    </div>

                    <div class="pt-4 border-t border-surface-100 flex gap-2">
                        <button class="btn-secondary btn-sm flex-1" onclick="window.addMemberModal('${o.id}')">
                            <i data-lucide="user-plus" class="w-4 h-4 mr-1"></i> Miembro
                        </button>
                        <button class="btn-secondary btn-sm flex-1" onclick="window.addPropertyModal('${o.id}')">
                            <i data-lucide="home" class="w-4 h-4 mr-1"></i> Propiedad
                        </button>
                    </div>
                </div>
            `}).join(""):'<div class="col-span-full py-12 text-center text-surface-500">No hay grupos de trabajo creados.</div>'}
        </div>
    `,document.getElementById("add-wg-btn").addEventListener("click",()=>{x("Nuevo Grupo de Trabajo",`
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
        `,{confirmText:"Crear",onConfirm:async()=>{const o=new FormData(document.getElementById("wg-form")),d=Object.fromEntries(o);await u.post("/work-groups",d),b("Grupo creado","success"),O(t,s)}})}),window.addMemberModal=async o=>{const d=r.length?r.map(i=>`<option value="${i.id}">${i.full_name||i.email} (${i.role})</option>`).join(""):'<option value="" disabled>No se encontraron usuarios</option>';x("Añadir Miembro",`
            <form id="wm-form" class="space-y-4">
                <div>
                    <label class="label">Usuario *</label>
                    <select class="select" name="user_id" required>
                        <option value="">Seleccione un usuario...</option>
                        ${d}
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
        `,{confirmText:"Añadir",onConfirm:async()=>{const i=new FormData(document.getElementById("wm-form")),c=Object.fromEntries(i);if(!c.user_id){b("Seleccione un usuario","error");return}await u.post(`/work-groups/${o}/members`,c),b("Miembro añadido","success"),O(t,s)}})},window.addPropertyModal=async o=>{const d=l.length?l.map(i=>`<option value="${i.id}">${i.name} (${i.property_type})</option>`).join(""):'<option value="" disabled>No se encontraron propiedades</option>';x("Asignar Propiedad",`
            <form id="wp-form" class="space-y-4">
                <div>
                    <label class="label">Propiedad *</label>
                    <select class="select" name="property_id" required>
                        <option value="">Seleccione una propiedad...</option>
                        ${d}
                    </select>
                </div>
            </form>
        `,{confirmText:"Asignar",onConfirm:async()=>{const i=new FormData(document.getElementById("wp-form")),c=Object.fromEntries(i);if(!c.property_id){b("Seleccione una propiedad","error");return}await u.post(`/work-groups/${o}/properties`,c),b("Propiedad asignada","success"),O(t,s)}})},window.lucide&&lucide.createIcons()}async function Ye(t,s){const e=await u.get("/audits?limit=50");t.innerHTML=`
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
                        ${e.length?e.map(a=>`
                            <tr class="hover:bg-surface-50">
                                <td class="whitespace-nowrap">${E(a.timestamp)}</td>
                                <td class="text-xs text-surface-600 font-mono">${a.user_id?a.user_id.slice(0,8):"Sistema"}</td>
                                <td>
                                    <span class="px-2 py-1 bg-surface-100 text-surface-700 rounded text-xs font-semibold">
                                        ${a.action}
                                    </span>
                                </td>
                                <td class="font-medium text-surface-800">${a.entity_type}</td>
                                <td class="text-xs text-surface-500 font-mono">${a.entity_id||"-"}</td>
                                <td class="text-xs text-surface-500 max-w-xs truncate" title="${a.details||""}">
                                    ${a.details||"-"}
                                </td>
                            </tr>
                        `).join(""):'<tr><td colspan="6" class="text-center py-10 text-surface-500">No hay registros de auditoría.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `,window.lucide&&lucide.createIcons()}async function Je(t){window.FullCalendar||await Ze(),t.innerHTML=`
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
    `;try{const e=((await u.get("/reports/upcoming-events?days=90")).events||[]).map(n=>({title:n.title,date:n.date,extendedProps:{detail:n.detail,type:n.type,severity:n.severity},backgroundColor:n.severity==="high"?"#f43f5e":n.severity==="medium"?"#f59e0b":"#60a5fa",borderColor:n.severity==="high"?"#e11d48":n.severity==="medium"?"#d97706":"#3b82f6",textColor:"#ffffff"}));new FullCalendar.Calendar(document.getElementById("pms-calendar"),{initialView:"dayGridMonth",locale:"es",height:620,headerToolbar:{left:"prev,next today",center:"title",right:"dayGridMonth,timeGridWeek,listMonth"},buttonText:{today:"Hoy",month:"Mes",week:"Semana",list:"Lista"},events:e,eventClick(n){const{title:l,extendedProps:r}=n.event;b(`${l} — ${r.detail}`,"info")},eventDidMount(n){n.el.title=`${n.event.title}
${n.event.extendedProps.detail}`}}).render()}catch(s){console.error("Calendar error:",s),b("Error cargando eventos del calendario","error")}}function Ze(){return new Promise((t,s)=>{if(window.FullCalendar)return t();const e=document.createElement("script");e.src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js",e.onload=t,e.onerror=s,document.head.appendChild(e)})}const I={user:null,currentPage:"dashboard"},Qe={dashboard:{title:"Dashboard",subtitle:"Vista general de su cartera inmobiliaria",render:Ie},properties:{title:"Propiedades",subtitle:"Gestión de su portfolio inmobiliario",render:W},financials:{title:"Finanzas",subtitle:"Ledger contable y conciliación bancaria",render:B},maintenance:{title:"Mantenimientos",subtitle:"Órdenes de trabajo y calendario",render:K},contracts:{title:"Contratos",subtitle:"Gestión de arrendamientos",render:G},budgets:{title:"Presupuestos",subtitle:"Control presupuestario y semáforo",render:Oe},"budget-report":{title:"Reporte de Presupuesto",subtitle:"Distribución y cumplimiento detallado",render:Re},facility:{title:"Facility Management",subtitle:"Gestión de activos e inspecciones",render:Y},"account-detail":{title:"Detalle de Cuenta",subtitle:"Historial de movimientos y análisis de saldo",render:We},"work-groups":{title:"Grupos de Trabajo",subtitle:"Gestión de equipos de mantenimiento",render:O},audits:{title:"Auditoría",subtitle:"Registro de actividades y log del sistema",render:Ye},calendar:{title:"Calendario",subtitle:"Eventos y fechas importantes próximas",render:Je}};function me(){return(window.location.hash.replace("#/","")||"dashboard").split("?")[0].split("/")[0]}async function be(t){const s=Qe[t];if(!s){window.location.hash="#/dashboard";return}I.currentPage=t,document.getElementById("page-title").textContent=s.title,document.getElementById("page-subtitle").textContent=s.subtitle,document.querySelectorAll(".sidebar-link").forEach(a=>{a.classList.toggle("active",a.dataset.page===t)});const e=document.getElementById("page-content");e.innerHTML='<div class="flex items-center justify-center py-20"><div class="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>';try{await s.render(e,I)}catch(a){console.error(`Error rendering ${t}:`,a),e.innerHTML=`
      <div class="text-center py-20">
        <i data-lucide="alert-circle" class="w-12 h-12 text-rose-400 mx-auto mb-4"></i>
        <h3 class="text-lg font-semibold text-surface-700 mb-2">Error al cargar la página</h3>
        <p class="text-surface-500">${a.message}</p>
      </div>
    `}window.lucide&&lucide.createIcons()}function R(){document.getElementById("auth-screen").classList.remove("hidden"),document.getElementById("app-shell").classList.add("hidden"),window.lucide&&lucide.createIcons()}function fe(){document.getElementById("auth-screen").classList.add("hidden"),document.getElementById("app-shell").classList.remove("hidden"),I.user&&(document.getElementById("user-name").textContent=I.user.full_name,document.getElementById("user-role").textContent=I.user.role,document.getElementById("user-avatar").textContent=I.user.full_name.charAt(0).toUpperCase()),window.lucide&&lucide.createIcons(),be(me())}async function Xe(){if(!u.isAuthenticated()){R();return}try{I.user=await u.getProfile(),fe()}catch{u.clearTokens(),R()}}function et(){window.addEventListener("hashchange",()=>{I.user&&be(me())}),document.getElementById("login-form").addEventListener("submit",async t=>{t.preventDefault();const s=document.getElementById("login-email").value,e=document.getElementById("login-password").value;try{await u.login(s,e),I.user=await u.getProfile(),b(`Bienvenido, ${I.user.full_name}`,"success"),fe()}catch(a){b(a.message,"error")}}),document.getElementById("register-form").addEventListener("submit",async t=>{t.preventDefault();const s={full_name:document.getElementById("reg-name").value,email:document.getElementById("reg-email").value,password:document.getElementById("reg-password").value,role:document.getElementById("reg-role").value};try{console.log("Registrando usuario...",s),await u.register(s),b("Cuenta creada. Inicie sesión.","success"),document.getElementById("register-form").classList.add("hidden"),document.getElementById("login-form").classList.remove("hidden"),t.target.reset()}catch(e){console.error("Error en registro:",e),b(e.message,"error")}}),document.getElementById("show-register").addEventListener("click",t=>{t.preventDefault(),document.getElementById("login-form").classList.add("hidden"),document.getElementById("register-form").classList.remove("hidden")}),document.getElementById("show-login").addEventListener("click",t=>{t.preventDefault(),document.getElementById("register-form").classList.add("hidden"),document.getElementById("login-form").classList.remove("hidden")}),document.getElementById("logout-btn").addEventListener("click",()=>{u.clearTokens(),I.user=null,b("Sesión cerrada","info"),R()}),u.onUnauthorized(()=>{I.user=null,R(),b("Sesión expirada","warning")}),Xe()}document.addEventListener("DOMContentLoaded",et);
