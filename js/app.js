/**
 * Orquestador principal de la Aplicación
 */
const APP = {
    async init() {
        console.log("🚀 Iniciando GeoGestión Cabañas...");
        
        // 1. Inicializar motores
        MAP_ENGINE.init();
        UI.init();

        // 2. Cargar fecha de hoy
        const hoy = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('master-date-filter');
        if (dateInput) dateInput.value = hoy;

        // 3. Primera sincronización
        await this.updateData(hoy);
    },

    async updateData(date) {
        UI.showLoading(true);
        
        try {
            const data = await API.getStatusByDate(date);
            
            // Renderizar Mapa
            MAP_ENGINE.renderPoints(data.features);
            
            // Actualizar Estadísticas BI
            UI.updateDashboard(data.stats);

            UI.showLoading(false);
        } catch (e) {
            UI.showLoading(false);
            console.error("Error en la actualización de datos:", e);
        }
    },

    recalcKPIs() {
        if (typeof CALENDAR === 'undefined' || !CALENDAR.allData) return;
        
        const dateInput = document.getElementById('master-date-filter');
        const targetDateStr = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
        const targetDate = new Date(targetDateStr + "T00:00:00");
        
        let ocupadas = 0;
        let ingresos = 0;
        let total = CALENDAR.allData.cabanas.length;
        
        CALENDAR.allData.cabanas.forEach(c => {
            const res = CALENDAR.allData.reservas.find(r => 
                r.id_cabana == c.id && 
                targetDate >= new Date(r.fecha_entrada.split('T')[0] + "T00:00:00") && 
                targetDate <= new Date(r.fecha_salida.split('T')[0] + "T00:00:00")
            );
            
            let precio = c.precio_base || 0;
            if (targetDate.getDay() === 5 || targetDate.getDay() === 6) precio *= 1.20;
            
            if (res) {
                // Usar precio personalizado si existe
                if (res.precios_dinamicos) {
                    precio = parseFloat(res.precios_dinamicos);
                }
                
                // Si justo hoy es el día de salida, no se cuenta como ocupada para la noche
                const isSalida = (targetDateStr === res.fecha_salida.split('T')[0]);
                if (!isSalida) {
                    ocupadas++;
                    ingresos += precio;
                }
            }
        });
        
        UI.updateDashboard({ total, ocupadas, ingresos });
    },

    async toggleView() {
        const mapDiv = document.getElementById('map');
        const calDiv = document.getElementById('calendar-view');
        const dashboard = document.querySelector('.bi-dashboard');
        const btn = document.getElementById('btn-toggle-view');

        if (calDiv.style.display === 'none') {
            // Mostrar Calendario
            mapDiv.style.display = 'none';
            dashboard.style.display = 'none';
            calDiv.style.display = 'block';
            btn.innerHTML = '<i class="fas fa-map"></i>';
            btn.title = 'Mapa';
            
            // Cargar datos
            UI.showLoading(true);
            try {
                const allData = await API.getAllData();
                if(typeof CALENDAR !== 'undefined') {
                    CALENDAR.render(allData);
                }
                UI.showLoading(false);
            } catch (e) {
                UI.showLoading(false);
                document.getElementById('calendar-content').innerHTML = `<p style="color:red; text-align:center;">Error cargando panorama:<br>${e.message}</p>`;
            }
        } else {
            // Mostrar Mapa
            calDiv.style.display = 'none';
            mapDiv.style.display = 'block';
            dashboard.style.display = 'flex';
            btn.innerHTML = '<i class="fas fa-calendar-alt"></i>';
            btn.title = 'Panorama';
            
            // Refrescar mapa si es necesario
            MAP_ENGINE.instance.invalidateSize();
        }
    },

    copyClientLink() {
        const currentUrl = window.location.href;
        let clientUrl = currentUrl;
        if (clientUrl.includes('index.html')) {
            clientUrl = clientUrl.replace('index.html', 'portal_clientes.html');
        } else {
            clientUrl = clientUrl.replace(/\/$/, '') + '/portal_clientes.html';
        }
        
        navigator.clipboard.writeText(clientUrl).then(() => {
            alert('¡Enlace para clientes copiado al portapapeles!\n\nYa puedes pegarlo en WhatsApp.');
        }).catch(err => {
            console.error('Error al copiar: ', err);
            prompt('Copia manualmente este enlace para tus clientes:', clientUrl);
        });
    }
};

// Punto de entrada al cargar la página
window.onload = () => APP.init();
