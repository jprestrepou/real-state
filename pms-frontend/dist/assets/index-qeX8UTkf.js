(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))t(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&t(o)}).observe(document,{childList:!0,subtree:!0});function e(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function t(n){if(n.ep)return;n.ep=!0;const i=e(n);fetch(n.href,i)}})();const B="http://localhost:8000/api/v1";class N{constructor(){this._accessToken=localStorage.getItem("pms_access_token"),this._refreshToken=localStorage.getItem("pms_refresh_token"),this._onUnauthorized=null}onUnauthorized(s){this._onUnauthorized=s}setTokens(s,e){this._accessToken=s,this._refreshToken=e,localStorage.setItem("pms_access_token",s),localStorage.setItem("pms_refresh_token",e)}clearTokens(){this._accessToken=null,this._refreshToken=null,localStorage.removeItem("pms_access_token"),localStorage.removeItem("pms_refresh_token")}isAuthenticated(){return!!this._accessToken}async _fetch(s,e={}){const t={"Content-Type":"application/json",...e.headers};this._accessToken&&(t.Authorization=`Bearer ${this._accessToken}`),e.body instanceof FormData&&delete t["Content-Type"];let n=await fetch(`${B}${s}`,{...e,headers:t});if(n.status===401&&this._refreshToken)if(await this._tryRefresh())t.Authorization=`Bearer ${this._accessToken}`,n=await fetch(`${B}${s}`,{...e,headers:t});else throw this.clearTokens(),this._onUnauthorized&&this._onUnauthorized(),new Error("Sesión expirada. Inicie sesión nuevamente.");if(!n.ok){const i=await n.json().catch(()=>({detail:"Error del servidor"}));throw new Error(i.detail||`Error ${n.status}`)}return n.status===204?null:n.json()}async _tryRefresh(){try{const s=await fetch(`${B}/auth/refresh`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refresh_token:this._refreshToken})});if(!s.ok)return!1;const e=await s.json();return this.setTokens(e.access_token,e.refresh_token),!0}catch{return!1}}get(s){return this._fetch(s)}post(s,e){return this._fetch(s,{method:"POST",body:JSON.stringify(e)})}put(s,e){return this._fetch(s,{method:"PUT",body:JSON.stringify(e)})}delete(s){return this._fetch(s,{method:"DELETE"})}upload(s,e){return this._fetch(s,{method:"POST",body:e})}async login(s,e){const t=await this.post("/auth/login",{email:s,password:e});return this.setTokens(t.access_token,t.refresh_token),t}async register(s){return this.post("/auth/register",s)}async getProfile(){return this.get("/auth/me")}}const l=new N;function u(a,s="info",e=4e3){const t=document.getElementById("toast-container"),n=document.createElement("div");n.className=`toast toast-${s}`,n.textContent=a,t.appendChild(n),setTimeout(()=>{n.style.opacity="0",n.style.transform="translateX(100%)",n.style.transition="all 0.3s ease-in",setTimeout(()=>n.remove(),300)},e)}function v(a,s,{onConfirm:e,confirmText:t="Guardar",showCancel:n=!0}={}){const i=document.getElementById("modal-container");i.innerHTML=`
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
          ${n?'<button id="modal-cancel" class="btn-secondary">Cancelar</button>':""}
          ${e?`<button id="modal-confirm" class="btn-primary">${t}</button>`:""}
        </div>
      </div>
    </div>
  `,window.lucide&&lucide.createIcons();const o=document.getElementById("modal-overlay"),d=document.getElementById("modal-close"),m=document.getElementById("modal-cancel"),p=document.getElementById("modal-confirm"),h=()=>{i.innerHTML=""};return o.addEventListener("click",y=>{y.target===o&&h()}),d==null||d.addEventListener("click",h),m==null||m.addEventListener("click",h),p&&e&&p.addEventListener("click",async()=>{try{await e(),h()}catch(y){u(y.message,"error")}}),{close:h,getBody:()=>document.getElementById("modal-body")}}function c(a,s="COP"){return a==null?"—":new Intl.NumberFormat("es-CO",{style:"currency",currency:s,minimumFractionDigits:0,maximumFractionDigits:0}).format(a)}function M(a){return a==null?"—":Math.abs(a)>=1e6?`$${(a/1e6).toFixed(1)}M`:Math.abs(a)>=1e3?`$${(a/1e3).toFixed(0)}K`:c(a)}function g(a){return a?new Date(a).toLocaleDateString("es-CO",{year:"numeric",month:"short",day:"numeric"}):"—"}function T(a){return a==null?"—":`${Number(a).toFixed(1)}%`}function _(a){return{Disponible:"badge-green",Arrendada:"badge-blue","En Mantenimiento":"badge-amber",Vendida:"badge-gray",Pendiente:"badge-amber","En Progreso":"badge-blue",Completado:"badge-green",Cancelado:"badge-red","Esperando Factura":"badge-amber",Activo:"badge-green",Borrador:"badge-gray",Finalizado:"badge-gray",Pagado:"badge-green",Vencido:"badge-red"}[a]||"badge-gray"}function D(a){return{Verde:"semaphore-green",Amarillo:"semaphore-amber",Rojo:"semaphore-red"}[a]||"semaphore-green"}const x={primary:"#4c6ef5",accent:"#20c997",accentLight:"rgba(32, 201, 151, 0.1)",red:"#e03131",redLight:"rgba(224, 49, 49, 0.1)"},$={responsive:!0,maintainAspectRatio:!1,plugins:{legend:{labels:{font:{family:"Inter",size:12,weight:"500"},padding:16,usePointStyle:!0,pointStyleWidth:10}},tooltip:{backgroundColor:"rgba(33, 37, 41, 0.95)",titleFont:{family:"Inter",size:13,weight:"600"},bodyFont:{family:"Inter",size:12},padding:12,cornerRadius:10,displayColors:!0}}};function G(a,s,e,t){return new Chart(a,{type:"bar",data:{labels:s,datasets:[{label:"Ingresos",data:e,backgroundColor:x.accent,borderRadius:8,barPercentage:.6},{label:"Gastos",data:t,backgroundColor:x.red,borderRadius:8,barPercentage:.6}]},options:{...$,scales:{y:{beginAtZero:!0,grid:{color:"rgba(0,0,0,0.04)"},ticks:{font:{family:"Inter",size:11}}},x:{grid:{display:!1},ticks:{font:{family:"Inter",size:11}}}}}})}function H(a,s,e){const t=["#4c6ef5","#20c997","#f59f00","#e03131","#845ef7","#339af0"];return new Chart(a,{type:"doughnut",data:{labels:s,datasets:[{data:e,backgroundColor:t.slice(0,e.length),borderWidth:0,hoverOffset:8}]},options:{...$,cutout:"70%",plugins:{...$.plugins,legend:{...$.plugins.legend,position:"bottom"}}}})}function U(a,s,e,t,n){return new Chart(a,{type:"line",data:{labels:s,datasets:[{label:"Ingresos Proyectados",data:e,borderColor:x.accent,backgroundColor:x.accentLight,fill:!0,tension:.4,pointRadius:4,pointHoverRadius:6,borderWidth:2.5},{label:"Gastos Proyectados",data:t,borderColor:x.red,backgroundColor:x.redLight,fill:!0,tension:.4,pointRadius:4,pointHoverRadius:6,borderWidth:2.5},{label:"Balance Neto",data:n,borderColor:x.primary,borderDash:[6,4],fill:!1,tension:.4,pointRadius:3,borderWidth:2}]},options:{...$,interaction:{mode:"index",intersect:!1},scales:{y:{grid:{color:"rgba(0,0,0,0.04)"},ticks:{font:{family:"Inter",size:11}}},x:{grid:{display:!1},ticks:{font:{family:"Inter",size:11}}}}}})}const V={Disponible:"#20c997",Arrendada:"#4c6ef5","En Mantenimiento":"#f59f00",Vendida:"#868e96"};let f=null,w=null;function W(a,s=[4.711,-74.072],e=12){return f&&f.remove(),f=L.map(a).setView(s,e),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:19}).addTo(f),w=L.markerClusterGroup({maxClusterRadius:50,spiderfyOnMaxZoom:!0,showCoverageOnHover:!1}),f.addLayer(w),f}function J(a){if(w&&(w.clearLayers(),a.forEach(s=>{const e=V[s.status]||"#868e96",t=L.circleMarker([s.latitude,s.longitude],{radius:10,fillColor:e,color:"#fff",weight:2,opacity:1,fillOpacity:.85}),n=`
      <div style="font-family:Inter,sans-serif; min-width:200px;">
        <h3 style="margin:0 0 4px; font-size:14px; font-weight:700; color:#212529;">${s.name}</h3>
        <p style="margin:0 0 2px; font-size:12px; color:#868e96;">${s.property_type} • ${s.city}</p>
        <div style="display:flex; align-items:center; gap:6px; margin-top:8px;">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${e};"></span>
          <span style="font-size:12px; font-weight:600; color:#495057;">${s.status}</span>
        </div>
        ${s.monthly_rent?`<p style="margin:6px 0 0; font-size:13px; font-weight:600; color:#20c997;">Canon: ${c(s.monthly_rent)}</p>`:""}
        <a href="#/properties/${s.id}" style="display:inline-block; margin-top:8px; font-size:12px; color:#4c6ef5; text-decoration:none; font-weight:600;">Ver ficha →</a>
      </div>
    `;t.bindPopup(n),w.addLayer(t)}),a.length>0)){const s=w.getBounds();s.isValid()&&f.fitBounds(s,{padding:[30,30]})}}function K(){f&&setTimeout(()=>f.invalidateSize(),100)}async function Z(a){const[s,e,t]=await Promise.all([l.get("/reports/summary"),l.get("/properties/map"),l.get("/reports/cashflow?months=12")]),n=s;if(a.innerHTML=`
    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 animate-fade-in">
      <div class="kpi-card kpi-blue">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-surface-500">Total Propiedades</span>
          <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <i data-lucide="home" class="w-5 h-5 text-primary-600"></i>
          </div>
        </div>
        <p class="text-3xl font-bold text-surface-900">${n.total_properties}</p>
      </div>

      <div class="kpi-card kpi-green">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-surface-500">Ocupación</span>
          <div class="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
            <i data-lucide="users" class="w-5 h-5 text-accent-600"></i>
          </div>
        </div>
        <p class="text-3xl font-bold text-surface-900">${T(n.occupancy_rate)}</p>
      </div>

      <div class="kpi-card kpi-green">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-surface-500">Ingresos</span>
          <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <i data-lucide="trending-up" class="w-5 h-5 text-green-600"></i>
          </div>
        </div>
        <p class="text-3xl font-bold text-surface-900">${M(n.total_income)}</p>
      </div>

      <div class="kpi-card kpi-red">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-surface-500">Gastos</span>
          <div class="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
            <i data-lucide="trending-down" class="w-5 h-5 text-rose-600"></i>
          </div>
        </div>
        <p class="text-3xl font-bold text-surface-900">${M(n.total_expenses)}</p>
      </div>
    </div>

    <!-- Map + Doughnut Chart Row -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
      <div class="xl:col-span-2 glass-card-static p-6 animate-fade-in">
        <h3 class="text-base font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <i data-lucide="map-pin" class="w-5 h-5 text-primary-500"></i>
          Mapa de Propiedades
        </h3>
        <div id="dashboard-map" style="height: 380px; border-radius: 12px;"></div>
      </div>

      <div class="glass-card-static p-6 animate-fade-in">
        <h3 class="text-base font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <i data-lucide="pie-chart" class="w-5 h-5 text-primary-500"></i>
          Distribución por Tipo
        </h3>
        <div style="height: 340px; display: flex; align-items: center; justify-content: center;">
          <canvas id="type-chart"></canvas>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
      <div class="glass-card-static p-6 animate-fade-in">
        <h3 class="text-base font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <i data-lucide="bar-chart-3" class="w-5 h-5 text-primary-500"></i>
          Ingresos vs Gastos
        </h3>
        <div style="height: 300px;">
          <canvas id="income-expense-chart"></canvas>
        </div>
      </div>

      <div class="glass-card-static p-6 animate-fade-in">
        <h3 class="text-base font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <i data-lucide="activity" class="w-5 h-5 text-primary-500"></i>
          Cash Flow (12 meses)
        </h3>
        <div style="height: 300px;">
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
      ${n.accounts.length>0?`
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          ${n.accounts.map(o=>`
            <div class="p-4 rounded-xl border border-surface-200 bg-surface-50/50 hover:border-primary-200 transition-colors">
              <p class="text-sm font-medium text-surface-600">${o.account_name}</p>
              <p class="text-sm text-surface-400 mb-2">${o.account_type} • ${o.currency}</p>
              <p class="text-xl font-bold ${o.current_balance>=0?"text-accent-600":"text-rose-600"}">${c(o.current_balance)}</p>
            </div>
          `).join("")}
        </div>
      `:`
        <p class="text-center text-surface-400 py-8">No hay cuentas registradas aún</p>
      `}
    </div>
  `,window.lucide&&lucide.createIcons(),setTimeout(()=>{W("dashboard-map"),J(e),K()},100),e.length>0){const o={};e.forEach(p=>{o[p.property_type]=(o[p.property_type]||0)+1});const d=Object.keys(o),m=Object.values(o);H(document.getElementById("type-chart"),d,m)}const i=t.months||[];if(i.length>0){const o=i.slice(-6);G(document.getElementById("income-expense-chart"),o.map(d=>d.month),o.map(d=>d.income),o.map(d=>d.expenses)),U(document.getElementById("cashflow-chart"),i.map(d=>d.month),i.map(d=>d.income),i.map(d=>d.expenses),i.map(d=>d.net))}}async function P(a){const e=(await l.get("/properties?limit=50")).items||[];a.innerHTML=`
    <div class="flex items-center justify-between mb-6 animate-fade-in">
      <div class="flex items-center gap-3">
        <select id="filter-status" class="select text-sm py-2 w-40">
          <option value="">Todos los estados</option>
          <option value="Disponible">Disponible</option>
          <option value="Arrendada">Arrendada</option>
          <option value="En Mantenimiento">En Mantenimiento</option>
          <option value="Vendida">Vendida</option>
        </select>
        <select id="filter-type" class="select text-sm py-2 w-40">
          <option value="">Todos los tipos</option>
          <option value="Apartamento">Apartamento</option>
          <option value="Casa">Casa</option>
          <option value="Local">Local</option>
          <option value="Bodega">Bodega</option>
          <option value="Oficina">Oficina</option>
          <option value="Lote">Lote</option>
        </select>
      </div>
      <button id="add-property-btn" class="btn-primary">
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
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${e.length>0?e.map(t=>`
            <tr>
              <td>
                <div class="font-semibold text-surface-900">${t.name}</div>
                <div class="text-xs text-surface-400 truncate max-w-[200px]">${t.address}</div>
              </td>
              <td><span class="badge badge-gray">${t.property_type}</span></td>
              <td class="text-surface-600">${t.city}</td>
              <td class="text-surface-600">${t.area_sqm}</td>
              <td class="font-medium">${c(t.commercial_value)}</td>
              <td><span class="badge ${_(t.status)}">${t.status}</span></td>
              <td class="text-surface-500 text-xs">${g(t.created_at)}</td>
              <td>
                <button class="btn-ghost text-xs py-1 px-2 edit-property" data-id="${t.id}" title="Editar">
                  <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                </button>
                <button class="btn-ghost text-xs py-1 px-2 delete-property text-rose-500 hover:bg-rose-50" data-id="${t.id}" title="Eliminar">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
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
  `,window.lucide&&lucide.createIcons(),document.getElementById("add-property-btn").addEventListener("click",()=>F()),document.getElementById("properties-table").addEventListener("click",async t=>{const n=t.target.closest(".edit-property"),i=t.target.closest(".delete-property");if(n){const o=n.dataset.id,d=await l.get(`/properties/${o}`);F(d)}if(i){const o=i.dataset.id;if(confirm("¿Está seguro de que desea eliminar esta propiedad? Esta acción la desactivará del sistema."))try{await l.delete(`/properties/${o}`),u("Propiedad eliminada correctamente","success");const d=document.getElementById("page-content");await P(d)}catch(d){u(d.message,"error")}}}),document.getElementById("filter-status").addEventListener("change",async t=>{const n=t.target.value,i=document.getElementById("filter-type").value;let o="/properties?limit=50";n&&(o+=`&status=${encodeURIComponent(n)}`),i&&(o+=`&property_type=${encodeURIComponent(i)}`);const d=await l.get(o);S(d.items||[])}),document.getElementById("filter-type").addEventListener("change",async t=>{const n=t.target.value,i=document.getElementById("filter-status").value;let o="/properties?limit=50";i&&(o+=`&status=${encodeURIComponent(i)}`),n&&(o+=`&property_type=${encodeURIComponent(n)}`);const d=await l.get(o);S(d.items||[])})}function S(a){const s=document.querySelector("#properties-table tbody");s.innerHTML=a.map(e=>`
    <tr>
      <td>
        <div class="font-semibold text-surface-900">${e.name}</div>
        <div class="text-xs text-surface-400 truncate max-w-[200px]">${e.address}</div>
      </td>
      <td><span class="badge badge-gray">${e.property_type}</span></td>
      <td class="text-surface-600">${e.city}</td>
      <td class="text-surface-600">${e.area_sqm}</td>
      <td class="font-medium">${c(e.commercial_value)}</td>
      <td><span class="badge ${_(e.status)}">${e.status}</span></td>
      <td class="text-surface-500 text-xs">${g(e.created_at)}</td>
      <td>
        <button class="btn-ghost text-xs py-1 px-2 edit-property" data-id="${e.id}" title="Editar">
          <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
        </button>
        <button class="btn-ghost text-xs py-1 px-2 delete-property text-rose-500 hover:bg-rose-50" data-id="${e.id}" title="Eliminar">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </td>
    </tr>
  `).join(""),window.lucide&&lucide.createIcons()}function F(a=null){const s=!!a,e=s?"Editar Propiedad":"Nueva Propiedad",t=`
    <form id="property-form" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Nombre *</label>
          <input class="input" name="name" required value="${(a==null?void 0:a.name)||""}" placeholder="Mi Apartamento Centro" />
        </div>
        <div>
          <label class="label">Tipo *</label>
          <select class="select" name="property_type" required>
            ${["Apartamento","Casa","Local","Bodega","Oficina","Lote"].map(n=>`<option value="${n}" ${(a==null?void 0:a.property_type)===n?"selected":""}>${n}</option>`).join("")}
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
            ${["Disponible","Arrendada","En Mantenimiento","Vendida"].map(n=>`<option value="${n}" ${(a==null?void 0:a.status)===n?"selected":""}>${n}</option>`).join("")}
          </select>
        </div>
      </div>
      <div>
        <label class="label">Notas</label>
        <textarea class="input" name="notes" rows="2" placeholder="Observaciones adicionales...">${(a==null?void 0:a.notes)||""}</textarea>
      </div>
    </form>
  `;v(e,t,{confirmText:s?"Guardar Cambios":"Crear Propiedad",onConfirm:async()=>{const n=document.getElementById("property-form"),i=new FormData(n),o={};i.forEach((m,p)=>{m!==""&&(["latitude","longitude","area_sqm","commercial_value"].includes(p)?o[p]=parseFloat(m):["bedrooms","bathrooms"].includes(p)?o[p]=parseInt(m):o[p]=m)}),s?(await l.put(`/properties/${a.id}`,o),u("Propiedad actualizada","success")):(await l.post("/properties",o),u("Propiedad creada","success"));const d=document.getElementById("page-content");await P(d)}})}async function I(a){var d,m,p,h,y;const[s,e,t]=await Promise.all([l.get("/accounts"),l.get("/transactions?limit=30"),l.get("/properties?limit=100")]),n=s||[],i=e.items||[],o=t.items||[];a.innerHTML=`
    <div class="flex items-center justify-between mb-6 animate-fade-in">
      <div class="flex items-center gap-3">
        <button id="add-account-btn" class="btn-primary">
          <i data-lucide="plus" class="w-4 h-4"></i> Nueva Cuenta
        </button>
        <button id="add-transaction-btn" class="btn-secondary">
          <i data-lucide="plus-circle" class="w-4 h-4"></i> Transacción
        </button>
        <button id="add-transfer-btn" class="btn-secondary">
          <i data-lucide="arrow-left-right" class="w-4 h-4"></i> Transferencia
        </button>
      </div>
      <div class="flex items-center gap-2">
         <button id="export-csv-btn" class="btn-secondary-outline">
          <i data-lucide="download" class="w-4 h-4"></i> Exportar
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex space-x-4 border-b border-surface-100 mb-6">
      <button class="tab-btn active" data-tab="summary">Resumen</button>
      <button class="tab-btn" data-tab="transactions">Transacciones</button>
      <button class="tab-btn" data-tab="reports">Reportes Corporativos</button>
    </div>

    <!-- Performance Analysis (Individual Properties) -->
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
          ${o.map(r=>`<option value="${r.id}">${r.name}</option>`).join("")}
        </select>
      </div>
      <div id="performance-content" class="min-h-[200px] flex items-center justify-center border-2 border-dashed border-surface-200 rounded-2xl bg-white/50">
        <div class="text-center">
          <i data-lucide="building" class="w-12 h-12 text-surface-200 mx-auto mb-3"></i>
          <p class="text-surface-400 font-medium">Selecciona una propiedad para ver su rendimiento individual</p>
        </div>
      </div>
    </div>

    <div id="financial-tabs-content">
      <div id="summary-tab" class="tab-content transition-all duration-300">
         <!-- Accounts Cards -->
         <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
           ${n.map(r=>`
             <div class="glass-card p-5">
               <div class="flex items-center justify-between mb-3">
                 <span class="badge ${r.is_active?"badge-green":"badge-gray"}">${r.account_type}</span>
                 <span class="text-xs text-surface-400">${r.currency}</span>
               </div>
               <p class="text-sm font-medium text-surface-700 mb-1">${r.account_name}</p>
               ${r.bank_name?`<p class="text-xs text-surface-400 mb-2">${r.bank_name}</p>`:""}
               <p class="text-2xl font-bold ${r.current_balance>=0?"text-accent-600":"text-rose-600"}">
                 ${c(r.current_balance)}
               </p>
             </div>
           `).join("")}
         </div>
      </div>

      <div id="transactions-tab" class="tab-content hidden transition-all duration-300">
         <!-- Transaction Ledger -->
         <div class="glass-card-static overflow-hidden animate-fade-in">
           <table class="data-table">
             <thead>
               <tr>
                 <th>Fecha</th>
                 <th>Descripción</th>
                 <th>Categoría</th>
                 <th>Tipo</th>
                 <th>Monto</th>
                 <th>Dirección</th>
               </tr>
             </thead>
             <tbody>
               ${i.length>0?i.map(r=>`
                 <tr>
                   <td class="text-xs text-surface-500">${g(r.transaction_date)}</td>
                   <td><div class="font-medium text-surface-900 text-sm">${r.description}</div></td>
                   <td><span class="badge badge-gray text-xs">${r.category}</span></td>
                   <td class="text-xs text-surface-500">${r.transaction_type}</td>
                   <td class="font-semibold ${r.direction==="Debit"?"text-accent-600":"text-rose-600"}">
                     ${r.direction==="Debit"?"+":"-"}${c(r.amount)}
                   </td>
                   <td>
                     <span class="badge ${r.direction==="Debit"?"badge-green":"badge-red"} text-xs">
                       ${r.direction==="Debit"?"Ingreso":"Egreso"}
                     </span>
                   </td>
                 </tr>
               `).join(""):`
                 <tr><td colspan="6" class="text-center py-12 text-surface-400">No hay transacciones</td></tr>
               `}
             </tbody>
           </table>
         </div>
      </div>

      <div id="reports-tab" class="tab-content hidden transition-all duration-300">
         <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="glass-card p-6" id="balance-sheet-container">
              <h3 class="font-bold mb-4">Balance General</h3>
              <p class="text-surface-400 text-sm">Cargando estado...</p>
            </div>
            <div class="glass-card p-6" id="income-statement-container">
              <h3 class="font-bold mb-4">Estado de Resultados</h3>
              <p class="text-surface-400 text-sm">Cargando estado...</p>
            </div>
         </div>
      </div>
    </div>
  `,window.lucide&&lucide.createIcons(),(d=document.getElementById("add-account-btn"))==null||d.addEventListener("click",()=>Q()),(m=document.getElementById("add-transaction-btn"))==null||m.addEventListener("click",()=>ee(n,o)),(p=document.getElementById("add-transfer-btn"))==null||p.addEventListener("click",()=>X(n)),(h=document.getElementById("export-csv-btn"))==null||h.addEventListener("click",async()=>{window.location.href=`${l.baseUrl}/reports/export`}),(y=document.getElementById("performance-property-select"))==null||y.addEventListener("change",r=>Y(r.target.value)),document.querySelectorAll(".tab-btn").forEach(r=>{r.addEventListener("click",()=>{document.querySelectorAll(".tab-btn").forEach(C=>C.classList.remove("active")),document.querySelectorAll(".tab-content").forEach(C=>C.classList.add("hidden")),r.classList.add("active");const A=r.dataset.tab;document.getElementById(`${A}-tab`).classList.remove("hidden"),A==="reports"&&te()})})}async function Y(a){if(!a)return;const s=document.getElementById("performance-content");s.innerHTML='<p class="animate-pulse">Calculando métricas...</p>';const e=await l.get(`/properties/${a}/performance`);if(!e)return;s.innerHTML=`
    <div class="animate-fade-in">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm hover:shadow-md transition-shadow">
          <p class="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Ingresos Totales</p>
          <p class="text-2xl font-bold text-accent-600">${c(e.total_income)}</p>
          <div class="mt-2 text-[10px] text-accent-500 font-medium flex items-center gap-1">
            <i data-lucide="trending-up" class="w-3 h-3"></i> Acumulado histórico
          </div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm hover:shadow-md transition-shadow">
          <p class="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Gastos Totales</p>
          <p class="text-2xl font-bold text-rose-600">${c(e.total_expenses)}</p>
          <div class="mt-2 text-[10px] text-rose-500 font-medium flex items-center gap-1">
            <i data-lucide="trending-down" class="w-3 h-3"></i> Acumulado histórico
          </div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm hover:shadow-md transition-shadow">
          <p class="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Utilidad Neta</p>
          <p class="text-2xl font-bold text-primary-600">${c(e.net_profit)}</p>
          <div class="mt-2 text-[10px] text-primary-500 font-medium flex items-center gap-1">
            <i data-lucide="wallet" class="w-3 h-3"></i> Saldo operacional
          </div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-surface-100 shadow-sm hover:shadow-md transition-shadow">
          <p class="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">ROI (Retorno)</p>
          <p class="text-2xl font-bold text-indigo-600">${e.roi}%</p>
          <div class="mt-2 text-[10px] text-indigo-500 font-medium flex items-center gap-1">
            <i data-lucide="percent" class="w-3 h-3"></i> Sobre valor comercial
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="bg-white p-6 rounded-2xl border border-surface-100 shadow-sm">
          <h4 class="text-sm font-bold text-surface-900 mb-4 flex items-center gap-2">
            <i data-lucide="history" class="w-4 h-4 text-primary-500"></i>
            Últimos Movimientos
          </h4>
          <div class="overflow-x-auto">
            <table class="data-table text-xs">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                ${e.last_transactions.length>0?e.last_transactions.map(n=>`
                  <tr>
                    <td class="text-surface-500">${g(n.transaction_date)}</td>
                    <td class="font-medium text-surface-800">${n.description}</td>
                    <td class="font-bold ${n.direction==="Debit"?"text-accent-600":"text-rose-600"}">
                      ${n.direction==="Debit"?"+":"-"}${c(n.amount)}
                    </td>
                  </tr>
                `).join(""):'<tr><td colspan="3" class="text-center py-4 text-surface-400">Sin movimientos</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-2xl border border-surface-100 shadow-sm">
          <h4 class="text-sm font-bold text-surface-900 mb-4 flex items-center gap-2">
            <i data-lucide="pie-chart" class="w-4 h-4 text-primary-500"></i>
            Distribución Financiera
          </h4>
          <div class="h-[200px] flex items-center justify-center">
            <canvas id="property-mini-chart"></canvas>
          </div>
          <div class="mt-4 grid grid-cols-2 gap-2 text-[10px] items-center">
             <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-accent-500"></span> Ingresos</div>
             <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-rose-500"></span> Gastos</div>
          </div>
        </div>
      </div>
    </div>
  `,window.lucide&&lucide.createIcons();const t=document.getElementById("property-mini-chart");t&&new Chart(t,{type:"doughnut",data:{labels:["Ingresos","Gastos"],datasets:[{data:[e.total_income,e.total_expenses],backgroundColor:["#20c997","#f03e3e"],borderWidth:0,cutout:"75%"}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}}}})}function X(a){v("Transferencia entre Cuentas",`
    <form id="transfer-form" class="space-y-4">
      <div>
        <label class="label">Cuenta Origen *</label>
        <select class="select" name="source_account_id" required>
          ${a.map(s=>`<option value="${s.id}">${s.account_name} (${c(s.current_balance)})</option>`).join("")}
        </select>
      </div>
      <div>
        <label class="label">Cuenta Destino *</label>
        <select class="select" name="destination_account_id" required>
          ${a.map(s=>`<option value="${s.id}">${s.account_name}</option>`).join("")}
        </select>
      </div>
      <div>
        <label class="label">Monto *</label>
        <input class="input" name="amount" type="number" step="0.01" required placeholder="500000" />
      </div>
      <div>
        <label class="label">Descripción *</label>
        <input class="input" name="description" required placeholder="Traslado de fondos para nómina" />
      </div>
      <div>
        <label class="label">Fecha *</label>
        <input class="input" name="transaction_date" type="date" required value="${new Date().toISOString().split("T")[0]}" />
      </div>
    </form>
  `,{confirmText:"Realizar Transferencia",onConfirm:async()=>{const s=document.getElementById("transfer-form"),e=new FormData(s),t={};if(e.forEach((n,i)=>{i==="amount"?t[i]=parseFloat(n):t[i]=n}),t.source_account_id===t.destination_account_id){u("Las cuentas deben ser diferentes","error");return}await l.post("/accounts/transfer",t),u("Transferencia completada","success"),await I(document.getElementById("page-content"))}})}function Q(){v("Nueva Cuenta Bancaria",`
    <form id="account-form" class="space-y-4">
      <div>
        <label class="label">Nombre de la Cuenta *</label>
        <input class="input" name="account_name" required placeholder="Cuenta Corriente Principal" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Tipo *</label>
          <select class="select" name="account_type" required>
            <option value="Corriente">Corriente</option>
            <option value="Ahorros">Ahorros</option>
            <option value="Inversión">Inversión</option>
            <option value="Caja Menor">Caja Menor</option>
          </select>
        </div>
        <div>
          <label class="label">Saldo Inicial</label>
          <input class="input" name="initial_balance" type="number" step="0.01" value="0" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Banco</label>
          <input class="input" name="bank_name" placeholder="Bancolombia" />
        </div>
        <div>
          <label class="label">Moneda</label>
          <input class="input" name="currency" value="COP" maxlength="3" />
        </div>
      </div>
    </form>
  `,{confirmText:"Crear Cuenta",onConfirm:async()=>{const a=document.getElementById("account-form"),s=new FormData(a),e={};s.forEach((t,n)=>{n==="initial_balance"?e[n]=parseFloat(t)||0:t&&(e[n]=t)});try{await l.post("/accounts",e),u("Cuenta creada correctamente","success"),await I(document.getElementById("page-content"))}catch(t){throw console.error("Error al crear cuenta:",t),u(`Error: ${t.message}`,"error"),t}}})}function ee(a,s=[]){v("Registrar Transacción",`
    <form id="tx-form" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Cuenta *</label>
          <select class="select" name="account_id" required>
            ${a.map(e=>`<option value="${e.id}">${e.account_name}</option>`).join("")}
          </select>
        </div>
        <div>
          <label class="label">Propiedad *</label>
          <select class="select" name="property_id" required>
            <option value="">Seleccione...</option>
            ${s.map(e=>`<option value="${e.id}">${e.name}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Tipo *</label>
          <select class="select" name="transaction_type" required id="tx-type-select">
            <option value="Ingreso">Ingreso</option>
            <option value="Gasto">Gasto</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Inversión">Inversión</option>
            <option value="Interés">Interés</option>
            <option value="Abono">Abono</option>
            <option value="Crédito">Crédito</option>
            <option value="Ajuste">Ajuste</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label">Monto *</label>
          <input class="input" name="amount" type="number" step="0.01" min="0.01" required placeholder="1500000" />
        </div>
        <div>
          <label class="label">Categoría *</label>
          <select class="select" name="category" required>
            <option value="Ingresos por Arriendo">Ingresos por Arriendo</option>
            <option value="Gastos Mantenimiento">Gastos Mantenimiento</option>
            <option value="Impuestos y Tasas">Impuestos y Tasas</option>
            <option value="Cuotas de Administración">Cuotas de Administración</option>
            <option value="Servicios Públicos">Servicios Públicos</option>
            <option value="Honorarios Gestión">Honorarios Gestión</option>
            <option value="Seguros">Seguros</option>
            <option value="Otros">Otros</option>
          </select>
        </div>
      </div>
      <div>
        <label class="label">Descripción *</label>
        <input class="input" name="description" required placeholder="Pago de canon mes de marzo" />
      </div>
      <div>
        <label class="label">Fecha *</label>
        <input class="input" name="transaction_date" type="date" required value="${new Date().toISOString().split("T")[0]}" />
      </div>
    </form>
  `,{confirmText:"Registrar",onConfirm:async()=>{const e=document.getElementById("tx-form"),t=new FormData(e),n={};t.forEach((i,o)=>{o==="amount"?n[o]=parseFloat(i):n[o]=i}),n.transaction_type==="Ingreso"?n.direction="Debit":n.transaction_type==="Gasto"&&(n.direction="Credit"),await l.post("/transactions",n),u("Transacción registrada","success"),await I(document.getElementById("page-content"))}})}async function te(){const[a,s]=await Promise.all([l.get("/reports/balance-sheet"),l.get(`/reports/income-statement?start_date=${new Date().getFullYear()}-01-01&end_date=${new Date().toISOString().split("T")[0]}`)]),e=document.getElementById("balance-sheet-container"),t=document.getElementById("income-statement-container");a&&(e.innerHTML=`
      <h3 class="font-bold mb-4 flex items-center justify-between">
        Balance General 
        <span class="text-xs font-normal text-surface-400">${g(a.date)}</span>
      </h3>
      <div class="space-y-3">
        ${a.accounts.map(n=>`
          <div class="flex justify-between text-sm py-2 border-b border-surface-50">
            <span class="text-surface-600">${n.account_name}</span>
            <span class="font-semibold">${c(n.current_balance)}</span>
          </div>
        `).join("")}
        <div class="flex justify-between text-lg font-bold pt-4 text-primary-600">
          <span>Total Activos</span>
          <span>${c(a.total_assets)}</span>
        </div>
      </div>
    `),s&&(t.innerHTML=`
      <h3 class="font-bold mb-4">Estado de Resultados (Año Actual)</h3>
      <div class="space-y-4">
        <div>
          <p class="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Ingresos</p>
          ${Object.entries(s.income).map(([n,i])=>`
            <div class="flex justify-between text-sm mb-1">
              <span>${n}</span>
              <span class="text-accent-600">+${c(i)}</span>
            </div>
          `).join("")}
        </div>
        <div>
          <p class="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Egresos</p>
          ${Object.entries(s.expenses).map(([n,i])=>`
            <div class="flex justify-between text-sm mb-1">
              <span>${n}</span>
              <span class="text-rose-600">-${c(i)}</span>
            </div>
          `).join("")}
        </div>
        <div class="border-t border-surface-100 pt-3 mt-4">
          <div class="flex justify-between text-lg font-bold ${s.net_income>=0?"text-accent-600":"text-rose-600"}">
            <span>Utilidad Neta</span>
            <span>${c(s.net_income)}</span>
          </div>
        </div>
      </div>
    `)}async function j(a){const e=(await l.get("/maintenance?limit=50")).items||[];a.innerHTML=`
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
        <p class="text-2xl font-bold text-amber-500">${e.filter(t=>t.status==="Pendiente").length}</p>
        <p class="text-xs text-surface-500 mt-1">Pendientes</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-primary-500">${e.filter(t=>t.status==="En Progreso").length}</p>
        <p class="text-xs text-surface-500 mt-1">En Progreso</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-accent-500">${e.filter(t=>t.status==="Completado").length}</p>
        <p class="text-xs text-surface-500 mt-1">Completados</p>
      </div>
      <div class="glass-card-static p-4 text-center">
        <p class="text-2xl font-bold text-rose-500">${c(e.reduce((t,n)=>t+(n.actual_cost||0),0))}</p>
        <p class="text-xs text-surface-500 mt-1">Costo Total</p>
      </div>
    </div>
    <div class="glass-card-static overflow-hidden animate-fade-in">
      <table class="data-table"><thead><tr>
        <th>Título</th><th>Tipo</th><th>Prioridad</th><th>Estado</th><th>Costo Est.</th><th>Fecha</th><th></th>
      </tr></thead><tbody>
      ${e.length?e.map(t=>`<tr>
        <td><div class="font-semibold text-sm">${t.title}</div>${t.supplier_name?`<div class="text-xs text-surface-400">${t.supplier_name}</div>`:""}</td>
        <td><span class="badge badge-gray text-xs">${t.maintenance_type}</span></td>
        <td><span class="badge ${t.priority==="Urgente"?"badge-red":t.priority==="Alta"?"badge-amber":"badge-gray"} text-xs">${t.priority}</span></td>
        <td><span class="badge ${_(t.status)} text-xs">${t.status}</span></td>
        <td class="text-sm">${c(t.estimated_cost)}</td>
        <td class="text-xs text-surface-500">${g(t.scheduled_date)}</td>
        <td>${t.status!=="Completado"&&t.status!=="Cancelado"?`<button class="btn-ghost text-xs py-1 px-2 status-btn" data-id="${t.id}"><i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></button>`:""}</td>
      </tr>`).join(""):'<tr><td colspan="7" class="text-center py-12 text-surface-400">No hay órdenes</td></tr>'}
      </tbody></table>
    </div>`,window.lucide&&lucide.createIcons(),document.getElementById("add-maint-btn").addEventListener("click",()=>ae()),document.querySelectorAll(".status-btn").forEach(t=>t.addEventListener("click",()=>se(t.dataset.id)))}function ae(){v("Nueva Orden",`<form id="mf" class="space-y-4">
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
  </form>`,{confirmText:"Crear",onConfirm:async()=>{const a=new FormData(document.getElementById("mf")),s={};a.forEach((e,t)=>{e&&(s[t]=t==="estimated_cost"?parseFloat(e):e)}),await l.post("/maintenance",s),u("Orden creada","success"),await j(document.getElementById("page-content"))}})}function se(a){v("Cambiar Estado",`<form id="sf" class="space-y-4">
    <div><label class="label">Estado *</label><select class="select" name="status">
      <option value="Pendiente">Pendiente</option><option value="En Progreso">En Progreso</option>
      <option value="Esperando Factura">Esperando Factura</option><option value="Completado">Completado</option>
      <option value="Cancelado">Cancelado</option></select></div>
    <div><label class="label">Notas</label><textarea class="input" name="notes" rows="2"></textarea></div>
  </form>`,{confirmText:"Actualizar",onConfirm:async()=>{const s=new FormData(document.getElementById("sf")),e={status:s.get("status")};s.get("notes")&&(e.notes=s.get("notes")),await l.put(`/maintenance/${a}/status`,e),u("Estado actualizado","success"),await j(document.getElementById("page-content"))}})}async function k(a){const e=(await l.get("/contracts?limit=50")).items||[];a.innerHTML=`
    <div class="flex items-center justify-between mb-6 animate-fade-in">
      <select id="fc-status" class="select text-sm py-2 w-40">
        <option value="">Todos</option>
        <option value="Activo">Activo</option>
        <option value="Borrador">Borrador</option>
        <option value="Finalizado">Finalizado</option>
      </select>
      <button id="add-contract-btn" class="btn-primary"><i data-lucide="plus" class="w-4 h-4"></i> Nuevo Contrato</button>
    </div>
    <div class="glass-card-static overflow-hidden animate-fade-in">
      <table class="data-table"><thead><tr>
        <th>Arrendatario</th><th>Tipo</th><th>Canon</th><th>Inicio</th><th>Fin</th><th>Estado</th><th></th>
      </tr></thead><tbody>
      ${e.length?e.map(t=>`<tr>
        <td><div class="font-semibold text-sm">${t.tenant_name}</div>${t.tenant_email?`<div class="text-xs text-surface-400">${t.tenant_email}</div>`:""}</td>
        <td><span class="badge badge-gray text-xs">${t.contract_type}</span></td>
        <td class="font-medium text-accent-600">${c(t.monthly_rent)}</td>
        <td class="text-xs">${g(t.start_date)}</td>
        <td class="text-xs">${g(t.end_date)}</td>
        <td><span class="badge ${_(t.status)} text-xs">${t.status}</span></td>
        <td><div class="flex gap-1">
          ${t.status==="Borrador"?`<button class="btn-ghost text-xs py-1 px-2 activate-btn" data-id="${t.id}" title="Activar"><i data-lucide="check-circle" class="w-3.5 h-3.5 text-accent-500"></i></button>`:""}
          <button class="btn-ghost text-xs py-1 px-2 payments-btn" data-id="${t.id}" title="Pagos"><i data-lucide="calendar" class="w-3.5 h-3.5"></i></button>
        </div></td>
      </tr>`).join(""):'<tr><td colspan="7" class="text-center py-12 text-surface-400">No hay contratos</td></tr>'}
      </tbody></table>
    </div>`,window.lucide&&lucide.createIcons(),document.getElementById("add-contract-btn").addEventListener("click",()=>ne()),document.querySelectorAll(".activate-btn").forEach(t=>t.addEventListener("click",async()=>{await l.post(`/contracts/${t.dataset.id}/activate`,{}),u("Contrato activado","success"),await k(a)})),document.querySelectorAll(".payments-btn").forEach(t=>t.addEventListener("click",async()=>{const n=await l.get(`/contracts/${t.dataset.id}/payments`);v("Cronograma de Pagos",`<div class="max-h-64 overflow-y-auto">
      <table class="data-table text-xs"><thead><tr><th>Fecha</th><th>Monto</th><th>Estado</th></tr></thead><tbody>
      ${n.map(i=>`<tr><td>${g(i.due_date)}</td><td class="font-medium">${c(i.amount)}</td>
        <td><span class="badge ${_(i.status)} text-xs">${i.status}</span></td></tr>`).join("")}
      </tbody></table></div>`,{showCancel:!1})}))}function ne(){const a=new Date().toISOString().split("T")[0];v("Nuevo Contrato",`<form id="cf" class="space-y-4">
    <div><label class="label">Propiedad ID *</label><input class="input" name="property_id" required /></div>
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
      <div><label class="label">Inicio *</label><input class="input" name="start_date" type="date" required value="${a}" /></div>
      <div><label class="label">Fin *</label><input class="input" name="end_date" type="date" required /></div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div><label class="label">Depósito</label><input class="input" name="deposit_amount" type="number" step="0.01" /></div>
      <div><label class="label">Incremento Anual %</label><input class="input" name="annual_increment_pct" type="number" step="0.01" value="5" /></div>
    </div>
  </form>`,{confirmText:"Crear",onConfirm:async()=>{const s=new FormData(document.getElementById("cf")),e={};s.forEach((t,n)=>{t&&(e[n]=["monthly_rent","deposit_amount","annual_increment_pct"].includes(n)?parseFloat(t):t)}),e.auto_renewal=!1,await l.post("/contracts",e),u("Contrato creado","success"),await k(document.getElementById("page-content"))}})}async function q(a){const s=await l.get("/budgets");a.innerHTML=`
    <div class="flex items-center justify-between mb-6 animate-fade-in">
      <h3 class="text-lg font-semibold text-surface-700">Presupuestos por Propiedad</h3>
      <button id="add-budget-btn" class="btn-primary"><i data-lucide="plus" class="w-4 h-4"></i> Nuevo Presupuesto</button>
    </div>
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in">
      ${s.length?s.map(e=>`
        <div class="glass-card-static p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h4 class="font-bold text-surface-900">Año ${e.year}</h4>
              <p class="text-xs text-surface-400">Propiedad: ${e.property_id.slice(0,8)}...</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="semaphore ${D(e.semaphore)}"></span>
              <span class="text-sm font-semibold ${e.semaphore==="Verde"?"text-green-600":e.semaphore==="Amarillo"?"text-amber-600":"text-red-600"}">${e.semaphore}</span>
            </div>
          </div>
          <div class="mb-4">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-surface-500">Ejecutado: ${c(e.total_executed)}</span>
              <span class="font-medium">${T(e.execution_pct)}</span>
            </div>
            <div class="w-full bg-surface-200 rounded-full h-2.5">
              <div class="h-2.5 rounded-full transition-all ${e.semaphore==="Verde"?"bg-green-500":e.semaphore==="Amarillo"?"bg-amber-500":"bg-red-500"}" style="width:${Math.min(e.execution_pct,100)}%"></div>
            </div>
            <p class="text-xs text-surface-400 mt-1">de ${c(e.total_budget)} presupuestado</p>
          </div>
          ${e.categories&&e.categories.length?`
            <div class="space-y-2 mt-4 pt-4 border-t border-surface-100">
              ${e.categories.map(t=>`
                <div class="flex items-center justify-between text-sm">
                  <div class="flex items-center gap-2">
                    <span class="semaphore ${D(t.semaphore)}" style="width:10px;height:10px;"></span>
                    <span class="text-surface-700">${t.category_name}</span>
                  </div>
                  <div class="text-right">
                    <span class="font-medium">${T(t.execution_pct)}</span>
                    <span class="text-xs text-surface-400 ml-1">(${c(t.executed_amount)} / ${c(t.budgeted_amount)})</span>
                  </div>
                </div>
              `).join("")}
            </div>
          `:""}
        </div>
      `).join(""):'<p class="text-surface-400 col-span-2 text-center py-12">No hay presupuestos. Cree uno para empezar.</p>'}
    </div>`,window.lucide&&lucide.createIcons(),document.getElementById("add-budget-btn").addEventListener("click",()=>ie())}function ie(){const a=new Date().getFullYear();v("Nuevo Presupuesto",`<form id="bf" class="space-y-4">
    <div><label class="label">Propiedad ID *</label><input class="input" name="property_id" required /></div>
    <div class="grid grid-cols-2 gap-4">
      <div><label class="label">Año *</label><input class="input" name="year" type="number" value="${a}" required /></div>
      <div><label class="label">Presupuesto Total *</label><input class="input" name="total_budget" type="number" step="0.01" required /></div>
    </div>
    <div id="cats-container">
      <label class="label">Categorías</label>
      <div class="space-y-2" id="cats-list"></div>
      <button type="button" id="add-cat-btn" class="btn-ghost text-xs mt-2"><i data-lucide="plus" class="w-3 h-3"></i> Agregar Categoría</button>
    </div>
  </form>`,{confirmText:"Crear",onConfirm:async()=>{const s=new FormData(document.getElementById("bf")),e=[];document.querySelectorAll(".cat-row").forEach(t=>{const n=t.querySelector('[name="cat_name"]').value,i=t.querySelector('[name="cat_amount"]').value;n&&i&&e.push({category_name:n,budgeted_amount:parseFloat(i)})}),await l.post("/budgets",{property_id:s.get("property_id"),year:parseInt(s.get("year")),total_budget:parseFloat(s.get("total_budget")),categories:e}),u("Presupuesto creado","success"),await q(document.getElementById("page-content"))}}),window.lucide&&lucide.createIcons(),document.getElementById("add-cat-btn").addEventListener("click",()=>{const s=document.getElementById("cats-list"),e=document.createElement("div");e.className="cat-row grid grid-cols-2 gap-2",e.innerHTML='<input class="input text-sm py-1.5" name="cat_name" placeholder="Mantenimiento" /><input class="input text-sm py-1.5" name="cat_amount" type="number" step="0.01" placeholder="5000000" />',s.appendChild(e)})}const b={user:null,currentPage:"dashboard"},oe={dashboard:{title:"Dashboard",subtitle:"Vista general de su cartera inmobiliaria",render:Z},properties:{title:"Propiedades",subtitle:"Gestión de su portfolio inmobiliario",render:P},financials:{title:"Finanzas",subtitle:"Ledger contable y conciliación bancaria",render:I},maintenance:{title:"Mantenimientos",subtitle:"Órdenes de trabajo y calendario",render:j},contracts:{title:"Contratos",subtitle:"Gestión de arrendamientos",render:k},budgets:{title:"Presupuestos",subtitle:"Control presupuestario y semáforo",render:q}};function O(){return(window.location.hash.replace("#/","")||"dashboard").split("/")[0]}async function R(a){const s=oe[a];if(!s){window.location.hash="#/dashboard";return}b.currentPage=a,document.getElementById("page-title").textContent=s.title,document.getElementById("page-subtitle").textContent=s.subtitle,document.querySelectorAll(".sidebar-link").forEach(t=>{t.classList.toggle("active",t.dataset.page===a)});const e=document.getElementById("page-content");e.innerHTML='<div class="flex items-center justify-center py-20"><div class="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>';try{await s.render(e,b)}catch(t){console.error(`Error rendering ${a}:`,t),e.innerHTML=`
      <div class="text-center py-20">
        <i data-lucide="alert-circle" class="w-12 h-12 text-rose-400 mx-auto mb-4"></i>
        <h3 class="text-lg font-semibold text-surface-700 mb-2">Error al cargar la página</h3>
        <p class="text-surface-500">${t.message}</p>
      </div>
    `}window.lucide&&lucide.createIcons()}function E(){document.getElementById("auth-screen").classList.remove("hidden"),document.getElementById("app-shell").classList.add("hidden"),window.lucide&&lucide.createIcons()}function z(){document.getElementById("auth-screen").classList.add("hidden"),document.getElementById("app-shell").classList.remove("hidden"),b.user&&(document.getElementById("user-name").textContent=b.user.full_name,document.getElementById("user-role").textContent=b.user.role,document.getElementById("user-avatar").textContent=b.user.full_name.charAt(0).toUpperCase()),window.lucide&&lucide.createIcons(),R(O())}async function le(){if(!l.isAuthenticated()){E();return}try{b.user=await l.getProfile(),z()}catch{l.clearTokens(),E()}}function de(){window.addEventListener("hashchange",()=>{b.user&&R(O())}),document.getElementById("login-form").addEventListener("submit",async a=>{a.preventDefault();const s=document.getElementById("login-email").value,e=document.getElementById("login-password").value;try{await l.login(s,e),b.user=await l.getProfile(),u(`Bienvenido, ${b.user.full_name}`,"success"),z()}catch(t){u(t.message,"error")}}),document.getElementById("register-form").addEventListener("submit",async a=>{a.preventDefault();const s={full_name:document.getElementById("reg-name").value,email:document.getElementById("reg-email").value,password:document.getElementById("reg-password").value,role:document.getElementById("reg-role").value};try{console.log("Registrando usuario...",s),await l.register(s),u("Cuenta creada. Inicie sesión.","success"),document.getElementById("register-form").classList.add("hidden"),document.getElementById("login-form").classList.remove("hidden"),a.target.reset()}catch(e){console.error("Error en registro:",e),u(e.message,"error")}}),document.getElementById("show-register").addEventListener("click",a=>{a.preventDefault(),document.getElementById("login-form").classList.add("hidden"),document.getElementById("register-form").classList.remove("hidden")}),document.getElementById("show-login").addEventListener("click",a=>{a.preventDefault(),document.getElementById("register-form").classList.add("hidden"),document.getElementById("login-form").classList.remove("hidden")}),document.getElementById("logout-btn").addEventListener("click",()=>{l.clearTokens(),b.user=null,u("Sesión cerrada","info"),E()}),l.onUnauthorized(()=>{b.user=null,E(),u("Sesión expirada","warning")}),le()}document.addEventListener("DOMContentLoaded",de);
