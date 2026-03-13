(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))e(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const l of r.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&e(l)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function e(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();const N="https://real-state-xd5o.onrender.com/api/v1";class ge{constructor(){this._accessToken=localStorage.getItem("pms_access_token"),this._refreshToken=localStorage.getItem("pms_refresh_token"),this._onUnauthorized=null}onUnauthorized(n){this._onUnauthorized=n}setTokens(n,t){this._accessToken=n,this._refreshToken=t,localStorage.setItem("pms_access_token",n),localStorage.setItem("pms_refresh_token",t)}clearTokens(){this._accessToken=null,this._refreshToken=null,localStorage.removeItem("pms_access_token"),localStorage.removeItem("pms_refresh_token")}isAuthenticated(){return!!this._accessToken}async _fetch(n,t={}){const e={"Content-Type":"application/json",...t.headers};this._accessToken&&(e.Authorization=`Bearer ${this._accessToken}`),t.body instanceof FormData&&delete e["Content-Type"];let s=await fetch(`${N}${n}`,{...t,headers:e});if(s.status===401&&this._refreshToken)if(await this._tryRefresh())e.Authorization=`Bearer ${this._accessToken}`,s=await fetch(`${N}${n}`,{...t,headers:e});else throw this.clearTokens(),this._onUnauthorized&&this._onUnauthorized(),new Error("Sesión expirada. Inicie sesión nuevamente.");if(!s.ok){let r="Error del servidor";try{const l=await s.json();typeof l.detail=="string"?r=l.detail:Array.isArray(l.detail)?r=l.detail.map(i=>i.msg).join(", "):l.detail&&(r=JSON.stringify(l.detail))}catch{r=`Error ${s.status}`}throw new Error(r)}return s.status===204?null:s.json()}async _tryRefresh(){try{const n=await fetch(`${N}/auth/refresh`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refresh_token:this._refreshToken})});if(!n.ok)return!1;const t=await n.json();return this.setTokens(t.access_token,t.refresh_token),!0}catch{return!1}}get(n){return this._fetch(n)}post(n,t){return this._fetch(n,{method:"POST",body:JSON.stringify(t)})}put(n,t){return this._fetch(n,{method:"PUT",body:JSON.stringify(t)})}delete(n){return this._fetch(n,{method:"DELETE"})}upload(n,t){return this._fetch(n,{method:"POST",body:t})}async login(n,t){const e=await this.post("/auth/login",{email:n,password:t});return this.setTokens(e.access_token,e.refresh_token),e}async register(n){return this.post("/auth/register",n)}async getProfile(){return this.get("/auth/me")}}const u=new ge;function b(a,n="info",t=4e3){const e=document.getElementById("toast-container"),s=document.createElement("div");s.className=`toast toast-${n}`,s.textContent=a,e.appendChild(s),setTimeout(()=>{s.style.opacity="0",s.style.transform="translateX(100%)",s.style.transition="all 0.3s ease-in",setTimeout(()=>s.remove(),300)},t)}function x(a,n,{onConfirm:t,confirmText:e="Guardar",showCancel:s=!0}={}){const r=document.getElementById("modal-container");r.innerHTML=`
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal-content">
        <div class="flex items-center justify-between p-6 border-b border-surface-100">
          <h3 class="text-lg font-bold text-surface-900">${a}</h3>
          <button id="modal-close" class="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
        <div class="p-6" id="modal-body">
          ${n}
        </div>
        <div class="flex items-center justify-end gap-3 p-6 border-t border-surface-100">
          ${s?'<button id="modal-cancel" class="btn-secondary">Cancelar</button>':""}
          ${t?`<button id="modal-confirm" class="btn-primary">${e}</button>`:""}
        </div>
      </div>
    </div>
  `,window.lucide&&lucide.createIcons();const l=document.getElementById("modal-overlay"),i=document.getElementById("modal-close"),d=document.getElementById("modal-cancel"),o=document.getElementById("modal-confirm"),c=()=>{r.innerHTML=""};return l.addEventListener("click",p=>{p.target===l&&c()}),i==null||i.addEventListener("click",c),d==null||d.addEventListener("click",c),o&&t&&o.addEventListener("click",async()=>{try{await t(),c()}catch(p){b(p.message,"error")}}),{close:c,getBody:()=>document.getElementById("modal-body")}}function f(a,n="COP"){return a==null?"—":new Intl.NumberFormat("es-CO",{style:"currency",currency:n,minimumFractionDigits:0,maximumFractionDigits:0}).format(a)}function X(a){return a==null?"—":Math.abs(a)>=1e6?`$${(a/1e6).toFixed(1)}M`:Math.abs(a)>=1e3?`$${(a/1e3).toFixed(0)}K`:f(a)}function E(a){return a?new Date(a).toLocaleDateString("es-CO",{year:"numeric",month:"short",day:"numeric"}):"—"}function V(a){return a==null?"—":`${Number(a).toFixed(1)}%`}function F(a){return{Disponible:"badge-green",Arrendada:"badge-blue","En Mantenimiento":"badge-amber",Vendida:"badge-gray",Pendiente:"badge-amber","En Progreso":"badge-blue",Completado:"badge-green",Cancelado:"badge-red","Esperando Factura":"badge-amber",Activo:"badge-green",Borrador:"badge-gray",Finalizado:"badge-gray",Pagado:"badge-green",Vencido:"badge-red"}[a]||"badge-gray"}function ve(a){return{Verde:"semaphore-green",Amarillo:"semaphore-amber",Rojo:"semaphore-red"}[a]||"semaphore-green"}const B={primary:"#4c6ef5",accent:"#20c997",accentLight:"rgba(32, 201, 151, 0.1)",red:"#e03131",redLight:"rgba(224, 49, 49, 0.1)"},q={responsive:!0,maintainAspectRatio:!1,plugins:{legend:{labels:{font:{family:"Inter",size:12,weight:"500"},padding:16,usePointStyle:!0,pointStyleWidth:10}},tooltip:{backgroundColor:"rgba(33, 37, 41, 0.95)",titleFont:{family:"Inter",size:13,weight:"600"},bodyFont:{family:"Inter",size:12},padding:12,cornerRadius:10,displayColors:!0}}};function xe(a,n,t,e){return new Chart(a,{type:"bar",data:{labels:n,datasets:[{label:"Ingresos",data:t,backgroundColor:B.accent,borderRadius:8,barPercentage:.6},{label:"Gastos",data:e,backgroundColor:B.red,borderRadius:8,barPercentage:.6}]},options:{...q,scales:{y:{beginAtZero:!0,grid:{color:"rgba(0,0,0,0.04)"},ticks:{font:{family:"Inter",size:11}}},x:{grid:{display:!1},ticks:{font:{family:"Inter",size:11}}}}}})}function he(a,n,t){const e=["#4c6ef5","#20c997","#f59f00","#e03131","#845ef7","#339af0"];return new Chart(a,{type:"doughnut",data:{labels:n,datasets:[{data:t,backgroundColor:e.slice(0,t.length),borderWidth:0,hoverOffset:8}]},options:{...q,cutout:"70%",plugins:{...q.plugins,legend:{...q.plugins.legend,position:"bottom"}}}})}function ye(a,n,t,e,s){return new Chart(a,{type:"line",data:{labels:n,datasets:[{label:"Ingresos Proyectados",data:t,borderColor:B.accent,backgroundColor:B.accentLight,fill:!0,tension:.4,pointRadius:4,pointHoverRadius:6,borderWidth:2.5},{label:"Gastos Proyectados",data:e,borderColor:B.red,backgroundColor:B.redLight,fill:!0,tension:.4,pointRadius:4,pointHoverRadius:6,borderWidth:2.5},{label:"Balance Neto",data:s,borderColor:B.primary,borderDash:[6,4],fill:!1,tension:.4,pointRadius:3,borderWidth:2}]},options:{...q,interaction:{mode:"index",intersect:!1},scales:{y:{grid:{color:"rgba(0,0,0,0.04)"},ticks:{font:{family:"Inter",size:11}}},x:{grid:{display:!1},ticks:{font:{family:"Inter",size:11}}}}}})}const we={Disponible:"#20c997",Arrendada:"#4c6ef5","En Mantenimiento":"#f59f00",Vendida:"#868e96"};let j=null,M=null;function $e(a,n=[4.711,-74.072],t=12){return j&&j.remove(),j=L.map(a).setView(n,t),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:19}).addTo(j),M=L.markerClusterGroup({maxClusterRadius:50,spiderfyOnMaxZoom:!0,showCoverageOnHover:!1}),j.addLayer(M),j}function _e(a){if(M&&(M.clearLayers(),a.forEach(n=>{const t=we[n.status]||"#868e96",e=L.circleMarker([n.latitude,n.longitude],{radius:10,fillColor:t,color:"#fff",weight:2,opacity:1,fillOpacity:.85}),s=`
      <div style="font-family:Inter,sans-serif; min-width:200px;">
        <h3 style="margin:0 0 4px; font-size:14px; font-weight:700; color:#212529;">${n.name}</h3>
        <p style="margin:0 0 2px; font-size:12px; color:#868e96;">${n.property_type} • ${n.city}</p>
        <div style="display:flex; align-items:center; gap:6px; margin-top:8px;">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${t};"></span>
          <span style="font-size:12px; font-weight:600; color:#495057;">${n.status}</span>
        </div>
        ${n.monthly_rent?`<p style="margin:6px 0 0; font-size:13px; font-weight:600; color:#20c997;">Canon: ${f(n.monthly_rent)}</p>`:""}
        <a href="#/properties/${n.id}" style="display:inline-block; margin-top:8px; font-size:12px; color:#4c6ef5; text-decoration:none; font-weight:600;">Ver ficha →</a>
      </div>
    `;e.bindPopup(s),M.addLayer(e)}),a.length>0)){const n=M.getBounds();n.isValid()&&j.fitBounds(n,{padding:[30,30]})}}function Ee(){j&&setTimeout(()=>j.invalidateSize(),100)}function Ce(a){return a==="high"?{bg:"bg-rose-50",border:"border-rose-200",text:"text-rose-700",dot:"bg-rose-500"}:a==="medium"?{bg:"bg-amber-50",border:"border-amber-200",text:"text-amber-700",dot:"bg-amber-500"}:{bg:"bg-blue-50",border:"border-blue-200",text:"text-blue-700",dot:"bg-blue-400"}}async function Ie(a){const[n,t,e,s]=await Promise.all([u.get("/reports/summary"),u.get("/properties/map"),u.get("/reports/cashflow?months=12"),u.get("/reports/upcoming-events?days=30").catch(()=>({events:[]}))]),r=n,l=s.events||[];if(a.innerHTML=`
    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 animate-fade-in">
      <div class="kpi-card kpi-blue">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-surface-500">Total Propiedades</span>
          <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <i data-lucide="home" class="w-5 h-5 text-primary-600"></i>
          </div>
        </div>
        <p class="text-3xl font-bold text-surface-900">${r.total_properties}</p>
      </div>

      <div class="kpi-card kpi-green">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-surface-500">Ocupación</span>
          <div class="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
            <i data-lucide="users" class="w-5 h-5 text-accent-600"></i>
          </div>
        </div>
        <p class="text-3xl font-bold text-surface-900">${V(r.occupancy_rate)}</p>
      </div>

      <div class="kpi-card kpi-green">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-surface-500">Ingresos</span>
          <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <i data-lucide="trending-up" class="w-5 h-5 text-green-600"></i>
          </div>
        </div>
        <p class="text-3xl font-bold text-surface-900">${X(r.total_income)}</p>
      </div>

      <div class="kpi-card kpi-red">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-surface-500">Gastos</span>
          <div class="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
            <i data-lucide="trending-down" class="w-5 h-5 text-rose-600"></i>
          </div>
        </div>
        <p class="text-3xl font-bold text-surface-900">${X(r.total_expenses)}</p>
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
          `:l.map(d=>{const o=Ce(d.severity);return`
            <div class="flex items-start gap-3 p-3 rounded-xl border ${o.bg} ${o.border}">
              <div class="mt-0.5 w-2 h-2 rounded-full ${o.dot} shrink-0 mt-1.5"></div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold ${o.text} truncate">${d.title}</p>
                <p class="text-[10px] text-surface-500 mt-0.5">${d.detail} · ${d.date}</p>
              </div>
              <i data-lucide="${d.icon}" class="w-4 h-4 ${o.text} shrink-0"></i>
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
      ${r.accounts.length>0?`
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          ${r.accounts.map(d=>`
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
  `,window.lucide&&lucide.createIcons(),setTimeout(()=>{$e("dashboard-map"),_e(t),Ee()},100),t.length>0){const d={};t.forEach(p=>{d[p.property_type]=(d[p.property_type]||0)+1});const o=Object.keys(d),c=Object.values(d);he(document.getElementById("type-chart"),o,c)}const i=e.months||[];if(i.length>0){const d=i.slice(-6);xe(document.getElementById("income-expense-chart"),d.map(o=>o.month),d.map(o=>o.income),d.map(o=>o.expenses)),ye(document.getElementById("cashflow-chart"),i.map(o=>o.month),i.map(o=>o.income),i.map(o=>o.expenses),i.map(o=>o.net))}}async function W(a){const t=(await u.get("/properties?limit=50")).items||[];a.innerHTML=`
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
          ${t.length>0?t.map(e=>`
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
  `,window.lucide&&lucide.createIcons(),document.getElementById("add-property-btn").addEventListener("click",()=>te()),document.getElementById("properties-table").addEventListener("click",async e=>{const s=e.target.closest(".view-property"),r=e.target.closest(".edit-property"),l=e.target.closest(".delete-property");if(s&&U(s.dataset.id),r){const i=r.dataset.id,d=await u.get(`/properties/${i}`);te(d)}if(l){const i=l.dataset.id;if(confirm("¿Está seguro de que desea eliminar esta propiedad? Esta acción la desactivará del sistema."))try{await u.delete(`/properties/${i}`),b("Propiedad eliminada correctamente","success");const d=document.getElementById("page-content");await W(d)}catch(d){b(d.message,"error")}}}),document.getElementById("filter-status").addEventListener("change",async e=>{const s=e.target.value,r=document.getElementById("filter-type").value;let l="/properties?limit=50";s&&(l+=`&status=${encodeURIComponent(s)}`),r&&(l+=`&property_type=${encodeURIComponent(r)}`);const i=await u.get(l);ee(i.items||[])}),document.getElementById("filter-type").addEventListener("change",async e=>{const s=e.target.value,r=document.getElementById("filter-status").value;let l="/properties?limit=50";r&&(l+=`&status=${encodeURIComponent(r)}`),s&&(l+=`&property_type=${encodeURIComponent(s)}`);const i=await u.get(l);ee(i.items||[])})}function ee(a){const n=document.querySelector("#properties-table tbody");n.innerHTML=a.map(t=>`
    <tr>
      <td>
        <div class="font-semibold text-surface-900">${t.name}</div>
        <div class="text-xs text-surface-400 truncate max-w-[200px]">${t.address}</div>
      </td>
      <td><span class="badge badge-gray">${t.property_type}</span></td>
      <td class="text-surface-600">${t.city}</td>
      <td class="text-surface-600">${t.area_sqm}</td>
      <td class="font-medium">${f(t.commercial_value)}</td>
      <td><span class="badge ${F(t.status)}">${t.status}</span></td>
      <td class="text-surface-500 text-xs">${E(t.created_at)}</td>
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
  `).join(""),window.lucide&&lucide.createIcons()}function te(a=null){const n=!!a,t=n?"Editar Propiedad":"Nueva Propiedad",e=`
    <form id="property-form" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Nombre *</label>
          <input class="input" name="name" required value="${(a==null?void 0:a.name)||""}" placeholder="Mi Apartamento Centro" />
        </div>
        <div>
          <label class="label">Tipo *</label>
          <select class="select" name="property_type" required>
            ${["Apartamento","Casa","Local","Bodega","Oficina","Lote"].map(s=>`<option value="${s}" ${(a==null?void 0:a.property_type)===s?"selected":""}>${s}</option>`).join("")}
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
            ${["Disponible","Arrendada","En Mantenimiento","Vendida"].map(s=>`<option value="${s}" ${(a==null?void 0:a.status)===s?"selected":""}>${s}</option>`).join("")}
          </select>
        </div>
      </div>
      <div>
        <label class="label">Notas</label>
        <textarea class="input" name="notes" rows="2" placeholder="Observaciones adicionales...">${(a==null?void 0:a.notes)||""}</textarea>
      </div>
    </form>
  `;x(t,e,{confirmText:n?"Guardar Cambios":"Crear Propiedad",onConfirm:async()=>{const s=document.getElementById("property-form"),r=new FormData(s),l={};r.forEach((d,o)=>{d!==""&&(["latitude","longitude","area_sqm","commercial_value"].includes(o)?l[o]=parseFloat(d):["bedrooms","bathrooms"].includes(o)?l[o]=parseInt(d):l[o]=d)}),n?(await u.put(`/properties/${a.id}`,l),b("Propiedad actualizada","success")):(await u.post("/properties",l),b("Propiedad creada","success"));const i=document.getElementById("page-content");await W(i)}})}async function U(a){const[n,t]=await Promise.all([u.get(`/properties/${a}`),u.get(`/occupants?property_id=${a}`)]),e=s=>s.length?`
      <div class="space-y-3 mt-4">
        ${s.map(r=>`
          <div class="flex items-center justify-between p-3 bg-surface-50 rounded-xl border border-surface-100 animate-fade-in">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                ${r.full_name.charAt(0)}
              </div>
              <div>
                <p class="text-sm font-semibold text-surface-900">${r.full_name} ${r.is_primary?'<span class="badge badge-blue text-[10px] ml-1">Principal</span>':""}</p>
                <p class="text-xs text-surface-500">${r.phone||r.email||"Sin contacto"}</p>
              </div>
            </div>
            <button class="delete-occupant-btn text-rose-400 hover:text-rose-600 p-1" data-id="${r.id}">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        `).join("")}
      </div>
    `:'<p class="text-sm text-surface-400 py-4 text-center">No hay ocupantes registrados.</p>';x(`Detalle: ${n.name}`,`
    <div class="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
      <div class="grid grid-cols-2 gap-4">
        <div class="glass-card-static p-4">
          <h4 class="text-xs font-bold text-surface-400 uppercase mb-3 flex items-center gap-1"><i data-lucide="info" class="w-3 h-3"></i> Información Básica</h4>
          <p class="text-sm"><strong>Dirección:</strong> ${n.address}</p>
          <p class="text-sm"><strong>Tipo:</strong> ${n.property_type}</p>
          <p class="text-sm"><strong>Área:</strong> ${n.area_sqm} m²</p>
          <p class="text-sm"><strong>Estado:</strong> <span class="badge ${F(n.status)}">${n.status}</span></p>
        </div>
        <div class="glass-card-static p-4">
          <h4 class="text-xs font-bold text-surface-400 uppercase mb-3 flex items-center gap-1"><i data-lucide="users" class="w-3 h-3"></i> Ocupantes (Viven aquí)</h4>
          <div id="occupants-container">
            ${e(t)}
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
    `,{confirmText:"Agregar",onConfirm:async()=>{const s=new FormData(document.getElementById("occupant-form")),r={property_id:a,full_name:s.get("full_name"),dni:s.get("dni")||null,phone:s.get("phone")||null,email:s.get("email")||null,is_primary:document.getElementById("is_primary").checked};await u.post("/occupants",r),b("Ocupante agregado","success"),U(a)}})}),document.querySelectorAll(".delete-occupant-btn").forEach(s=>{s.addEventListener("click",async()=>{confirm("¿Eliminar este ocupante?")&&(await u.delete(`/occupants/${s.dataset.id}`),b("Ocupante eliminado","success"),U(a))})})}const le=["Gastos Generales","Gastos Administrativos","Mantenimiento General","Pago de Empleados","Nómina y Personal","Suministros de Oficina","Marketing y Publicidad","Servicios Públicos","Seguros","Impuestos y Tasas","Honorarios Gestión","Otros"],de=["Ingresos por Arriendo","Gastos Mantenimiento","Impuestos y Tasas","Cuotas de Administración","Servicios Públicos","Honorarios Gestión","Seguros","Pago Hipoteca","Otros"];async function A(a){var h,w,$,k,T,C,J,Z,Q;const[n,t,e]=await Promise.all([u.get("/accounts"),u.get("/transactions?limit=30"),u.get("/properties?limit=100")]),s=n||[],r=t.items||[],l=e.items||[];let i=1,d=!1,o=r.length>=30;a.innerHTML=`
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
          ${s.map(m=>`
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
              ${r.length>0?r.map(m=>`
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
              ${l.map(m=>`<option value="${m.id}">${m.name}</option>`).join("")}
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
  `,window.lucide&&lucide.createIcons(),(h=document.getElementById("add-account-btn"))==null||h.addEventListener("click",()=>Te()),(w=document.getElementById("add-transaction-btn"))==null||w.addEventListener("click",()=>ae(s,l,!1)),($=document.getElementById("add-general-expense-btn"))==null||$.addEventListener("click",()=>ae(s,l,!0)),(k=document.getElementById("add-transfer-btn"))==null||k.addEventListener("click",()=>Le(s)),(T=document.getElementById("import-csv-btn"))==null||T.addEventListener("click",()=>{var m;return(m=document.getElementById("import-csv-input"))==null?void 0:m.click()}),(C=document.getElementById("import-csv-input"))==null||C.addEventListener("change",async m=>{const _=m.target.files[0];_&&(await Be(_),m.target.value="")}),(J=document.getElementById("export-csv-btn"))==null||J.addEventListener("click",()=>{window.location.href=`${u.baseUrl}/reports/export`}),document.querySelectorAll(".account-card").forEach(m=>{m.addEventListener("click",_=>{_.target.closest(".edit-account-btn")||_.target.closest(".delete-account-btn")||(window.location.hash=`#/account-detail?id=${m.dataset.accountId}`)})}),document.querySelectorAll(".edit-account-btn").forEach(m=>{m.addEventListener("click",_=>{_.stopPropagation(),ke(m.dataset.id,m.dataset.name,m.dataset.bank,m.dataset.number)})}),document.querySelectorAll(".delete-account-btn").forEach(m=>{m.addEventListener("click",_=>{_.stopPropagation(),Pe(m.dataset.id,m.dataset.name,parseFloat(m.dataset.balance))})}),document.querySelectorAll(".edit-tx-btn").forEach(m=>{m.addEventListener("click",()=>{se(m.dataset.id,m.dataset.desc,m.dataset.cat,m.dataset.amount,m.dataset.type,m.dataset.date)})}),document.querySelectorAll(".delete-tx-btn").forEach(m=>{m.addEventListener("click",()=>ne(m.dataset.id,m.dataset.desc))}),(Z=document.getElementById("performance-property-select"))==null||Z.addEventListener("change",m=>je(m.target.value)),(Q=document.getElementById("generate-pdf-btn"))==null||Q.addEventListener("click",()=>Se(s,r)),document.querySelectorAll(".tab-btn").forEach(m=>{m.addEventListener("click",()=>{document.querySelectorAll(".tab-btn").forEach(S=>S.classList.remove("active")),document.querySelectorAll(".tab-content").forEach(S=>S.classList.add("hidden")),m.classList.add("active");const _=m.dataset.tab;document.getElementById(`${_}-tab`).classList.remove("hidden"),_==="analysis"&&Ae()})});const c=document.getElementById("infinite-scroll-sentinel"),p=document.getElementById("loading-spinner"),g=document.querySelector("#operations-tab tbody"),v=new IntersectionObserver(async m=>{if(m[0].isIntersecting&&o&&!d){d=!0,p.classList.remove("hidden"),i++;try{const S=(await u.get(`/transactions?limit=30&page=${i}`)).items||[];S.length===0?o=!1:(S.forEach(y=>{const D=document.createElement("tr");D.innerHTML=`
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
            `,g.appendChild(D),D.querySelector(".edit-tx-btn").addEventListener("click",()=>{const P=D.querySelector(".edit-tx-btn");se(P.dataset.id,P.dataset.desc,P.dataset.cat,P.dataset.amount,P.dataset.type,P.dataset.date)}),D.querySelector(".delete-tx-btn").addEventListener("click",()=>{const P=D.querySelector(".delete-tx-btn");ne(P.dataset.id,P.dataset.desc)})}),window.lucide&&lucide.createIcons(),S.length<30&&(o=!1))}catch(_){console.error("Error loading more transactions:",_)}finally{d=!1,p.classList.add("hidden")}}},{threshold:.1});c&&v.observe(c)}function Te(){x("Nueva Cuenta Bancaria",`
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
  `,{confirmText:"Crear Cuenta",onConfirm:async()=>{const a=new FormData(document.getElementById("account-form")),n={};a.forEach((t,e)=>{e==="initial_balance"?n[e]=parseFloat(t)||0:t&&(n[e]=t)}),await u.post("/accounts",n),b("Cuenta creada","success"),await A(document.getElementById("page-content"))}})}function ke(a,n,t,e){x("Editar Cuenta",`
    <form id="edit-account-form" class="space-y-4">
      <div><label class="label">Nombre *</label><input class="input" name="account_name" value="${n}" required /></div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Banco</label><input class="input" name="bank_name" value="${t}" /></div>
        <div><label class="label">Número de Cuenta</label><input class="input" name="account_number" value="${e}" /></div>
      </div>
    </form>
  `,{confirmText:"Guardar Cambios",onConfirm:async()=>{const s=new FormData(document.getElementById("edit-account-form")),r={};s.forEach((l,i)=>{l&&(r[i]=l)}),await u.put(`/accounts/${a}`,r),b("Cuenta actualizada","success"),await A(document.getElementById("page-content"))}})}function Pe(a,n,t){if(t!==0){b(`No se puede eliminar "${n}": tiene saldo de ${f(t)}. Transfiera los fondos primero.`,"error");return}x("Eliminar Cuenta",`
    <div class="text-center py-4">
      <div class="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i data-lucide="alert-triangle" class="w-8 h-8 text-rose-500"></i>
      </div>
      <p class="text-surface-700 font-medium mb-2">¿Eliminar la cuenta "${n}"?</p>
      <p class="text-sm text-surface-400">Esta acción desactivará la cuenta. No será visible pero sus transacciones históricas se conservan.</p>
    </div>
  `,{confirmText:"Eliminar",onConfirm:async()=>{await u.delete(`/accounts/${a}`),b("Cuenta eliminada","success"),await A(document.getElementById("page-content"))}}),window.lucide&&lucide.createIcons()}function ae(a,n=[],t=!1){const e=t?"Registrar Gasto General":"Registrar Transacción",s=t?le:de;x(e,`
    <form id="tx-form" class="space-y-4">
      ${t?'<div class="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-2"><div class="flex items-center gap-2 text-amber-700 text-sm font-medium"><i data-lucide="info" class="w-4 h-4"></i> Este gasto no está asociado a ninguna propiedad</div></div>':""}
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Cuenta *</label><select class="select" name="account_id" required>${a.map(c=>`<option value="${c.id}">${c.account_name}</option>`).join("")}</select></div>
        ${t?"":`<div><label class="label">Propiedad *</label><select class="select" name="property_id" required><option value="">Seleccione...</option>${n.map(c=>`<option value="${c.id}">${c.name}</option>`).join("")}</select></div>`}
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Tipo *</label><select class="select" name="transaction_type" required>
          ${t?'<option value="Gasto">Gasto</option>':'<option value="Ingreso">Ingreso</option><option value="Gasto">Gasto</option><option value="Transferencia">Transferencia</option><option value="Interés">Interés</option><option value="Abono">Abono</option><option value="Crédito">Crédito</option><option value="Ajuste">Ajuste</option>'}
        </select></div>
        <div><label class="label">Categoría *</label><select class="select" name="category" required>${s.map(c=>`<option value="${c}">${c}</option>`).join("")}</select></div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Monto *</label><input class="input" name="amount" type="number" step="0.01" min="0.01" required placeholder="1500000" /></div>
        <div><label class="label">Fecha *</label><input class="input" name="transaction_date" type="date" required value="${new Date().toISOString().split("T")[0]}" /></div>
      </div>
      <div><label class="label">Descripción *</label><input class="input" name="description" required placeholder="${t?"Pago servicios oficina":"Pago canon mes de marzo"}" /></div>
    </form>
  `,{confirmText:"Registrar",onConfirm:async()=>{const c=new FormData(document.getElementById("tx-form")),p={};c.forEach((g,v)=>{v==="amount"?p[v]=parseFloat(g):g&&(p[v]=g)}),t&&delete p.property_id,p.transaction_type==="Ingreso"?p.direction="Debit":p.transaction_type==="Gasto"&&(p.direction="Credit"),await u.post("/transactions",p),b(t?"Gasto registrado":"Transacción registrada","success"),await A(document.getElementById("page-content"))}}),window.lucide&&lucide.createIcons();const r=document.getElementById("tx-form"),l=r.querySelector('[name="property_id"]'),i=r.querySelector('[name="transaction_date"]'),d=r.querySelector('[name="category"]'),o=async()=>{const c=t?"GENERAL":l.value,p=i.value;if(!c||!p)return;const[g,v]=p.split("-").map(Number);try{let h=c;if(c==="GENERAL"){const k=(await u.get("/properties?limit=100")).items.find(T=>T.name==="Gastos Generales");k&&(h=k.id)}const w=await u.get(`/budgets?property_id=${h}&year=${g}&month=${v}`);if(w&&w.length>0){let T=w[0].categories.map(C=>C.category_name).map(C=>`<option value="${C}">${C} (Presupuestado)</option>`).join("");T+="<option disabled>──────────</option>",T+=s.map(C=>`<option value="${C}">${C}</option>`).join(""),d.innerHTML=T}else d.innerHTML=s.map($=>`<option value="${$}">${$}</option>`).join("")}catch(h){console.warn("Could not fetch budget categories:",h),d.innerHTML=s.map(w=>`<option value="${w}">${w}</option>`).join("")}};l&&l.addEventListener("change",o),i.addEventListener("change",o),r.querySelector('[name="transaction_type"]').addEventListener("change",o),(t||l&&l.value)&&o()}function se(a,n,t,e,s,r){const l=[...new Set([...le,...de])];x("Editar Transacción",`
    <form id="edit-tx-form" class="space-y-4">
      <div><label class="label">Descripción</label><input class="input" name="description" value="${n}" /></div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Categoría</label><select class="select" name="category">${l.map(i=>`<option value="${i}" ${i===t?"selected":""}>${i}</option>`).join("")}</select></div>
        <div><label class="label">Tipo</label><select class="select" name="transaction_type">
          ${["Ingreso","Gasto","Transferencia","Ajuste","Interés","Abono","Crédito"].map(i=>`<option value="${i}" ${i===s?"selected":""}>${i}</option>`).join("")}
        </select></div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Monto</label><input class="input" name="amount" type="number" step="0.01" value="${e}" /></div>
        <div><label class="label">Fecha</label><input class="input" name="transaction_date" type="date" value="${r}" /></div>
      </div>
    </form>
  `,{confirmText:"Guardar",onConfirm:async()=>{const i=new FormData(document.getElementById("edit-tx-form")),d={};i.forEach((o,c)=>{c==="amount"?d[c]=parseFloat(o):o&&(d[c]=o)}),await u.put(`/transactions/${a}`,d),b("Transacción actualizada","success"),await A(document.getElementById("page-content"))}})}function ne(a,n){x("Eliminar Transacción",`
    <div class="text-center py-4">
      <div class="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i data-lucide="alert-triangle" class="w-8 h-8 text-rose-500"></i>
      </div>
      <p class="text-surface-700 font-medium mb-2">¿Eliminar esta transacción?</p>
      <p class="text-sm text-surface-400 italic mb-2">"${n}"</p>
      <p class="text-xs text-rose-500">El saldo de la cuenta será ajustado automáticamente.</p>
    </div>
  `,{confirmText:"Eliminar",onConfirm:async()=>{await u.delete(`/transactions/${a}`),b("Transacción eliminada","success"),await A(document.getElementById("page-content"))}}),window.lucide&&lucide.createIcons()}function Le(a){x("Transferencia entre Cuentas",`
    <form id="transfer-form" class="space-y-4">
      <div><label class="label">Cuenta Origen *</label><select class="select" name="source_account_id" required>${a.map(n=>`<option value="${n.id}">${n.account_name} (${f(n.current_balance)})</option>`).join("")}</select></div>
      <div><label class="label">Cuenta Destino *</label><select class="select" name="destination_account_id" required>${a.map(n=>`<option value="${n.id}">${n.account_name}</option>`).join("")}</select></div>
      <div><label class="label">Monto *</label><input class="input" name="amount" type="number" step="0.01" required placeholder="500000" /></div>
      <div><label class="label">Descripción *</label><input class="input" name="description" required placeholder="Traslado de fondos" /></div>
      <div><label class="label">Fecha *</label><input class="input" name="transaction_date" type="date" required value="${new Date().toISOString().split("T")[0]}" /></div>
    </form>
  `,{confirmText:"Transferir",onConfirm:async()=>{const n=new FormData(document.getElementById("transfer-form")),t={};if(n.forEach((e,s)=>{s==="amount"?t[s]=parseFloat(e):t[s]=e}),t.source_account_id===t.destination_account_id){b("Las cuentas deben ser diferentes","error");return}await u.post("/accounts/transfer",t),b("Transferencia completada","success"),await A(document.getElementById("page-content"))}})}async function je(a){if(!a)return;const n=document.getElementById("performance-content");n.innerHTML='<div class="flex items-center justify-center py-12"><div class="animate-spin rounded-full h-8 w-8 border-2 border-accent-500 border-t-transparent"></div><p class="ml-3 text-surface-500">Calculando métricas...</p></div>';const t=await u.get(`/properties/${a}/performance`);if(!t)return;const e=t.total_income>0||t.total_expenses>0;n.innerHTML=`
    <div class="animate-fade-in">
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-surface-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center"><i data-lucide="building-2" class="w-5 h-5 text-primary-600"></i></div>
          <div>
            <h4 class="font-bold text-surface-900">${t.property_name}</h4>
            <span class="badge ${t.property_status==="Arrendada"?"badge-green":"badge-blue"} text-xs">${t.property_status||"Sin estado"}</span>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm">
          <p class="text-xs font-bold text-surface-400 uppercase mb-2">Ingresos</p>
          <p class="text-2xl font-bold text-accent-600">${f(t.total_income)}</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm">
          <p class="text-xs font-bold text-surface-400 uppercase mb-2">Gastos</p>
          <p class="text-2xl font-bold text-rose-600">${f(t.total_expenses)}</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm">
          <p class="text-xs font-bold text-surface-400 uppercase mb-2">Utilidad</p>
          <p class="text-2xl font-bold ${t.net_profit>=0?"text-primary-600":"text-rose-600"}">${f(t.net_profit)}</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm">
          <p class="text-xs font-bold text-surface-400 uppercase mb-2">ROI</p>
          <p class="text-2xl font-bold text-indigo-600">${t.roi}%</p>
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
          ${e?`
            ${Object.entries(t.income_by_category||{}).map(([l,i])=>`<div class="flex justify-between text-sm mb-1"><span>${l}</span><span class="text-accent-600">+${f(i)}</span></div>`).join("")}
            <div class="border-t border-surface-100 my-3"></div>
            ${Object.entries(t.expense_by_category||{}).map(([l,i])=>`<div class="flex justify-between text-sm mb-1"><span>${l}</span><span class="text-rose-600">-${f(i)}</span></div>`).join("")}
          `:'<p class="text-surface-400 text-center py-4">Sin datos</p>'}
        </div>
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h4 class="text-sm font-bold text-surface-900 mb-4">Últimos Movimientos</h4>
          <div class="overflow-x-auto"><table class="data-table text-xs"><thead><tr><th>Fecha</th><th>Descripción</th><th>Monto</th></tr></thead><tbody>
            ${(t.last_transactions||[]).length>0?t.last_transactions.map(l=>`<tr><td class="text-surface-500">${E(l.transaction_date)}</td><td class="font-medium">${l.description}</td><td class="font-bold ${l.direction==="Debit"?"text-accent-600":"text-rose-600"}">${l.direction==="Debit"?"+":"-"}${f(l.amount)}</td></tr>`).join(""):'<tr><td colspan="3" class="text-center py-4 text-surface-400">Sin movimientos</td></tr>'}
          </tbody></table></div>
        </div>
      </div>
    </div>
  `,window.lucide&&lucide.createIcons();const s=document.getElementById("property-mini-chart");s&&e&&new Chart(s,{type:"doughnut",data:{labels:["Ingresos","Gastos"],datasets:[{data:[t.total_income,t.total_expenses],backgroundColor:["#20c997","#f03e3e"],borderWidth:0,cutout:"75%"}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}}}});const r=document.getElementById("property-cashflow-chart");if(r&&t.monthly_cashflow){const l=t.monthly_cashflow;new Chart(r,{type:"bar",data:{labels:l.map(i=>i.month),datasets:[{label:"Ingresos",data:l.map(i=>i.income),backgroundColor:"rgba(32,201,151,0.7)",borderRadius:6,barPercentage:.6},{label:"Gastos",data:l.map(i=>i.expenses),backgroundColor:"rgba(240,62,62,0.7)",borderRadius:6,barPercentage:.6}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"top",labels:{usePointStyle:!0,font:{size:10}}}},scales:{y:{beginAtZero:!0,ticks:{font:{size:10},callback:i=>"$"+(i>=1e6?(i/1e6).toFixed(1)+"M":i>=1e3?(i/1e3).toFixed(0)+"K":i)},grid:{color:"rgba(0,0,0,0.04)"}},x:{ticks:{font:{size:9}},grid:{display:!1}}}}})}}async function Ae(){const[a,n]=await Promise.all([u.get("/reports/balance-sheet"),u.get(`/reports/income-statement?start_date=${new Date().getFullYear()}-01-01&end_date=${new Date().toISOString().split("T")[0]}`)]);a&&(document.getElementById("balance-sheet-container").innerHTML=`
      <h3 class="font-bold mb-4 flex items-center justify-between">Balance General <span class="text-xs font-normal text-surface-400">${E(a.date)}</span></h3>
      <div class="space-y-3">
        ${a.accounts.map(t=>`<div class="flex justify-between text-sm py-2 border-b border-surface-50"><span class="text-surface-600">${t.account_name}</span><span class="font-semibold">${f(t.current_balance)}</span></div>`).join("")}
        <div class="flex justify-between text-lg font-bold pt-4 text-primary-600"><span>Total Activos</span><span>${f(a.total_assets)}</span></div>
      </div>
    `),n&&(document.getElementById("income-statement-container").innerHTML=`
      <h3 class="font-bold mb-4">Estado de Resultados (Año Actual)</h3>
      <div class="space-y-4">
        <div><p class="text-xs font-bold text-surface-400 uppercase mb-2">Ingresos</p>${Object.entries(n.income).map(([t,e])=>`<div class="flex justify-between text-sm mb-1"><span>${t}</span><span class="text-accent-600">+${f(e)}</span></div>`).join("")}</div>
        <div><p class="text-xs font-bold text-surface-400 uppercase mb-2">Egresos</p>${Object.entries(n.expenses).map(([t,e])=>`<div class="flex justify-between text-sm mb-1"><span>${t}</span><span class="text-rose-600">-${f(e)}</span></div>`).join("")}</div>
        <div class="border-t border-surface-100 pt-3"><div class="flex justify-between text-lg font-bold ${n.net_income>=0?"text-accent-600":"text-rose-600"}"><span>Utilidad Neta</span><span>${f(n.net_income)}</span></div></div>
      </div>
    `)}async function Se(a,n){const{jsPDF:t}=window.jspdf,e=new t;e.setFillColor(66,99,235),e.rect(0,0,210,35,"F"),e.setTextColor(255),e.setFontSize(20),e.text("PMS — Informe Financiero",14,20),e.setFontSize(10),e.text(`Generado: ${new Date().toLocaleDateString("es-CO")}`,14,28),e.setTextColor(0),e.setFontSize(14),e.text("Cuentas Bancarias",14,45),e.autoTable({startY:50,head:[["Cuenta","Tipo","Banco","Moneda","Saldo"]],body:a.map(o=>[o.account_name,o.account_type,o.bank_name||"-",o.currency,f(o.current_balance)]),theme:"striped",headStyles:{fillColor:[66,99,235]},styles:{fontSize:9}});const s=e.lastAutoTable.finalY+15;e.setFontSize(14),e.text("Últimas Transacciones",14,s),e.autoTable({startY:s+5,head:[["Fecha","Descripción","Categoría","Tipo","Monto"]],body:n.map(o=>[o.transaction_date,o.description.substring(0,40),o.category,o.transaction_type,`${o.direction==="Debit"?"+":"-"}${f(o.amount)}`]),theme:"striped",headStyles:{fillColor:[66,99,235]},styles:{fontSize:8}});const r=n.filter(o=>o.direction==="Debit").reduce((o,c)=>o+c.amount,0),l=n.filter(o=>o.direction==="Credit").reduce((o,c)=>o+c.amount,0),i=e.lastAutoTable.finalY+15;e.setFontSize(12),e.setTextColor(32,201,151),e.text(`Total Ingresos: ${f(r)}`,14,i),e.setTextColor(240,62,62),e.text(`Total Gastos: ${f(l)}`,14,i+8),e.setTextColor(66,99,235),e.text(`Resultado Neto: ${f(r-l)}`,14,i+16);const d=e.internal.getNumberOfPages();for(let o=1;o<=d;o++)e.setPage(o),e.setFontSize(8),e.setTextColor(150),e.text(`PMS — Property Management System | Página ${o} de ${d}`,105,290,{align:"center"});e.save(`informe_financiero_${new Date().toISOString().split("T")[0]}.pdf`),b("PDF generado y descargado","success")}async function Be(a){x("Analizando CSV...",`
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
      <p class="ml-3 text-surface-500">Analizando archivo...</p>
    </div>
  `,{showCancel:!1});let n;try{const o=new FormData;o.append("file",a),n=await u.upload("/transactions/import/analyze",o)}catch(o){b(`Error al analizar: ${o.message}`,"error");return}const{total_rows:t,transfers_skipped:e,new_accounts:s,existing_accounts:r,detected_labels:l,category_mapping:i}=n,d=l.length>0?l.map(o=>`
    <label class="flex items-center gap-3 p-3 rounded-xl border border-surface-100 hover:bg-surface-50 transition cursor-pointer">
      <input type="checkbox" class="import-label-check w-4 h-4 rounded text-indigo-500" value="${o.label}" ${o.suggested_apartment?"checked":""} ${o.already_exists?"checked disabled":""} />
      <div class="flex-1 min-w-0">
        <span class="font-medium text-surface-800 text-sm">${o.label}</span>
        <span class="text-xs text-surface-400 ml-2">(${o.transaction_count} tx)</span>
      </div>
      ${o.already_exists?'<span class="badge badge-green text-xs">Existe</span>':o.suggested_apartment?'<span class="badge badge-blue text-xs">Sugerido</span>':'<span class="badge badge-amber text-xs">General</span>'}
    </label>
  `).join(""):'<p class="text-surface-400 text-sm py-4 text-center">No se detectaron labels</p>';x("Importación de Transacciones",`
    <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-indigo-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-indigo-600">${t}</p><p class="text-xs text-indigo-400">Transacciones</p></div>
        <div class="bg-amber-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-amber-600">${e}</p><p class="text-xs text-amber-400">Omitidas</p></div>
        <div class="bg-purple-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-purple-600">${l.length}</p><p class="text-xs text-purple-400">Labels</p></div>
      </div>
      ${s.length>0?`<div class="bg-blue-50 border border-blue-200 rounded-xl p-4"><p class="text-sm font-bold text-blue-700 mb-2">Cuentas nuevas (${s.length})</p>${s.map(o=>`<div class="flex justify-between text-sm"><span class="text-blue-600">${o.name}</span><span class="text-blue-400">${o.transaction_count} tx</span></div>`).join("")}</div>`:""}
      ${r.length>0?`<div class="bg-green-50 border border-green-200 rounded-xl p-4"><p class="text-sm font-bold text-green-700 mb-2">Cuentas existentes (${r.length})</p>${r.map(o=>`<div class="flex justify-between text-sm"><span class="text-green-600">${o.name}</span><span class="text-green-400">${o.transaction_count} tx</span></div>`).join("")}</div>`:""}
      ${Object.keys(i).length>0?`<details class="bg-surface-50 border border-surface-200 rounded-xl p-4"><summary class="text-sm font-bold text-surface-700 cursor-pointer">Mapeo categorías (${Object.keys(i).length})</summary><div class="mt-3 space-y-1 max-h-40 overflow-y-auto">${Object.entries(i).map(([o,c])=>`<div class="flex justify-between text-xs py-1 border-b border-surface-100"><span>${o}</span><span class="text-indigo-600">→ ${c}</span></div>`).join("")}</div></details>`:""}
      <div>
        <p class="text-sm font-bold text-surface-700 mb-3">¿Cuáles labels son apartamentos?</p>
        <p class="text-xs text-surface-400 mb-3">Los seleccionados se crean como propiedades.</p>
        <div class="space-y-2 max-h-60 overflow-y-auto">${d}</div>
      </div>
    </div>
  `,{confirmText:"Importar Transacciones",onConfirm:async()=>{const o=document.querySelectorAll(".import-label-check:checked"),c=Array.from(o).map(v=>v.value),p=new FormData;p.append("file",a);const g=encodeURIComponent(c.join(","));try{const v=await u.upload(`/transactions/import/confirm?confirmed_labels=${g}`,p);let h=`✅ ${v.imported} transacciones importadas.`;v.accounts_created.length>0&&(h+=` 📁 Cuentas: ${v.accounts_created.join(", ")}`),v.properties_created.length>0&&(h+=` 🏠 Propiedades: ${v.properties_created.join(", ")}`),v.errors.length>0&&(h+=` ⚠️ ${v.errors.length} errores`),b(h,"success"),await A(document.getElementById("page-content"))}catch(v){b(`Error al importar: ${v.message}`,"error")}}}),window.lucide&&lucide.createIcons()}async function Y(a){const t=(await u.get("/maintenance?limit=50")).items||[];a.innerHTML=`
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
        <p class="text-2xl font-bold text-rose-500">${f(t.reduce((e,s)=>e+(s.actual_cost||0),0))}</p>
        <p class="text-xs text-surface-500 mt-1">Costo Total</p>
      </div>
    </div>
    <div class="glass-card-static overflow-hidden animate-fade-in">
      <table class="data-table"><thead><tr>
        <th>Título</th><th>Tipo</th><th>Prioridad</th><th>Estado</th><th>Costo Est.</th><th>Fecha</th><th></th>
      </tr></thead><tbody>
      ${t.length?t.map(e=>`<tr>
        <td><div class="font-semibold text-sm">${e.title}</div>${e.supplier_name?`<div class="text-xs text-surface-400">${e.supplier_name}</div>`:""}</td>
        <td><span class="badge badge-gray text-xs">${e.maintenance_type}</span></td>
        <td><span class="badge ${e.priority==="Urgente"?"badge-red":e.priority==="Alta"?"badge-amber":"badge-gray"} text-xs">${e.priority}</span></td>
        <td><span class="badge ${F(e.status)} text-xs">${e.status}</span></td>
        <td class="text-sm">${f(e.estimated_cost)}</td>
        <td class="text-xs text-surface-500">${E(e.scheduled_date)}</td>
        <td>${e.status!=="Completado"&&e.status!=="Cancelado"?`<button class="btn-ghost text-xs py-1 px-2 status-btn" data-id="${e.id}"><i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></button>`:""}</td>
      </tr>`).join(""):'<tr><td colspan="7" class="text-center py-12 text-surface-400">No hay órdenes</td></tr>'}
      </tbody></table>
    </div>`,window.lucide&&lucide.createIcons(),document.getElementById("add-maint-btn").addEventListener("click",()=>De()),document.querySelectorAll(".status-btn").forEach(e=>e.addEventListener("click",()=>Me(e.dataset.id)))}function De(){x("Nueva Orden",`<form id="mf" class="space-y-4">
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
  </form>`,{confirmText:"Crear",onConfirm:async()=>{const a=new FormData(document.getElementById("mf")),n={};a.forEach((t,e)=>{t&&(n[e]=e==="estimated_cost"?parseFloat(t):t)}),await u.post("/maintenance",n),b("Orden creada","success"),await Y(document.getElementById("page-content"))}})}function Me(a){x("Cambiar Estado",`<form id="sf" class="space-y-4">
    <div><label class="label">Estado *</label><select class="select" name="status">
      <option value="Pendiente">Pendiente</option><option value="En Progreso">En Progreso</option>
      <option value="Esperando Factura">Esperando Factura</option><option value="Completado">Completado</option>
      <option value="Cancelado">Cancelado</option></select></div>
    <div><label class="label">Notas</label><textarea class="input" name="notes" rows="2"></textarea></div>
  </form>`,{confirmText:"Actualizar",onConfirm:async()=>{const n=new FormData(document.getElementById("sf")),t={status:n.get("status")};n.get("notes")&&(t.notes=n.get("notes")),await u.put(`/maintenance/${a}/status`,t),b("Estado actualizado","success"),await Y(document.getElementById("page-content"))}})}async function G(a){const[n,t]=await Promise.all([u.get("/contracts?limit=50"),u.get("/properties?limit=100")]),e=n.items||[],s=t.items||[];a.innerHTML=`
    <div class="space-y-6 animate-fade-in">
        <div class="flex border-b border-surface-200 mb-4">
            <button class="tab-btn active px-4 py-2 text-primary-600 border-b-2 border-primary-600 font-medium" data-tab="list">Contratos</button>
            <button class="tab-btn px-4 py-2 text-surface-500 hover:text-surface-700 font-medium" data-tab="tenants">Inquilinos</button>
        </div>
        <div id="contracts-tab-content"><!-- Content --></div>
    </div>
  `;const r=a.querySelector("#contracts-tab-content"),l=a.querySelectorAll(".tab-btn");l.forEach(i=>{i.addEventListener("click",()=>{l.forEach(d=>{d.classList.remove("active","text-primary-600","border-primary-600","border-b-2"),d.classList.add("text-surface-500")}),i.classList.remove("text-surface-500"),i.classList.add("active","text-primary-600","border-primary-600","border-b-2"),i.dataset.tab==="list"?ie(r,e,s,a):Fe(r,e)})}),ie(r,e,s,a)}function ie(a,n,t,e){a.innerHTML=`
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
      ${n.length?n.map(s=>`<tr>
        <td>
          <div class="font-bold text-surface-900">${s.tenant_name}</div>
          ${s.tenant_email?`<div class="text-[10px] text-surface-400 font-medium">${s.tenant_email}</div>`:""}
        </td>
        <td>
          <div class="font-bold text-primary-600 text-xs">${s.property_name||"Sin asignar"}</div>
          <div class="text-[10px] text-surface-400 italic truncate max-w-[150px]">${s.property_address||""}</div>
        </td>
        <td>
          <span class="badge badge-gray text-[10px] mr-1">${s.contract_type}</span>
          <div class="font-black text-accent-700 mt-0.5">${f(s.monthly_rent)}</div>
        </td>
        <td class="text-xs text-surface-500 font-medium whitespace-nowrap">
          ${E(s.start_date)} <span class="text-surface-300">→</span> ${E(s.end_date)}
        </td>
        <td><span class="badge ${F(s.status)} text-[10px] font-bold">${s.status}</span></td>
        <td class="text-right"><div class="flex justify-end gap-1">
          ${s.status==="Borrador"||s.status==="Firmado"?`
            <button class="btn-ghost text-xs p-1.5 activate-btn hover:bg-accent-50 rounded-lg group" data-id="${s.id}" title="Activar Contrato">
              <i data-lucide="check-circle" class="w-4 h-4 text-accent-500 group-hover:scale-110 transition-transform"></i>
            </button>`:""}
          <button class="btn-ghost text-xs p-1.5 download-btn hover:bg-blue-50 rounded-lg group" data-id="${s.id}" title="Descargar PDF">
            <i data-lucide="download" class="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform"></i>
          </button>
          <button class="btn-ghost text-xs p-1.5 pdf-btn hover:bg-red-50 rounded-lg group" data-id="${s.id}" title="Carta de Terminación">
            <i data-lucide="file-text" class="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform"></i>
          </button>
          <button class="btn-ghost text-xs p-1.5 payments-btn hover:bg-primary-50 rounded-lg group" data-id="${s.id}" title="Cronograma de Pagos">
            <i data-lucide="calendar" class="w-4 h-4 text-primary-500 group-hover:scale-110 transition-transform"></i>
          </button>
        </div></td>
      </tr>`).join(""):'<tr><td colspan="6" class="text-center py-20 text-surface-400 font-medium italic">No hay contratos registrados</td></tr>'}
      </tbody></table>
    </div>`,window.lucide&&lucide.createIcons(),document.getElementById("add-contract-btn").addEventListener("click",()=>qe(t,e)),document.querySelectorAll(".activate-btn").forEach(s=>s.addEventListener("click",async()=>{try{await u.post(`/contracts/${s.dataset.id}/activate`,{}),b("Contrato activado y cronograma de pagos generado","success"),await G(e||document.getElementById("page-content"))}catch(r){b(r.message||"Error al activar contrato","error")}})),document.querySelectorAll(".download-btn").forEach(s=>s.addEventListener("click",async()=>{var r,l;try{b("Generando PDF...","info");const i=((l=(r=u.opts)==null?void 0:r.baseUrl)==null?void 0:l.replace("/api/v1",""))||"",d=localStorage.getItem("access_token")||"",o=`${i}/api/v1/contracts/${s.dataset.id}/download`,c=await fetch(o,{headers:{Authorization:`Bearer ${d}`}});if(!c.ok)throw new Error("Error generando PDF");const p=await c.blob(),g=document.createElement("a");g.href=URL.createObjectURL(p),g.download=`contrato_${s.dataset.id.slice(0,8)}.pdf`,g.click(),URL.revokeObjectURL(g.href)}catch(i){b(i.message||"No se pudo descargar el PDF","error")}})),document.querySelectorAll(".pdf-btn").forEach(s=>s.addEventListener("click",()=>{const r=new Date().toISOString().split("T")[0];x("Generar Carta de Terminación",`
        <form id="pdf-form" class="space-y-4">
            <div>
                <label class="label">Motivo</label>
                <input class="input" name="reason" value="Terminación por mutuo acuerdo" required />
            </div>
            <div>
                <label class="label">Fecha de Terminación</label>
                <input class="input" type="date" name="termination_date" value="${r}" required />
            </div>
        </form>
      `,{confirmText:"Generar PDF",onConfirm:async()=>{var o,c;const l=new FormData(document.getElementById("pdf-form")),i=Object.fromEntries(l),d=await u.post(`/contracts/${s.dataset.id}/termination-letter`,i);if(b("PDF Generado","success"),d.pdf_url){const p=((c=(o=u.opts)==null?void 0:o.baseUrl)==null?void 0:c.replace("/api/v1",""))||"";window.open(p+d.pdf_url,"_blank")}}})})),document.querySelectorAll(".payments-btn").forEach(s=>s.addEventListener("click",async()=>{var c;const[r,l]=await Promise.all([u.get(`/contracts/${s.dataset.id}/payments`),u.get("/accounts")]),i=l.items||l||[],d=p=>p==="Pagado"?"badge-green":p==="Vencido"?"badge-red":"badge-yellow";x("Cronograma de Pagos",`
      <div class="space-y-4">
        <div class="max-h-80 overflow-y-auto border border-surface-100 rounded-xl">
          <table class="data-table text-xs">
            <thead class="sticky top-0 bg-white z-10 shadow-sm">
              <tr><th>Fecha</th><th>Monto</th><th>Estado</th><th class="text-right">Acción</th></tr>
            </thead>
            <tbody>
              ${r.map(p=>`
                <tr class="hover:bg-surface-50">
                  <td class="font-medium">${E(p.due_date)}</td>
                  <td class="font-black text-accent-700">${f(p.amount)}</td>
                  <td><span class="badge ${d(p.status)} text-[10px] uppercase font-bold">${p.status}</span></td>
                  <td class="text-right">
                    ${p.status==="Pendiente"?`
                      <button class="btn-primary py-1 px-3 text-[10px] pay-payment-btn"
                        data-pid="${p.id}" data-cid="${s.dataset.id}" data-amount="${p.amount}">
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
                ${i.length?i.map(p=>`<option value="${p.id}">${p.account_name} (${f(p.current_balance)})</option>`).join(""):'<option value="" disabled>No hay cuentas disponibles</option>'}
              </select>
            </div>
            <button id="confirm-pay-btn" class="btn-primary w-full py-2">Confirmar Pago</button>
          </div>
        </div>
      </div>
    `,{showCancel:!1}),window.lucide&&lucide.createIcons();let o=null;document.querySelectorAll(".pay-payment-btn").forEach(p=>p.addEventListener("click",()=>{o={pid:p.dataset.pid,cid:p.dataset.cid},document.getElementById("payment-receipt-box").classList.remove("hidden"),document.querySelectorAll(".pay-payment-btn").forEach(g=>g.closest("tr").classList.remove("bg-primary-50")),p.closest("tr").classList.add("bg-primary-50")})),(c=document.getElementById("confirm-pay-btn"))==null||c.addEventListener("click",async()=>{if(!o)return;const p=document.getElementById("pay-account-id").value;if(!p){b("Seleccione una cuenta","error");return}try{await u.post(`/contracts/${o.cid}/payments/${o.pid}/pay?account_id=${p}`,{}),b("✅ Pago registrado — transacción bancaria creada","success"),await G(e||document.getElementById("page-content"))}catch(g){b(g.message||"Error al registrar pago","error")}})}))}function qe(a=[],n){const t=new Date().toISOString().split("T")[0];x("Nuevo Contrato",`<form id="cf" class="space-y-4">
    <div>
      <label class="label">Propiedad *</label>
      <select class="select" name="property_id" required>
        <option value="">Seleccione propiedad...</option>
        ${a.map(e=>`<option value="${e.id}">${e.name} (${e.property_type})</option>`).join("")}
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
      <div><label class="label">Inicio *</label><input class="input" name="start_date" type="date" required value="${t}" /></div>
      <div><label class="label">Fin *</label><input class="input" name="end_date" type="date" required /></div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div><label class="label">Depósito</label><input class="input" name="deposit_amount" type="number" step="0.01" /></div>
      <div><label class="label">Incremento Anual %</label><input class="input" name="annual_increment_pct" type="number" step="0.01" value="5" /></div>
    </div>
  </form>`,{confirmText:"Crear",onConfirm:async()=>{const e=new FormData(document.getElementById("cf")),s={};e.forEach((r,l)=>{r&&(s[l]=["monthly_rent","deposit_amount","annual_increment_pct"].includes(l)?parseFloat(r):r)}),s.auto_renewal=!1,await u.post("/contracts",s),b("Contrato creado en Borrador — use ✓ para activarlo","success"),await G(n||document.getElementById("page-content"))}})}function Fe(a,n){const t={};n.forEach(s=>{t[s.tenant_name]||(t[s.tenant_name]={name:s.tenant_name,email:s.tenant_email,phone:s.tenant_phone,document:s.tenant_document,active_contracts:0}),s.status==="Activo"&&t[s.tenant_name].active_contracts++});const e=Object.values(t);a.innerHTML=`
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        ${e.length?e.map(s=>`
            <div class="glass-card-static p-5 flex items-start gap-4">
                <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg shrink-0">
                    ${s.name.charAt(0)}
                </div>
                <div class="min-w-0 flex-1">
                    <h4 class="font-bold text-surface-900 truncate">${s.name}</h4>
                    <p class="text-xs text-surface-500 mt-1"><i data-lucide="mail" class="w-3 h-3 inline mr-1"></i>${s.email||"-"}</p>
                    <p class="text-xs text-surface-500 mt-1"><i data-lucide="phone" class="w-3 h-3 inline mr-1"></i>${s.phone||"-"}</p>
                    <p class="text-xs text-surface-500 mt-1"><i data-lucide="credit-card" class="w-3 h-3 inline mr-1"></i>${s.document||"-"}</p>
                    <div class="mt-3">
                        <span class="badge ${s.active_contracts>0?"badge-green":"badge-gray"} text-xs">
                            ${s.active_contracts} Contratos Activos
                        </span>
                    </div>
                </div>
            </div>
        `).join(""):'<div class="col-span-full py-12 text-center text-surface-500">No hay inquilinos registrados.</div>'}
        </div>
    `,window.lucide&&lucide.createIcons()}async function Oe(a){a.innerHTML=`
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
            ${Array.from({length:12},(l,i)=>`<option value="${i+1}">${new Date(0,i).toLocaleString("es",{month:"long"})}</option>`).join("")}
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
  `,window.lucide&&lucide.createIcons();const[n,t]=await Promise.all([u.get("/properties?limit=100"),u.get("/properties?limit=1").then(l=>{var i;return((i=l.items.find(d=>d.name==="Gastos Generales"))==null?void 0:i.id)||"GENERAL"})]),e=n.items||[],s=document.getElementById("filter-property");e.filter(l=>l.id!==t).forEach(l=>{const i=document.createElement("option");i.value=l.id,i.textContent=l.name,s.appendChild(i)});const r=async()=>{const l=document.getElementById("budgets-table-container"),i=document.getElementById("filter-property").value,d=document.getElementById("filter-year").value,o=document.getElementById("filter-month").value,c=document.getElementById("filter-status").value;let p="/budgets?limit=100";i&&(p+=`&property_id=${i}`),d&&(p+=`&year=${d}`),o&&(p+=`&month=${o}`);try{const g=await u.get(p);let v=g;c&&(v=g.filter(h=>h.semaphore===c)),ce(l,v,e,t,r)}catch(g){l.innerHTML=`<div class="p-8 text-center text-rose-500">Error al cargar presupuestos: ${g.message}</div>`}};document.getElementById("apply-filters").addEventListener("click",r),document.getElementById("add-budget-btn").addEventListener("click",()=>ue(e,null,r)),r()}function ce(a,n,t,e,s,r="",l=1){if(!n.length){a.innerHTML='<div class="py-20 text-center text-surface-400">No se encontraron presupuestos con los filtros seleccionados.</div>';return}a.innerHTML=`
    <table class="data-table">
      <thead>
        <tr>
          <th class="sortable cursor-pointer hover:bg-surface-100" data-sort="property">
            Propiedad ${r==="property"?`<i data-lucide="chevron-${l===1?"up":"down"}" class="w-3 h-3 inline ml-1"></i>`:'<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>'}
          </th>
          <th class="sortable cursor-pointer hover:bg-surface-100" data-sort="date">
            Periodo ${r==="date"?`<i data-lucide="chevron-${l===1?"up":"down"}" class="w-3 h-3 inline ml-1"></i>`:'<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>'}
          </th>
          <th class="sortable cursor-pointer hover:bg-surface-100" data-sort="status">
            Estado ${r==="status"?`<i data-lucide="chevron-${l===1?"up":"down"}" class="w-3 h-3 inline ml-1"></i>`:'<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>'}
          </th>
          <th class="sortable cursor-pointer hover:bg-surface-100" data-sort="budget">
            Presupuesto ${r==="budget"?`<i data-lucide="chevron-${l===1?"up":"down"}" class="w-3 h-3 inline ml-1"></i>`:'<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>'}
          </th>
          <th>Ejecutado</th>
          <th class="sortable cursor-pointer hover:bg-surface-100" data-sort="pct">
            % Ejecución ${r==="pct"?`<i data-lucide="chevron-${l===1?"up":"down"}" class="w-3 h-3 inline ml-1"></i>`:'<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-50"></i>'}
          </th>
          <th class="text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${n.map(i=>{const d=t.find(c=>c.id===i.property_id);return`
          <tr class="hover:bg-surface-50 transition-colors">
            <td>
              <div class="font-semibold text-surface-900">${i.property_id===e?"Gastos Generales":d?d.name:"Unidad Borrada"}</div>
              <div class="text-[10px] text-surface-400 italic">${i.property_id.slice(0,8)}...</div>
            </td>
            <td>
              <span class="text-sm font-medium text-surface-700">${i.year} - ${new Date(0,i.month-1).toLocaleString("es",{month:"short",year:"numeric"}).toUpperCase()}</span>
            </td>
            <td>
              <div class="flex items-center gap-2">
                <span class="semaphore ${ve(i.semaphore)}"></span>
                <span class="text-xs font-semibold ${i.semaphore==="Verde"?"text-green-600":i.semaphore==="Amarillo"?"text-amber-600":"text-red-600"}">${i.semaphore}</span>
              </div>
            </td>
            <td class="text-sm font-medium text-surface-900">${f(i.total_budget)}</td>
            <td class="text-sm font-medium text-surface-600">${f(i.total_executed)}</td>
            <td class="w-48">
              <div class="flex items-center gap-3">
                <div class="flex-1 bg-surface-100 rounded-full h-1.5 overflow-hidden">
                  <div class="h-full rounded-full ${i.semaphore==="Verde"?"bg-green-500":i.semaphore==="Amarillo"?"bg-amber-500":"bg-red-500"}" 
                    style="width: ${Math.min(i.execution_pct,100)}%"></div>
                </div>
                <span class="text-xs font-bold w-10">${V(i.execution_pct)}</span>
              </div>
            </td>
            <td>
              <div class="flex justify-end gap-2">
                <a href="#/budget-report?property_id=${i.property_id}&year=${i.year}&month=${i.month}" 
                  class="p-2 rounded-lg hover:bg-primary-50 text-primary-600 transition" title="Ver Reporte Detallado">
                  <i data-lucide="bar-chart-3" class="w-4 h-4"></i>
                </a>
                <button class="edit-btn p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition" 
                  data-id="${i.id}" title="Editar">
                  <i data-lucide="edit-3" class="w-4 h-4"></i>
                </button>
                <button class="duplicate-btn p-2 rounded-lg hover:bg-surface-100 text-surface-500 transition" 
                  data-id="${i.id}" title="Duplicar">
                  <i data-lucide="copy" class="w-4 h-4"></i>
                </button>
                <button class="delete-budget-btn p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition" 
                  data-id="${i.id}" title="Eliminar">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </td>
          </tr>
        `}).join("")}
      </tbody>
    </table>
  `,window.lucide&&lucide.createIcons(),a.querySelectorAll("th.sortable").forEach(i=>{i.addEventListener("click",()=>{const d=i.dataset.sort;r===d?l*=-1:(r=d,l=1);const o=[...n].sort((c,p)=>{var h,w;let g,v;return d==="property"?(g=((h=t.find($=>$.id===c.property_id))==null?void 0:h.name)||"",v=((w=t.find($=>$.id===p.property_id))==null?void 0:w.name)||""):d==="date"?(g=c.year*100+c.month,v=p.year*100+p.month):d==="status"?(g=c.semaphore,v=p.semaphore):d==="budget"?(g=c.total_budget,v=p.total_budget):d==="pct"&&(g=c.execution_pct,v=p.execution_pct),(g>v?1:-1)*l});ce(a,o,t,e,s,d,l)})}),a.querySelectorAll(".edit-btn").forEach(i=>{i.addEventListener("click",async()=>{const d=n.find(o=>o.id===i.dataset.id);ue(t,d,s)})}),a.querySelectorAll(".duplicate-btn").forEach(i=>{i.addEventListener("click",()=>{const d=n.find(o=>o.id===i.dataset.id);Ge(t,d,s)})}),a.querySelectorAll(".delete-budget-btn").forEach(i=>{i.addEventListener("click",async()=>{x("¿Eliminar Presupuesto?","Esta acción borrará el presupuesto de este periodo y sus categorías.",{confirmText:"Eliminar",onConfirm:async()=>{await u.delete(`/budgets/${i.dataset.id}`),b("Presupuesto eliminado","success"),s()}})})})}function ue(a,n=null,t){const e=!!n,s=e?n.year:new Date().getFullYear(),r=e?n.month:new Date().getMonth()+1,l=a.map(c=>`<option value="${c.id}" ${e&&n.property_id===c.id?"selected":""}>${c.name}</option>`).join("");x(e?"Editar Presupuesto":"Nuevo Presupuesto",`
    <form id="bf" class="space-y-4">
      <div class="${e?"pointer-events-none opacity-60":""}">
        <label class="label">Propiedad *</label>
        <select class="select" name="property_id" required>
          <option value="GENERAL" ${e&&n.property_id==="GENERAL"?"selected":""}>Gastos Generales (Distribuible)</option>
          ${l}
        </select>
        ${e?'<p class="text-[10px] text-surface-400 mt-1">La propiedad y periodo no se pueden cambiar. Duplique el presupuesto si lo desea en otro lugar.</p>':""}
      </div>
      <div class="grid grid-cols-3 gap-4 items-end ${e?"pointer-events-none opacity-60":""}">
        <div><label class="label">Año *</label><input class="input" name="year" type="number" value="${s}" required /></div>
        <div><label class="label">Mes *</label><input class="input" name="month" type="number" min="1" max="12" value="${r}" required /></div>
        <div id="total-budget-container">
           <label class="label">Presupuesto *</label>
           <input class="input" name="total_budget" id="total_budget_input" type="number" step="0.01" value="${e?n.total_budget:""}" ${e&&n.auto_calculate_total?"disabled":""} />
        </div>
      </div>
      <div class="flex items-center gap-2 bg-primary-50 p-3 rounded-xl border border-primary-100">
        <input type="checkbox" id="auto_calculate_total" name="auto_calculate_total" class="w-4 h-4 rounded text-primary-600" ${e&&n.auto_calculate_total?"checked":""} />
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
          ${e?n.categories.map(c=>oe(c.category_name,c.budgeted_amount,c.is_distributable)).join(""):""}
        </div>
      </div>
      <div>
        <label class="label">Notas</label>
        <textarea class="textarea text-sm" name="notes" placeholder="Opcional...">${e&&n.notes||""}</textarea>
      </div>
    </form>
  `,{confirmText:e?"Guardar Cambios":"Crear Presupuesto",onConfirm:async()=>{var w;const c=document.getElementById("bf"),p=new FormData(c),g=document.getElementById("auto_calculate_total").checked,v=[];c.querySelectorAll(".cat-row").forEach($=>{const k=$.querySelector('[name="cat_name"]').value,T=$.querySelector('[name="cat_amount"]').value,C=$.querySelector('[name="cat_dist"]').checked;k&&T&&v.push({category_name:k,budgeted_amount:parseFloat(T),is_distributable:C})});const h={property_id:p.get("property_id"),year:parseInt(p.get("year")),month:parseInt(p.get("month")),total_budget:g?0:parseFloat(p.get("total_budget"))||0,categories:v,auto_calculate_total:g,notes:p.get("notes")};e?(await u.put(`/budgets/${n.id}`,h),b("Presupuesto actualizado","success")):(h.is_annual=((w=document.getElementById("is_annual"))==null?void 0:w.checked)||!1,await u.post("/budgets",h),b("Presupuesto creado","success")),t&&t()}});const i=document.getElementById("auto_calculate_total"),d=document.getElementById("total_budget_input");i.addEventListener("change",()=>{d.disabled=i.checked,i.checked&&o()});const o=()=>{if(!i.checked)return;let c=0;document.querySelectorAll(".cat-row").forEach(p=>{c+=parseFloat(p.querySelector('[name="cat_amount"]').value||0)}),d.value=c};document.getElementById("add-cat-btn").addEventListener("click",()=>{const c=document.getElementById("cats-list"),p=document.createElement("div");p.innerHTML=oe();const g=p.firstElementChild;c.appendChild(g),window.lucide&&lucide.createIcons(),g.querySelector('[name="cat_amount"]').addEventListener("input",o)}),document.querySelectorAll('.cat-row [name="cat_amount"]').forEach(c=>{c.addEventListener("input",o)}),window.lucide&&lucide.createIcons()}function oe(a="",n="",t=!1){return`
    <div class="cat-row flex gap-2 items-center animate-fade-in group">
      <input class="input text-sm py-1.5 flex-1" name="cat_name" value="${a}" placeholder="Ej: Mantenimiento" />
      <input class="input text-sm py-1.5 w-40" name="cat_amount" type="number" step="0.01" value="${n}" placeholder="$" />
      <div class="flex items-center gap-1">
        <input type="checkbox" name="cat_dist" class="w-4 h-4" ${t?"checked":""} />
        <span class="text-[10px] text-surface-400">Dist.</span>
      </div>
      <button type="button" class="p-1.5 text-rose-300 hover:text-rose-600 transition" onclick="this.parentElement.remove(); document.dispatchEvent(new Event('catChange'));">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>
  `}document.addEventListener("catChange",()=>{const a=document.getElementById("auto_calculate_total");if(a&&a.checked){let n=0;document.querySelectorAll(".cat-row").forEach(e=>{n+=parseFloat(e.querySelector('[name="cat_amount"]').value||0)});const t=document.getElementById("total_budget_input");t&&(t.value=n)}});function Ge(a,n,t){const e=new Date().getFullYear(),s=a.map(r=>`<option value="${r.id}" ${n.property_id===r.id?"selected":""}>${r.name}</option>`).join("");x("Duplicar Periodo",`
    <form id="df" class="space-y-4">
      <div class="bg-indigo-50 p-3 rounded-xl border border-indigo-100 mb-4 flex gap-3 items-center">
        <i data-lucide="copy" class="w-5 h-5 text-indigo-600"></i>
        <p class="text-xs text-indigo-700">Copia este presupuesto a un nuevo mes/año con un ajuste opcional.</p>
      </div>
      
      <div>
        <label class="label">Propiedad Destino *</label>
        <select class="select" name="target_property_id" required>
          <option value="GENERAL" ${n.property_id==="GENERAL"?"selected":""}>Gastos Generales (Distribuible)</option>
          ${s}
        </select>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Año Destino *</label><input class="input" name="target_year" type="number" value="${e}" required /></div>
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
  `,{confirmText:"Procesar Duplicación",onConfirm:async()=>{const r=new FormData(document.getElementById("df")),l={target_year:parseInt(r.get("target_year")),target_month:parseInt(r.get("target_month")),target_property_id:r.get("target_property_id"),percentage_increase:parseFloat(r.get("percentage_increase")||0)};await u.post(`/budgets/${n.id}/duplicate`,l),b("Presupuesto duplicado","success"),t&&t()}}),window.lucide&&lucide.createIcons()}async function Re(a){const n=new URLSearchParams(window.location.hash.split("?")[1]||""),t=n.get("property_id"),e=n.get("year"),s=n.get("month");if(!t||!e||!s){a.innerHTML='<div class="p-12 text-center text-surface-500">Faltan parámetros para el reporte.</div>';return}const r=await u.get(`/budgets/report/${t}?year=${e}&month=${s}`),l=new Set;r.rows.forEach(d=>{Object.keys(d.distribution).forEach(o=>l.add(o))});const i=Array.from(l);a.innerHTML=`
    <div class="mb-6 flex items-center justify-between">
      <a href="#/budgets" class="btn-ghost text-sm"><i data-lucide="arrow-left" class="w-4 h-4 mr-1"></i> Volver</a>
      <div class="text-right">
        <h4 class="font-bold text-surface-900">Periodo: ${s}/${e}</h4>
      </div>
    </div>

    <div class="glass-card overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-surface-50 border-b border-surface-200">
            <th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Categoría</th>
            <th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Presupuestado</th>
            <th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Ejecutado Total</th>
            ${i.map(d=>`<th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">${d.slice(0,8)}...</th>`).join("")}
            <th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Diferencia</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-100">
          ${r.rows.length?r.rows.map(d=>{const o=d.budgeted-d.actual,c=o>=0?"text-green-600":"text-red-600";return`
              <tr class="hover:bg-surface-50/50 transition-colors">
                <td class="p-4 font-medium text-surface-700">
                  <div class="flex flex-col">
                    <span>${d.category}</span>
                    ${d.is_distributable?'<span class="text-[10px] text-primary-500 font-bold uppercase">Distribuible</span>':""}
                  </div>
                </td>
                <td class="p-4 text-surface-600 font-mono text-sm">${f(d.budgeted)}</td>
                <td class="p-4 text-surface-900 font-bold font-mono text-sm">${f(d.actual)}</td>
                ${i.map(p=>`
                  <td class="p-4 text-surface-500 font-mono text-xs">
                    ${d.distribution[p]?f(d.distribution[p]):"--"}
                  </td>
                `).join("")}
                <td class="p-4 font-bold font-mono text-sm ${c}">${f(o)}</td>
              </tr>
            `}).join(""):`<tr><td colspan="${4+i.length}" class="p-8 text-center text-surface-400">Sin datos para este periodo</td></tr>`}
        </tbody>
      </table>
    </div>

    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card-static p-4">
        <p class="text-xs text-surface-400 uppercase font-bold mb-1">Total Presupuesto</p>
        <p class="text-xl font-bold text-surface-900 font-mono">${f(r.rows.reduce((d,o)=>d+o.budgeted,0))}</p>
      </div>
      <div class="glass-card-static p-4">
        <p class="text-xs text-surface-400 uppercase font-bold mb-1">Total Ejecutado</p>
        <p class="text-xl font-bold text-primary-600 font-mono">${f(r.rows.reduce((d,o)=>d+o.actual,0))}</p>
      </div>
       <div class="glass-card-static p-4">
        <p class="text-xs text-surface-400 uppercase font-bold mb-1">Cumpimiento</p>
        <p class="text-xl font-bold text-surface-900 font-mono">
          ${V(r.rows.reduce((d,o)=>d+o.actual,0)/(r.rows.reduce((d,o)=>d+o.budgeted,0)||1)*100)}
        </p>
      </div>
    </div>
  `,window.lucide&&lucide.createIcons()}async function K(a,n){const[t,e,s]=await Promise.all([u.get("/assets"),u.get("/inspections"),u.get("/properties?limit=100")]),r=s.items||[];a.innerHTML=`
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
    `;const l=a.querySelector("#tab-content"),i=a.querySelectorAll(".tab-btn");i.forEach(d=>{d.addEventListener("click",()=>{i.forEach(o=>o.classList.remove("active")),d.classList.add("active"),re(d.dataset.tab,l,{assets:t,inspections:e,properties:r})})}),re("assets",l,{assets:t,inspections:e,properties:r})}async function re(a,n,t){switch(a){case"assets":Ne(n,t);break;case"inspections":ze(n,t);break;case"providers":He(n);break}}function Ne(a,{assets:n,properties:t}){a.innerHTML=`
        <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-semibold text-surface-700">Equipos y Mobiliario</h4>
            <button id="add-asset-btn" class="btn-primary btn-sm px-3 py-1.5"><i data-lucide="plus" class="w-4 h-4"></i> Nuevo Activo</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${n.length?n.map(e=>`
                <div class="glass-card-static p-4 space-y-3">
                    <div class="flex justify-between items-start">
                        <div>
                            <span class="text-[10px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">${e.category}</span>
                            <h5 class="font-bold text-surface-900 mt-1">${e.name}</h5>
                        </div>
                        <span class="badge ${e.status==="Operativo"?"badge-green":"badge-amber"}">${e.status}</span>
                    </div>
                    <div class="text-xs text-surface-500 space-y-1">
                        <p><span class="font-medium">Marca:</span> ${e.brand||"N/A"}</p>
                        <p><span class="font-medium">Modelo:</span> ${e.model||"N/A"}</p>
                        <p><span class="font-medium">Serial:</span> ${e.serial_number||"N/A"}</p>
                    </div>
                    <div class="pt-2 border-t border-surface-100 flex justify-between items-center">
                        <span class="text-[10px] text-surface-400">Propiedad: ${e.property_id.slice(0,8)}</span>
                        <button class="text-primary-600 hover:text-primary-700 text-xs font-semibold">Detalles</button>
                    </div>
                </div>
            `).join(""):'<p class="text-surface-400 text-center py-20 col-span-full">No hay activos registrados.</p>'}
        </div>
    `,document.getElementById("add-asset-btn").addEventListener("click",()=>Ue(t)),window.lucide&&lucide.createIcons()}function ze(a,{inspections:n,properties:t}){a.innerHTML=`
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
                    ${n.length?n.map(e=>`
                        <tr>
                            <td class="font-medium">${e.inspection_type}</td>
                            <td>${E(e.scheduled_date)}</td>
                            <td><span class="badge ${e.status==="Realizada"?"badge-green":e.status==="Cancelada"?"badge-red":"badge-blue"}">${e.status}</span></td>
                            <td>${e.inspector_name||"-"}</td>
                            <td class="text-xs text-surface-500">${e.property_id.slice(0,8)}</td>
                            <td class="text-right">
                                <button class="text-surface-400 hover:text-primary-600"><i data-lucide="more-horizontal" class="w-5 h-5"></i></button>
                            </td>
                        </tr>
                    `).join(""):'<tr><td colspan="6" class="text-center py-10 text-surface-400">No hay inspecciones programadas.</td></tr>'}
                </tbody>
            </table>
        </div>
    `,document.getElementById("add-insp-btn").addEventListener("click",()=>Ve(t)),window.lucide&&lucide.createIcons()}async function He(a){const n=await u.get("/contacts?type=Proveedor");a.innerHTML=`
        <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-semibold text-surface-700">Directorio de Proveedores</h4>
            <button id="add-prov-btn" class="btn-primary btn-sm px-3 py-1.5"><i data-lucide="user-plus" class="w-4 h-4"></i> Nuevo Proveedor</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${n.length?n.map(t=>`
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
    `,window.lucide&&lucide.createIcons()}function Ue(a){const n=a.map(t=>`<option value="${t.id}">${t.name}</option>`).join("");x("Nuevo Activo",`
        <form id="af" class="space-y-4">
            <div>
                <label class="label">Propiedad *</label>
                <select class="select" name="property_id" required>${n}</select>
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
    `,{confirmText:"Guardar",onConfirm:async()=>{const t=new FormData(document.getElementById("af")),e=Object.fromEntries(t);await u.post("/assets",e),b("Activo registrado","success"),await K(document.getElementById("page-content"))}})}function Ve(a){const n=a.map(t=>`<option value="${t.id}">${t.name}</option>`).join("");x("Programar Inspección",`
        <form id="if" class="space-y-4">
            <div>
                <label class="label">Propiedad *</label>
                <select class="select" name="property_id" required>${n}</select>
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
    `,{confirmText:"Programar",onConfirm:async()=>{const t=new FormData(document.getElementById("if")),e=Object.fromEntries(t);await u.post("/inspections",e),b("Inspección programada","success"),await K(document.getElementById("page-content"))}})}let z=null,H=null;async function We(a){const t=new URLSearchParams(window.location.hash.split("?")[1]).get("id");if(!t){a.innerHTML='<div class="p-8 text-center text-rose-500">Error: No se proporcionó ID de cuenta.</div>';return}a.innerHTML=`
        <div class="flex items-center justify-center py-20">
            <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
        </div>
    `;try{await pe(a,t)}catch(e){a.innerHTML=`<div class="p-8 text-center text-rose-500">Error al cargar datos de la cuenta: ${e.message}</div>`}}async function pe(a,n,t={}){const e=new URLSearchParams;t.date_from&&e.set("date_from",t.date_from),t.date_to&&e.set("date_to",t.date_to),t.tx_type&&e.set("tx_type",t.tx_type),e.set("months",12);const s=await u.get(`/accounts/${n}/history?${e.toString()}`);if(!s)return;const{account:r,monthly_cashflow:l,recent_transactions:i,balance_history:d}=s;a.innerHTML=`
        <div class="flex flex-col gap-6 animate-fade-in">
            <!-- Header & Balance -->
            <div class="flex flex-col md:flex-row gap-6 items-center glass-card-static p-6 border-white/40 shadow-sm relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -translate-y-16 translate-x-16"></div>
                <div class="text-center md:text-left flex-1 z-10">
                    <div class="flex items-center gap-3 mb-2">
                        <a href="#/financials" class="p-2 rounded-xl bg-white/50 hover:bg-white text-surface-400 hover:text-primary-600 transition shadow-sm border border-white/20">
                            <i data-lucide="arrow-left" class="w-4 h-4"></i>
                        </a>
                        <h2 class="text-2xl font-black text-surface-900">${r.account_name}</h2>
                    </div>
                    <p class="text-surface-500 text-sm ml-11">${r.bank_name||"Sin Banco"} • ${r.account_type} • ${r.currency}</p>
                </div>
                <div class="bg-white/80 backdrop-blur-md px-8 py-4 rounded-2xl shadow-xl shadow-primary-500/5 border border-white text-center z-10 group transition-transform hover:scale-105">
                    <p class="text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-1">Saldo Disponible</p>
                    <p class="text-3xl font-black ${r.current_balance>=0?"text-accent-600":"text-rose-600"}">
                        ${f(r.current_balance)}
                    </p>
                </div>
            </div>

            <!-- Filters Row -->
            <div class="flex flex-wrap items-end gap-4 p-5 glass-card-static border-white/40 shadow-sm">
                <div class="flex-1 min-w-[150px]">
                    <label class="block text-[10px] font-bold text-surface-400 uppercase mb-2 tracking-wider ml-1">Desde</label>
                    <div class="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-xl border border-white/20 shadow-sm">
                        <i data-lucide="calendar" class="w-4 h-4 text-surface-400"></i>
                        <input type="date" id="filter-date-from" class="bg-transparent text-sm font-medium focus:outline-none w-full" value="${t.date_from||""}">
                    </div>
                </div>
                <div class="flex-1 min-w-[150px]">
                    <label class="block text-[10px] font-bold text-surface-400 uppercase mb-2 tracking-wider ml-1">Hasta</label>
                    <div class="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-xl border border-white/20 shadow-sm">
                        <i data-lucide="calendar" class="w-4 h-4 text-surface-400"></i>
                        <input type="date" id="filter-date-to" class="bg-transparent text-sm font-medium focus:outline-none w-full" value="${t.date_to||""}">
                    </div>
                </div>
                <div class="flex-1 min-w-[150px]">
                    <label class="block text-[10px] font-bold text-surface-400 uppercase mb-2 tracking-wider ml-1">Tipo de Transacción</label>
                    <div class="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-xl border border-white/20 shadow-sm">
                        <i data-lucide="list-filter" class="w-4 h-4 text-surface-400"></i>
                        <select id="filter-tx-type" class="bg-transparent text-sm font-medium focus:outline-none w-full appearance-none">
                            <option value="">Cualquier tipo</option>
                            <option value="Ingreso" ${t.tx_type==="Ingreso"?"selected":""}>Ingreso</option>
                            <option value="Gasto" ${t.tx_type==="Gasto"?"selected":""}>Gasto</option>
                            <option value="Transferencia" ${t.tx_type==="Transferencia"?"selected":""}>Transferencia</option>
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
                        ${i.length} registros en periodo
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
                            ${i.length>0?i.map(o=>`
                                <tr class="hover:bg-white/50 transition-colors group">
                                    <td class="text-xs text-surface-400 font-medium italic">${E(o.transaction_date)}</td>
                                    <td>
                                        <div class="font-bold text-surface-900 text-sm group-hover:text-primary-600 transition-colors">${o.description}</div>
                                        <div class="text-[10px] text-surface-400 flex items-center gap-1 mt-0.5">
                                            <i data-lucide="map-pin" class="w-2.5 h-2.5"></i>
                                            ${o.property_name||"Gasto General Corporativo"}
                                        </div>
                                    </td>
                                    <td>
                                        <span class="badge badge-gray !rounded-lg text-[10px] font-semibold">${o.category}</span>
                                    </td>
                                    <td class="text-right font-black text-sm ${o.direction==="Debit"?"text-accent-600":"text-rose-600"}">
                                        <div class="flex items-center justify-end gap-1">
                                            <span>${o.direction==="Debit"?"+":"-"}</span>
                                            <span>${f(o.amount)}</span>
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
    `,window.lucide&&lucide.createIcons(),document.getElementById("btn-apply-filters").addEventListener("click",()=>{const o={date_from:document.getElementById("filter-date-from").value,date_to:document.getElementById("filter-date-to").value,tx_type:document.getElementById("filter-tx-type").value};pe(a,n,o)}),Ye(l,d)}function Ye(a,n){z&&z.destroy(),H&&H.destroy();const t=document.getElementById("account-history-chart");t&&a.length>0&&(z=new Chart(t,{type:"bar",data:{labels:a.map(s=>s.month),datasets:[{label:"Ingresos",data:a.map(s=>s.income),backgroundColor:"#00d084",borderRadius:8,barThickness:15},{label:"Gastos",data:a.map(s=>s.expenses),backgroundColor:"#ff4d4f",borderRadius:8,barThickness:15}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"bottom",labels:{boxWidth:10,usePointStyle:!0,font:{size:11,weight:"600"}}}},scales:{y:{grid:{color:"rgba(0,0,0,0.03)"},ticks:{font:{size:10},callback:s=>"$"+s.toLocaleString()}},x:{grid:{display:!1},ticks:{font:{size:10}}}}}}));const e=document.getElementById("account-balance-chart");e&&n&&n.length>0&&(H=new Chart(e,{type:"line",data:{labels:n.map(s=>E(s.date)),datasets:[{label:"Saldo",data:n.map(s=>s.balance),borderColor:"#4d7cfe",backgroundColor:"rgba(77, 124, 254, 0.1)",fill:!0,tension:.4,pointRadius:2,pointHoverRadius:6,borderWidth:4,pointBackgroundColor:"#fff",pointBorderWidth:2}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{mode:"index",intersect:!1}},scales:{y:{grid:{color:"rgba(0,0,0,0.03)"},ticks:{font:{size:10},callback:s=>"$"+s.toLocaleString()}},x:{grid:{display:!1},ticks:{font:{size:8},maxRotation:0,autoSkip:!0,maxTicksLimit:12}}}}}))}async function O(a,n){const[t,e,s]=await Promise.all([u.get("/work-groups"),u.get("/properties?limit=100"),u.get("/users?limit=100").catch(()=>({items:[]}))]),r=e.items||[],l=s.items||[];a.innerHTML=`
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
            ${t.length?t.map(i=>{var d,o;return`
                <div class="glass-card-static p-5 flex flex-col space-y-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-bold text-surface-900 text-lg">${i.name}</h4>
                            <p class="text-xs text-surface-500">${i.description||"Sin descripción"}</p>
                        </div>
                        <span class="badge badge-blue">ID: ${i.id.slice(0,4)}</span>
                    </div>

                    <div class="space-y-2 flex-grow">
                        <div class="flex justify-between text-sm">
                            <span class="text-surface-600 font-medium">Miembros</span>
                            <span class="font-bold text-surface-900">${((d=i.members)==null?void 0:d.length)||0}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-surface-600 font-medium">Propiedades Asignadas</span>
                            <span class="font-bold text-surface-900">${((o=i.assigned_properties)==null?void 0:o.length)||0}</span>
                        </div>
                    </div>

                    <div class="pt-4 border-t border-surface-100 flex gap-2">
                        <button class="btn-secondary btn-sm flex-1" onclick="window.addMemberModal('${i.id}')">
                            <i data-lucide="user-plus" class="w-4 h-4 mr-1"></i> Miembro
                        </button>
                        <button class="btn-secondary btn-sm flex-1" onclick="window.addPropertyModal('${i.id}')">
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
        `,{confirmText:"Crear",onConfirm:async()=>{const i=new FormData(document.getElementById("wg-form")),d=Object.fromEntries(i);await u.post("/work-groups",d),b("Grupo creado","success"),O(a,n)}})}),window.addMemberModal=async i=>{const d=l.length?l.map(o=>`<option value="${o.id}">${o.full_name||o.email} (${o.role})</option>`).join(""):'<option value="" disabled>No se encontraron usuarios</option>';x("Añadir Miembro",`
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
        `,{confirmText:"Añadir",onConfirm:async()=>{const o=new FormData(document.getElementById("wm-form")),c=Object.fromEntries(o);if(!c.user_id){b("Seleccione un usuario","error");return}await u.post(`/work-groups/${i}/members`,c),b("Miembro añadido","success"),O(a,n)}})},window.addPropertyModal=async i=>{const d=r.length?r.map(o=>`<option value="${o.id}">${o.name} (${o.property_type})</option>`).join(""):'<option value="" disabled>No se encontraron propiedades</option>';x("Asignar Propiedad",`
            <form id="wp-form" class="space-y-4">
                <div>
                    <label class="label">Propiedad *</label>
                    <select class="select" name="property_id" required>
                        <option value="">Seleccione una propiedad...</option>
                        ${d}
                    </select>
                </div>
            </form>
        `,{confirmText:"Asignar",onConfirm:async()=>{const o=new FormData(document.getElementById("wp-form")),c=Object.fromEntries(o);if(!c.property_id){b("Seleccione una propiedad","error");return}await u.post(`/work-groups/${i}/properties`,c),b("Propiedad asignada","success"),O(a,n)}})},window.lucide&&lucide.createIcons()}async function Ke(a,n){const t=await u.get("/audits?limit=50");a.innerHTML=`
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
                        ${t.length?t.map(e=>`
                            <tr class="hover:bg-surface-50">
                                <td class="whitespace-nowrap">${E(e.timestamp)}</td>
                                <td class="text-xs text-surface-600 font-mono">${e.user_id?e.user_id.slice(0,8):"Sistema"}</td>
                                <td>
                                    <span class="px-2 py-1 bg-surface-100 text-surface-700 rounded text-xs font-semibold">
                                        ${e.action}
                                    </span>
                                </td>
                                <td class="font-medium text-surface-800">${e.entity_type}</td>
                                <td class="text-xs text-surface-500 font-mono">${e.entity_id||"-"}</td>
                                <td class="text-xs text-surface-500 max-w-xs truncate" title="${e.details||""}">
                                    ${e.details||"-"}
                                </td>
                            </tr>
                        `).join(""):'<tr><td colspan="6" class="text-center py-10 text-surface-500">No hay registros de auditoría.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `,window.lucide&&lucide.createIcons()}async function Je(a){window.FullCalendar||await Ze(),a.innerHTML=`
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
    `;try{const t=((await u.get("/reports/upcoming-events?days=90")).events||[]).map(s=>({title:s.title,date:s.date,extendedProps:{detail:s.detail,type:s.type,severity:s.severity},backgroundColor:s.severity==="high"?"#f43f5e":s.severity==="medium"?"#f59e0b":"#60a5fa",borderColor:s.severity==="high"?"#e11d48":s.severity==="medium"?"#d97706":"#3b82f6",textColor:"#ffffff"}));new FullCalendar.Calendar(document.getElementById("pms-calendar"),{initialView:"dayGridMonth",locale:"es",height:620,headerToolbar:{left:"prev,next today",center:"title",right:"dayGridMonth,timeGridWeek,listMonth"},buttonText:{today:"Hoy",month:"Mes",week:"Semana",list:"Lista"},events:t,eventClick(s){const{title:r,extendedProps:l}=s.event;b(`${r} — ${l.detail}`,"info")},eventDidMount(s){s.el.title=`${s.event.title}
${s.event.extendedProps.detail}`}}).render()}catch(n){console.error("Calendar error:",n),b("Error cargando eventos del calendario","error")}}function Ze(){return new Promise((a,n)=>{if(window.FullCalendar)return a();const t=document.createElement("script");t.src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js",t.onload=a,t.onerror=n,document.head.appendChild(t)})}async function Qe(a,n){var t;if(((t=n.user)==null?void 0:t.role)!=="Admin"){a.innerHTML=`
            <div class="text-center py-20">
                <i data-lucide="shield-alert" class="w-12 h-12 text-rose-500 mx-auto mb-4"></i>
                <h3 class="text-xl font-bold text-surface-900 mb-2">Acceso Denegado</h3>
                <p class="text-surface-500">Solo los administradores pueden modificar la configuración del sistema.</p>
            </div>
        `;return}a.innerHTML=`
        <div class="max-w-4xl mx-auto space-y-8">
            
            <!-- Email Configuration -->
            <div class="glass-card p-6">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                        <i data-lucide="mail" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-surface-900">Configuración de Correo Electrónico</h3>
                        <p class="text-sm text-surface-500">Credenciales SMTP para el envío de notificaciones y reportes.</p>
                    </div>
                </div>

                <form id="email-config-form" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="label text-sm" for="smtp_host">Servidor SMTP (Host)</label>
                            <input type="text" id="smtp_host" name="SMTP_HOST" class="input" placeholder="ej. smtp.gmail.com">
                        </div>
                        <div>
                            <label class="label text-sm" for="smtp_port">Puerto SMTP</label>
                            <input type="number" id="smtp_port" name="SMTP_PORT" class="input" placeholder="ej. 587">
                        </div>
                        <div>
                            <label class="label text-sm" for="smtp_user">Usuario (Correo)</label>
                            <input type="email" id="smtp_user" name="SMTP_USER" class="input" placeholder="correo@empresa.com">
                        </div>
                        <div>
                            <label class="label text-sm" for="smtp_pass">Contraseña / App Password</label>
                            <input type="password" id="smtp_pass" name="SMTP_PASS" class="input" placeholder="••••••••">
                        </div>
                    </div>
                    <div class="flex justify-end pt-4">
                        <button type="submit" class="btn-primary" id="btn-save-email">Guardar Correo</button>
                    </div>
                </form>
            </div>

            <!-- Telegram Configuration -->
            <div class="glass-card p-6">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
                        <i data-lucide="send" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-surface-900">Bot de Telegram</h3>
                        <p class="text-sm text-surface-500">Token de acceso proporcionado por BotFather para recibir daños.</p>
                    </div>
                </div>

                <form id="telegram-config-form" class="space-y-4">
                    <div>
                        <label class="label text-sm" for="telegram_token">Telegram Bot Token</label>
                        <input type="text" id="telegram_token" name="TELEGRAM_BOT_TOKEN" class="input font-mono text-sm" placeholder="123456789:ABCdefGHIjklmnoPQR_stuVwxyz12345">
                        <p class="text-xs text-surface-400 mt-2">Asegúrate de configurar el Webhook en tu hosting después de agregar este token.</p>
                    </div>
                    <div class="flex justify-end pt-4">
                        <button type="submit" class="btn-primary" id="btn-save-telegram">Guardar Telegram</button>
                    </div>
                </form>
            </div>

        </div>
    `;try{(await u.get("/config")).forEach(s=>{const r=a.querySelector(`[name="${s.key}"]`);r&&(r.value=s.value)})}catch(e){b("Error cargando la configuración: "+e.message,"error")}a.querySelector("#email-config-form").addEventListener("submit",async e=>{e.preventDefault();const s=a.querySelector("#btn-save-email");s.disabled=!0,s.innerHTML='<i data-lucide="loader-2" class="w-4 h-4 mr-2 animate-spin"></i> Guardando...';const r=new FormData(e.target),l={};r.forEach((i,d)=>{i.trim()!==""&&(l[d]=i.trim())});try{await u.post("/config/batch",l),b("Configuración de correo guardada exitosamente.","success")}catch(i){b("Error al guardar: "+i.message,"error")}finally{s.disabled=!1,s.textContent="Guardar Correo"}}),a.querySelector("#telegram-config-form").addEventListener("submit",async e=>{e.preventDefault();const s=a.querySelector("#btn-save-telegram");s.disabled=!0,s.innerHTML='<i data-lucide="loader-2" class="w-4 h-4 mr-2 animate-spin"></i> Guardando...';const r=e.target.elements.TELEGRAM_BOT_TOKEN.value.trim();if(!r){b("El token no puede estar vacío","warning"),s.disabled=!1,s.textContent="Guardar Telegram";return}try{await u.post("/config/batch",{TELEGRAM_BOT_TOKEN:r}),b("Token de Telegram guardado.","success")}catch(l){b("Error al guardar: "+l.message,"error")}finally{s.disabled=!1,s.textContent="Guardar Telegram"}})}const I={user:null,currentPage:"dashboard"},Xe={dashboard:{title:"Dashboard",subtitle:"Vista general de su cartera inmobiliaria",render:Ie},properties:{title:"Propiedades",subtitle:"Gestión de su portfolio inmobiliario",render:W},financials:{title:"Finanzas",subtitle:"Ledger contable y conciliación bancaria",render:A},maintenance:{title:"Mantenimientos",subtitle:"Órdenes de trabajo y calendario",render:Y},contracts:{title:"Contratos",subtitle:"Gestión de arrendamientos",render:G},budgets:{title:"Presupuestos",subtitle:"Control presupuestario y semáforo",render:Oe},"budget-report":{title:"Reporte de Presupuesto",subtitle:"Distribución y cumplimiento detallado",render:Re},facility:{title:"Facility Management",subtitle:"Gestión de activos e inspecciones",render:K},"account-detail":{title:"Detalle de Cuenta",subtitle:"Historial de movimientos y análisis de saldo",render:We},"work-groups":{title:"Grupos de Trabajo",subtitle:"Gestión de equipos de mantenimiento",render:O},audits:{title:"Auditoría",subtitle:"Registro de actividades y log del sistema",render:Ke},calendar:{title:"Calendario",subtitle:"Eventos y fechas importantes próximas",render:Je},settings:{title:"Configuración",subtitle:"Ajustes globales de Telegram y Correo",render:Qe}};function me(){return(window.location.hash.replace("#/","")||"dashboard").split("?")[0].split("/")[0]}async function be(a){const n=Xe[a];if(!n){window.location.hash="#/dashboard";return}I.currentPage=a,document.getElementById("page-title").textContent=n.title,document.getElementById("page-subtitle").textContent=n.subtitle,document.querySelectorAll(".sidebar-link").forEach(e=>{e.classList.toggle("active",e.dataset.page===a)});const t=document.getElementById("page-content");t.innerHTML='<div class="flex items-center justify-center py-20"><div class="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>';try{await n.render(t,I)}catch(e){console.error(`Error rendering ${a}:`,e),t.innerHTML=`
      <div class="text-center py-20">
        <i data-lucide="alert-circle" class="w-12 h-12 text-rose-400 mx-auto mb-4"></i>
        <h3 class="text-lg font-semibold text-surface-700 mb-2">Error al cargar la página</h3>
        <p class="text-surface-500">${e.message}</p>
      </div>
    `}window.lucide&&lucide.createIcons()}function R(){document.getElementById("auth-screen").classList.remove("hidden"),document.getElementById("app-shell").classList.add("hidden"),window.lucide&&lucide.createIcons()}function fe(){document.getElementById("auth-screen").classList.add("hidden"),document.getElementById("app-shell").classList.remove("hidden"),I.user&&(document.getElementById("user-name").textContent=I.user.full_name,document.getElementById("user-role").textContent=I.user.role,document.getElementById("user-avatar").textContent=I.user.full_name.charAt(0).toUpperCase()),window.lucide&&lucide.createIcons(),be(me())}async function et(){if(!u.isAuthenticated()){R();return}try{I.user=await u.getProfile(),fe()}catch{u.clearTokens(),R()}}function tt(){window.addEventListener("hashchange",()=>{I.user&&be(me())}),document.getElementById("login-form").addEventListener("submit",async a=>{a.preventDefault();const n=document.getElementById("login-email").value,t=document.getElementById("login-password").value;try{await u.login(n,t),I.user=await u.getProfile(),b(`Bienvenido, ${I.user.full_name}`,"success"),fe()}catch(e){b(e.message,"error")}}),document.getElementById("register-form").addEventListener("submit",async a=>{a.preventDefault();const n={full_name:document.getElementById("reg-name").value,email:document.getElementById("reg-email").value,password:document.getElementById("reg-password").value,role:document.getElementById("reg-role").value};try{console.log("Registrando usuario...",n),await u.register(n),b("Cuenta creada. Inicie sesión.","success"),document.getElementById("register-form").classList.add("hidden"),document.getElementById("login-form").classList.remove("hidden"),a.target.reset()}catch(t){console.error("Error en registro:",t),b(t.message,"error")}}),document.getElementById("show-register").addEventListener("click",a=>{a.preventDefault(),document.getElementById("login-form").classList.add("hidden"),document.getElementById("register-form").classList.remove("hidden")}),document.getElementById("show-login").addEventListener("click",a=>{a.preventDefault(),document.getElementById("register-form").classList.add("hidden"),document.getElementById("login-form").classList.remove("hidden")}),document.getElementById("logout-btn").addEventListener("click",()=>{u.clearTokens(),I.user=null,b("Sesión cerrada","info"),R()}),u.onUnauthorized(()=>{I.user=null,R(),b("Sesión expirada","warning")}),et()}document.addEventListener("DOMContentLoaded",tt);
