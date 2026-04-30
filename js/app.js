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
        document.getElementById('master-date-filter').value = hoy;

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
    }
};

// Punto de entrada al cargar la página
window.onload = () => APP.init();
