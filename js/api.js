/**
 * Módulo de comunicación con el Backend (Apps Script)
 */
const API = {
    async getStatusByDate(date) {
        console.log(`📡 Consultando API para fecha: ${date}`);
        try {
            const response = await fetch(`${CONFIG.API_URL}?date=${date}`);
            if (!response.ok) throw new Error('Error en la red');
            return await response.json();
        } catch (error) {
            console.error("❌ Fallo en la comunicación con la API:", error);
            throw error;
        }
    },

    async getAllData() {
        console.log(`📡 Consultando todas las reservas...`);
        try {
            const response = await fetch(`${CONFIG.API_URL}?action=all_data`);
            if (!response.ok) throw new Error('Error en la red');
            return await response.json();
        } catch (error) {
            console.error("❌ Fallo en la comunicación con la API:", error);
            throw error;
        }
    },

    async createReservation(payload) {
        console.log(`📡 Enviando nueva reserva...`, payload);
        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'create_reserva', ...payload })
            });
            return await response.json();
        } catch (error) {
            console.error("❌ Fallo al guardar reserva:", error);
            throw error;
        }
    }
};
