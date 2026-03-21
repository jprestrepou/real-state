(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))a(e);new MutationObserver(e=>{for(const l of e)if(l.type==="childList")for(const d of l.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&a(d)}).observe(document,{childList:!0,subtree:!0});function i(e){const l={};return e.integrity&&(l.integrity=e.integrity),e.referrerPolicy&&(l.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?l.credentials="include":e.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function a(e){if(e.ep)return;e.ep=!0;const l=i(e);fetch(e.href,l)}})();const R="https://real-state-xd5o.onrender.com/api/v1";class xe{constructor(){this._accessToken=localStorage.getItem("pms_access_token"),this._refreshToken=localStorage.getItem("pms_refresh_token"),this._onUnauthorized=null}get baseUrl(){return R}onUnauthorized(s){this._onUnauthorized=s}setTokens(s,i){this._accessToken=s,this._refreshToken=i,localStorage.setItem("pms_access_token",s),localStorage.setItem("pms_refresh_token",i)}clearTokens(){this._accessToken=null,this._refreshToken=null,localStorage.removeItem("pms_access_token"),localStorage.removeItem("pms_refresh_token")}isAuthenticated(){return!!this._accessToken}async _fetch(s,i={}){const a={"Content-Type":"application/json",...i.headers};this._accessToken&&(a.Authorization=`Bearer ${this._accessToken}`),i.body instanceof FormData&&delete a["Content-Type"];let e=await fetch(`${R}${s}`,{...i,headers:a});if(e.status===401&&this._refreshToken)if(await this._tryRefresh())a.Authorization=`Bearer ${this._accessToken}`,e=await fetch(`${R}${s}`,{...i,headers:a});else throw this.clearTokens(),this._onUnauthorized&&this._onUnauthorized(),new Error("Sesión expirada. Inicie sesión nuevamente.");if(!e.ok){let l="Error del servidor";try{const d=await e.json();typeof d.detail=="string"?l=d.detail:Array.isArray(d.detail)?l=d.detail.map(o=>o.msg).join(", "):d.detail&&(l=JSON.stringify(d.detail))}catch{l=`Error ${e.status}`}throw new Error(l)}return e.status===204?null:e.json()}async _tryRefresh(){try{const s=await fetch(`${R}/auth/refresh`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refresh_token:this._refreshToken})});if(!s.ok)return!1;const i=await s.json();return this.setTokens(i.access_token,i.refresh_token),!0}catch{return!1}}get(s){return this._fetch(s)}post(s,i){return this._fetch(s,{method:"POST",body:JSON.stringify(i)})}put(s,i){return this._fetch(s,{method:"PUT",body:JSON.stringify(i)})}delete(s){return this._fetch(s,{method:"DELETE"})}upload(s,i){return this._fetch(s,{method:"POST",body:i})}async login(s,i){const a=await this.post("/auth/login",{email:s,password:i});return this.setTokens(a.access_token,a.refresh_token),a}async register(s){return this.post("/auth/register",s)}async getProfile(){return this.get("/auth/me")}}const p=new xe;function b(t,s="info",i=4e3){const a=document.getElementById("toast-container"),e=document.createElement("div");e.className=`toast toast-${s}`,e.textContent=t,a.appendChild(e),setTimeout(()=>{e.style.opacity="0",e.style.transform="translateX(100%)",e.style.transition="all 0.3s ease-in",setTimeout(()=>e.remove(),300)},i)}function h(t,s,{onConfirm:i,confirmText:a="Guardar",showCancel:e=!0}={}){const l=document.getElementById("modal-container");l.innerHTML=`
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
          ${e?'<button id="modal-cancel" class="btn-secondary">Cancelar</button>':""}
          ${i?`<button id="modal-confirm" class="btn-primary">${a}</button>`:""}
        </div>
      </div>
    </div>
  `,window.lucide&&lucide.createIcons();const d=document.getElementById("modal-overlay"),o=document.getElementById("modal-close"),r=document.getElementById("modal-cancel"),n=document.getElementById("modal-confirm"),c=()=>{l.innerHTML=""};return d.addEventListener("click",u=>{u.target===d&&c()}),o==null||o.addEventListener("click",c),r==null||r.addEventListener("click",c),n&&i&&n.addEventListener("click",async()=>{try{await i(),c()}catch(u){b(u.message,"error")}}),{close:c,getBody:()=>document.getElementById("modal-body")}}function U(){document.getElementById("modal-container").innerHTML=""}function g(t,s="COP"){return t==null?"—":new Intl.NumberFormat("es-CO",{style:"currency",currency:s,minimumFractionDigits:0,maximumFractionDigits:0}).format(t)}function te(t){return t==null?"—":Math.abs(t)>=1e6?`$${(t/1e6).toFixed(1)}M`:Math.abs(t)>=1e3?`$${(t/1e3).toFixed(0)}K`:g(t)}function _(t){return t?new Date(t).toLocaleDateString("es-CO",{year:"numeric",month:"short",day:"numeric"}):"—"}function Y(t){return t==null?"—":`${Number(t).toFixed(1)}%`}function q(t){return{Disponible:"badge-green",Arrendada:"badge-blue","En Mantenimiento":"badge-amber",Vendida:"badge-gray",Pendiente:"badge-amber","En Progreso":"badge-blue",Completado:"badge-green",Cancelado:"badge-red","Esperando Factura":"badge-amber",Activo:"badge-green",Borrador:"badge-gray",Finalizado:"badge-gray",Pagado:"badge-green",Vencido:"badge-red"}[t]||"badge-gray"}function he(t){return{Verde:"semaphore-green",Amarillo:"semaphore-amber",Rojo:"semaphore-red"}[t]||"semaphore-green"}const B={primary:"#4c6ef5",accent:"#20c997",accentLight:"rgba(32, 201, 151, 0.1)",red:"#e03131",redLight:"rgba(224, 49, 49, 0.1)"},F={responsive:!0,maintainAspectRatio:!1,plugins:{legend:{labels:{font:{family:"Inter",size:12,weight:"500"},padding:16,usePointStyle:!0,pointStyleWidth:10}},tooltip:{backgroundColor:"rgba(33, 37, 41, 0.95)",titleFont:{family:"Inter",size:13,weight:"600"},bodyFont:{family:"Inter",size:12},padding:12,cornerRadius:10,displayColors:!0}}};function ye(t,s,i,a){return new Chart(t,{type:"bar",data:{labels:s,datasets:[{label:"Ingresos",data:i,backgroundColor:B.accent,borderRadius:8,barPercentage:.6},{label:"Gastos",data:a,backgroundColor:B.red,borderRadius:8,barPercentage:.6}]},options:{...F,scales:{y:{beginAtZero:!0,grid:{color:"rgba(0,0,0,0.04)"},ticks:{font:{family:"Inter",size:11}}},x:{grid:{display:!1},ticks:{font:{family:"Inter",size:11}}}}}})}function we(t,s,i){const a=["#4c6ef5","#20c997","#f59f00","#e03131","#845ef7","#339af0"];return new Chart(t,{type:"doughnut",data:{labels:s,datasets:[{data:i,backgroundColor:a.slice(0,i.length),borderWidth:0,hoverOffset:8}]},options:{...F,cutout:"70%",plugins:{...F.plugins,legend:{...F.plugins.legend,position:"bottom"}}}})}function $e(t,s,i,a,e){return new Chart(t,{type:"line",data:{labels:s,datasets:[{label:"Ingresos Proyectados",data:i,borderColor:B.accent,backgroundColor:B.accentLight,fill:!0,tension:.4,pointRadius:4,pointHoverRadius:6,borderWidth:2.5},{label:"Gastos Proyectados",data:a,borderColor:B.red,backgroundColor:B.redLight,fill:!0,tension:.4,pointRadius:4,pointHoverRadius:6,borderWidth:2.5},{label:"Balance Neto",data:e,borderColor:B.primary,borderDash:[6,4],fill:!1,tension:.4,pointRadius:3,borderWidth:2}]},options:{...F,interaction:{mode:"index",intersect:!1},scales:{y:{grid:{color:"rgba(0,0,0,0.04)"},ticks:{font:{family:"Inter",size:11}}},x:{grid:{display:!1},ticks:{font:{family:"Inter",size:11}}}}}})}const _e={Disponible:"#20c997",Arrendada:"#4c6ef5","En Mantenimiento":"#f59f00",Vendida:"#868e96"};let k=null,D=null;function Ee(t,s=[4.711,-74.072],i=12){return k&&k.remove(),k=L.map(t).setView(s,i),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:19}).addTo(k),D=L.markerClusterGroup({maxClusterRadius:50,spiderfyOnMaxZoom:!0,showCoverageOnHover:!1}),k.addLayer(D),k}function Ce(t){if(D&&(D.clearLayers(),t.forEach(s=>{const i=_e[s.status]||"#868e96",a=L.circleMarker([s.latitude,s.longitude],{radius:10,fillColor:i,color:"#fff",weight:2,opacity:1,fillOpacity:.85}),e=`
      <div style="font-family:Inter,sans-serif; min-width:200px;">
        <h3 style="margin:0 0 4px; font-size:14px; font-weight:700; color:#212529;">${s.name}</h3>
        <p style="margin:0 0 2px; font-size:12px; color:#868e96;">${s.property_type} • ${s.city}</p>
        <div style="display:flex; align-items:center; gap:6px; margin-top:8px;">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${i};"></span>
          <span style="font-size:12px; font-weight:600; color:#495057;">${s.status}</span>
        </div>
        ${s.monthly_rent?`<p style="margin:6px 0 0; font-size:13px; font-weight:600; color:#20c997;">Canon: ${g(s.monthly_rent)}</p>`:""}
        <a href="#/properties/${s.id}" style="display:inline-block; margin-top:8px; font-size:12px; color:#4c6ef5; text-decoration:none; font-weight:600;">Ver ficha →</a>
      </div>
    `;a.bindPopup(e),D.addLayer(a)}),t.length>0)){const s=D.getBounds();s.isValid()&&k.fitBounds(s,{padding:[30,30]})}}function Ie(){k&&setTimeout(()=>k.invalidateSize(),100)}function Pe(t){return t==="high"?{bg:"bg-rose-50",border:"border-rose-200",text:"text-rose-700",dot:"bg-rose-500"}:t==="medium"?{bg:"bg-amber-50",border:"border-amber-200",text:"text-amber-700",dot:"bg-amber-500"}:{bg:"bg-blue-50",border:"border-blue-200",text:"text-blue-700",dot:"bg-blue-400"}}async function Te(t){const[s,i,a,e]=await Promise.all([p.get("/reports/summary"),p.get("/properties/map"),p.get("/reports/cashflow?months=12"),p.get("/reports/upcoming-events?days=30").catch(()=>({events:[]}))]),l=s,d=e.events||[];if(t.innerHTML=`
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
        <p class="text-3xl font-bold text-surface-900">${Y(l.occupancy_rate)}</p>
      </div>

      <div class="kpi-card kpi-green">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-surface-500">Ingresos</span>
          <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <i data-lucide="trending-up" class="w-5 h-5 text-green-600"></i>
          </div>
        </div>
        <p class="text-3xl font-bold text-surface-900">${te(l.total_income)}</p>
      </div>

      <div class="kpi-card kpi-red">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-surface-500">Gastos</span>
          <div class="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
            <i data-lucide="trending-down" class="w-5 h-5 text-rose-600"></i>
          </div>
        </div>
        <p class="text-3xl font-bold text-surface-900">${te(l.total_expenses)}</p>
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
          `:d.map(r=>{const n=Pe(r.severity);return`
            <div class="flex items-start gap-3 p-3 rounded-xl border ${n.bg} ${n.border}">
              <div class="mt-0.5 w-2 h-2 rounded-full ${n.dot} shrink-0 mt-1.5"></div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold ${n.text} truncate">${r.title}</p>
                <p class="text-[10px] text-surface-500 mt-0.5">${r.detail} · ${r.date}</p>
              </div>
              <i data-lucide="${r.icon}" class="w-4 h-4 ${n.text} shrink-0"></i>
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
          ${l.accounts.map(r=>`
            <div class="p-4 rounded-xl border border-surface-200 bg-surface-50/50 hover:border-primary-200 transition-colors">
              <p class="text-sm font-medium text-surface-600">${r.account_name}</p>
              <p class="text-sm text-surface-400 mb-2">${r.account_type} · ${r.currency}</p>
              <p class="text-xl font-bold ${r.current_balance>=0?"text-accent-600":"text-rose-600"}">${g(r.current_balance)}</p>
            </div>
          `).join("")}
        </div>
      `:`
        <p class="text-center text-surface-400 py-8">No hay cuentas registradas aún</p>
      `}
    </div>
  `,window.lucide&&lucide.createIcons(),setTimeout(()=>{Ee("dashboard-map"),Ce(i),Ie()},100),i.length>0){const r={};i.forEach(u=>{r[u.property_type]=(r[u.property_type]||0)+1});const n=Object.keys(r),c=Object.values(r);we(document.getElementById("type-chart"),n,c)}const o=a.months||[];if(o.length>0){const r=o.slice(-6);ye(document.getElementById("income-expense-chart"),r.map(n=>n.month),r.map(n=>n.income),r.map(n=>n.expenses)),$e(document.getElementById("cashflow-chart"),o.map(n=>n.month),o.map(n=>n.income),o.map(n=>n.expenses),o.map(n=>n.net))}}async function K(t){const i=(await p.get("/properties?limit=50")).items||[];t.innerHTML=`
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
          ${i.length>0?i.map(a=>`
            <tr>
              <td>
                <div class="font-semibold text-surface-900">${a.name}</div>
                <div class="text-xs text-surface-400 truncate max-w-[200px]">${a.address}</div>
              </td>
              <td><span class="badge badge-gray">${a.property_type}</span></td>
              <td class="text-surface-600">${a.city}</td>
              <td class="text-surface-600">${a.area_sqm}</td>
              <td class="font-medium">${g(a.commercial_value)}</td>
              <td><span class="badge ${q(a.status)}">${a.status}</span></td>
              <td class="text-surface-500 text-xs">${_(a.created_at)}</td>
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
  `,window.lucide&&lucide.createIcons(),document.getElementById("add-property-btn").addEventListener("click",()=>se()),document.getElementById("properties-table").addEventListener("click",async a=>{const e=a.target.closest(".view-property"),l=a.target.closest(".edit-property"),d=a.target.closest(".delete-property");if(e&&W(e.dataset.id),l){const o=l.dataset.id,r=await p.get(`/properties/${o}`);se(r)}if(d){const o=d.dataset.id;if(confirm("¿Está seguro de que desea eliminar esta propiedad? Esta acción la desactivará del sistema."))try{await p.delete(`/properties/${o}`),b("Propiedad eliminada correctamente","success");const r=document.getElementById("page-content");await K(r)}catch(r){b(r.message,"error")}}}),document.getElementById("filter-status").addEventListener("change",async a=>{const e=a.target.value,l=document.getElementById("filter-type").value;let d="/properties?limit=50";e&&(d+=`&status=${encodeURIComponent(e)}`),l&&(d+=`&property_type=${encodeURIComponent(l)}`);const o=await p.get(d);ae(o.items||[])}),document.getElementById("filter-type").addEventListener("change",async a=>{const e=a.target.value,l=document.getElementById("filter-status").value;let d="/properties?limit=50";l&&(d+=`&status=${encodeURIComponent(l)}`),e&&(d+=`&property_type=${encodeURIComponent(e)}`);const o=await p.get(d);ae(o.items||[])})}function ae(t){const s=document.querySelector("#properties-table tbody");s.innerHTML=t.map(i=>`
    <tr>
      <td>
        <div class="font-semibold text-surface-900">${i.name}</div>
        <div class="text-xs text-surface-400 truncate max-w-[200px]">${i.address}</div>
      </td>
      <td><span class="badge badge-gray">${i.property_type}</span></td>
      <td class="text-surface-600">${i.city}</td>
      <td class="text-surface-600">${i.area_sqm}</td>
      <td class="font-medium">${g(i.commercial_value)}</td>
      <td><span class="badge ${q(i.status)}">${i.status}</span></td>
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
  `).join(""),window.lucide&&lucide.createIcons()}function se(t=null){const s=!!t,i=s?"Editar Propiedad":"Nueva Propiedad",a=`
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
            <input class="input" name="administration_fee" type="number" value="${(t==null?void 0:t.administration_fee)||""}" placeholder="250000" />
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
  `;h(i,a,{confirmText:s?"Guardar Cambios":"Crear Propiedad",onConfirm:async()=>{const e=document.getElementById("property-form"),l=new FormData(e),d={};l.forEach((r,n)=>{r===""&&n!=="pays_administration"||(["latitude","longitude","area_sqm","commercial_value","administration_fee"].includes(n)?d[n]=parseFloat(r):["bedrooms","bathrooms","administration_day"].includes(n)?d[n]=parseInt(r):n==="pays_administration"?d[n]=document.getElementById("pays_administration").checked:d[n]=r)}),d.hasOwnProperty("pays_administration")||(d.pays_administration=document.getElementById("pays_administration").checked),s?(await p.put(`/properties/${t.id}`,d),b("Propiedad actualizada","success")):(await p.post("/properties",d),b("Propiedad creada","success"));const o=document.getElementById("page-content");await K(o)}})}async function W(t){const[s,i]=await Promise.all([p.get(`/properties/${t}`),p.get(`/occupants?property_id=${t}`)]),a=e=>e.length?`
      <div class="space-y-3 mt-4">
        ${e.map(l=>`
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
    `:'<p class="text-sm text-surface-400 py-4 text-center">No hay ocupantes registrados.</p>';h(`Detalle: ${s.name}`,`
    <div class="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
      <div class="grid grid-cols-2 gap-4">
        <div class="glass-card-static p-4">
          <h4 class="text-xs font-bold text-surface-400 uppercase mb-3 flex items-center gap-1"><i data-lucide="info" class="w-3 h-3"></i> Información Básica</h4>
          <p class="text-sm"><strong>Dirección:</strong> ${s.address}</p>
          <p class="text-sm"><strong>Tipo:</strong> ${s.property_type}</p>
          <p class="text-sm"><strong>Área:</strong> ${s.area_sqm} m²</p>
          <p class="text-sm"><strong>Estado:</strong> <span class="badge ${q(s.status)}">${s.status}</span></p>
          <hr class="my-3 border-surface-100" />
          <h5 class="text-xs font-bold text-surface-400 uppercase mb-2">Administración</h5>
          <p class="text-sm"><strong>Paga:</strong> ${s.pays_administration?"Sí":"No"}</p>
          ${s.pays_administration?`
            <p class="text-sm"><strong>Valor:</strong> ${g(s.administration_fee)}</p>
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
            ${a(i)}
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
    `,{confirmText:"Agregar",onConfirm:async()=>{const e=new FormData(document.getElementById("occupant-form")),l={property_id:t,full_name:e.get("full_name"),dni:e.get("dni")||null,phone:e.get("phone")||null,email:e.get("email")||null,is_primary:document.getElementById("is_primary").checked};await p.post("/occupants",l),b("Ocupante agregado","success"),W(t)}})}),document.querySelectorAll(".delete-occupant-btn").forEach(e=>{e.addEventListener("click",async()=>{confirm("¿Eliminar este ocupante?")&&(await p.delete(`/occupants/${e.dataset.id}`),b("Ocupante eliminado","success"),W(t))})})}const ce=["Gastos Generales","Gastos Administrativos","Mantenimiento General","Pago de Empleados","Nómina y Personal","Suministros de Oficina","Marketing y Publicidad","Servicios Públicos","Seguros","Impuestos y Tasas","Honorarios Gestión","Otros"],ue=["Ingresos por Arriendo","Gastos Mantenimiento","Impuestos y Tasas","Cuotas de Administración","Servicios Públicos","Honorarios Gestión","Seguros","Pago Hipoteca","Otros"];async function j(t){var x,y,w,E,I,O,X,Q,ee;const[s,i,a]=await Promise.all([p.get("/accounts"),p.get("/transactions?limit=30"),p.get("/properties?limit=100")]),e=s||[],l=i.items||[],d=a.items||[];let o=1,r=!1,n=l.length>=30;t.innerHTML=`
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
                ${g(m.current_balance)}
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
                  <td class="text-xs text-surface-500">${_(m.transaction_date)}</td>
                  <td><div class="font-medium text-surface-900 text-sm">${m.description}</div></td>
                  <td><span class="badge badge-gray text-xs">${m.category}</span></td>
                  <td class="text-xs text-surface-500">
                    ${m.property_id?'<span class="badge badge-blue text-xs">Propiedad</span>':'<span class="badge badge-amber text-xs">General</span>'}
                  </td>
                  <td class="text-xs text-surface-500">${m.transaction_type}</td>
                  <td class="font-semibold ${m.direction==="Debit"?"text-accent-600":"text-rose-600"}">
                    ${m.direction==="Debit"?"+":"-"}${g(m.amount)}
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
  `,window.lucide&&lucide.createIcons(),(x=document.getElementById("add-account-btn"))==null||x.addEventListener("click",()=>ke()),(y=document.getElementById("add-transaction-btn"))==null||y.addEventListener("click",()=>ie(e,d,!1)),(w=document.getElementById("add-general-expense-btn"))==null||w.addEventListener("click",()=>ie(e,d,!0)),(E=document.getElementById("add-transfer-btn"))==null||E.addEventListener("click",()=>Ae(e)),(I=document.getElementById("import-csv-btn"))==null||I.addEventListener("click",()=>{var m;return(m=document.getElementById("import-csv-input"))==null?void 0:m.click()}),(O=document.getElementById("import-csv-input"))==null||O.addEventListener("change",async m=>{const C=m.target.files[0];C&&(await De(C),m.target.value="")}),(X=document.getElementById("export-csv-btn"))==null||X.addEventListener("click",()=>{window.location.href=`${p.baseUrl}/reports/export`}),document.querySelectorAll(".account-card").forEach(m=>{m.addEventListener("click",C=>{C.target.closest(".edit-account-btn")||C.target.closest(".delete-account-btn")||(window.location.hash=`#/account-detail?id=${m.dataset.accountId}`)})}),document.querySelectorAll(".edit-account-btn").forEach(m=>{m.addEventListener("click",C=>{C.stopPropagation(),Le(m.dataset.id,m.dataset.name,m.dataset.bank,m.dataset.number)})}),document.querySelectorAll(".delete-account-btn").forEach(m=>{m.addEventListener("click",C=>{C.stopPropagation(),je(m.dataset.id,m.dataset.name,parseFloat(m.dataset.balance))})}),document.querySelectorAll(".edit-tx-btn").forEach(m=>{m.addEventListener("click",()=>{ne(m.dataset.id,m.dataset.desc,m.dataset.cat,m.dataset.amount,m.dataset.type,m.dataset.date)})}),document.querySelectorAll(".delete-tx-btn").forEach(m=>{m.addEventListener("click",()=>oe(m.dataset.id,m.dataset.desc))}),(Q=document.getElementById("performance-property-select"))==null||Q.addEventListener("change",m=>Be(m.target.value)),(ee=document.getElementById("generate-pdf-btn"))==null||ee.addEventListener("click",()=>Me(e,l)),document.querySelectorAll(".tab-btn").forEach(m=>{m.addEventListener("click",()=>{document.querySelectorAll(".tab-btn").forEach(A=>A.classList.remove("active")),document.querySelectorAll(".tab-content").forEach(A=>A.classList.add("hidden")),m.classList.add("active");const C=m.dataset.tab;document.getElementById(`${C}-tab`).classList.remove("hidden"),C==="analysis"&&Se()})});const c=document.getElementById("infinite-scroll-sentinel"),u=document.getElementById("loading-spinner"),v=document.querySelector("#operations-tab tbody"),f=new IntersectionObserver(async m=>{if(m[0].isIntersecting&&n&&!r){r=!0,u.classList.remove("hidden"),o++;try{const A=(await p.get(`/transactions?limit=30&page=${o}`)).items||[];A.length===0?n=!1:(A.forEach($=>{const S=document.createElement("tr");S.innerHTML=`
              <td class="text-xs text-surface-500">${_($.transaction_date)}</td>
              <td><div class="font-medium text-surface-900 text-sm">${$.description}</div></td>
              <td><span class="badge badge-gray text-xs">${$.category}</span></td>
              <td class="text-xs text-surface-500">
                ${$.property_id?'<span class="badge badge-blue text-xs">Propiedad</span>':'<span class="badge badge-amber text-xs">General</span>'}
              </td>
              <td class="text-xs text-surface-500">${$.transaction_type}</td>
              <td class="font-semibold ${$.direction==="Debit"?"text-accent-600":"text-rose-600"}">
                ${$.direction==="Debit"?"+":"-"}${g($.amount)}
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
            `,v.appendChild(S),S.querySelector(".edit-tx-btn").addEventListener("click",()=>{const T=S.querySelector(".edit-tx-btn");ne(T.dataset.id,T.dataset.desc,T.dataset.cat,T.dataset.amount,T.dataset.type,T.dataset.date)}),S.querySelector(".delete-tx-btn").addEventListener("click",()=>{const T=S.querySelector(".delete-tx-btn");oe(T.dataset.id,T.dataset.desc)})}),window.lucide&&lucide.createIcons(),A.length<30&&(n=!1))}catch(C){console.error("Error loading more transactions:",C)}finally{r=!1,u.classList.add("hidden")}}},{threshold:.1});c&&f.observe(c)}function ke(){h("Nueva Cuenta Bancaria",`
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
  `,{confirmText:"Crear Cuenta",onConfirm:async()=>{const t=new FormData(document.getElementById("account-form")),s={};t.forEach((i,a)=>{a==="initial_balance"?s[a]=parseFloat(i)||0:i&&(s[a]=i)}),await p.post("/accounts",s),b("Cuenta creada","success"),await j(document.getElementById("page-content"))}})}function Le(t,s,i,a){h("Editar Cuenta",`
    <form id="edit-account-form" class="space-y-4">
      <div><label class="label">Nombre *</label><input class="input" name="account_name" value="${s}" required /></div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Banco</label><input class="input" name="bank_name" value="${i}" /></div>
        <div><label class="label">Número de Cuenta</label><input class="input" name="account_number" value="${a}" /></div>
      </div>
    </form>
  `,{confirmText:"Guardar Cambios",onConfirm:async()=>{const e=new FormData(document.getElementById("edit-account-form")),l={};e.forEach((d,o)=>{d&&(l[o]=d)}),await p.put(`/accounts/${t}`,l),b("Cuenta actualizada","success"),await j(document.getElementById("page-content"))}})}function je(t,s,i){if(i!==0){b(`No se puede eliminar "${s}": tiene saldo de ${g(i)}. Transfiera los fondos primero.`,"error");return}h("Eliminar Cuenta",`
    <div class="text-center py-4">
      <div class="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i data-lucide="alert-triangle" class="w-8 h-8 text-rose-500"></i>
      </div>
      <p class="text-surface-700 font-medium mb-2">¿Eliminar la cuenta "${s}"?</p>
      <p class="text-sm text-surface-400">Esta acción desactivará la cuenta. No será visible pero sus transacciones históricas se conservan.</p>
    </div>
  `,{confirmText:"Eliminar",onConfirm:async()=>{await p.delete(`/accounts/${t}`),b("Cuenta eliminada","success"),await j(document.getElementById("page-content"))}}),window.lucide&&lucide.createIcons()}function ie(t,s=[],i=!1){const a=i?"Registrar Gasto General":"Registrar Transacción",e=i?ce:ue;h(a,`
    <form id="tx-form" class="space-y-4">
      ${i?'<div class="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-2"><div class="flex items-center gap-2 text-amber-700 text-sm font-medium"><i data-lucide="info" class="w-4 h-4"></i> Este gasto no está asociado a ninguna propiedad</div></div>':""}
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Cuenta *</label><select class="select" name="account_id" required>${t.map(c=>`<option value="${c.id}">${c.account_name}</option>`).join("")}</select></div>
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
  `,{confirmText:"Registrar",onConfirm:async()=>{const c=new FormData(document.getElementById("tx-form")),u={},v=c.get("category"),[f,x]=v.includes("|")?v.split("|"):[null,v];c.forEach((y,w)=>{w==="amount"?u[w]=parseFloat(y):w==="category"?u[w]=x:y&&(u[w]=y)}),u.budget_category_id=f||null,i&&delete u.property_id,u.transaction_type==="Ingreso"?u.direction="Debit":u.transaction_type==="Gasto"&&(u.direction="Credit"),await p.post("/transactions",u),b(i?"Gasto registrado":"Transacción registrada","success"),await j(document.getElementById("page-content"))}}),window.lucide&&lucide.createIcons();const l=document.getElementById("tx-form"),d=l.querySelector('[name="property_id"]'),o=l.querySelector('[name="transaction_date"]'),r=l.querySelector('[name="category"]'),n=async()=>{const c=i?"GENERAL":d.value,u=o.value;if(!c||!u)return;const[v,f]=u.split("-").map(Number);try{let x=c;if(c==="GENERAL"){const E=(await p.get("/properties?limit=100")).items.find(I=>I.name==="Gastos Generales");E&&(x=E.id)}const y=await p.get(`/budgets?property_id=${x}&year=${v}&month=${f}`);if(y&&y.length>0){let E=y[0].categories.map(I=>`<option value="${I.id}|${I.category_name}">${I.category_name} (Presupuestado)</option>`).join("");E+="<option disabled>──────────</option>",E+=e.map(I=>`<option value="|${I}">${I}</option>`).join(""),r.innerHTML=E}else r.innerHTML=e.map(w=>`<option value="|${w}">${w}</option>`).join("")}catch(x){console.warn("Could not fetch budget categories:",x),r.innerHTML=e.map(y=>`<option value="|${y}">${y}</option>`).join("")}};d&&d.addEventListener("change",n),o.addEventListener("change",n),l.querySelector('[name="transaction_type"]').addEventListener("change",n),(i||d&&d.value)&&n()}function ne(t,s,i,a,e,l){const d=[...new Set([...ce,...ue])];h("Editar Transacción",`
    <form id="edit-tx-form" class="space-y-4">
      <div><label class="label">Descripción</label><input class="input" name="description" value="${s}" /></div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Categoría</label><select class="select" name="category">${d.map(o=>`<option value="${o}" ${o===i?"selected":""}>${o}</option>`).join("")}</select></div>
        <div><label class="label">Tipo</label><select class="select" name="transaction_type">
          ${["Ingreso","Gasto","Transferencia","Ajuste","Interés","Abono","Crédito"].map(o=>`<option value="${o}" ${o===e?"selected":""}>${o}</option>`).join("")}
        </select></div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="label">Monto</label><input class="input" name="amount" type="number" step="0.01" value="${a}" /></div>
        <div><label class="label">Fecha</label><input class="input" name="transaction_date" type="date" value="${l}" /></div>
      </div>
    </form>
  `,{confirmText:"Guardar",onConfirm:async()=>{const o=new FormData(document.getElementById("edit-tx-form")),r={};o.forEach((n,c)=>{c==="amount"?r[c]=parseFloat(n):n&&(r[c]=n)}),await p.put(`/transactions/${t}`,r),b("Transacción actualizada","success"),await j(document.getElementById("page-content"))}})}function oe(t,s){h("Eliminar Transacción",`
    <div class="text-center py-4">
      <div class="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i data-lucide="alert-triangle" class="w-8 h-8 text-rose-500"></i>
      </div>
      <p class="text-surface-700 font-medium mb-2">¿Eliminar esta transacción?</p>
      <p class="text-sm text-surface-400 italic mb-2">"${s}"</p>
      <p class="text-xs text-rose-500">El saldo de la cuenta será ajustado automáticamente.</p>
    </div>
  `,{confirmText:"Eliminar",onConfirm:async()=>{await p.delete(`/transactions/${t}`),b("Transacción eliminada","success"),await j(document.getElementById("page-content"))}}),window.lucide&&lucide.createIcons()}function Ae(t){h("Transferencia entre Cuentas",`
    <form id="transfer-form" class="space-y-4">
      <div><label class="label">Cuenta Origen *</label><select class="select" name="source_account_id" required>${t.map(s=>`<option value="${s.id}">${s.account_name} (${g(s.current_balance)})</option>`).join("")}</select></div>
      <div><label class="label">Cuenta Destino *</label><select class="select" name="destination_account_id" required>${t.map(s=>`<option value="${s.id}">${s.account_name}</option>`).join("")}</select></div>
      <div><label class="label">Monto *</label><input class="input" name="amount" type="number" step="0.01" required placeholder="500000" /></div>
      <div><label class="label">Descripción *</label><input class="input" name="description" required placeholder="Traslado de fondos" /></div>
      <div><label class="label">Fecha *</label><input class="input" name="transaction_date" type="date" required value="${new Date().toISOString().split("T")[0]}" /></div>
    </form>
  `,{confirmText:"Transferir",onConfirm:async()=>{const s=new FormData(document.getElementById("transfer-form")),i={};if(s.forEach((a,e)=>{e==="amount"?i[e]=parseFloat(a):i[e]=a}),i.source_account_id===i.destination_account_id){b("Las cuentas deben ser diferentes","error");return}await p.post("/accounts/transfer",i),b("Transferencia completada","success"),await j(document.getElementById("page-content"))}})}async function Be(t){if(!t)return;const s=document.getElementById("performance-content");s.innerHTML='<div class="flex items-center justify-center py-12"><div class="animate-spin rounded-full h-8 w-8 border-2 border-accent-500 border-t-transparent"></div><p class="ml-3 text-surface-500">Calculando métricas...</p></div>';const i=await p.get(`/properties/${t}/performance`);if(!i)return;const a=i.total_income>0||i.total_expenses>0;s.innerHTML=`
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
          <p class="text-2xl font-bold text-accent-600">${g(i.total_income)}</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm">
          <p class="text-xs font-bold text-surface-400 uppercase mb-2">Gastos</p>
          <p class="text-2xl font-bold text-rose-600">${g(i.total_expenses)}</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm">
          <p class="text-xs font-bold text-surface-400 uppercase mb-2">Utilidad</p>
          <p class="text-2xl font-bold ${i.net_profit>=0?"text-primary-600":"text-rose-600"}">${g(i.net_profit)}</p>
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
          ${a?`
            ${Object.entries(i.income_by_category||{}).map(([d,o])=>`<div class="flex justify-between text-sm mb-1"><span>${d}</span><span class="text-accent-600">+${g(o)}</span></div>`).join("")}
            <div class="border-t border-surface-100 my-3"></div>
            ${Object.entries(i.expense_by_category||{}).map(([d,o])=>`<div class="flex justify-between text-sm mb-1"><span>${d}</span><span class="text-rose-600">-${g(o)}</span></div>`).join("")}
          `:'<p class="text-surface-400 text-center py-4">Sin datos</p>'}
        </div>
        <div class="bg-white p-6 rounded-2xl border border-surface-100">
          <h4 class="text-sm font-bold text-surface-900 mb-4">Últimos Movimientos</h4>
          <div class="overflow-x-auto"><table class="data-table text-xs"><thead><tr><th>Fecha</th><th>Descripción</th><th>Monto</th></tr></thead><tbody>
            ${(i.last_transactions||[]).length>0?i.last_transactions.map(d=>`<tr><td class="text-surface-500">${_(d.transaction_date)}</td><td class="font-medium">${d.description}</td><td class="font-bold ${d.direction==="Debit"?"text-accent-600":"text-rose-600"}">${d.direction==="Debit"?"+":"-"}${g(d.amount)}</td></tr>`).join(""):'<tr><td colspan="3" class="text-center py-4 text-surface-400">Sin movimientos</td></tr>'}
          </tbody></table></div>
        </div>
      </div>
    </div>
  `,window.lucide&&lucide.createIcons();const e=document.getElementById("property-mini-chart");e&&a&&new Chart(e,{type:"doughnut",data:{labels:["Ingresos","Gastos"],datasets:[{data:[i.total_income,i.total_expenses],backgroundColor:["#20c997","#f03e3e"],borderWidth:0,cutout:"75%"}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}}}});const l=document.getElementById("property-cashflow-chart");if(l&&i.monthly_cashflow){const d=i.monthly_cashflow;new Chart(l,{type:"bar",data:{labels:d.map(o=>o.month),datasets:[{label:"Ingresos",data:d.map(o=>o.income),backgroundColor:"rgba(32,201,151,0.7)",borderRadius:6,barPercentage:.6},{label:"Gastos",data:d.map(o=>o.expenses),backgroundColor:"rgba(240,62,62,0.7)",borderRadius:6,barPercentage:.6}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"top",labels:{usePointStyle:!0,font:{size:10}}}},scales:{y:{beginAtZero:!0,ticks:{font:{size:10},callback:o=>"$"+(o>=1e6?(o/1e6).toFixed(1)+"M":o>=1e3?(o/1e3).toFixed(0)+"K":o)},grid:{color:"rgba(0,0,0,0.04)"}},x:{ticks:{font:{size:9}},grid:{display:!1}}}}})}}async function Se(){const[t,s]=await Promise.all([p.get("/reports/balance-sheet"),p.get(`/reports/income-statement?start_date=${new Date().getFullYear()}-01-01&end_date=${new Date().toISOString().split("T")[0]}`)]);t&&(document.getElementById("balance-sheet-container").innerHTML=`
      <h3 class="font-bold mb-4 flex items-center justify-between">Balance General <span class="text-xs font-normal text-surface-400">${_(t.date)}</span></h3>
      <div class="space-y-3">
        ${t.accounts.map(i=>`<div class="flex justify-between text-sm py-2 border-b border-surface-50"><span class="text-surface-600">${i.account_name}</span><span class="font-semibold">${g(i.current_balance)}</span></div>`).join("")}
        <div class="flex justify-between text-lg font-bold pt-4 text-primary-600"><span>Total Activos</span><span>${g(t.total_assets)}</span></div>
      </div>
    `),s&&(document.getElementById("income-statement-container").innerHTML=`
      <h3 class="font-bold mb-4">Estado de Resultados (Año Actual)</h3>
      <div class="space-y-4">
        <div><p class="text-xs font-bold text-surface-400 uppercase mb-2">Ingresos</p>${Object.entries(s.income).map(([i,a])=>`<div class="flex justify-between text-sm mb-1"><span>${i}</span><span class="text-accent-600">+${g(a)}</span></div>`).join("")}</div>
        <div><p class="text-xs font-bold text-surface-400 uppercase mb-2">Egresos</p>${Object.entries(s.expenses).map(([i,a])=>`<div class="flex justify-between text-sm mb-1"><span>${i}</span><span class="text-rose-600">-${g(a)}</span></div>`).join("")}</div>
        <div class="border-t border-surface-100 pt-3"><div class="flex justify-between text-lg font-bold ${s.net_income>=0?"text-accent-600":"text-rose-600"}"><span>Utilidad Neta</span><span>${g(s.net_income)}</span></div></div>
      </div>
    `)}async function Me(t,s){const{jsPDF:i}=window.jspdf,a=new i;a.setFillColor(66,99,235),a.rect(0,0,210,35,"F"),a.setTextColor(255),a.setFontSize(20),a.text("PMS — Informe Financiero",14,20),a.setFontSize(10),a.text(`Generado: ${new Date().toLocaleDateString("es-CO")}`,14,28),a.setTextColor(0),a.setFontSize(14),a.text("Cuentas Bancarias",14,45),a.autoTable({startY:50,head:[["Cuenta","Tipo","Banco","Moneda","Saldo"]],body:t.map(n=>[n.account_name,n.account_type,n.bank_name||"-",n.currency,g(n.current_balance)]),theme:"striped",headStyles:{fillColor:[66,99,235]},styles:{fontSize:9}});const e=a.lastAutoTable.finalY+15;a.setFontSize(14),a.text("Últimas Transacciones",14,e),a.autoTable({startY:e+5,head:[["Fecha","Descripción","Categoría","Tipo","Monto"]],body:s.map(n=>[n.transaction_date,n.description.substring(0,40),n.category,n.transaction_type,`${n.direction==="Debit"?"+":"-"}${g(n.amount)}`]),theme:"striped",headStyles:{fillColor:[66,99,235]},styles:{fontSize:8}});const l=s.filter(n=>n.direction==="Debit").reduce((n,c)=>n+c.amount,0),d=s.filter(n=>n.direction==="Credit").reduce((n,c)=>n+c.amount,0),o=a.lastAutoTable.finalY+15;a.setFontSize(12),a.setTextColor(32,201,151),a.text(`Total Ingresos: ${g(l)}`,14,o),a.setTextColor(240,62,62),a.text(`Total Gastos: ${g(d)}`,14,o+8),a.setTextColor(66,99,235),a.text(`Resultado Neto: ${g(l-d)}`,14,o+16);const r=a.internal.getNumberOfPages();for(let n=1;n<=r;n++)a.setPage(n),a.setFontSize(8),a.setTextColor(150),a.text(`PMS — Property Management System | Página ${n} de ${r}`,105,290,{align:"center"});a.save(`informe_financiero_${new Date().toISOString().split("T")[0]}.pdf`),b("PDF generado y descargado","success")}async function De(t){h("Analizando CSV...",`
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
      <p class="ml-3 text-surface-500">Analizando archivo...</p>
    </div>
  `,{showCancel:!1});let s;try{const n=new FormData;n.append("file",t),s=await p.upload("/transactions/import/analyze",n)}catch(n){b(`Error al analizar: ${n.message}`,"error");return}const{total_rows:i,transfers_skipped:a,new_accounts:e,existing_accounts:l,detected_labels:d,category_mapping:o}=s,r=d.length>0?d.map(n=>`
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
        <div class="bg-amber-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-amber-600">${a}</p><p class="text-xs text-amber-400">Omitidas</p></div>
        <div class="bg-purple-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-purple-600">${d.length}</p><p class="text-xs text-purple-400">Labels</p></div>
      </div>
      ${e.length>0?`<div class="bg-blue-50 border border-blue-200 rounded-xl p-4"><p class="text-sm font-bold text-blue-700 mb-2">Cuentas nuevas (${e.length})</p>${e.map(n=>`<div class="flex justify-between text-sm"><span class="text-blue-600">${n.name}</span><span class="text-blue-400">${n.transaction_count} tx</span></div>`).join("")}</div>`:""}
      ${l.length>0?`<div class="bg-green-50 border border-green-200 rounded-xl p-4"><p class="text-sm font-bold text-green-700 mb-2">Cuentas existentes (${l.length})</p>${l.map(n=>`<div class="flex justify-between text-sm"><span class="text-green-600">${n.name}</span><span class="text-green-400">${n.transaction_count} tx</span></div>`).join("")}</div>`:""}
      ${Object.keys(o).length>0?`<details class="bg-surface-50 border border-surface-200 rounded-xl p-4"><summary class="text-sm font-bold text-surface-700 cursor-pointer">Mapeo categorías (${Object.keys(o).length})</summary><div class="mt-3 space-y-1 max-h-40 overflow-y-auto">${Object.entries(o).map(([n,c])=>`<div class="flex justify-between text-xs py-1 border-b border-surface-100"><span>${n}</span><span class="text-indigo-600">→ ${c}</span></div>`).join("")}</div></details>`:""}
      <div>
        <p class="text-sm font-bold text-surface-700 mb-3">¿Cuáles labels son apartamentos?</p>
        <p class="text-xs text-surface-400 mb-3">Los seleccionados se crean como propiedades.</p>
        <div class="space-y-2 max-h-60 overflow-y-auto">${r}</div>
      </div>
    </div>
  `,{confirmText:"Importar Transacciones",onConfirm:async()=>{const n=document.querySelectorAll(".import-label-check:checked"),c=Array.from(n).map(f=>f.value),u=new FormData;u.append("file",t);const v=encodeURIComponent(c.join(","));try{const f=await p.upload(`/transactions/import/confirm?confirmed_labels=${v}`,u);let x=`✅ ${f.imported} transacciones importadas.`;f.accounts_created.length>0&&(x+=` 📁 Cuentas: ${f.accounts_created.join(", ")}`),f.properties_created.length>0&&(x+=` 🏠 Propiedades: ${f.properties_created.join(", ")}`),f.errors.length>0&&(x+=` ⚠️ ${f.errors.length} errores`),b(x,"success"),await j(document.getElementById("page-content"))}catch(f){b(`Error al importar: ${f.message}`,"error")}}}),window.lucide&&lucide.createIcons()}async function H(t,s){const a=(await p.get("/maintenance?limit=50")).items||[];t.innerHTML=`
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
        <p class="text-2xl font-bold text-amber-500">${a.filter(e=>e.status==="Pendiente").length}</p>
        <p class="text-xs text-surface-500 mt-1">Pendientes</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-primary-500">${a.filter(e=>e.status==="En Progreso").length}</p>
        <p class="text-xs text-surface-500 mt-1">En Progreso</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-accent-500">${a.filter(e=>e.status==="Completado").length}</p>
        <p class="text-xs text-surface-500 mt-1">Completados</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-rose-500">${g(a.reduce((e,l)=>e+(l.actual_cost||0),0))}</p>
        <p class="text-xs text-surface-500 mt-1">Costo Total</p>
      </div>
    </div>
    <div class="glass-card-static overflow-hidden animate-fade-in mb-8">
      <table class="data-table"><thead><tr>
        <th></th><th>Título</th><th>Tipo</th><th>Prioridad</th><th>Estado</th><th>Costo Est.</th><th>Fecha</th><th></th>
      </tr></thead><tbody>
      ${a.length?a.map(e=>`<tr>
        <td class="w-12">
            ${e.photos&&e.photos.length>0?`<div class="relative group cursor-pointer" onclick="viewPhotos('${e.id}')">
                    <img src="${p.baseUrl.replace("/api/v1","")}/${e.photos[0].photo_path}" class="w-10 h-10 rounded object-cover border border-surface-200" />
                    <span class="absolute -top-2 -right-2 bg-primary-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">${e.photos.length}</span>
                </div>`:'<div class="w-10 h-10 rounded bg-surface-100 flex items-center justify-center text-surface-400"><i data-lucide="image" class="w-5 h-5"></i></div>'}
        </td>
        <td><div class="font-semibold text-sm">${e.title}</div>${e.supplier_name?`<div class="text-xs text-surface-400">${e.supplier_name}</div>`:""}</td>
        <td><span class="badge badge-gray text-xs">${e.maintenance_type}</span></td>
        <td><span class="badge ${e.priority==="Urgente"?"badge-red":e.priority==="Alta"?"badge-amber":"badge-gray"} text-xs">${e.priority}</span></td>
        <td><span class="badge ${q(e.status)} text-xs">${e.status}</span></td>
        <td class="text-sm">${g(e.estimated_cost)}</td>
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
    `,window.lucide&&lucide.createIcons(),document.getElementById("add-maint-btn").addEventListener("click",async()=>await Fe()),document.querySelectorAll(".status-btn").forEach(e=>e.addEventListener("click",()=>Oe(e.dataset.id))),document.querySelectorAll(".edit-btn").forEach(e=>e.addEventListener("click",()=>qe(e.dataset.id)))}window.viewPhotos=async t=>{const s=await p.get(`/maintenance/${t}`);if(!s.photos||s.photos.length===0)return;const i=p.baseUrl.replace("/api/v1","");h("Evidencia Fotográfica",`
      <div class="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
        ${s.photos.map(a=>`
          <div class="space-y-2">
            <img src="${i}/${a.photo_path}" class="w-full rounded-lg border border-surface-200 cursor-zoom-in" onclick="window.open('${i}/${a.photo_path}', '_blank')" />
            <p class="text-[10px] text-surface-400 text-center">${_(a.uploaded_at)}</p>
          </div>
        `).join("")}
      </div>
    `,{confirmText:"Cerrar"})};async function Fe(){let t='<option value="">Cargando propiedades...</option>';try{const s=await p.get("/properties?limit=100");s.items&&s.items.length>0?t=s.items.map(i=>`<option value="${i.id}">${i.name} (ID: ${i.id.split("-")[0]})</option>`).join(""):t='<option value="">No hay propiedades disponibles</option>'}catch{t='<option value="">Error al cargar propiedades</option>'}h("Nueva Orden",`<form id="mf" class="space-y-4">
    <div><label class="label">Propiedad *</label><select class="select" name="property_id" required>${t}</select></div>
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
  </form>`,{confirmText:"Crear",onConfirm:async()=>{const s=new FormData(document.getElementById("mf")),i={};s.forEach((a,e)=>{a&&(i[e]=e==="estimated_cost"?parseFloat(a):a)}),await p.post("/maintenance",i),b("Orden creada","success"),await H(document.getElementById("page-content"),state)}})}async function qe(t){const s=await p.get(`/maintenance/${t}`);h("Editar Orden",`<form id="ef" class="space-y-4">
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
  </form>`,{confirmText:"Guardar Cambios",onConfirm:async()=>{const i=new FormData(document.getElementById("ef")),a={};i.forEach((e,l)=>{l==="estimated_cost"||l==="actual_cost"?a[l]=e?parseFloat(e):null:e&&(a[l]=e)}),await p.put(`/maintenance/${t}`,a),b("Orden actualizada correctamente","success"),await H(document.getElementById("page-content"),state)}})}function Oe(t){h("Cambiar Estado",`<form id="sf" class="space-y-4">
    <div><label class="label">Estado *</label><select class="select" name="status">
      <option value="Pendiente">Pendiente</option><option value="En Progreso">En Progreso</option>
      <option value="Esperando Factura">Esperando Factura</option><option value="Completado">Completado</option>
      <option value="Cancelado">Cancelado</option></select></div>
    <div><label class="label">Notas</label><textarea class="input" name="notes" rows="2"></textarea></div>
  </form>`,{confirmText:"Actualizar",onConfirm:async()=>{const s=new FormData(document.getElementById("sf")),i={status:s.get("status")};s.get("notes")&&(i.notes=s.get("notes")),await p.put(`/maintenance/${t}/status`,i),b("Estado actualizado","success"),await H(document.getElementById("page-content"),state)}})}async function N(t){const[s,i]=await Promise.all([p.get("/contracts?limit=50"),p.get("/properties?limit=100")]),a=s.items||[],e=i.items||[];t.innerHTML=`
    <div class="space-y-6 animate-fade-in">
        <div class="flex border-b border-surface-200 mb-4">
            <button class="tab-btn active px-4 py-2 text-primary-600 border-b-2 border-primary-600 font-medium" data-tab="list">Contratos</button>
            <button class="tab-btn px-4 py-2 text-surface-500 hover:text-surface-700 font-medium" data-tab="tenants">Inquilinos</button>
        </div>
        <div id="contracts-tab-content"><!-- Content --></div>
    </div>
  `;const l=t.querySelector("#contracts-tab-content"),d=t.querySelectorAll(".tab-btn");d.forEach(o=>{o.addEventListener("click",()=>{d.forEach(r=>{r.classList.remove("active","text-primary-600","border-primary-600","border-b-2"),r.classList.add("text-surface-500")}),o.classList.remove("text-surface-500"),o.classList.add("active","text-primary-600","border-primary-600","border-b-2"),o.dataset.tab==="list"?re(l,a,e,t):Ne(l,a)})}),re(l,a,e,t)}function re(t,s,i,a){t.innerHTML=`
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
          <div class="font-black text-accent-700 mt-0.5">${g(e.monthly_rent)}</div>
        </td>
        <td class="text-xs text-surface-500 font-medium whitespace-nowrap">
          ${_(e.start_date)} <span class="text-surface-300">→</span> ${_(e.end_date)}
        </td>
        <td><span class="badge ${q(e.status)} text-[10px] font-bold">${e.status}</span></td>
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
    </div>`,window.lucide&&lucide.createIcons(),document.getElementById("add-contract-btn").addEventListener("click",()=>Re(i,a)),document.querySelectorAll(".activate-btn").forEach(e=>e.addEventListener("click",async()=>{try{await p.post(`/contracts/${e.dataset.id}/activate`,{}),b("Contrato activado y cronograma de pagos generado","success"),await N(a||document.getElementById("page-content"))}catch(l){b(l.message||"Error al activar contrato","error")}})),document.querySelectorAll(".download-btn").forEach(e=>e.addEventListener("click",async()=>{var l,d;try{b("Generando PDF...","info");const o=((d=(l=p.opts)==null?void 0:l.baseUrl)==null?void 0:d.replace("/api/v1",""))||"",r=localStorage.getItem("access_token")||"",n=`${o}/api/v1/contracts/${e.dataset.id}/download`,c=await fetch(n,{headers:{Authorization:`Bearer ${r}`}});if(!c.ok)throw new Error("Error generando PDF");const u=await c.blob(),v=document.createElement("a");v.href=URL.createObjectURL(u),v.download=`contrato_${e.dataset.id.slice(0,8)}.pdf`,v.click(),URL.revokeObjectURL(v.href)}catch(o){b(o.message||"No se pudo descargar el PDF","error")}})),document.querySelectorAll(".pdf-btn").forEach(e=>e.addEventListener("click",()=>{const l=new Date().toISOString().split("T")[0];h("Generar Carta de Terminación",`
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
      `,{confirmText:"Generar PDF",onConfirm:async()=>{var n,c;const d=new FormData(document.getElementById("pdf-form")),o=Object.fromEntries(d),r=await p.post(`/contracts/${e.dataset.id}/termination-letter`,o);if(b("PDF Generado","success"),r.pdf_url){const u=((c=(n=p.opts)==null?void 0:n.baseUrl)==null?void 0:c.replace("/api/v1",""))||"";window.open(u+r.pdf_url,"_blank")}}})})),document.querySelectorAll(".payments-btn").forEach(e=>e.addEventListener("click",async()=>{var c;const[l,d]=await Promise.all([p.get(`/contracts/${e.dataset.id}/payments`),p.get("/accounts")]),o=d.items||d||[],r=u=>u==="Pagado"?"badge-green":u==="Vencido"?"badge-red":"badge-yellow";let n=null;h("Cronograma de Pagos",`
      <div class="space-y-4">
        <div class="max-h-80 overflow-y-auto border border-surface-100 rounded-xl">
          <table class="data-table text-xs">
            <thead class="sticky top-0 bg-white z-10 shadow-sm">
              <tr><th>Fecha</th><th>Monto</th><th>Estado</th><th class="text-right">Acción</th></tr>
            </thead>
            <tbody>
              ${l.map(u=>`
                <tr class="hover:bg-surface-50">
                  <td class="font-medium">${_(u.due_date)}</td>
                  <td class="font-black text-accent-700">${g(u.amount)}</td>
                  <td><span class="badge ${r(u.status)} text-[10px] uppercase font-bold">${u.status}</span></td>
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
                  ${o.length?o.map(u=>`<option value="${u.id}">${u.account_name} (${g(u.current_balance)})</option>`).join(""):'<option value="" disabled>No hay cuentas disponibles</option>'}
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
    `,{showCancel:!1}),window.lucide&&lucide.createIcons(),document.querySelectorAll(".pay-payment-btn").forEach(u=>u.addEventListener("click",()=>{n={pid:u.dataset.pid,cid:u.dataset.cid,amount:u.dataset.amount},document.getElementById("payment-receipt-box").classList.remove("hidden"),document.getElementById("pay-amount").value=n.amount,document.querySelectorAll(".pay-payment-btn").forEach(v=>v.closest("tr").classList.remove("bg-primary-50")),u.closest("tr").classList.add("bg-primary-50")})),(c=document.getElementById("confirm-pay-btn"))==null||c.addEventListener("click",async()=>{if(!n)return;const u=document.getElementById("pay-account-id").value,v=document.getElementById("pay-amount").value;if(!u){b("Seleccione una cuenta","error");return}try{await p.post(`/contracts/${n.cid}/payments/${n.pid}/pay?account_id=${u}&amount=${v}`,{}),b("✅ Pago registrado — transacción bancaria creada","success"),await N(a||document.getElementById("page-content"))}catch(f){b(f.message||"Error al registrar pago","error")}})}))}function Re(t=[],s){const i=new Date().toISOString().split("T")[0];h("Nuevo Contrato",`<form id="cf" class="space-y-4">
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
      <div><label class="label">Inicio *</label><input class="input" name="start_date" type="date" required value="${i}" /></div>
      <div><label class="label">Fin *</label><input class="input" name="end_date" type="date" required /></div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div><label class="label">Depósito</label><input class="input" name="deposit_amount" type="number" step="0.01" /></div>
      <div><label class="label">Incremento Anual %</label><input class="input" name="annual_increment_pct" type="number" step="0.01" value="5" /></div>
    </div>
  </form>`,{confirmText:"Crear",onConfirm:async()=>{const a=new FormData(document.getElementById("cf")),e={};a.forEach((l,d)=>{l&&(e[d]=["monthly_rent","deposit_amount","annual_increment_pct"].includes(d)?parseFloat(l):l)}),e.auto_renewal=!1,await p.post("/contracts",e),b("Contrato creado en Borrador — use ✓ para activarlo","success"),await N(s||document.getElementById("page-content"))}})}function Ne(t,s){const i={};s.forEach(e=>{i[e.tenant_name]||(i[e.tenant_name]={name:e.tenant_name,email:e.tenant_email,phone:e.tenant_phone,document:e.tenant_document,active_contracts:0}),e.status==="Activo"&&i[e.tenant_name].active_contracts++});const a=Object.values(i);t.innerHTML=`
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        ${a.length?a.map(e=>`
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
    `,window.lucide&&lucide.createIcons()}async function Ge(t){t.innerHTML=`
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
            ${Array.from({length:12},(r,n)=>`<option value="${n+1}">${new Date(0,n).toLocaleString("es",{month:"long"})}</option>`).join("")}
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
  `,window.lucide&&lucide.createIcons();const[s]=await Promise.all([p.get("/properties?limit=100")]),i=s.items||[],a=null,e=document.getElementById("filter-property");i.forEach(r=>{const n=document.createElement("option");n.value=r.id,n.textContent=r.name,e.appendChild(n)});const l=async()=>{const r=document.getElementById("budgets-table-container"),n=document.getElementById("filter-property").value,c=document.getElementById("filter-year").value,u=document.getElementById("filter-month").value,v=document.getElementById("filter-status").value;let f="/budgets?limit=100";n&&(f+=`&property_id=${n}`),c&&(f+=`&year=${c}`),u&&(f+=`&month=${u}`);try{const x=await p.get(f);let y=x;v&&(y=x.filter(w=>w.semaphore===v)),pe(r,y,i,a,l)}catch(x){r.innerHTML=`<div class="p-8 text-center text-rose-500">Error al cargar presupuestos: ${x.message}</div>`}};document.getElementById("apply-filters").addEventListener("click",l),document.getElementById("add-budget-btn").addEventListener("click",()=>me(i,null,l));const d=document.querySelector(".glass-card-static.flex.flex-wrap"),o=document.createElement("button");o.className="btn-secondary !rounded-xl shadow-sm py-2 px-4 flex items-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 ml-auto",o.innerHTML='<i data-lucide="download" class="w-4 h-4"></i> Exportar a Excel',o.addEventListener("click",()=>{const r=document.getElementById("filter-property").value,n=document.getElementById("filter-year").value;let c=`${p.baseURL}/budgets/export/excel`;const u=new URLSearchParams;r&&u.append("property_id",r==="GENERAL"?"":r),n&&(u.append("start_year",parseInt(n)-2),u.append("end_year",parseInt(n)+2)),[...u].length&&(c+="?"+u.toString());const v=localStorage.getItem("token");fetch(c,{headers:v?{Authorization:`Bearer ${v}`}:{}}).then(async f=>{if(!f.ok)throw new Error("Error limitando exportación");const x=await f.blob(),y=document.createElement("a");y.href=URL.createObjectURL(x),y.download=`Presupuestos_${n||"Todos"}.xlsx`,document.body.appendChild(y),y.click(),y.remove(),b("Exportación exitosa","success")}).catch(f=>{b("Error exportando Excel","error"),console.error(f)})}),d.appendChild(o),l()}function pe(t,s,i,a,e,l="",d=1){if(!s.length){t.innerHTML='<div class="py-20 text-center text-surface-400">No se encontraron presupuestos con los filtros seleccionados.</div>';return}t.innerHTML=`
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
        ${s.map(o=>{const r=i.find(c=>c.id===o.property_id);return`
          <tr class="hover:bg-surface-50 transition-colors">
            <td>
              <div class="font-semibold text-surface-900">${o.property_id===null?"Gastos Generales":r?r.name:"Unidad Borrada"}</div>
              <div class="text-[10px] text-surface-400 italic">${o.property_id?o.property_id.slice(0,8)+"...":"General"}</div>
            </td>
            <td>
              <div class="flex items-center gap-1">
                <span class="text-sm font-medium text-surface-700">${o.year} - ${new Date(0,o.month-1).toLocaleString("es",{month:"short",year:"numeric"}).toUpperCase()}</span>
                ${o.is_closed?'<i data-lucide="lock" class="w-3 h-3 text-surface-400" title="Presupuesto Cerrado"></i>':""}
              </div>
            </td>
            <td>
              <div class="flex items-center gap-2">
                <span class="semaphore ${he(o.semaphore)}"></span>
                <span class="text-xs font-semibold ${o.semaphore==="Verde"?"text-green-600":o.semaphore==="Amarillo"?"text-amber-600":"text-red-600"}">${o.semaphore}</span>
              </div>
            </td>
            <td class="text-sm font-medium text-surface-900">${g(o.total_budget)}</td>
            <td class="text-sm font-medium text-surface-600">${g(o.total_executed)}</td>
            <td class="w-48">
              <div class="flex items-center gap-3">
                <div class="flex-1 bg-surface-100 rounded-full h-1.5 overflow-hidden">
                  <div class="h-full rounded-full ${o.semaphore==="Verde"?"bg-green-500":o.semaphore==="Amarillo"?"bg-amber-500":"bg-red-500"}" 
                    style="width: ${Math.min(o.execution_pct,100)}%"></div>
                </div>
                <span class="text-xs font-bold w-10">${Y(o.execution_pct)}</span>
              </div>
            </td>
            <td>
              <div class="flex justify-end gap-1">
                <a href="#/budget-report?property_id=${o.property_id}&year=${o.year}&month=${o.month}" 
                  class="p-2 rounded-lg hover:bg-primary-50 text-primary-600 transition" title="Ver Reporte Detallado">
                  <i data-lucide="bar-chart-3" class="w-4 h-4"></i>
                </a>
                
                <button class="export-pdf-btn p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition" 
                  data-id="${o.id}" data-ym="${o.year}_${o.month}" title="Exportar PDF de Asamblea">
                  <i data-lucide="file-text" class="w-4 h-4"></i>
                </button>

                <button class="history-btn p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition" 
                  data-id="${o.id}" title="Ver Historial de Cambios">
                  <i data-lucide="history" class="w-4 h-4"></i>
                </button>
                
                ${o.is_closed?"":`
                <button class="close-budget-btn p-2 rounded-lg hover:bg-indigo-50 text-indigo-600 transition" 
                  data-id="${o.id}" title="Cerrar Mes (Congelar Distribución)">
                  <i data-lucide="lock" class="w-4 h-4"></i>
                </button>
                <button class="edit-btn p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition" 
                  data-id="${o.id}" title="Editar">
                  <i data-lucide="edit-3" class="w-4 h-4"></i>
                </button>
                `}
                
                <button class="duplicate-btn p-2 rounded-lg hover:bg-surface-100 text-surface-500 transition" 
                  data-id="${o.id}" title="Duplicar">
                  <i data-lucide="copy" class="w-4 h-4"></i>
                </button>
                
                ${o.is_closed?"":`
                <button class="delete-budget-btn p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition" 
                  data-id="${o.id}" title="Eliminar">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
                `}
              </div>
            </td>
          </tr>
        `}).join("")}
      </tbody>
    </table>
  `,window.lucide&&lucide.createIcons(),t.querySelectorAll("th.sortable").forEach(o=>{o.addEventListener("click",()=>{const r=o.dataset.sort;l===r?d*=-1:(l=r,d=1);const n=[...s].sort((c,u)=>{var x,y;let v,f;return r==="property"?(v=((x=i.find(w=>w.id===c.property_id))==null?void 0:x.name)||"",f=((y=i.find(w=>w.id===u.property_id))==null?void 0:y.name)||""):r==="date"?(v=c.year*100+c.month,f=u.year*100+u.month):r==="status"?(v=c.semaphore,f=u.semaphore):r==="budget"?(v=c.total_budget,f=u.total_budget):r==="pct"&&(v=c.execution_pct,f=u.execution_pct),(v>f?1:-1)*d});pe(t,n,i,a,e,r,d)})}),t.querySelectorAll(".edit-btn").forEach(o=>{o.addEventListener("click",async()=>{const r=s.find(n=>n.id===o.dataset.id);me(i,r,e)})}),t.querySelectorAll(".duplicate-btn").forEach(o=>{o.addEventListener("click",()=>{const r=s.find(n=>n.id===o.dataset.id);Ue(i,r,e)})}),t.querySelectorAll(".delete-budget-btn").forEach(o=>{o.addEventListener("click",async()=>{h("¿Eliminar Presupuesto?","Esta acción borrará el presupuesto de este periodo y sus categorías.",{confirmText:"Eliminar",onConfirm:async()=>{await p.delete(`/budgets/${o.dataset.id}`),b("Presupuesto eliminado","success"),e()}})})}),t.querySelectorAll(".close-budget-btn").forEach(o=>{o.addEventListener("click",async()=>{h("¿Cerrar y Congelar Presupuesto?","Esta acción calculará y guardará irreversiblemente los porcentajes de distribución de este mes. El presupuesto quedará bloqueado y no podrá ser editado ni eliminado en el futuro.",{confirmText:"Cerrar Presupuesto",onConfirm:async()=>{try{await p.post(`/budgets/${o.dataset.id}/close`),b("Presupuesto cerrado exitosamente","success"),e()}catch(r){b(r.message||"Error al cerrar presupuesto","error")}}})})}),t.querySelectorAll(".export-pdf-btn").forEach(o=>{o.addEventListener("click",async()=>{const r=o.dataset.id,n=o.dataset.ym;b("Generando PDF...","info");try{const c=localStorage.getItem("token"),u=await fetch(`${p.baseURL}/budgets/${r}/export/pdf`,{headers:c?{Authorization:`Bearer ${c}`}:{}});if(!u.ok)throw new Error("Error al generar PDF");const v=await u.blob(),f=document.createElement("a");f.href=URL.createObjectURL(v),f.download=`Presupuesto_${n}.pdf`,document.body.appendChild(f),f.click(),f.remove(),b("PDF generado exitosamente","success")}catch(c){b(c.message||"Error al exportar PDF","error")}})}),t.querySelectorAll(".history-btn").forEach(o=>{o.addEventListener("click",()=>{const r=s.find(n=>n.id===o.dataset.id);He(r)})})}function He(t){if(!t.revisions||t.revisions.length===0){h("Historial de Cambios",'<p class="text-surface-500 py-4 text-center">No hay revisiones registradas para este presupuesto.</p>',{confirmText:"Cerrar"});return}const s=t.revisions.map(i=>{var a;return`
      <div class="p-4 bg-surface-50 rounded-xl border border-surface-200 mb-3 animate-fade-in">
        <div class="flex justify-between items-start mb-2">
          <div>
            <span class="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-md border border-primary-100">${new Date(i.created_at).toLocaleString()}</span>
          </div>
          <span class="text-xs text-surface-500 italic">Usuario ID: ${((a=i.user_id)==null?void 0:a.slice(0,8))||"Sistema"}</span>
        </div>
        <div class="flex items-center gap-3 text-sm font-medium text-surface-700 my-2">
          <span class="text-surface-500 line-through">${g(i.old_amount)}</span>
          <i data-lucide="arrow-right" class="w-4 h-4 text-surface-400"></i>
          <span class="text-emerald-600">${g(i.new_amount)}</span>
        </div>
        ${i.justification?`<div class="text-xs text-surface-600 bg-white p-2 border border-surface-200 rounded-lg mt-2 font-medium"><b>Justificación:</b> ${i.justification}</div>`:""}
      </div>
    `}).join("");h("Historial de Modificaciones",`
    <div class="max-h-96 overflow-y-auto pr-2">
      ${s}
    </div>
  `,{confirmText:"Cerrar"}),window.lucide&&lucide.createIcons()}function me(t,s=null,i){const a=!!s,e=a?s.year:new Date().getFullYear(),l=a?s.month:new Date().getMonth()+1,d=t.map(c=>`<option value="${c.id}" ${a&&s.property_id===c.id?"selected":""}>${c.name}</option>`).join("");h(a?"Editar Presupuesto":"Nuevo Presupuesto",`
    <form id="bf" class="space-y-4">
      <div class="${a?"pointer-events-none opacity-60":""}">
        <label class="label">Propiedad *</label>
        <select class="select" name="property_id" required>
          <option value="GENERAL" ${a&&b_prop===null?"selected":""}>Gastos Generales (Distribuible)</option>
          ${d}
        </select>
        ${a?'<p class="text-[10px] text-surface-400 mt-1">La propiedad y periodo no se pueden cambiar. Duplique el presupuesto si lo desea en otro lugar.</p>':""}
      </div>
      <div class="grid grid-cols-3 gap-4 items-end ${a?"pointer-events-none opacity-60":""}">
        <div><label class="label">Año *</label><input class="input" name="year" type="number" value="${e}" required /></div>
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
          ${a?s.categories.map(c=>le(c.category_name,c.budgeted_amount,c.is_distributable)).join(""):""}
        </div>
      </div>
      ${a?`
      <div class="bg-amber-50 p-3 rounded-xl border border-amber-100">
        <label class="label text-amber-900">Justificación del Cambio *</label>
        <input class="input bg-white" name="justification" type="text" placeholder="Razón de la modificación (obligatorio si cambia el total)..." />
        <p class="text-[10px] text-amber-700 mt-1">Requerido por auditoría si el monto total cambia.</p>
      </div>
      `:""}
      <div>
        <label class="label">Notas Adicionales</label>
        <textarea class="textarea text-sm" name="notes" placeholder="Opcional...">${a&&s.notes||""}</textarea>
      </div>
    </form>
  `,{confirmText:a?"Guardar Cambios":"Crear Presupuesto",onConfirm:async()=>{var y;const c=document.getElementById("bf"),u=new FormData(c),v=document.getElementById("auto_calculate_total").checked,f=[];c.querySelectorAll(".cat-row").forEach(w=>{const E=w.querySelector('[name="cat_name"]').value,I=w.querySelector('[name="cat_amount"]').value,O=w.querySelector('[name="cat_dist"]').checked;E&&I&&f.push({category_name:E,budgeted_amount:parseFloat(I),is_distributable:O})});const x={property_id:u.get("property_id")==="GENERAL"?null:u.get("property_id"),year:parseInt(u.get("year")),month:parseInt(u.get("month")),total_budget:v?0:parseFloat(u.get("total_budget"))||0,categories:f,auto_calculate_total:v,notes:u.get("notes"),justification:u.get("justification")||""};a?(await p.put(`/budgets/${s.id}`,x),b("Presupuesto actualizado","success")):(x.is_annual=((y=document.getElementById("is_annual"))==null?void 0:y.checked)||!1,await p.post("/budgets",x),b("Presupuesto creado","success")),i&&i()}});const o=document.getElementById("auto_calculate_total"),r=document.getElementById("total_budget_input");o.addEventListener("change",()=>{r.disabled=o.checked,o.checked&&n()});const n=()=>{if(!o.checked)return;let c=0;document.querySelectorAll(".cat-row").forEach(u=>{c+=parseFloat(u.querySelector('[name="cat_amount"]').value||0)}),r.value=c};document.getElementById("add-cat-btn").addEventListener("click",()=>{const c=document.getElementById("cats-list"),u=document.createElement("div");u.innerHTML=le();const v=u.firstElementChild;c.appendChild(v),window.lucide&&lucide.createIcons(),v.querySelector('[name="cat_amount"]').addEventListener("input",n)}),document.querySelectorAll('.cat-row [name="cat_amount"]').forEach(c=>{c.addEventListener("input",n)}),window.lucide&&lucide.createIcons()}function le(t="",s="",i=!1){return`
    <div class="cat-row flex gap-2 items-center animate-fade-in group">
      <input class="input text-sm py-1.5 flex-1" name="cat_name" value="${t}" placeholder="Ej: Mantenimiento" />
      <input class="input text-sm py-1.5 w-40" name="cat_amount" type="number" step="0.01" value="${s}" placeholder="$" />
      <div class="flex items-center gap-1">
        <input type="checkbox" name="cat_dist" class="w-4 h-4" ${i?"checked":""} />
        <span class="text-[10px] text-surface-400">Dist.</span>
      </div>
      <button type="button" class="p-1.5 text-rose-300 hover:text-rose-600 transition" onclick="this.parentElement.remove(); document.dispatchEvent(new Event('catChange'));">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>
  `}document.addEventListener("catChange",()=>{const t=document.getElementById("auto_calculate_total");if(t&&t.checked){let s=0;document.querySelectorAll(".cat-row").forEach(a=>{s+=parseFloat(a.querySelector('[name="cat_amount"]').value||0)});const i=document.getElementById("total_budget_input");i&&(i.value=s)}});function Ue(t,s,i){const a=new Date().getFullYear(),e=t.map(l=>`<option value="${l.id}" ${s.property_id===l.id?"selected":""}>${l.name}</option>`).join("");h("Duplicar Periodo",`
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
  `,{confirmText:"Procesar Duplicación",onConfirm:async()=>{const l=new FormData(document.getElementById("df")),d={target_year:parseInt(l.get("target_year")),target_month:parseInt(l.get("target_month")),target_property_id:l.get("target_property_id"),percentage_increase:parseFloat(l.get("percentage_increase")||0)};await p.post(`/budgets/${s.id}/duplicate`,d),b("Presupuesto duplicado","success"),i&&i()}}),window.lucide&&lucide.createIcons()}async function ze(t){const s=new URLSearchParams(window.location.hash.split("?")[1]||""),i=s.get("property_id"),a=s.get("year"),e=s.get("month");if(!i||!a||!e){t.innerHTML='<div class="p-12 text-center text-surface-500">Faltan parámetros para el reporte.</div>';return}const l=await p.get(`/budgets/report/${i}?year=${a}&month=${e}`),d=new Set;l.rows.forEach(r=>{Object.keys(r.distribution).forEach(n=>d.add(n))});const o=Array.from(d);t.innerHTML=`
    <div class="mb-6 flex items-center justify-between">
      <a href="#/budgets" class="btn-ghost text-sm"><i data-lucide="arrow-left" class="w-4 h-4 mr-1"></i> Volver</a>
      <div class="text-right">
        <h4 class="font-bold text-surface-900">Periodo: ${e}/${a}</h4>
      </div>
    </div>

    <div class="glass-card overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-surface-50 border-b border-surface-200">
            <th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Categoría</th>
            <th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Presupuestado</th>
            <th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Ejecutado Total</th>
            ${o.map(r=>`<th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">${r.slice(0,8)}...</th>`).join("")}
            <th class="p-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Diferencia</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-100">
          ${l.rows.length?l.rows.map(r=>{const n=r.budgeted-r.actual,c=n>=0?"text-green-600":"text-red-600";return`
              <tr class="hover:bg-surface-50/50 transition-colors">
                <td class="p-4 font-medium text-surface-700">
                  <div class="flex flex-col">
                    <span>${r.category}</span>
                    ${r.is_distributable?'<span class="text-[10px] text-primary-500 font-bold uppercase">Distribuible</span>':""}
                  </div>
                </td>
                <td class="p-4 text-surface-600 font-mono text-sm">${g(r.budgeted)}</td>
                <td class="p-4 text-surface-900 font-bold font-mono text-sm">${g(r.actual)}</td>
                ${o.map(u=>`
                  <td class="p-4 text-surface-500 font-mono text-xs">
                    ${r.distribution[u]?g(r.distribution[u]):"--"}
                  </td>
                `).join("")}
                <td class="p-4 font-bold font-mono text-sm ${c}">${g(n)}</td>
              </tr>
            `}).join(""):`<tr><td colspan="${4+o.length}" class="p-8 text-center text-surface-400">Sin datos para este periodo</td></tr>`}
        </tbody>
      </table>
    </div>

    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card-static p-4">
        <p class="text-xs text-surface-400 uppercase font-bold mb-1">Total Presupuesto</p>
        <p class="text-xl font-bold text-surface-900 font-mono">${g(l.rows.reduce((r,n)=>r+n.budgeted,0))}</p>
      </div>
      <div class="glass-card-static p-4">
        <p class="text-xs text-surface-400 uppercase font-bold mb-1">Total Ejecutado</p>
        <p class="text-xl font-bold text-primary-600 font-mono">${g(l.rows.reduce((r,n)=>r+n.actual,0))}</p>
      </div>
       <div class="glass-card-static p-4">
        <p class="text-xs text-surface-400 uppercase font-bold mb-1">Cumpimiento</p>
        <p class="text-xl font-bold text-surface-900 font-mono">
          ${Y(l.rows.reduce((r,n)=>r+n.actual,0)/(l.rows.reduce((r,n)=>r+n.budgeted,0)||1)*100)}
        </p>
      </div>
    </div>
  `,window.lucide&&lucide.createIcons()}async function J(t,s){let i=[],a=[],e={items:[]};try{const[c,u,v]=await Promise.all([p.get("/assets").catch(f=>(console.error("Error fetching assets:",f),[])),p.get("/inspections").catch(f=>(console.error("Error fetching inspections:",f),[])),p.get("/properties?limit=100").catch(f=>(console.error("Error fetching properties:",f),{items:[]}))]);i=c||[],a=u||[],e=v||{items:[]}}catch(c){console.error("Unhandled error fetching facility data:",c)}const l=e.items||[];t.innerHTML=`
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
    `;const d=t.querySelector("#tab-content"),o=t.querySelectorAll(".tab-btn"),r=sessionStorage.getItem("facility_active_tab")||"assets";o.forEach(c=>{c.addEventListener("click",async()=>{o.forEach(u=>u.classList.remove("active")),c.classList.add("active"),sessionStorage.setItem("facility_active_tab",c.dataset.tab),await de(c.dataset.tab,d,{assets:i,inspections:a,properties:l})})});const n=t.querySelector(`.tab-btn[data-tab="${r}"]`);n&&(o.forEach(c=>c.classList.remove("active")),n.classList.add("active")),await de(r,d,{assets:i,inspections:a,properties:l})}async function de(t,s,i){s.innerHTML=`
        <div class="flex items-center justify-center py-20">
            <div class="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    `;try{switch(t){case"assets":Ve(s,i);break;case"inspections":We(s,i);break;case"providers":await Ye(s,i);break;case"maintenance":await Z(s,i);break}}catch(a){console.error(`Error rendering tab ${t}:`,a),s.innerHTML=`
            <div class="text-center py-20">
                <i data-lucide="alert-circle" class="w-12 h-12 text-rose-400 mx-auto mb-4"></i>
                <h3 class="text-lg font-semibold text-surface-700 mb-2">No se pudo cargar la información</h3>
                <p class="text-surface-500 text-sm">${a.message}</p>
                <button onclick="window.location.reload()" class="btn-primary btn-sm mt-4">Reintentar</button>
            </div>
        `,window.lucide&&lucide.createIcons()}}function Ve(t,{assets:s,properties:i}){t.innerHTML=`
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
    `,document.getElementById("add-asset-btn").addEventListener("click",()=>Ke(i)),window.lucide&&lucide.createIcons()}function We(t,{inspections:s,properties:i}){t.innerHTML=`
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
                            <td>${_(a.scheduled_date)}</td>
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
    `,document.getElementById("add-insp-btn").addEventListener("click",()=>Qe(i)),window.lucide&&lucide.createIcons()}async function Ye(t){const i=(await p.get("/contacts?contact_type=Proveedor&limit=100")).items||[];t.innerHTML=`
        <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-semibold text-surface-700">Directorio de Proveedores</h4>
            <button id="add-prov-btn" class="btn-primary btn-sm px-3 py-1.5"><i data-lucide="user-plus" class="w-4 h-4"></i> Nuevo Proveedor</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${i.length?i.map(a=>`
                <div class="glass-card-static p-4 flex gap-4 items-center">
                    <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                        ${a.name.charAt(0)}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h5 class="font-bold text-surface-900 truncate">${a.name}</h5>
                        <p class="text-xs text-surface-500 truncate">${a.email||"Sin correo"}</p>
                        <p class="text-xs font-medium text-primary-600 mt-1">${a.phone||"Sin teléfono"}</p>
                    </div>
                </div>
            `).join(""):'<p class="text-surface-400 text-center py-20 col-span-full">No se encontraron proveedores.</p>'}
        </div>
    `,window.lucide&&lucide.createIcons()}function Ke(t){const s=t.map(i=>`<option value="${i.id}">${i.name}</option>`).join("");h("Nuevo Activo",`
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
    `,{confirmText:"Guardar",onConfirm:async()=>{const i=new FormData(document.getElementById("af")),a=Object.fromEntries(i);await p.post("/assets",a),b("Activo registrado","success"),await J(document.getElementById("page-content"))}})}async function Z(t,{properties:s}){const a=(await p.get("/maintenance?limit=50")).items||[];t.innerHTML=`
    <div class="flex items-center justify-between mb-6 animate-fade-in px-4">
      <div class="flex items-center gap-3">
        <h4 class="text-lg font-semibold text-surface-700">Órdenes de Trabajo</h4>
      </div>
      <button id="add-maint-btn" class="btn-primary btn-sm"><i data-lucide="plus" class="w-4 h-4"></i> Nueva Orden</button>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-in px-4">
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-amber-500">${a.filter(e=>e.status==="Pendiente").length}</p>
        <p class="text-xs text-surface-500 mt-1">Pendientes</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-primary-500">${a.filter(e=>e.status==="En Progreso").length}</p>
        <p class="text-xs text-surface-500 mt-1">En Progreso</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-emerald-500">${a.filter(e=>e.status==="Completado").length}</p>
        <p class="text-xs text-surface-500 mt-1">Completados</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-rose-500">${g(a.reduce((e,l)=>e+(l.actual_cost||0),0))}</p>
        <p class="text-xs text-surface-500 mt-1">Costo Total</p>
      </div>
    </div>
    <div class="glass-card-static overflow-hidden animate-fade-in mx-4">
      <table class="data-table">
        <thead><tr><th></th><th>Título</th><th>Tipo</th><th>Prioridad</th><th>Estado</th><th>Proveedor</th><th>Costo</th><th></th></tr></thead>
        <tbody>
        ${a.length?a.map(e=>{var l;return`<tr>
          <td class="w-12">
            ${e.photos&&e.photos.length>0?`<div class="relative group cursor-pointer" onclick="viewPhotos('${e.id}')">
                <img src="${p.baseUrl.replace("/api/v1","")}/${e.photos[0].photo_path}" class="w-10 h-10 rounded object-cover border border-surface-200" />
                <span class="absolute -top-1 -right-1 bg-primary-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">${e.photos.length}</span>
              </div>`:'<div class="w-10 h-10 rounded bg-surface-100 flex items-center justify-center text-surface-400"><i data-lucide="image" class="w-5 h-5"></i></div>'}
          </td>
          <td><div class="font-semibold text-sm">${e.title}</div><div class="text-[10px] text-surface-400">${_(e.scheduled_date)}</div></td>
          <td><span class="badge badge-gray text-[10px]">${e.maintenance_type}</span></td>
          <td><span class="badge ${e.priority==="Urgente"?"badge-red":e.priority==="Alta"?"badge-amber":"badge-gray"} text-[10px]">${e.priority}</span></td>
          <td><span class="badge ${Je(e.status)} text-[10px]">${e.status}</span></td>
          <td class="text-xs">${((l=e.supplier)==null?void 0:l.name)||e.supplier_name||'<span class="text-surface-400">—</span>'}</td>
          <td class="text-sm font-medium">${g(e.actual_cost||e.estimated_cost)}</td>
          <td class="text-right">
             <button class="btn-ghost p-1 edit-maint-btn" data-id="${e.id}"><i data-lucide="edit-3" class="w-4 h-4 text-surface-400"></i></button>
          </td>
        </tr>`}).join(""):'<tr><td colspan="8" class="text-center py-10 text-surface-400">No hay mantenimientos.</td></tr>'}
        </tbody>
      </table>
    </div>
    `,window.lucide&&lucide.createIcons(),document.getElementById("add-maint-btn").addEventListener("click",()=>Ze(s,t)),document.querySelectorAll(".edit-maint-btn").forEach(e=>e.addEventListener("click",()=>Xe(e.dataset.id,s,t)))}function Je(t){return{Pendiente:"badge-amber","En Progreso":"badge-primary",Completado:"badge-green",Cancelado:"badge-red"}[t]||"badge-gray"}async function Ze(t,s){const a=(await p.get("/contacts?contact_type=Proveedor&limit=100")).items||[],e=a.length?a.map(d=>`<option value="${d.id}|${d.name}">${d.name}</option>`).join(""):'<option value="">No hay proveedores</option>',l=t.map(d=>`<option value="${d.id}">${d.name}</option>`).join("");h("Nueva Orden de Mantenimiento",`
        <form id="mf" class="space-y-4">
            <div><label class="label">Propiedad *</label><select class="select" name="property_id" required>${l}</select></div>
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
    `,{confirmText:"Crear",onConfirm:async()=>{const d=new FormData(document.getElementById("mf")),o={};d.forEach((n,c)=>{c==="estimated_cost"?o[c]=n?parseFloat(n):void 0:n&&(o[c]=n)});const r=document.getElementById("maint-supplier-select").value;if(r){const[n,c]=r.split("|");o.supplier_id=n,o.supplier_name=c}await p.post("/maintenance",o),b("Orden creada","success"),s&&await Z(s,{properties:t})}})}async function Xe(t,s,i){const[a,e]=await Promise.all([p.get(`/maintenance/${t}`),p.get("/contacts?contact_type=Proveedor&limit=100")]),l=e.items||[],d=l.length?l.map(o=>`<option value="${o.id}|${o.name}" ${a.supplier_id===o.id?"selected":""}>${o.name}</option>`).join(""):'<option value="">No hay proveedores</option>';h("Editar Mantenimiento",`
        <form id="e-mf" class="space-y-4">
            <div><label class="label">Título</label><input class="input" name="title" value="${a.title}" /></div>
            <div class="grid grid-cols-2 gap-4">
                <div><label class="label">Estado</label><select class="select" name="status">
                    <option value="Pendiente" ${a.status==="Pendiente"?"selected":""}>Pendiente</option>
                    <option value="En Progreso" ${a.status==="En Progreso"?"selected":""}>En Progreso</option>
                    <option value="Esperando Factura" ${a.status==="Esperando Factura"?"selected":""}>Esperando Factura</option>
                    <option value="Completado" ${a.status==="Completado"?"selected":""}>Completado</option>
                    <option value="Cancelado" ${a.status==="Cancelado"?"selected":""}>Cancelado</option>
                </select></div>
                <div><label class="label">Prioridad</label><select class="select" name="priority">
                    <option value="Baja" ${a.priority==="Baja"?"selected":""}>Baja</option>
                    <option value="Media" ${a.priority==="Media"?"selected":""}>Media</option>
                    <option value="Alta" ${a.priority==="Alta"?"selected":""}>Alta</option>
                    <option value="Urgente" ${a.priority==="Urgente"?"selected":""}>Urgente</option>
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
                <div><label class="label">Costo Estimado</label><input class="input" type="number" name="estimated_cost" step="0.01" value="${a.estimated_cost||""}" /></div>
                <div><label class="label">Costo Real</label><input class="input" type="number" name="actual_cost" step="0.01" value="${a.actual_cost||""}" /></div>
            </div>
            <div><label class="label">Fecha Programada</label><input class="input" type="date" name="scheduled_date" value="${a.scheduled_date||""}" /></div>
            <div><label class="label">Notas</label><textarea class="input" name="notes" rows="3">${a.notes||""}</textarea></div>
        </form>
    `,{confirmText:"Guardar",onConfirm:async()=>{const o=new FormData(document.getElementById("e-mf")),r={};o.forEach((c,u)=>{u==="estimated_cost"||u==="actual_cost"?r[u]=c?parseFloat(c):null:c&&(r[u]=c)});const n=document.getElementById("e-maint-supplier-select").value;if(n){const[c,u]=n.split("|");r.supplier_id=c,r.supplier_name=u}else r.supplier_id=null,r.supplier_name=null;await p.put(`/maintenance/${t}`,r),b("Actualizado","success"),i&&await Z(i,{properties:s})}})}window.viewPhotos=async t=>{const s=await p.get(`/maintenance/${t}`);if(!s.photos||s.photos.length===0)return;const i=p.baseUrl.replace("/api/v1","");h("Evidencia Fotográfica",`
      <div class="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
        ${s.photos.map(a=>`
          <div class="space-y-2">
            <img src="${i}/${a.photo_path}" class="w-full rounded-lg border border-surface-200 cursor-zoom-in" onclick="window.open('${i}/${a.photo_path}', '_blank')" />
            <p class="text-[10px] text-surface-400 text-center">${_(a.uploaded_at)}</p>
          </div>
        `).join("")}
      </div>
    `,{confirmText:"Cerrar"})};function Qe(t){const s=t.map(i=>`<option value="${i.id}">${i.name}</option>`).join("");h("Programar Inspección",`
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
    `,{confirmText:"Programar",onConfirm:async()=>{const i=new FormData(document.getElementById("if")),a=Object.fromEntries(i);await p.post("/inspections",a),b("Inspección programada","success"),await J(document.getElementById("page-content"))}})}let z=null,V=null;async function et(t){const i=new URLSearchParams(window.location.hash.split("?")[1]).get("id");if(!i){t.innerHTML='<div class="p-8 text-center text-rose-500">Error: No se proporcionó ID de cuenta.</div>';return}t.innerHTML=`
        <div class="flex items-center justify-center py-20">
            <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
        </div>
    `;try{await be(t,i)}catch(a){t.innerHTML=`<div class="p-8 text-center text-rose-500">Error al cargar datos de la cuenta: ${a.message}</div>`}}async function be(t,s,i={}){const a=new URLSearchParams;i.date_from&&a.set("date_from",i.date_from),i.date_to&&a.set("date_to",i.date_to),i.tx_type&&a.set("tx_type",i.tx_type),a.set("months",12);const e=await p.get(`/accounts/${s}/history?${a.toString()}`);if(!e)return;const{account:l,monthly_cashflow:d,recent_transactions:o,balance_history:r}=e;t.innerHTML=`
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
                        ${g(l.current_balance)}
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
                            ${o.length>0?o.map(n=>`
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
                                            <span>${g(n.amount)}</span>
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
    `,window.lucide&&lucide.createIcons(),document.getElementById("btn-apply-filters").addEventListener("click",()=>{const n={date_from:document.getElementById("filter-date-from").value,date_to:document.getElementById("filter-date-to").value,tx_type:document.getElementById("filter-tx-type").value};be(t,s,n)}),tt(d,r)}function tt(t,s){z&&z.destroy(),V&&V.destroy();const i=document.getElementById("account-history-chart");i&&t.length>0&&(z=new Chart(i,{type:"bar",data:{labels:t.map(e=>e.month),datasets:[{label:"Ingresos",data:t.map(e=>e.income),backgroundColor:"#00d084",borderRadius:8,barThickness:15},{label:"Gastos",data:t.map(e=>e.expenses),backgroundColor:"#ff4d4f",borderRadius:8,barThickness:15}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"bottom",labels:{boxWidth:10,usePointStyle:!0,font:{size:11,weight:"600"}}}},scales:{y:{grid:{color:"rgba(0,0,0,0.03)"},ticks:{font:{size:10},callback:e=>"$"+e.toLocaleString()}},x:{grid:{display:!1},ticks:{font:{size:10}}}}}}));const a=document.getElementById("account-balance-chart");a&&s&&s.length>0&&(V=new Chart(a,{type:"line",data:{labels:s.map(e=>_(e.date)),datasets:[{label:"Saldo",data:s.map(e=>e.balance),borderColor:"#4d7cfe",backgroundColor:"rgba(77, 124, 254, 0.1)",fill:!0,tension:.4,pointRadius:2,pointHoverRadius:6,borderWidth:4,pointBackgroundColor:"#fff",pointBorderWidth:2}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{mode:"index",intersect:!1}},scales:{y:{grid:{color:"rgba(0,0,0,0.03)"},ticks:{font:{size:10},callback:e=>"$"+e.toLocaleString()}},x:{grid:{display:!1},ticks:{font:{size:8},maxRotation:0,autoSkip:!0,maxTicksLimit:12}}}}}))}async function M(t,s){const[i,a,e]=await Promise.all([p.get("/work-groups"),p.get("/properties?limit=100"),p.get("/users?limit=100").catch(()=>({items:[]}))]),l=a.items||[],o=(e.items||[]).filter(r=>r.id);t.innerHTML=`
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
            ${i.length?i.map(r=>`
                <div class="glass-card-static p-5 flex flex-col space-y-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-bold text-surface-900 text-lg">${r.name}</h4>
                            <p class="text-xs text-surface-500">${r.description||"Sin descripción"}</p>
                        </div>
                        <span class="badge badge-blue">ID: ${r.id.slice(0,4)}</span>
                    </div>

                    <div class="space-y-2 flex-grow">
                        <div class="flex justify-between text-sm">
                            <span class="text-surface-600 font-medium">Miembros</span>
                            <span class="font-bold text-surface-900">${r.members_count||0}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-surface-600 font-medium">Propiedades Asignadas</span>
                            <span class="font-bold text-surface-900">${r.properties_count||0}</span>
                        </div>
                    </div>

                    <div class="pt-4 border-t border-surface-100 flex flex-col gap-2">
                        <button class="btn-ghost btn-sm w-full font-medium" onclick="window.viewGroupDetails('${r.id}')">
                            <i data-lucide="eye" class="w-4 h-4 mr-1"></i> Ver Detalles
                        </button>
                        <div class="flex gap-2">
                            <button class="btn-secondary btn-sm flex-1" onclick="window.addMemberModal('${r.id}')">
                                <i data-lucide="user-plus" class="w-4 h-4 mr-1"></i> Miembro
                            </button>
                            <button class="btn-secondary btn-sm flex-1" onclick="window.addPropertyModal('${r.id}')">
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
        `,{confirmText:"Crear",onConfirm:async()=>{const r=new FormData(document.getElementById("wg-form")),n=Object.fromEntries(r);await p.post("/work-groups",n),b("Grupo creado","success"),M(t,s)}})}),window.addMemberModal=async r=>{const n=o.length?o.map(c=>`<option value="${c.id}">${c.full_name||c.email} (${c.role})</option>`).join(""):'<option value="" disabled>No se encontraron usuarios</option>';h("Añadir Miembro",`
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
        `,{confirmText:"Añadir",onConfirm:async()=>{const c=new FormData(document.getElementById("wm-form")),u=Object.fromEntries(c);if(!u.user_id)throw b("Seleccione un usuario","error"),new Error("Seleccione un usuario");await p.post(`/work-groups/${r}/members`,u),b("Miembro añadido","success"),M(t,s)}})},window.addPropertyModal=async r=>{const n=l.length?l.map(c=>`<option value="${c.id}">${c.name} (${c.property_type})</option>`).join(""):'<option value="" disabled>No se encontraron propiedades</option>';h("Asignar Propiedad",`
            <form id="wp-form" class="space-y-4">
                <div>
                    <label class="label">Propiedad *</label>
                    <select class="select" name="property_id" required>
                        <option value="">Seleccione una propiedad...</option>
                        ${n}
                    </select>
                </div>
            </form>
        `,{confirmText:"Asignar",onConfirm:async()=>{const c=new FormData(document.getElementById("wp-form")),u=Object.fromEntries(c);if(!u.property_id)throw b("Seleccione una propiedad","error"),new Error("Seleccione una propiedad");await p.post(`/work-groups/${r}/properties`,u),b("Propiedad asignada","success"),M(t,s)}})},window.viewGroupDetails=async r=>{try{const[n,c,u]=await Promise.all([p.get(`/work-groups/${r}`),p.get(`/work-groups/${r}/members`),p.get(`/work-groups/${r}/properties`)]),v=c.length?c.map(x=>{var y,w,E;return`
                <div class="flex justify-between items-center p-2 border-b border-surface-100 last:border-0 hover:bg-surface-50">
                    <div>
                        <p class="font-medium text-sm text-surface-900">${((y=x.user)==null?void 0:y.full_name)||"Desconocido"}</p>
                        <p class="text-[10px] text-surface-500">${((w=x.user)==null?void 0:w.email)||"N/A"}</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="badge ${x.role==="Admin"||x.role==="Super Admin"?"badge-primary":"badge-gray"} text-xs">${x.role}</span>
                        ${x.user_id!==((E=s.user)==null?void 0:E.id)&&x.role!=="Super Admin"?`<button class="text-rose-500 hover:text-rose-700" onclick="window.removeMember('${r}', '${x.user_id}')" title="Eliminar miembro"><i data-lucide="user-minus" class="w-4 h-4"></i></button>`:""}
                    </div>
                </div>
            `}).join(""):'<p class="text-surface-500 text-sm py-2">No hay miembros adicionales.</p>',f=u.length?u.map(x=>`
                <div class="flex justify-between items-center p-2 border-b border-surface-100 last:border-0 hover:bg-surface-50">
                    <div>
                        <p class="font-medium text-sm text-surface-900">${x.name}</p>
                        <p class="text-[10px] text-surface-500">${x.property_type} • ${x.address||""}</p>
                    </div>
                    <button class="text-rose-500 hover:text-rose-700" onclick="window.removeProperty('${r}', '${x.id}')" title="Quitar propiedad"><i data-lucide="unlink" class="w-4 h-4"></i></button>
                </div>
            `).join(""):'<p class="text-surface-500 text-sm py-2">No hay propiedades asignadas.</p>';h(`Detalles: ${n.name}`,`
                <div class="space-y-6">
                    <div>
                        <h4 class="text-sm font-bold text-surface-700 border-b border-surface-200 pb-1 mb-2">Miembros del Equipo</h4>
                        <div class="max-h-48 overflow-y-auto">
                            ${v}
                        </div>
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-surface-700 border-b border-surface-200 pb-1 mb-2">Propiedades Asignadas</h4>
                        <div class="max-h-48 overflow-y-auto">
                            ${f}
                        </div>
                    </div>
                </div>
            `,{cancelText:"Cerrar",confirmText:"Aceptar",onConfirm:()=>U()}),window.lucide&&lucide.createIcons()}catch(n){console.error(n),b("Error al cargar los detalles","error")}},window.removeMember=async(r,n)=>{if(confirm("¿Está seguro de eliminar este miembro del grupo?"))try{await p.delete(`/work-groups/${r}/members/${n}`),b("Miembro eliminado","success"),U(),M(t,s),setTimeout(()=>window.viewGroupDetails(r),300)}catch(c){b(c.message||"Error al eliminar","error")}},window.removeProperty=async(r,n)=>{if(confirm("¿Está seguro de deasignar esta propiedad del grupo?"))try{await p.delete(`/work-groups/${r}/properties/${n}`),b("Propiedad deasignada","success"),U(),M(t,s),setTimeout(()=>window.viewGroupDetails(r),300)}catch(c){b(c.message||"Error al deasignar","error")}},window.lucide&&lucide.createIcons()}async function at(t,s){const i=await p.get("/audits?limit=50");t.innerHTML=`
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
                        ${i.length?i.map(a=>`
                            <tr class="hover:bg-surface-50">
                                <td class="whitespace-nowrap">${_(a.timestamp)}</td>
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
    `,window.lucide&&lucide.createIcons()}async function st(t){window.FullCalendar||await it(),t.innerHTML=`
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
    `;try{const i=((await p.get("/reports/upcoming-events?days=90")).events||[]).map(e=>({title:e.title,date:e.date,extendedProps:{detail:e.detail,type:e.type,severity:e.severity},backgroundColor:e.severity==="high"?"#f43f5e":e.severity==="medium"?"#f59e0b":"#60a5fa",borderColor:e.severity==="high"?"#e11d48":e.severity==="medium"?"#d97706":"#3b82f6",textColor:"#ffffff"}));new FullCalendar.Calendar(document.getElementById("pms-calendar"),{initialView:"dayGridMonth",locale:"es",height:620,headerToolbar:{left:"prev,next today",center:"title",right:"dayGridMonth,timeGridWeek,listMonth"},buttonText:{today:"Hoy",month:"Mes",week:"Semana",list:"Lista"},events:i,eventClick(e){const{title:l,extendedProps:d}=e.event;b(`${l} — ${d.detail}`,"info")},eventDidMount(e){e.el.title=`${e.event.title}
${e.event.extendedProps.detail}`}}).render()}catch(s){console.error("Calendar error:",s),b("Error cargando eventos del calendario","error")}}function it(){return new Promise((t,s)=>{if(window.FullCalendar)return t();const i=document.createElement("script");i.src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js",i.onload=t,i.onerror=s,document.head.appendChild(i)})}async function nt(t,s){var i,a,e;if(((i=s.user)==null?void 0:i.role)!=="Admin"){t.innerHTML='<div class="p-8 text-center text-surface-500">Acceso denegado. Se requieren permisos de Administrador.</div>';return}t.innerHTML=`
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in cursor-default">
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
    `,window.lucide&&lucide.createIcons();try{const l=await p.get("/config"),d=document.getElementById("telegram-config-form"),o=document.getElementById("email-config-form");l.forEach(u=>{d.elements[u.key]&&(d.elements[u.key].value=u.value),o.elements[u.key]&&(o.elements[u.key].value=u.value)});const r=document.getElementById("webhook-status-badge"),n=document.getElementById("telegram_token"),c=document.getElementById("btn-edit-token");try{const u=await p.get("/telegram/webhook-status");u.ok&&((a=u.result)!=null&&a.url)?(r.className="badge badge-green flex items-center gap-1",r.innerHTML='<i data-lucide="check-circle" class="w-3 h-3"></i> Conectado',n.disabled=!0,c.classList.remove("hidden")):(r.className="badge badge-gray flex items-center gap-1",r.innerHTML='<i data-lucide="x-circle" class="w-3 h-3"></i> Inactivo',n.disabled=!1)}catch{r.className="badge badge-red flex items-center gap-1",r.innerHTML='<i data-lucide="alert-circle" class="w-3 h-3"></i> Error Webhook'}window.lucide&&lucide.createIcons()}catch{b("Error al cargar la configuración","error")}(e=document.getElementById("btn-edit-token"))==null||e.addEventListener("click",()=>{confirm("Si editas el token, deberás volver a activar el webhook. ¿Deseas editarlo?")&&(document.getElementById("telegram_token").disabled=!1,document.getElementById("telegram_token").focus())}),document.getElementById("telegram-config-form").addEventListener("submit",async l=>{l.preventDefault();const d=document.getElementById("btn-save-telegram");d.disabled=!0;const o=l.target.elements.TELEGRAM_BOT_TOKEN.value.trim(),r=l.target.elements.TELEGRAM_CHAT_ID.value.trim();try{await p.post("/config/batch",{TELEGRAM_BOT_TOKEN:o,TELEGRAM_CHAT_ID:r}),b("Ajustes guardados exitosamente","success"),o&&(document.getElementById("telegram_token").disabled=!0,document.getElementById("btn-edit-token").classList.remove("hidden"))}catch(n){b("Error al guardar: "+n.message,"error")}finally{d.disabled=!1}}),document.getElementById("email-config-form").addEventListener("submit",async l=>{l.preventDefault();const d=document.getElementById("btn-save-email");d.disabled=!0;const o={SMTP_HOST:l.target.elements.SMTP_HOST.value.trim(),SMTP_PORT:l.target.elements.SMTP_PORT.value.trim(),SMTP_USER:l.target.elements.SMTP_USER.value.trim(),SMTP_PASS:l.target.elements.SMTP_PASS.value.trim()};try{await p.post("/config/batch",o),b("Configuración SMTP guardada","success")}catch(r){b("Error al guardar: "+r.message,"error")}finally{d.disabled=!1}}),document.getElementById("btn-activate-webhook").addEventListener("click",async l=>{const d=l.target.closest("button");d.disabled=!0;try{await p.post("/telegram/register-webhook",{domain:"https://real-state-xd5o.onrender.com"}),b("Webhook activado correctamente","success"),setTimeout(()=>window.location.reload(),1500)}catch(o){b("Error en Webhook: "+o.message,"error")}finally{d.disabled=!1}})}const P={user:null,currentPage:"dashboard"},ot={dashboard:{title:"Dashboard",subtitle:"Vista general de su cartera inmobiliaria",render:Te},properties:{title:"Propiedades",subtitle:"Gestión de su portfolio inmobiliario",render:K},financials:{title:"Finanzas",subtitle:"Ledger contable y conciliación bancaria",render:j},maintenance:{title:"Mantenimientos",subtitle:"Órdenes de trabajo y calendario",render:H},contracts:{title:"Contratos",subtitle:"Gestión de arrendamientos",render:N},budgets:{title:"Presupuestos",subtitle:"Control presupuestario y semáforo",render:Ge},"budget-report":{title:"Reporte de Presupuesto",subtitle:"Distribución y cumplimiento detallado",render:ze},facility:{title:"Facility Management",subtitle:"Gestión de activos e inspecciones",render:J},"account-detail":{title:"Detalle de Cuenta",subtitle:"Historial de movimientos y análisis de saldo",render:et},"work-groups":{title:"Grupos de Trabajo",subtitle:"Gestión de equipos de mantenimiento",render:M},audits:{title:"Auditoría",subtitle:"Registro de actividades y log del sistema",render:at},calendar:{title:"Calendario",subtitle:"Eventos y fechas importantes próximas",render:st},settings:{title:"Configuración",subtitle:"Ajustes globales y de integraciones",render:nt}};function fe(){return(window.location.hash.replace("#/","")||"dashboard").split("?")[0].split("/")[0]}async function ge(t){const s=ot[t];if(!s){window.location.hash="#/dashboard";return}P.currentPage=t,document.getElementById("page-title").textContent=s.title,document.getElementById("page-subtitle").textContent=s.subtitle,document.querySelectorAll(".sidebar-link").forEach(a=>{a.classList.toggle("active",a.dataset.page===t)});const i=document.getElementById("page-content");i.innerHTML='<div class="flex items-center justify-center py-20"><div class="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>';try{await s.render(i,P)}catch(a){console.error(`Error rendering ${t}:`,a),i.innerHTML=`
      <div class="text-center py-20">
        <i data-lucide="alert-circle" class="w-12 h-12 text-rose-400 mx-auto mb-4"></i>
        <h3 class="text-lg font-semibold text-surface-700 mb-2">Error al cargar la página</h3>
        <p class="text-surface-500">${a.message}</p>
      </div>
    `}window.lucide&&lucide.createIcons()}function G(){document.getElementById("auth-screen").classList.remove("hidden"),document.getElementById("app-shell").classList.add("hidden"),window.lucide&&lucide.createIcons()}function ve(){document.getElementById("auth-screen").classList.add("hidden"),document.getElementById("app-shell").classList.remove("hidden"),P.user&&(document.getElementById("user-name").textContent=P.user.full_name,document.getElementById("user-role").textContent=P.user.role,document.getElementById("user-avatar").textContent=P.user.full_name.charAt(0).toUpperCase()),window.lucide&&lucide.createIcons(),ge(fe())}async function rt(){if(!p.isAuthenticated()){G();return}try{P.user=await p.getProfile(),ve()}catch{p.clearTokens(),G()}}function lt(){window.addEventListener("hashchange",()=>{P.user&&ge(fe())}),document.getElementById("login-form").addEventListener("submit",async t=>{t.preventDefault();const s=document.getElementById("login-email").value,i=document.getElementById("login-password").value;try{await p.login(s,i),P.user=await p.getProfile(),b(`Bienvenido, ${P.user.full_name}`,"success"),ve()}catch(a){b(a.message,"error")}}),document.getElementById("register-form").addEventListener("submit",async t=>{t.preventDefault();const s={full_name:document.getElementById("reg-name").value,email:document.getElementById("reg-email").value,password:document.getElementById("reg-password").value,role:document.getElementById("reg-role").value};try{console.log("Registrando usuario...",s),await p.register(s),b("Cuenta creada. Inicie sesión.","success"),document.getElementById("register-form").classList.add("hidden"),document.getElementById("login-form").classList.remove("hidden"),t.target.reset()}catch(i){console.error("Error en registro:",i),b(i.message,"error")}}),document.getElementById("show-register").addEventListener("click",t=>{t.preventDefault(),document.getElementById("login-form").classList.add("hidden"),document.getElementById("register-form").classList.remove("hidden")}),document.getElementById("show-login").addEventListener("click",t=>{t.preventDefault(),document.getElementById("register-form").classList.add("hidden"),document.getElementById("login-form").classList.remove("hidden")}),document.getElementById("logout-btn").addEventListener("click",()=>{p.clearTokens(),P.user=null,b("Sesión cerrada","info"),G()}),p.onUnauthorized(()=>{P.user=null,G(),b("Sesión expirada","warning")}),rt()}document.addEventListener("DOMContentLoaded",lt);
