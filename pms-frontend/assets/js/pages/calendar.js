/**
 * Calendar Page — using FullCalendar to display upcoming events.
 */
import { api } from '../api.js';
import { showToast } from '../components/modal.js';

export async function renderCalendar(container) {
    // Ensure FullCalendar is loaded
    if (!window.FullCalendar) {
        await loadFullCalendar();
    }

    container.innerHTML = `
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
    `;

    try {
        // Fetch 90 days of events
        const eventsData = await api.get('/reports/upcoming-events?days=90');
        const events = (eventsData.events || []).map(ev => ({
            title: ev.title,
            date: ev.date,
            extendedProps: { detail: ev.detail, type: ev.type, severity: ev.severity },
            backgroundColor: ev.severity === 'high' ? '#f43f5e' : ev.severity === 'medium' ? '#f59e0b' : '#60a5fa',
            borderColor: ev.severity === 'high' ? '#e11d48' : ev.severity === 'medium' ? '#d97706' : '#3b82f6',
            textColor: '#ffffff',
        }));

        const cal = new FullCalendar.Calendar(document.getElementById('pms-calendar'), {
            initialView: 'dayGridMonth',
            locale: 'es',
            height: 620,
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listMonth',
            },
            buttonText: {
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                list: 'Lista',
            },
            events,
            eventClick(info) {
                const { title, extendedProps } = info.event;
                showToast(`${title} — ${extendedProps.detail}`, 'info');
            },
            eventDidMount(info) {
                info.el.title = `${info.event.title}\n${info.event.extendedProps.detail}`;
            },
        });
        cal.render();
    } catch(err) {
        console.error('Calendar error:', err);
        showToast('Error cargando eventos del calendario', 'error');
    }
}

function loadFullCalendar() {
    return new Promise((resolve, reject) => {
        if (window.FullCalendar) return resolve();
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}
